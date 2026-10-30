import { readFileSync } from "fs";
import {
  FAN_REGISTER_INTRO,
  FAN_REGISTER_TEAMS_COPY,
} from "../app/lib/fan-register-copy";
import { fanRegisterCatalog } from "../app/services/teams.service";
import { sportingCalendarClubCount } from "../app/lib/calendar-clubs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  FAN_REGISTER_INTRO ===
    "You are registering as a Sports Fan to help your favourite Team offset their Match Day Carbon Footprints. As a registered S4P user, you will be entitled to take cash from your Team's Sponsors Carbon Wallet, and Donate it to any of the 5 listed Climate Projects chosen by Team for that Match Day",
  "Fan registration intro is the worldwide Sports Fan copy"
);
assert(
  FAN_REGISTER_TEAMS_COPY ===
    "Pick from the current 2026/27 season. A confirmed score by those clubs unlocks the Score Impact Pool on that Match-Sponsorship. Extra scores count in S4P statistics but do not add sponsor liabilities.",
  "Fan registration team copy names the season without the three-club demo list"
);
assert(
  !FAN_REGISTER_INTRO.includes("Hibernian") &&
    !FAN_REGISTER_TEAMS_COPY.includes("Hearts") &&
    !FAN_REGISTER_TEAMS_COPY.includes("£10,000"),
  "Fan registration copy does not name demo clubs or a £10,000/Goal example"
);

const catalog = fanRegisterCatalog();
const names = catalog.flatMap((group) =>
  group.competitions.flatMap((competition) =>
    competition.teams.map((team) => team.displayName)
  )
);
assert(
  names.some((name) => /chelsea/i.test(name)) &&
    names.some((name) => /real madrid/i.test(name)) &&
    names.some((name) => /new england patriots/i.test(name)) &&
    names.some((name) => /boston celtics/i.test(name)) &&
    names.some((name) => /arsenal/i.test(name)),
  "Fan registration lists Sporting Calendar clubs beyond the three-club demo"
);
assert(
  names.length >= sportingCalendarClubCount(),
  "Fan registration catalog covers the Sporting Calendar"
);

const registerPage = readFileSync("app/register/page.tsx", "utf8");
assert(
  registerPage.includes("FAN_REGISTER_INTRO") &&
    registerPage.includes("showScorePrice={false}") &&
    registerPage.includes("uuidOrNull(teams[0]?.id)") &&
    !registerPage.includes("readInvitedClubs") &&
    !registerPage.includes("exampleS2PS") &&
    !registerPage.includes("You've been invited"),
  "Fan registration page hides Goal scored · £10,000/Goal and the Hibernian invite"
);
assert(
  registerPage.includes("formReady") &&
    registerPage.includes("suppressHydrationWarning") &&
    registerPage.includes('roleRegisterAccount("fan")') &&
    registerPage.includes("account.firstNameName") &&
    registerPage.includes("account.emailName") &&
    registerPage.includes("account.passwordName") &&
    registerPage.includes('autoComplete="off"') &&
    registerPage.includes("FanRegisterField") &&
    !registerPage.includes('name="firstName"') &&
    !registerPage.includes('name="email"') &&
    !registerPage.includes('name="password"'),
  "Fan registration waits until the client is ready and uses unique field names so Chrome/LastPass cannot mismatch SSR HTML"
);

const picker = readFileSync("app/components/fan/TeamPicker.tsx", "utf8");
assert(
  picker.includes("showScorePrice") &&
    picker.includes("openCompetitions") &&
    picker.includes("suppressHydrationWarning"),
  "Team picker can hide the Goal scored price on Fan registration"
);

if (failures.length > 0) {
  console.error("verify-fan-register-open failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-fan-register-open: ok");
