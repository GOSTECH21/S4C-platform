import { readFileSync } from "fs";
import {
  GAME_TIME_CARBON_WALLET_LABEL,
  GAME_TIME_NAV_LABEL,
  GAME_TIME_PRODUCT_LABEL,
  GAME_TIME_SPONSOR_LABEL,
  GAME_TIME_SPONSORSHIP_LABEL,
  GAME_TIME_WALLET_LABEL,
  P4P_SHORT,
} from "../app/lib/predict-for-planet";
import { GAME_TIME_SPONSORSHIP_RANGE_LABEL } from "../app/lib/sponsor-listings";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  GAME_TIME_NAV_LABEL === "P4P" &&
    GAME_TIME_NAV_LABEL === P4P_SHORT &&
    GAME_TIME_SPONSORSHIP_LABEL === "P4P Sponsorship" &&
    GAME_TIME_SPONSOR_LABEL === "P4P Sponsor" &&
    GAME_TIME_PRODUCT_LABEL === "P4P Sponsor" &&
    GAME_TIME_CARBON_WALLET_LABEL === "P4P Carbon Wallet" &&
    GAME_TIME_WALLET_LABEL === "P4P Wallet" &&
    GAME_TIME_SPONSORSHIP_RANGE_LABEL === "P4P Sponsorship Amount",
  "P4P replaces Game-Time on labels, tabs and buttons"
);

const nav = readFileSync("app/sponsor/sponsor-nav.tsx", "utf8");
const page = readFileSync("app/sponsor/game-time/page.tsx", "utf8");
const demo = readFileSync("app/preview/game-time/page.tsx", "utf8");
const play = readFileSync("app/components/fan/PredictForPlanetPlay.tsx", "utf8");
const preview = readFileSync(
  "app/components/fan/P4pLiveChallengePreview.tsx",
  "utf8"
);
const overlay = readFileSync("apply-p4p-rename-game-time.mjs", "utf8");

assert(
  nav.includes("GAME_TIME_NAV_LABEL") &&
    nav.includes("p4p-rename-game-time-v1") &&
    !nav.includes(">Game-Time<") &&
    !nav.includes("          Game-Time"),
  "The sponsor tab is P4P, not Game-Time"
);
assert(
  page.includes("p4p-rename-game-time-v1") &&
    page.includes("Buy another {P4P_SHORT} slot") &&
    page.includes("Back to {GAME_TIME_NAV_LABEL}") &&
    page.includes("{GAME_TIME_SLOT_MINUTES}-minute {P4P_SHORT} slot") &&
    demo.includes("{GAME_TIME_SLOT_MINUTES}-minute {P4P_SHORT} slot") &&
    play.includes("GAME_TIME_SPONSOR_LABEL") &&
    preview.includes("GAME_TIME_SPONSOR_LABEL") &&
    !page.includes("Game-Time") &&
    !demo.includes("Game-Time") &&
    !play.includes("Game-Time") &&
    overlay.includes('STAMP = "p4p-rename-game-time-v1"'),
  "Sponsor P4P page, fan play and overlay drop the Game-Time phrase"
);

if (failures.length > 0) {
  console.error("verify-p4p-rename-game-time failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-p4p-rename-game-time: ok");
