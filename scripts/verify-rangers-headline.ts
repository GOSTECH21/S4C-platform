import {
  nextFanMatchForClub,
  type ChosenMatch,
} from "../app/lib/climate-sponsors";
import {
  campaignHeadline,
  matchSponsorshipHeading,
} from "../app/lib/sponsorship-auction";

const failures: string[] = [];

function assert(ok: boolean, message: string) {
  if (!ok) failures.push(message);
}

const now = "2026-11-06T21:00:00.000Z";
const published = [
  { fixtureName: "St Mirren v Rangers", date: "2026-11-07", kickoff: "20:00" },
  { fixtureName: "Rangers v Aberdeen", date: "2026-11-24", kickoff: "20:00" },
];
const fundedAberdeen: ChosenMatch[] = [
  {
    clubName: "Rangers",
    fixtureName: "Rangers v Aberdeen",
    fixtureDate: "2026-11-24",
    kickoff: "20:00",
    lockedAt: now,
  },
];

assert(
  nextFanMatchForClub({
    clubName: "Rangers",
    signedOff: fundedAberdeen,
    published,
    now,
  })?.fixtureName === "Rangers v Aberdeen",
  "Rangers fans see Rangers v Aberdeen when that Match Day is funded, not St Mirren v Rangers"
);
assert(
  campaignHeadline("Rangers v Aberdeen") ===
    "Rangers v Aberdeen Climate Campaign",
  "The Climate Campaign headline is Rangers v Aberdeen"
);
assert(
  matchSponsorshipHeading("Everton") === "Everton Match Sponsorship",
  "The club line is Everton Match Sponsorship"
);
assert(
  nextFanMatchForClub({
    clubName: "Rangers",
    signedOff: [],
    published,
    now,
  })?.fixtureName === "St Mirren v Rangers",
  "With no funded Match Day, Rangers fans still see the next published fixture"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Rangers Climate Campaigns show Rangers v Aberdeen when that Match Day is funded."
);
