import { readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const join = readFileSync("app/components/home/HomeJoinMission.tsx", "utf8");
const front = readFileSync("app/components/home/HomeFrontPage.tsx", "utf8");
const login = readFileSync("app/components/auth/RoleLoginForm.tsx", "utf8");
const board = readFileSync(
  "app/components/fan/P4pLiveChallengePreview.tsx",
  "utf8"
);
const page = readFileSync("app/sponsor/game-time/page.tsx", "utf8");
const apply = readFileSync("apply-play-p4p-optional-logo.mjs", "utf8");

assert(
  join.includes("play-p4p-fan-login-v1") &&
    join.includes("FAN_LOGIN_PATH") &&
    join.includes('data-fan-join-tab="play-p4p"') &&
    join.includes("hardNavigateOnClick(FAN_LOGIN_PATH") &&
    !join.includes("onPlayP4P") &&
    front.includes("<HomeJoinMission />") &&
    !front.includes("showFanP4P") &&
    login.includes("Register here") &&
    login.includes("Don&apos;t have an account?"),
  "Play P4P opens Fan Login, which still offers Register here"
);

assert(
  board.includes("sponsored-by-first-v1") &&
    board.indexOf("{P4P_GAME_TIME_SPONSORED_BY_LABEL}") <
      board.indexOf("Add logo") &&
    !board.includes("hidden text-sm font-semibold text-slate-700 sm:block") &&
    page.includes("sponsored-by-first-v1") &&
    !page.includes("pointer-events-none opacity-40") &&
    !page.includes("Add your logo next to Sponsored By."),
  "Sponsored By is before the logo, and the logo does not block Club, Match or payment"
);

assert(
  apply.includes('BRANCH = "cursor/play-p4p-optional-logo-18f9"') &&
    apply.includes("play-p4p-optional-logo-1") &&
    apply.includes("app/components/home/HomeJoinMission.tsx") &&
    apply.includes("app/sponsor/game-time/page.tsx"),
  "PC overlay pulls Play P4P to Fan Login and the optional logo"
);

if (failures.length > 0) {
  console.error("verify-play-p4p-optional-logo failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-play-p4p-optional-logo: ok");
