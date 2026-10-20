import { supabase } from "@/app/lib/supabase";
import { ensureCurrentSeasonRoster } from "./season-roster.service";
import {
  CURRENT_SEASON_LEAGUES,
  LEAGUE_SPORT,
  findClubOnRoster,
  isDemoClubName,
  seasonNamesMatch,
} from "../lib/current-season";
import { sportingCalendarClubGroups } from "../lib/calendar-clubs";
import {
  isPrimarySport,
  SPORT_ORDER,
  scoreLabelForSport,
} from "../lib/sports";

export { SPORT_ORDER, scoreLabelForSport };

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
  if (/heart of midlothian|hearts of midlothian|^hearts$/i.test(name)) {
    return "Hearts of Midlothian FC";
  }
  return name;
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
  if (key.includes("american express") || key === "amex") {
    return "/sponsors/amex.svg";
  }
  return null;
}

export function groupTeams(teams: TeamOption[]): TeamGroup[] {
  const grouped = new Map<string, Map<string, TeamOption[]>>();

  for (const team of teams) {
    if (!grouped.has(team.sport)) grouped.set(team.sport, new Map());
    const byComp = grouped.get(team.sport)!;
    if (!byComp.has(team.competition)) byComp.set(team.competition, []);
    byComp.get(team.competition)!.push(team);
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
      .map(([name, list]) => ({
        name,
        teams: uniqueTeamsById(
          list.sort((a, b) => a.displayName.localeCompare(b.displayName))
        ),
      })),
  }));
}
type CatalogClubRow = {
  id: string;
  name: string;
  sport: string;
  competition: string;
  competition_id: string | null;
};

export async function getTeamCatalog(): Promise<TeamGroup[]> {
  if (typeof window !== "undefined") {
    try {
      const response = await fetch("/api/fan/team-catalog", { cache: "no-store" });
      if (response.ok) {
        const payload = (await response.json()) as { catalog?: TeamGroup[] };
        if (Array.isArray(payload.catalog) && payload.catalog.length > 0) {
          return payload.catalog;
        }
      }
    } catch {
      // Fall through to a direct database read.
    }
  }
  return loadTeamCatalogFromDatabase();
}

export async function loadTeamCatalogFromDatabase(): Promise<TeamGroup[]> {
  await ensureCurrentSeasonRoster();
  const { data, error } = await supabase
    .from("clubs")
    .select("id, name, competition_id, competitions ( name, sports ( name ) )")
    .order("name");

  if (error) throw error;

  const rows: CatalogClubRow[] = (data ?? []).map((row) => {
    const competition = (
      row as unknown as {
        competitions: { name: string | null; sports: { name: string } | null } | null;
      }
    ).competitions;
    return {
      id: row.id as string,
      name: row.name as string,
      sport: competition?.sports?.name ?? "Other",
      competition: competition?.name ?? "Other",
      competition_id: (row.competition_id as string | null) ?? null,
    };
  });

  const teams: TeamOption[] = [];
  const usedIds = new Set<string>();

  for (const [league, names] of Object.entries(CURRENT_SEASON_LEAGUES)) {
    const sport = LEAGUE_SPORT[league] ?? "Football";
    for (const name of names) {
      const club = findClubOnRoster(
        rows.filter((row) => !usedIds.has(row.id)),
        name
      );
      const team: TeamOption = {
        id: club?.id ?? `season:${league}:${name}`,
        name: club?.name ?? name,
        displayName: displayClubName(club?.name ?? name),
        sport: club?.sport && club.sport !== "Other" ? club.sport : sport,
        competition: league,
      };
      if (club) usedIds.add(club.id);
      teams.push(team);
    }
  }

  return groupTeams(teams).filter((group) => isPrimarySport(group.sport));
}

/** Full 2026/27 Sporting Calendar — Fan registration is not limited to the three-club demo. */
export function fanRegisterCatalog(): TeamGroup[] {
  const teams: TeamOption[] = [];
  for (const group of sportingCalendarClubGroups()) {
    for (const name of group.clubs) {
      teams.push({
        id: `season:${group.league}:${name}`,
        name,
        displayName: displayClubName(name),
        sport: group.sport,
        competition: group.league,
      });
    }
  }
  return groupTeams(teams).filter((group) => isPrimarySport(group.sport));
}

