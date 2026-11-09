import { readFileSync } from "fs";
import {
  DEFAULT_MATCHRAV_CONSENT,
  compareRoutes,
  confirmMatchravTrip,
  attachMatchravTicket,
  destinationForFixture,
  destinationPoint,
  listMatchravTrips,
  matchravStadiumForClub,
  matchravStadiumForMatch,
  milesFromOriginToDestination,
  originPoint,
  readMatchravAnalytics,
  saveMatchravTrip,
  stadiumLabel,
} from "../app/lib/matchrav-journey";
import {
  stadiumSiteForClub,
  stadiumSiteForVenue,
} from "../app/lib/project-site";
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
    panel.includes("data-matchrav-miles") &&
    panel.includes("milesFromOriginToDestination") &&
    !panel.includes("TRAVEL_EXAMPLE.miles / 2") &&
    panel.includes("Return the same way") &&
    panel.includes("MATCHRAV_STADIUM_HEADING") &&
    panel.includes("MATCHRAV_TRAVEL_THERE") &&
    panel.includes("data-matchrav-ticket") &&
    panel.includes("data-matchrav-fund") &&
    panel.indexOf("legend={MATCHRAV_TRAVEL_THERE}") <
      panel.indexOf("Outbound distance (miles)") &&
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
    compareRoutes(30, 2).some((row) => row.id === "walk-cycle" && row.kg === 0) &&
    compareRoutes(200, 1).some((row) => row.id === "flight" && row.practical),
  "Round-trip compare still locks Car 30 miles / 2 people at 6.8 kg and includes Flight"
);

assert(
  apply.includes("cursor/matchrav-journey-ops-18f9") &&
    apply.includes('PIN = "cb14b63"') &&
    apply.includes("app/components/fan/FanMatchravPanel.tsx") &&
    apply.includes("app/lib/matchrav-journey.ts"),
  "PC overlay pulls the Matchrav journey files"
);

const everton = matchravStadiumForClub("Everton");
const brentfordAway: UpcomingMatch = {
  id: "brentford-everton",
  date: "2026-11-23",
  kickoff: "20:00",
  homeName: "Brentford",
  awayName: "Everton",
  venue: "Gtech Community Stadium",
  competition: "Premier League",
  source: "s4p",
  sourceUrl: null,
};
const eh11ToGtech = milesFromOriginToDestination(
  "EH11 2PB",
  "Gtech Community Stadium",
  brentfordAway,
  everton
);
assert(
  Boolean(originPoint("EH11 2PB")) &&
    stadiumSiteForVenue("Gtech Community Stadium")?.name === "Brentford" &&
    matchravStadiumForMatch("Everton", brentfordAway, everton)?.venue ===
      "Gtech Community Stadium" &&
    destinationForFixture("Everton", brentfordAway, everton) ===
      stadiumLabel(matchravStadiumForMatch("Everton", brentfordAway, everton)) &&
    destinationForFixture("Everton", brentfordAway, everton).includes(
      "Gtech Community Stadium"
    ) &&
    !destinationForFixture("Everton", brentfordAway, everton).includes(
      "Hill Dickinson"
    ) &&
    Boolean(destinationPoint("Gtech Community Stadium", brentfordAway, everton)) &&
    eh11ToGtech > 300 &&
    eh11ToGtech < 420,
  "Car outbound miles from EH11 2PB to Gtech Community Stadium are the real road-scale distance, not 15"
);

const carMilesApply = readFileSync("apply-matchrav-car-miles.mjs", "utf8");
assert(
  carMilesApply.includes("cursor/matchrav-car-miles-18f9") &&
    carMilesApply.includes('PIN = "25864c3"') &&
    carMilesApply.includes("milesFromOriginToDestination") &&
    carMilesApply.includes("app/components/fan/FanMatchravPanel.tsx"),
  "PC overlay pulls the Matchrav car miles files"
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

const hearts = matchravStadiumForClub("Hearts of Midlothian FC");
const heartsAwayAtIbrox: UpcomingMatch = {
  id: "rangers-hearts",
  date: "2026-11-22",
  kickoff: "15:00",
  homeName: "Rangers",
  awayName: "Hearts of Midlothian FC",
  venue: "Ibrox Stadium",
  competition: "Scottish Premiership",
  source: "s4p",
  sourceUrl: null,
};
const ibrox = matchravStadiumForMatch(
  "Hearts of Midlothian FC",
  heartsAwayAtIbrox,
  hearts
);
assert(
  ibrox?.venue === "Ibrox Stadium" &&
    stadiumLabel(ibrox).includes("Ibrox Stadium") &&
    !stadiumLabel(ibrox).includes("Tynecastle") &&
    destinationForFixture(
      "Hearts of Midlothian FC",
      heartsAwayAtIbrox,
      hearts
    ) === stadiumLabel(ibrox),
  "Hearts away at Rangers uses Ibrox Stadium details, matching Destination"
);

const withTicket = attachMatchravTicket(
  stored?.id ?? "",
  {
    fileName: "edinburgh-glasgow-train.pdf",
    mimeType: "application/pdf",
    dataUrl: "data:application/pdf;base64,dGlja2V0",
    uploadedAt: "2026-11-09T12:00:00.000Z",
  },
  DEFAULT_MATCHRAV_CONSENT
);
assert(
  withTicket?.ticketEvidence?.fileName === "edinburgh-glasgow-train.pdf" &&
    listMatchravTrips()[0]?.ticketEvidence?.fileName ===
      "edinburgh-glasgow-train.pdf" &&
    matchrav.includes("Travel ticket evidence") &&
    matchrav.includes("Hearts of Midlothian FC") &&
    panel.includes("MATCHRAV_TICKET_HEADING"),
  "Fund climate action stores travel ticket evidence on the journey"
);

if (failures.length > 0) {
  console.error("verify-matchrav-journey failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-matchrav-journey: ok");
