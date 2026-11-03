/** Club Sustainability Director: the Match Day fixture they registered on Select Match. */

import { formatKickoff, formatMatchDate } from "./upcoming-matches";

export const CLUB_SELECTED_MATCH_STORAGE_PREFIX = "s4p.sd.selectedMatch.";
export const CLUB_SELECTED_MATCH_EVENT = "s4p-club-selected-match";

export type ClubSelectedMatch = {
  club: string;
  clubId?: string;
  matchId: string;
  fixtureName: string;
  league: string;
  date: string;
  kickoff: string;
  venue: string;
  savedAt: string;
};

function clean(value: string | null | undefined): string {
  return String(value ?? "").trim();
}

function storageKey(clubIdOrName: string): string {
  return CLUB_SELECTED_MATCH_STORAGE_PREFIX + clean(clubIdOrName).toLowerCase();
}

function parseMatch(raw: string | null): ClubSelectedMatch | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ClubSelectedMatch>;
    const club = clean(parsed.club);
    const fixtureName = clean(parsed.fixtureName);
    const matchId = clean(parsed.matchId);
    if (!club || !fixtureName || !matchId) return null;
    return {
      club,
      clubId: clean(parsed.clubId) || undefined,
      matchId,
      fixtureName,
      league: clean(parsed.league),
      date: clean(parsed.date),
      kickoff: clean(parsed.kickoff),
      venue: clean(parsed.venue),
      savedAt: clean(parsed.savedAt) || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function clubSelectedMatchFixtureLabel(
  match: Pick<ClubSelectedMatch, "fixtureName"> | null | undefined
): string {
  return clean(match?.fixtureName).replace(/\s+v\s+/i, " vs ");
}

export function clubMatchDayLabel(
  match: ClubSelectedMatch | null | undefined,
  clubName: string
): string {
  const fixture = clubSelectedMatchFixtureLabel(match);
  if (fixture) return fixture;
  return `${clean(clubName) || "Club"} Match Day`;
}

export function clubSelectedMatchDetail(
  match: ClubSelectedMatch | null | undefined
): string {
  if (!match) return "";
  const when = [
    match.date ? formatMatchDate(match.date) : "",
    match.kickoff ? formatKickoff(match.kickoff) : "",
  ]
    .filter(Boolean)
    .join(" · ");
  return [when, match.venue, match.league].filter(Boolean).join(" · ");
}

export function readClubSelectedMatch(clubIdOrName: string): ClubSelectedMatch | null {
  if (typeof window === "undefined") return null;
  const key = clean(clubIdOrName);
  if (!key) return null;
  try {
    return parseMatch(window.localStorage.getItem(storageKey(key)));
  } catch {
    return null;
  }
}

export function resolveClubSelectedMatch(
  clubId?: string | null,
  clubName?: string | null
): ClubSelectedMatch | null {
  return (
    (clubId ? readClubSelectedMatch(clubId) : null) ??
    (clubName ? readClubSelectedMatch(clubName) : null)
  );
}

export function saveClubSelectedMatch(match: ClubSelectedMatch): ClubSelectedMatch {
  const saved: ClubSelectedMatch = {
    ...match,
    club: clean(match.club),
    clubId: clean(match.clubId) || undefined,
    matchId: clean(match.matchId),
    fixtureName: clean(match.fixtureName),
    league: clean(match.league),
    date: clean(match.date),
    kickoff: clean(match.kickoff),
    venue: clean(match.venue),
    savedAt: new Date().toISOString(),
  };
  if (typeof window === "undefined") return saved;
  try {
    const payload = JSON.stringify(saved);
    window.localStorage.setItem(storageKey(saved.club), payload);
    if (saved.clubId) {
      window.localStorage.setItem(storageKey(saved.clubId), payload);
    }
    window.dispatchEvent(new Event(CLUB_SELECTED_MATCH_EVENT));
  } catch {
    // Private mode can block localStorage.
  }
  return saved;
}

export function clearClubSelectedMatch(clubIdOrName: string): void {
  if (typeof window === "undefined") return;
  const key = clean(clubIdOrName);
  if (!key) return;
  try {
    window.localStorage.removeItem(storageKey(key));
    window.dispatchEvent(new Event(CLUB_SELECTED_MATCH_EVENT));
  } catch {
    // Ignore blocked storage.
  }
}

export function matchesClubSelectedMatch(
  match: { id: string; fixtureName?: string },
  selected: ClubSelectedMatch | null | undefined
): boolean {
  if (!selected) return false;
  if (clean(match.id) && clean(match.id) === selected.matchId) return true;
  return (
    clubSelectedMatchFixtureLabel({ fixtureName: match.fixtureName ?? "" }) ===
    clubSelectedMatchFixtureLabel(selected)
  );
}