export async function loadFanRegisterCatalog(): Promise<TeamGroup[]> {
  const catalog = fanRegisterCatalog();
  try {
    await ensureCurrentSeasonRoster();
    const { data, error } = await supabase
      .from("clubs")
      .select("id, name, competition_id, competitions ( name, sports ( name ) )")
      .order("name");
    if (error || !data) return catalog;
    const rows: CatalogClubRow[] = data.map((row) => {
      const competition = (
        row as unknown as {
          competitions: {
            name: string | null;
            sports: { name: string } | null;
          } | null;
        }
      ).competitions;
      return {
        id: row.id as string,
        name: row.name as string,
        sport: competition?.sports?.name ?? "Other",
        competition: competition?.name ?? "Other",
        competition_id: (row.competition_id as string | null) ?? null,
      };
    });
    const usedIds = new Set<string>();
    return catalog.map((sportGroup) => ({
      ...sportGroup,
      competitions: sportGroup.competitions.map((competition) => ({
        ...competition,
        teams: competition.teams.map((team) => {
          const club = findClubOnRoster(
            rows.filter((row) => !usedIds.has(row.id)),
            team.name
          );
          if (!club) return team;
          usedIds.add(club.id);
          return {
            ...team,
            id: club.id,
            name: club.name,
            displayName: displayClubName(club.name),
          };
        }),
      })),
    }));
  } catch {
    return catalog;
  }
}

