/** Clubs a National/Global or Local sponsor can pick — the full sporting calendar, not the three-club demo. */

import { seasonNamesMatch } from "./current-season";
import {
  SPORTING_CALENDAR_LEAGUES,
  isCupCompetitionName,
  sportingLeagueByName,
  type CalendarSport,
} from "./sporting-calendar-leagues";

export type CalendarClubGroup = {
  league: string;
  sport: CalendarSport;
  country: string;
  clubs: string[];
};

export function sportingCalendarClubGroups(): CalendarClubGroup[] {
  return SPORTING_CALENDAR_LEAGUES.flatMap((league) => {
    if (isCupCompetitionName(league.name)) return [];
    if (league.teams.length === 0) return [];
    return [
      {
        league: league.name,
        sport: league.sport,
        country: league.country,
        clubs: league.teams.map((team) => team.name),
      },
    ];
  });
}

export function sportingCalendarClubCount(): number {
  const names = new Set<string>();
  for (const group of sportingCalendarClubGroups()) {
    for (const club of group.clubs) names.add(club.toLowerCase());
  }
  return names.size;
}

export function isSportingCalendarClub(name: string | null | undefined): boolean {
  const raw = String(name ?? "").trim();
  if (!raw) return false;
  return sportingCalendarClubGroups().some((group) =>
    group.clubs.some((club) => seasonNamesMatch(club, raw))
  );
}

export function calendarClubNamesOnly(names: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const name of names) {
    const match = sportingCalendarClubGroups()
      .flatMap((group) => group.clubs)
      .find((club) => seasonNamesMatch(club, name));
    if (!match) continue;
    const key = match.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(match);
  }
  return out;
}

export function leagueForSportingCalendarClub(
  clubName: string | null | undefined
): string | null {
  const raw = String(clubName ?? "").trim();
  if (!raw) return null;
  for (const group of sportingCalendarClubGroups()) {
    if (group.clubs.some((club) => seasonNamesMatch(club, raw))) {
      return group.league;
    }
  }
  return sportingLeagueByName(raw)?.name ?? null;
}
