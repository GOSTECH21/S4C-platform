import { existsSync, readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const how = readFileSync("app/components/home/HowItWorks.tsx", "utf8");
const select = readFileSync("app/components/home/HowS4pSelectMatch.tsx", "utf8");
const fixtures = readFileSync(
  "app/components/home/SelectMatchFixtures.tsx",
  "utf8"
);
const lib = readFileSync("app/lib/how-s4p-works.ts", "utf8");
const fan = readFileSync(
  "app/components/fan/FanMyTeamsPanel.tsx",
  "utf8"
);
const fanP4p = readFileSync(
  "app/supporter/dashboard/predict/page.tsx",
  "utf8"
);
const p4pSection = readFileSync(
  "app/components/home/HowS4pPredictForPlanet.tsx",
  "utf8"
);
const lead = readFileSync(
  "app/components/sponsor/MatchDayLockIn.tsx",
  "utf8"
);
const localRegister = readFileSync(
  "app/sponsor/local/register/page.tsx",
  "utf8"
);
const wallet = readFileSync("app/sponsor/wallet/page.tsx", "utf8");
const club = readFileSync("app/club/dashboard/page.tsx", "utf8");

assert(how.includes("how-s4p-split-steps-v1"), "HowItWorks stamp is split v1");
assert(
  how.includes("HOW_S4P_ACCESS_JOIN") &&
    how.includes("{HOW_S4P_ACCESS_JOIN.title}") &&
    !how.includes("Explore the six steps below") &&
    !how.includes("Step 1 of 6") &&
    !how.includes("1. {") &&
    !how.includes("data-how-s4p-scroller") &&
    how.includes("data-how-s4p-access-join"),
  "Homepage How S4P Works is Access & Join without explore, step badge, or 1."
);
assert(
  lib.includes("/images/home/access-join-phone.png") &&
    lib.includes("/images/home/select-match-phone.png") &&
    lib.includes('title: "Access & Join"') &&
    lib.includes('title: "Select Match"') &&
    lib.includes("HOW_S4P_SELECT_MATCH_FAN") &&
    lib.includes("HOW_S4P_SELECT_MATCH_SPONSOR") &&
    lib.includes("HOW_S4P_SELECT_MATCH_CLUB"),
  "Access & Join and Select Match copy live in how-s4p-works"
);
assert(
  select.includes('data-how-s4p-select-match={audience}') &&
    select.includes('fan: "view"') &&
    select.includes('sponsor: "sponsor"') &&
    select.includes('club: "club"') &&
    select.includes("SelectMatchPhone") &&
    select.includes("SelectMatchFixtures"),
  "HowS4pSelectMatch is a reusable phone panel with fan/sponsor/club modes"
);
assert(
  fixtures.includes('export type SelectMatchMode = "view" | "sponsor" | "club"') &&
    fixtures.includes("data-phone-match-sponsor") &&
    fixtures.includes("data-phone-match-select") &&
    fixtures.includes("Sponsor · Sign off") &&
    fixtures.includes("Select this Match"),
  "Select Match phone rows lock-in for sponsors and select for fans/clubs"
);
assert(
  fan.includes('audience="fan"') &&
    fan.includes("clubOptions={selected.map((team) => team.name)}") &&
    !fan.includes("UpcomingMatches") &&
    !fan.includes("MyTeamsList") &&
    lead.includes('audience="sponsor"') &&
    localRegister.includes('audience="sponsor"') &&
    wallet.includes('audience="sponsor"') &&
    club.includes('audience="club"') &&
    club.includes("clubLocked"),
  "Select Match is on fan My Teams, lead lock-in, local register/wallet, and club dashboard"
);
assert(
  fanP4p.includes("HowS4pPredictForPlanet") &&
    fanP4p.includes("PredictForPlanetPlay") &&
    p4pSection.includes("data-how-s4p-p4p") &&
    p4pSection.includes("PredictForPlanetPhone") &&
    p4pSection.includes("PredictForPlanetPanel") &&
    p4pSection.indexOf("PredictForPlanetPanel") <
      p4pSection.indexOf("PredictForPlanetPhone") &&
    p4pSection.includes("HOW_S4P_P4P") &&
    lib.includes('title: "Predict-For Planet"') &&
    lib.includes("/images/home/plan-your-travel-phone.png") &&
    !how.includes("PredictForPlanetPhone") &&
    !how.includes("HOW_S4P_P4P"),
  "Image P4P lands on the Fan P4P tab with the live prediction board, not the homepage"
);
assert(
  existsSync("public/images/home/access-join-phone.png") &&
    existsSync("public/images/home/select-match-phone.png") &&
    existsSync("public/images/home/how-youre-supporting-phone.png") &&
    existsSync("public/images/home/plan-your-travel-phone.png") &&
    existsSync("public/images/home/match-day-climate-mission-phone.png") &&
    existsSync("public/images/home/choose-direct-impact-phone.png"),
  "All six How S4P Works phone images remain in public/images/home"
);
const frame = readFileSync("app/components/home/PhoneFrame.tsx", "utf8");
const supporting = readFileSync(
  "app/components/home/HowYoureSupporting.tsx",
  "utf8"
);
const p4pPhone = readFileSync(
  "app/components/home/PredictForPlanet.tsx",
  "utf8"
);
assert(
  frame.includes("data-phone-frame") &&
    frame.includes("hidden h-auto w-full md:block") &&
    frame.includes("PHONE_COLUMN_CLASS") &&
    how.includes("hidden md:block") &&
    how.includes("data-phone-frame") &&
    how.includes("PHONE_COLUMN_CLASS") &&
    how.includes("onLogin") &&
    select.includes("PHONE_COLUMN_CLASS") &&
    p4pSection.includes("PHONE_COLUMN_CLASS") &&
    fixtures.includes("PhoneFrame") &&
    p4pPhone.includes("PhoneFrame") &&
    supporting.includes("PhoneFrame") &&
    supporting.includes("max-md:static"),
  "Phone bezels hide below md; Access & Join, Select Match, P4P, and How You're Supporting are handset-native"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "How S4P Works: homepage Access & Join only; Select Match on fan, lead, local, and club screens."
);