export async function findClubByPreferenceName(
  name: string
): Promise<TeamOption | null> {
  const catalog = await loadFanRegisterCatalog();
  const needle = normalizeName(name);
  const aliases = NAME_ALIASES[needle] ?? [needle];

  for (const group of catalog) {
    for (const competition of group.competitions) {
      for (const team of competition.teams) {
        if (
          seasonNamesMatch(team.name, name) ||
          seasonNamesMatch(team.displayName, name) ||
          aliases.some(
            (alias) =>
              seasonNamesMatch(team.name, alias) ||
              seasonNamesMatch(team.displayName, alias)
          )
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
  const currentLeague =
    Object.entries(CURRENT_SEASON_LEAGUES).find(([, names]) =>
      names.some((clubName) => seasonNamesMatch(clubName, data.name as string))
    )?.[0] ?? competition?.name ?? "";
  return {
    id: data.id as string,
    name: data.name as string,
    displayName: displayClubName(data.name as string),
    sport: competition?.sports?.name ?? LEAGUE_SPORT[currentLeague] ?? "Football",
    competition: currentLeague,
  };
}

export function flattenCatalog(catalog: TeamGroup[]): TeamOption[] {
  return catalog.flatMap((group) =>
    group.competitions.flatMap((competition) => competition.teams)
  );
}

function teamMatchingName(
  catalogTeams: TeamOption[],
  name: string
): TeamOption | undefined {
  return catalogTeams.find(
    (option) =>
      seasonNamesMatch(option.name, name) ||
      seasonNamesMatch(option.displayName, name) ||
      namesMatch(option.name, name) ||
      namesMatch(option.displayName, name)
  );
}

const LOCAL_SUPPORTED_CLUBS_KEY = "s4p.fan.supportedClubs";

export function readLocalSupportedClubs(userId?: string | null): string[] {
  if (typeof window === "undefined" || !userId) return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_SUPPORTED_CLUBS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { userId?: string; clubs?: unknown };
    if (parsed.userId !== userId || !Array.isArray(parsed.clubs)) return [];
    return parsed.clubs.filter(
      (name): name is string => typeof name === "string" && Boolean(name.trim())
    );
  } catch {
    return [];
  }
}

export function writeLocalSupportedClubs(userId: string, clubs: string[]) {
  if (typeof window === "undefined" || !userId) return;
  window.localStorage.setItem(
    LOCAL_SUPPORTED_CLUBS_KEY,
    JSON.stringify({ userId, clubs })
  );
}

function teamsMatchingNames(
  catalogTeams: TeamOption[],
  names: string[] | undefined
): TeamOption[] {
  const matched: TeamOption[] = [];
  const seen = new Set<string>();
  for (const name of names ?? []) {
    const team = teamMatchingName(catalogTeams, name);
    if (!team || seen.has(team.id)) continue;
    seen.add(team.id);
    matched.push(team);
  }
  return matched;
}

/** Saved club names win over a leftover Hibernian favourite_club_id. */
export function selectedTeamsFromSources(
  catalog: TeamGroup[],
  options: {
    favouriteClubId?: string | null;
    preferenceClubNames?: string[];
    storedClubNames?: string[];
  }
): TeamOption[] {
  const catalogTeams = flattenCatalog(catalog);
  const catalogById = new Map(catalogTeams.map((team) => [team.id, team]));
  const fromPrefs = teamsMatchingNames(catalogTeams, options.preferenceClubNames);
  if (fromPrefs.length > 0) return fromPrefs;

  const fromStored = teamsMatchingNames(catalogTeams, options.storedClubNames);
  if (fromStored.length > 0) return fromStored;

  const favouriteId = options.favouriteClubId;
  if (!favouriteId) return [];
  const favourite = catalogById.get(favouriteId);
  const fromFavourite = favourite
    ? [favourite]
    : favouriteId.startsWith("season:")
      ? teamsMatchingNames(
          catalogTeams,
          [favouriteId.split(":").slice(2).join(":")].filter(Boolean)
        )
      : [];
  if (fromFavourite.length === 0) return [];
  if (fromFavourite.every((team) => isDemoClubName(team.name))) return [];
  return fromFavourite;
}

export async function getSupportedTeams(
  supporter: SupporterRef
): Promise<TeamOption[]> {
  const catalog = await loadFanRegisterCatalog();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const preferenceClubNames: string[] = [];
  if (user) {
    const { data: prefs } = await supabase
      .from("supporter_preferences")
      .select("sport, club")
      .eq("user_id", user.id);
    for (const pref of prefs ?? []) {
      if (pref.club) preferenceClubNames.push(pref.club);
    }
  }

  const storedClubNames = readLocalSupportedClubs(user?.id);

  if (preferenceClubNames.length > 0) {
    const fromCatalog = selectedTeamsFromSources(catalog, {
      preferenceClubNames,
    });
    if (fromCatalog.length > 0) return fromCatalog;
    const extra: TeamOption[] = [];
    for (const name of preferenceClubNames) {
      const team = await findClubByPreferenceName(name);
      if (team) extra.push(team);
    }
    return uniqueTeamsById(extra);
  }

  return selectedTeamsFromSources(catalog, {
    favouriteClubId: supporter.favourite_club_id,
    storedClubNames,
  });
}

export async function saveSupportedTeams(
  userId: string,
  supporterId: string,
  teams: TeamOption[]
) {
  if (teams.length === 0) {
    throw new Error("Select at least one team to support.");
  }

  writeLocalSupportedClubs(
    userId,
    teams.map((team) => team.name)
  );

  const favouriteId = uuidOrNull(teams[0].id);
  const { error: favError } = await supabase
    .from("supporters")
    .update({ favourite_club_id: favouriteId })
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

function uniqueTeamsById(teams: TeamOption[]): TeamOption[] {
  const seen = new Set<string>();
  const unique: TeamOption[] = [];
  for (const team of teams) {
    if (!team.id || seen.has(team.id)) continue;
    seen.add(team.id);
    unique.push(team);
  }
  return unique;
}

function namesMatch(a: string, b: string): boolean {
  const left = normalizeName(a);
  const right = normalizeName(b);
  if (left === right) return true;
  const leftAliases = NAME_ALIASES[left] ?? [left];
  const rightAliases = NAME_ALIASES[right] ?? [right];
  return leftAliases.some((alias) => rightAliases.includes(alias));
}

function uuidOrNull(value?: string | null): string | null {
  if (!value) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  )
    ? value
    : null;
}
