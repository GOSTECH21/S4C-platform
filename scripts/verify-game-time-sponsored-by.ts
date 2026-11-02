import { readFileSync } from "fs";
import {
  P4P_GAME_TIME_PREDICT_LABEL,
  P4P_GAME_TIME_SPONSORED_BY_LABEL,
} from "../app/lib/predict-for-planet";
import { S4P_SPONSOR_MARK } from "../app/lib/s4p-tabs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const lib = readFileSync("app/lib/predict-for-planet.ts", "utf8");
const board = readFileSync(
  "app/components/fan/P4pLiveChallengePreview.tsx",
  "utf8"
);
const page = readFileSync("app/sponsor/game-time/page.tsx", "utf8");
const demo = readFileSync("app/preview/game-time/page.tsx", "utf8");
const layout = readFileSync("app/sponsor/layout.tsx", "utf8");
const navPreview = readFileSync("app/preview/sponsor-nav/page.tsx", "utf8");
const apply = readFileSync("apply-game-time-sponsored-by.mjs", "utf8");

assert(
  P4P_GAME_TIME_PREDICT_LABEL === "Predict what happens next" &&
    P4P_GAME_TIME_SPONSORED_BY_LABEL === "Sponsored By" &&
    S4P_SPONSOR_MARK === "S4P SPONSOR" &&
    lib.includes("game-time-sponsored-by-v1"),
  "Game-Time copy is Predict what happens next, Sponsored By, and S4P SPONSOR"
);

assert(
  board.includes("game-time-sponsored-by-v1") &&
    board.includes("P4P_GAME_TIME_PREDICT_LABEL") &&
    board.includes("Predict what") &&
    board.includes("happens next") &&
    board.includes('data-testid="p4p-sponsored-by"') &&
    board.includes('accept="image/*"') &&
    board.includes("saveBrandLogo") &&
    !board.includes("P4P_POWERED_BY_LABEL") &&
    !board.includes("P4P_SPONSOR_PREDICT_LABEL") &&
    !board.includes("What Fans will predict on"),
  "The Game-Time board has a two-line Predict heading and a Sponsored By logo slot"
);

assert(
  page.includes("game-time-sponsored-by-v1") &&
    page.includes("onLogoChange={setLogoUrl}") &&
    page.includes("Add your logo next to Sponsored By.") &&
    page.includes('data-testid="p4p-game-time-form"') &&
    demo.includes("onLogoChange={setLogoUrl}") &&
    demo.includes("S4P_SPONSOR_MARK"),
  "The buy form waits for a logo, then Club, Match and Continue to payment"
);

assert(
  layout.includes("S4P_SPONSOR_MARK") &&
    layout.includes('data-testid="s4p-sponsor-mark"') &&
    layout.includes("s4p-logo-back-home-v1") &&
    navPreview.includes("S4P_SPONSOR_MARK"),
  "The sponsor header keeps the S4P SPONSOR mark for assistive text"
);

assert(
  apply.includes('BRANCH = "cursor/game-time-sponsored-by-18f9"') &&
    apply.includes("game-time-sponsored-by-1") &&
    apply.includes("P4P_GAME_TIME_PREDICT_LABEL") &&
    apply.includes("app/sponsor/layout.tsx"),
  "PC overlay pulls the Sponsored By logo slot and S4P SPONSOR mark"
);

if (failures.length > 0) {
  console.error("verify-game-time-sponsored-by failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-game-time-sponsored-by: ok");
