import { readFileSync } from "fs";
import { destinationForRole, SUPPORTER_HOME_PATH, SUPPORTER_PREDICT_PATH } from "../app/lib/routes";
import { destinationForSignedInKind } from "../app/lib/signed-in-role";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  SUPPORTER_HOME_PATH === SUPPORTER_PREDICT_PATH &&
    SUPPORTER_PREDICT_PATH === "/supporter/dashboard/predict",
  "Supporter home after login is the P4P tab"
);
assert(
  destinationForRole("fan") === SUPPORTER_PREDICT_PATH &&
    destinationForRole("supporter") === SUPPORTER_PREDICT_PATH &&
    destinationForRole(null) === SUPPORTER_PREDICT_PATH,
  "Fan, supporter, and default login land on P4P"
);
assert(
  destinationForSignedInKind("fan") === SUPPORTER_PREDICT_PATH,
  "A signed-in fan is sent to P4P"
);

const fanLogin = readFileSync("app/fan/login/page.tsx", "utf8");
const supporterLogin = readFileSync("app/supporter/login/page.tsx", "utf8");
const register = readFileSync("app/register/page.tsx", "utf8");
const play = readFileSync("app/components/fan/PredictForPlanetPlay.tsx", "utf8");
const phone = readFileSync("app/components/home/PredictForPlanet.tsx", "utf8");
const predictPage = readFileSync(
  "app/supporter/dashboard/predict/page.tsx",
  "utf8"
);

assert(
  fanLogin.includes("SUPPORTER_HOME_PATH") &&
    supporterLogin.includes("SUPPORTER_HOME_PATH") &&
    register.includes("SUPPORTER_HOME_PATH") &&
    !fanLogin.includes("SUPPORTER_CAMPAIGN_PATH") &&
    !supporterLogin.includes("SUPPORTER_CAMPAIGN_PATH") &&
    !register.includes("SUPPORTER_CAMPAIGN_PATH"),
  "Fan login, supporter login, and fan register default to P4P"
);

assert(
  play.includes("p4p-stay-on-tab-v1") &&
    !play.includes("location.assign") &&
    !play.includes("p4pDonateProjectsPath"),
  "The live P4P board stays on P4P instead of sending fans to Climate Projects"
);

assert(
  phone.includes("p4p-stay-on-tab-v1") &&
    !phone.includes("location.assign") &&
    !phone.includes("donateOnFullTime"),
  "The P4P demo phone does not auto-open Climate Projects"
);

assert(
  predictPage.includes("showPhone={false}") &&
    !predictPage.includes("donateOnFullTime"),
  "Logged-in fan P4P does not arm a Climate Projects hand-off"
);

if (failures.length > 0) {
  console.error("verify-fan-default-p4p failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-fan-default-p4p: ok");
