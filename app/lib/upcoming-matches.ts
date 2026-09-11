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
