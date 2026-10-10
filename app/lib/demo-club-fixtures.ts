/** Upcoming Match Day lists for the three demo clubs when live feeds are empty. */

import {
  clubFixtureFromUpcoming,
  sameNamedFixture,
  type ClubFixture,
} from "./club-fixtures";
import { isDemoClubName, seasonNamesMatch } from "./current-season";
import type { UpcomingMatch } from "./upcoming-matches";

type DemoSeed = {
  date: string;
  kickoff: string;
  homeName: string;
  awayName: string;
  venue: string;
  competition: string;
};

const ARSENAL: DemoSeed[] = [
  {
    date: "2026-10-17",
    kickoff: "15:00",
    homeName: "Arsenal",
    awayName: "Liverpool",
    venue: "Emirates Stadium",
    competition: "Premier League",
  },
  {
    date: "2026-10-24",
    kickoff: "12:30",
    homeName: "Arsenal",
    awayName: "Leeds United",
    venue: "Emirates Stadium",
    competition: "Premier League",
  },
  {
    date: "2026-10-31",
    kickoff: "17:30",
    homeName: "Chelsea",
    awayName: "Arsenal",
    venue: "Stamford Bridge",
    competition: "Premier League",
  },
  {
    date: "2026-11-07",
    kickoff: "16:30",
    homeName: "Arsenal",
    awayName: "Tottenham Hotspur",
    venue: "Emirates Stadium",
    competition: "Premier League",
  },
  {
    date: "2026-11-21",
    kickoff: "15:00",
    homeName: "Manchester City",
    awayName: "Arsenal",
    venue: "Etihad Stadium",
    competition: "Premier League",
  },
  {
    date: "2026-12-05",
    kickoff: "15:00",
    homeName: "Arsenal",
    awayName: "Aston Villa",
    venue: "Emirates Stadium",
    competition: "Premier League",
  },
];

const HEARTS: DemoSeed[] = [
  {
    date: "2026-10-17",
    kickoff: "15:00",
    homeName: "Hearts",
    awayName: "Celtic",
    venue: "Tynecastle Park",
    competition: "Scottish Premiership",
  },
  {
    date: "2026-10-24",
    kickoff: "12:30",
    homeName: "Rangers",
    awayName: "Hearts",
    venue: "Ibrox Stadium",
    competition: "Scottish Premiership",
  },
  {
    date: "2026-10-31",
    kickoff: "15:00",
    homeName: "Hearts",
    awayName: "Aberdeen",
    venue: "Tynecastle Park",
    competition: "Scottish Premiership",
  },
  {
    date: "2026-11-07",
    kickoff: "15:00",
    homeName: "Hearts",
    awayName: "Hibernian",
    venue: "Tynecastle Park",
    competition: "Scottish Premiership",
  },
  {
    date: "2026-11-21",
    kickoff: "15:00",
    homeName: "Dundee United",
    awayName: "Hearts",
    venue: "Tannadice Park",
    competition: "Scottish Premiership",
  },
  {
    date: "2026-12-05",
    kickoff: "15:00",
    homeName: "Hearts",
    awayName: "St Mirren",
    venue: "Tynecastle Park",
    competition: "Scottish Premiership",
  },
];

const HIBERNIAN: DemoSeed[] = [
  {
    date: "2026-10-17",
    kickoff: "15:00",
    homeName: "Hibernian",
    awayName: "Celtic",
    venue: "Easter Road Stadium",
    competition: "Scottish Premiership",
  },
  {
    date: "2026-10-24",
    kickoff: "15:00",
    homeName: "Hibernian",
    awayName: "Aberdeen",
    venue: "Easter Road Stadium",
    competition: "Scottish Premiership",
  },
  {
    date: "2026-10-31",
    kickoff: "12:30",
    homeName: "Rangers",
    awayName: "Hibernian",
    venue: "Ibrox Stadium",
    competition: "Scottish Premiership",
  },
  {
    date: "2026-11-07",
    kickoff: "15:00",
    homeName: "Hibernian",
    awayName: "Hearts",
    venue: "Easter Road Stadium",
    competition: "Scottish Premiership",
  },
  {
    date: "2026-11-21",
    kickoff: "15:00",
    homeName: "Kilmarnock",
    awayName: "Hibernian",
    venue: "Rugby Park",
    competition: "Scottish Premiership",
  },
  {
    date: "2026-12-05",
    kickoff: "15:00",
    homeName: "Hibernian",
    awayName: "Motherwell",
    venue: "Easter Road Stadium",
    competition: "Scottish Premiership",
  },
];

function demoKey(clubName: string): "arsenal" | "hearts" | "hibernian" | null {
  if (seasonNamesMatch(clubName, "Arsenal")) return "arsenal";
  if (seasonNamesMatch(clubName, "Hearts")) return "hearts";
  if (seasonNamesMatch(clubName, "Hibernian")) return "hibernian";
  return null;
}

function seedToUpcoming(seed: DemoSeed, clubKey: string, index: number): UpcomingMatch {
  return {
    id: `demo:${clubKey}:${seed.date}:${index}`,
    date: seed.date,
    kickoff: seed.kickoff,
    homeName: seed.homeName,
    awayName: seed.awayName,
    venue: seed.venue,
    competition: seed.competition,
    source: "s4p",
    sourceUrl: null,
  };
}

function seedsFor(clubKey: "arsenal" | "hearts" | "hibernian"): DemoSeed[] {
  if (clubKey === "arsenal") return ARSENAL;
  if (clubKey === "hearts") return HEARTS;
  return HIBERNIAN;
}

export function demoUpcomingForClub(clubName: string): UpcomingMatch[] {
  const key = demoKey(clubName);
  if (!key) return [];
  const today = new Date().toISOString().slice(0, 10);
  return seedsFor(key)
    .filter((seed) => seed.date >= today)
    .map((seed, index) => seedToUpcoming(seed, key, index));
}

export function demoFixturesForClub(clubName: string): ClubFixture[] {
  return demoUpcomingForClub(clubName).map(clubFixtureFromUpcoming);
}

export function withDemoClubFixtures(
  clubName: string,
  published: ClubFixture[]
): ClubFixture[] {
  if (!isDemoClubName(clubName)) return published;
  const demo = demoFixturesForClub(clubName);
  if (published.length === 0) return demo;
  const extra = demo.filter(
    (row) =>
      !published.some((live) => sameNamedFixture(live.fixtureName, row.fixtureName))
  );
  return [...published, ...extra];
}

export function withDemoUpcomingFixtures(
  clubName: string,
  published: UpcomingMatch[]
): UpcomingMatch[] {
  if (!isDemoClubName(clubName)) return published;
  const demo = demoUpcomingForClub(clubName);
  if (published.length === 0) return demo;
  const extra = demo.filter(
    (row) =>
      !published.some((live) =>
        sameNamedFixture(
          `${live.homeName} v ${live.awayName}`,
          `${row.homeName} v ${row.awayName}`
        )
      )
  );
  return [...published, ...extra];
}
