import { readFileSync } from "fs";
import {
  FAN_LOGIN_PATH,
  FAN_REGISTER_PATH,
  fanLoginPath,
  fanRegisterPath,
  SUPPORTER_HOME_PATH,
  SUPPORTER_MATCHRAV_PATH,
} from "../app/lib/routes";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const matchrav = readFileSync("app/lib/matchrav.ts", "utf8");
const routes = readFileSync("app/lib/routes.ts", "utf8");
const login = readFileSync("app/fan/login/page.tsx", "utf8");
const register = readFileSync("app/register/page.tsx", "utf8");
const tabs = readFileSync(
  "app/dashboard/supporter/components/FanTabBar.tsx",
  "utf8"
);
const panel = readFileSync("app/components/fan/FanMatchravPanel.tsx", "utf8");
const page = readFileSync("app/supporter/dashboard/matchrav/page.tsx", "utf8");
const alias = readFileSync("app/dashboard/supporter/matchrav/page.tsx", "utf8");
const apply = readFileSync("apply-matchrav-fan-account.mjs", "utf8");

assert(
  SUPPORTER_MATCHRAV_PATH === "/supporter/dashboard/matchrav" &&
    routes.includes('SUPPORTER_MATCHRAV_PATH = "/supporter/dashboard/matchrav"'),
  "Matchrav lives at /supporter/dashboard/matchrav"
);

assert(
  fanLoginPath(SUPPORTER_MATCHRAV_PATH) ===
    `${FAN_LOGIN_PATH}?next=${encodeURIComponent(SUPPORTER_MATCHRAV_PATH)}` &&
    matchrav.includes("fanLoginPath(SUPPORTER_MATCHRAV_PATH)") &&
    matchrav.includes("MATCHRAV_EXPLORE_HREF") &&
    !matchrav.includes("FAN_REGISTER_PATH"),
  "Explore Matchrav is Fan Login with next=Matchrav"
);

assert(
  fanRegisterPath(SUPPORTER_MATCHRAV_PATH) ===
    `${FAN_REGISTER_PATH}?next=${encodeURIComponent(SUPPORTER_MATCHRAV_PATH)}` &&
    fanRegisterPath(SUPPORTER_HOME_PATH) === FAN_REGISTER_PATH &&
    login.includes("fanRegisterPath(destination)") &&
    login.includes("useSearchParams") &&
    register.includes("useSearchParams") &&
    register.includes("fanLoginPath(nextPath)") &&
    register.includes("afterAuthPath"),
  "Fan Login Register here and Fan registration keep the Matchrav return path"
);

assert(
  tabs.includes('label: "Matchrav"') &&
    tabs.includes("SUPPORTER_MATCHRAV_PATH") &&
    tabs.includes('data-fan-tabs="6"') &&
    tabs.includes("grid-cols-6") &&
    tabs.indexOf('label: "Matchrav"') < tabs.indexOf('label: "P4P"'),
  "Fan accounts have a Matchrav tab before P4P"
);

assert(
  page.includes("FanMatchravPanel") &&
    !page.includes("dynamic") &&
    alias.includes("redirect(SUPPORTER_MATCHRAV_PATH)") &&
    panel.includes("MATCHRAV_ACCOUNT_STAMP") &&
    panel.includes("MATCHRAV_ACCOUNT_INTRO") &&
    panel.includes("MATCHRAV_ACCOUNT_STEPS") &&
    matchrav.includes('MATCHRAV_ACCOUNT_STAMP = "matchrav-fan-account-v1"'),
  "The Matchrav tab shows the first Matchrav account panel"
);

assert(
  apply.includes("cursor/matchrav-fan-tab-18f9") &&
    apply.includes('PIN = "37be6a4"') &&
    apply.includes("git fetch") &&
    apply.includes("app/components/fan/FanMatchravPanel.tsx") &&
    apply.includes("app/dashboard/supporter/components/FanTabBar.tsx"),
  "PC overlay pulls the Matchrav fan-account tab"
);

if (failures.length > 0) {
  console.error("verify-matchrav-fan-account failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-matchrav-fan-account: ok");
