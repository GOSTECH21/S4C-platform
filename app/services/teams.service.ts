import { supabase } from "../lib/supabase";

type SupporterRef = {
  id: string;
  favourite_club_id?: string | null;
};

export type TeamOption = {
  id: string;
  name: string;
  displayName: string;
  sport: string;
  competition: string;
};

export type TeamGroup = {
  sport: string;
  competitions: { name: string; teams: TeamOption[] }[];
};

const SPORT_ORDER = ["Football", "Rugby", "Cricket", "NFL", "NHL"];

const NAME_ALIASES: Record<string, string[]> = {
  hearts: [
    "hearts",
    "heart of midlothian",
    "hearts of midlothian",
    "hearts of midlothian fc",
    "heart of midlothian fc",
  ],
  scotland: ["scotland", "scotland rugby"],
};

export function displayClubName(name: string): string {
  if (/^hearts$/i.test(name)) return "Hearts of Midlothian FC";
  return name;
}

export function scoreLabelForSport(sport: string | null | undefined): string {
  const value = (sport ?? "").toLowerCase();
  if (value.includes("rugby")) return "Try";
  if (value.includes("nfl") || value.includes("american football")) {
    return "Touchdown";
  }
  if (value.includes("cricket")) return "Run";
  return "Goal";
}

export function sponsorLogoSrc(
  name: string | null | undefined,
  logoUrl: string | null | undefined
): string | null {
  if (logoUrl) return logoUrl;
  const key = (name ?? "").trim().toLowerCase();
  if (!key) return null;
  if (key.includes("budweiser")) return "/sponsors/budweiser.svg";
  if (key.includes("gillette")) return "/sponsors/gillette.svg";
  if (key.includes("carbon warrior")) return "/sponsors/carbon-warriors.svg";
  return null;
}

export async function getTeamCatalog(): Promise<TeamGroup[]> {
  const { data, error } = await supabase
    .from("clubs")
    .select(
      "id, name, competition_id, competitions ( name, sports ( name ) )"
    )
    .not("competition_id", "is", null)
    .order("name");

  if (error) throw error;

  const grouped = new Map<string, Map<string, TeamOption[]>>();

  for (const row of data ?? []) {
    const competition = (
      row as unknown as {
        competitions: { name: string | null; sports: { name: string } | null } | null;
      }
    ).competitions;
    const sport = competition?.sports?.name ?? "Other";
    const competitionName = competition?.name ?? "Other";
    const team: TeamOption = {
      id: row.id as string,
      name: row.name as string,
      displayName: displayClubName(row.name as string),
      sport,
      competition: competitionName,
    };
    if (!grouped.has(sport)) grouped.set(sport, new Map());
    const byComp = grouped.get(sport)!;
    if (!byComp.has(competitionName)) byComp.set(competitionName, []);
    byComp.get(competitionName)!.push(team);
  }

  const sports = [...grouped.keys()].sort((a, b) => {
    const ai = SPORT_ORDER.indexOf(a);
    const bi = SPORT_ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.localeCompare(b);
  });

  return sports.map((sport) => ({
    sport,
    competitions: [...grouped.get(sport)!.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, teams]) => ({
        name,
        teams: teams.sort((a, b) => a.displayName.localeCompare(b.displayName)),
      })),
  }));
}

export async function findClubByPreferenceName(
  name: string
): Promise<TeamOption | null> {
  const catalog = await getTeamCatalog();
  const needle = normalizeName(name);
  const aliases = NAME_ALIASES[needle] ?? [needle];

  for (const group of catalog) {
    for (const competition of group.competitions) {
      for (const team of competition.teams) {
        const teamNames = [
          normalizeName(team.name),
          normalizeName(team.displayName),
        ];
        if (
          aliases.some((alias) => teamNames.includes(alias)) ||
          teamNames.some((teamName) => aliases.includes(teamName))
        ) {
          return team;
        }
      }
    }
  }

  const { data } = await supabase
    .from("clubs")
    .select("id, name, competitions ( name, sports ( name ) )")
    .ilike("name", `%${name}%`)
    .not("competition_id", "is", null)
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  const competition = (
    data as unknown as {
      competitions: { name: string | null; sports: { name: string } | null } | null;
    }
  ).competitions;
  return {
    id: data.id as string,
    name: data.name as string,
    displayName: displayClubName(data.name as string),
    sport: competition?.sports?.name ?? "Football",
    competition: competition?.name ?? "",
  };
}

export async function getSupportedTeams(
  supporter: SupporterRef
): Promise<TeamOption[]> {
  const byId = new Map<string, TeamOption>();
  const catalog = await getTeamCatalog();
  const catalogById = new Map(
    catalog.flatMap((group) =>
      group.competitions.flatMap((competition) =>
        competition.teams.map((team) => [team.id, team] as const)
      )
    )
  );

  if (supporter.favourite_club_id) {
    const favourite = catalogById.get(supporter.favourite_club_id);
    if (favourite) byId.set(favourite.id, favourite);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: prefs } = await supabase
      .from("supporter_preferences")
      .select("sport, club")
      .eq("user_id", user.id);

    for (const pref of prefs ?? []) {
      const team =
        catalog.flatMap((group) =>
          group.competitions.flatMap((competition) => competition.teams)
        ).find((option) => namesMatch(option.name, pref.club) || namesMatch(option.displayName, pref.club)) ??
        (await findClubByPreferenceName(pref.club));
      if (team) byId.set(team.id, team);
    }
  }

  return [...byId.values()];
}

export async function saveSupportedTeams(
  userId: string,
  supporterId: string,
  teams: TeamOption[]
) {
  if (teams.length === 0) {
    throw new Error("Select at least one team to support.");
  }

  const { error: favError } = await supabase
    .from("supporters")
    .update({ favourite_club_id: teams[0].id })
    .eq("id", supporterId);
  if (favError) throw favError;

  await supabase.from("supporter_preferences").delete().eq("user_id", userId);

  const { error: prefError } = await supabase.from("supporter_preferences").insert(
    teams.map((team) => ({
      user_id: userId,
      sport: team.sport,
      club: team.name,
    }))
  );
  if (prefError) throw prefError;
}

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/fc\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function namesMatch(a: string, b: string): boolean {
  const left = normalizeName(a);
  const right = normalizeName(b);
  if (left === right) return true;
  const leftAliases = NAME_ALIASES[left] ?? [left];
  const rightAliases = NAME_ALIASES[right] ?? [right];
  return leftAliases.some((alias) => rightAliases.includes(alias));
}
