/** Homepage Select Match → sponsor lock-in. Kept off the fixture catalog. */

import { SPONSOR_FROM_MATCH_PATH, safeSponsorReturnPath } from "./routes";

export const PENDING_SPONSOR_MATCH_KEY = "s4p.pending-sponsor-match";

export type PendingSponsorMatch = {
  club: string;
  fixtureName: string;
  league: string;
  date: string;
  kickoff: string;
  venue: string;
  matchId: string;
};

function clean(value: string | null | undefined): string {
  return String(value ?? "").trim();
}

export function pendingSponsorMatchFromSearch(
  search: string | null | undefined
): PendingSponsorMatch | null {
  const query = new URLSearchParams(String(search ?? "").replace(/^\?/, ""));
  const club = clean(query.get("club"));
  const fixtureName = clean(query.get("fixture"));
  if (!club || !fixtureName) return null;
  return {
    club,
    fixtureName,
    league: clean(query.get("league")),
    date: clean(query.get("date")),
    kickoff: clean(query.get("kickoff")),
    venue: clean(query.get("venue")),
    matchId: clean(query.get("match")),
  };
}

export function sponsorFromMatchPath(match: PendingSponsorMatch): string {
  const query = new URLSearchParams();
  query.set("club", match.club);
  query.set("fixture", match.fixtureName);
  if (match.league) query.set("league", match.league);
  if (match.date) query.set("date", match.date);
  if (match.kickoff) query.set("kickoff", match.kickoff);
  if (match.venue) query.set("venue", match.venue);
  if (match.matchId) query.set("match", match.matchId);
  return `${SPONSOR_FROM_MATCH_PATH}?${query.toString()}`;
}

export function savePendingSponsorMatch(match: PendingSponsorMatch): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      PENDING_SPONSOR_MATCH_KEY,
      JSON.stringify(match)
    );
  } catch {
    // Private mode can block sessionStorage.
  }
}

export function readPendingSponsorMatch(): PendingSponsorMatch | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PENDING_SPONSOR_MATCH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingSponsorMatch>;
    const club = clean(parsed.club);
    const fixtureName = clean(parsed.fixtureName);
    if (!club || !fixtureName) return null;
    return {
      club,
      fixtureName,
      league: clean(parsed.league),
      date: clean(parsed.date),
      kickoff: clean(parsed.kickoff),
      venue: clean(parsed.venue),
      matchId: clean(parsed.matchId),
    };
  } catch {
    return null;
  }
}

export function clearPendingSponsorMatch(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(PENDING_SPONSOR_MATCH_KEY);
  } catch {
    // Ignore blocked storage.
  }
}

export function resolvePendingSponsorMatch(
  search?: string | null
): PendingSponsorMatch | null {
  return (
    pendingSponsorMatchFromSearch(search) ?? readPendingSponsorMatch()
  );
}

export function continueAfterSponsorAuth(): string | null {
  if (typeof window === "undefined") return null;
  const next = safeSponsorReturnPath(
    new URLSearchParams(window.location.search).get("next")
  );
  if (next) return next;
  const pending = readPendingSponsorMatch();
  return pending ? sponsorFromMatchPath(pending) : null;
}
