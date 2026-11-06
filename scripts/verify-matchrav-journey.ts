import { readFileSync } from "fs";
import {
  DEFAULT_MATCHRAV_CONSENT,
  compareRoutes,
  confirmMatchravTrip,
  destinationForFixture,
  listMatchravTrips,
  matchravStadiumForClub,
  readMatchravAnalytics,
  saveMatchravTrip,
} from "../app/lib/matchrav-journey";
import { stadiumSiteForClub } from "../app/lib/project-site";
import { ADMIN_MATCHRAV_PATH } from "../app/lib/routes";
import type { UpcomingMatch } from "../app/lib/upcoming-matches";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const matchrav = readFileSync("app/lib/matchrav.ts", "utf8");
const journey = readFileSync("app/lib/matchrav-journey.ts", "utf8");
const panel = readFileSync("app/components/fan/FanMatchravPanel.tsx", "utf8");
const fanPage = readFileSync("app/supporter/dashboard/matchrav/page.tsx", "utf8");
const api = readFileSync("app/api/fan/matchrav-fixtures/route.ts", "utf8");
const admin = readFileSync("app/admin/matchrav/page.tsx", "utf8");
const ops = readFileSync("app/components/admin/MatchravOpsBoard.tsx", "utf8");
const sidebar = readFileSync("app/layout/Sidebar.tsx", "utf8");
const apply = readFileSync("apply-matchrav-journey.mjs", "utf8");

assert(
  matchrav.includes('MATCHRAV_JOURNEY_STAMP = "matchrav-journey-ops-v1"') &&
    panel.includes("MATCHRAV_JOURNEY_STAMP") &&
    panel.includes("data-matchrav-journey") &&
    panel.includes("data-matchrav-fixture") &&
    panel.includes("data-matchrav-stadium") &&
    panel.includes("data-matchrav-origin") &&
    panel.includes("data-matchrav-routing") &&
    panel.includes("data-matchrav-trips") &&
    panel.includes("data-matchrav-confirm") &&
    panel.includes("data-matchrav-privacy") &&
    panel.includes("Return the same way") &&
    panel.includes('type="submit"') &&
    !panel.includes("PhoneFrame") &&
    fanPage.includes("initialClub") &&
    fanPage.includes("calendarMatchesAsUpcoming"),
  "Fan Matchrav has fixture, origin, routing, trips, confirmation and privacy"
);

const madrid = matchravStadiumForClub("Real Madrid");
const awayFixture: UpcomingMatch = {
  id: "valencia-real-madrid",
  date: "2026-11-07",
  kickoff: "20:00",
  homeName: "Valencia",
  awayName: "Real Madrid",
  venue: "Mestalla Stadium",
  competition: "La Liga",
  source: "s4p",
  sourceUrl: null,
};
const homeFixture: UpcomingMatch = {
  ...awayFixture,
  id: "real-madrid-home",
  homeName: "Real Madrid",
  awayName: "Valencia",
  venue: "Santiago Bernabeu",
};

assert(
  api.includes("calendarMatchesAsUpcoming") &&
    api.includes("matchravStadiumForClub") &&
    journey.includes("destinationForFixture") &&
    Boolean(stadiumSiteForClub("Real Madrid")) &&
    Boolean(madrid?.venue.includes("Bernabeu")) &&
    destinationForFixture("Real Madrid", awayFixture, madrid) ===
      "Mestalla Stadium" &&
    Boolean(
      destinationForFixture("Real Madrid", homeFixture, madrid).includes(
        "Bernabeu"
      )
    ),
  "Club fixtures and stadiums resolve, including Real Madrid"
);

assert(
  ADMIN_MATCHRAV_PATH === "/admin/matchrav" &&
    admin.includes("MatchravOpsBoard") &&
    ops.includes("data-matchrav-ops") &&
    sidebar.includes('href: "/admin/matchrav"'),
  "S4P admin has a Matchrav operations page"
);

const car = compareRoutes(30, 2).find((row) => row.id === "car");
assert(
  car?.kg === 6.8 &&
    compareRoutes(30, 2).some((row) => row.id === "walk-cycle" && row.kg === 0),
  "Round-trip compare still locks Car 30 miles / 2 people at 6.8 kg"
);

assert(
  apply.includes("cursor/matchrav-journey-ops-18f9") &&
    apply.includes("app/components/fan/FanMatchravPanel.tsx") &&
    apply.includes("app/lib/matchrav-journey.ts"),
  "PC overlay pulls the Matchrav journey files"
);

const memory = new Map<string, string>();
(globalThis as { window?: { localStorage: Storage } }).window = {
  localStorage: {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
    removeItem: (key: string) => {
      memory.delete(key);
    },
    clear: () => memory.clear(),
    key: (index: number) => [...memory.keys()][index] ?? null,
    get length() {
      return memory.size;
    },
  } as Storage,
};

const stored = saveMatchravTrip(
  {
    club: "Real Madrid",
    matchId: awayFixture.id,
    fixtureName: "Valencia vs Real Madrid",
    venue: "Mestalla Stadium",
    matchDate: awayFixture.date,
    origin: "Madrid centre",
    destination: "Mestalla Stadium",
    outboundMiles: 15,
    returnMiles: 15,
    outboundMode: "car",
    returnMode: "car",
    occupants: 2,
  },
  { ...DEFAULT_MATCHRAV_CONSENT, shareAnonymous: true }
);
assert(stored?.totalKg === 6.8, "Saved Real Madrid round trip is 6.8 kg");
assert(listMatchravTrips().length === 1, "Trip stores on this device");
const confirmed = confirmMatchravTrip(stored?.id ?? "", "train", {
  ...DEFAULT_MATCHRAV_CONSENT,
  shareAnonymous: true,
});
assert(
  confirmed?.status === "confirmed" && confirmed.confirmedMode === "train",
  "Travel mode confirmation records the real mode"
);
assert(
  readMatchravAnalytics().confirmed === 1 &&
    readMatchravAnalytics().byMode.train === 1,
  "Anonymous analytics count confirmed journeys"
);

if (failures.length > 0) {
  console.error("verify-matchrav-journey failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-matchrav-journey: ok");
