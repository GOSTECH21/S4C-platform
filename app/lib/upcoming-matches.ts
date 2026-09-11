export type UpcomingMatchSource = "club-website" | "fixtures-list" | "s4p";

export type UpcomingMatch = {
  id: string;
  date: string;
  kickoff: string | null;
  homeName: string;
  awayName: string;
  venue: string | null;
  competition: string | null;
  source: UpcomingMatchSource;
  sourceUrl: string | null;
};

export type TeamRef = {
  id: string;
  name: string;
  displayName: string;
  sport?: string;
};

const NAME_ALIASES: Record<string, string[]> = {
  hearts: [
    "hearts",
    "heart of midlothian",
    "hearts of midlothian",
    "hearts of midlothian fc",
    "heart of midlothian fc",
  ],
  "heart of midlothian": [
    "hearts",
    "heart of midlothian",
    "hearts of midlothian",
  ],
  "hearts of midlothian": [
    "hearts",
    "heart of midlothian",
    "hearts of midlothian",
  ],
  "manchester united": ["manchester united", "man utd", "man united"],
  "scotland rugby": ["scotland rugby", "scotland"],
};

export function normalizeClubName(value: string): string {
  return value
    .toLowerCase()
    .replace(/fc\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function namesMatch(a: string, b: string): boolean {
  const left = normalizeClubName(a);
  const right = normalizeClubName(b);
  if (!left || !right) return false;
  if (left === right) return true;
  const leftAliases = NAME_ALIASES[left] ?? [left];
  const rightAliases = NAME_ALIASES[right] ?? [right];
  if (leftAliases.some((alias) => rightAliases.includes(alias))) return true;
  return left.includes(right) || right.includes(left);
}

export function namesLooselyMatch(a: string, b: string): boolean {
  if (namesMatch(a, b)) return true;
  const skip = new Set([
    "united",
    "city",
    "town",
    "real",
    "sporting",
    "athletic",
    "club",
    "hotspur",
  ]);
  const tokens = (value: string) =>
    normalizeClubName(value)
      .split(" ")
      .filter((token) => token.length >= 4 && !skip.has(token));
  const left = tokens(a);
  const right = tokens(b);
  return left.some((token) => right.includes(token));
}

export function formatKickoff(kickoff: string | null): string {
  if (!kickoff) return "TBC";
  const [hours, minutes] = kickoff.split(":");
  const hour = Number(hours);
  if (Number.isNaN(hour)) return kickoff.slice(0, 5);
  const suffix = hour >= 12 ? "pm" : "am";
  const twelve = hour % 12 || 12;
  return `${twelve}:${(minutes ?? "00").slice(0, 2)} ${suffix}`;
}

export function formatMatchDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function clubIsHome(match: UpcomingMatch, clubName: string): boolean {
  return namesMatch(match.homeName, clubName);
}

export function opponentName(match: UpcomingMatch, clubName: string): string {
  return clubIsHome(match, clubName) ? match.awayName : match.homeName;
}

export function sourceLabel(source: UpcomingMatchSource): string {
  if (source === "club-website") return "Club fixtures list";
  if (source === "fixtures-list") return "Fixtures list";
  return "S4P";
}

export function matchSortKey(match: UpcomingMatch): string {
  return `${match.date}T${(match.kickoff ?? "99:99").slice(0, 5)}`;
}

const CUP_NAME =
  /champions league|europa league|europa cup|conference league|fa cup|scottish cup|carabao|league cup|premier sports cup|efl cup|\bcup\b|\btrophy\b|uefa super cup/;

const LEAGUE_NAME =
  /premier league|scottish premiership|premiership|la liga|bundesliga|serie a|ligue 1|championship\b|league one|league two|six nations/;

export function isCupCompetition(name: string | null | undefined): boolean {
  const value = (name ?? "").toLowerCase();
  if (!value) return false;
  if (CUP_NAME.test(value)) return true;
  if (LEAGUE_NAME.test(value)) return false;
  return false;
}

export function displayCompetition(name: string | null | undefined): string {
  if (!name) return "";
  const value = name.toLowerCase();
  if (/champions league/.test(value)) return "UEFA Champions League";
  if (/conference league/.test(value) || /europa conference/.test(value)) {
    return "UEFA Europa Conference League";
  }
  if (/europa/.test(value)) return "UEFA Europa League";
  if (/\bfa cup\b/.test(value)) return "FA Cup";
  if (/scottish cup/.test(value) && !/league cup/.test(value)) {
    return "Scottish Cup";
  }
  if (/carabao/.test(value) || (/league cup/.test(value) && /england/.test(value))) {
    return "Carabao Cup";
  }
  if (/premier sports cup/.test(value) || (/league cup/.test(value) && /scotland/.test(value))) {
    return "Scottish League Cup";
  }
  return name.replace(/^England - |^Scotland - |^Europe - /i, "").trim();
}
