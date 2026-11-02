import { readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const page = readFileSync("app/sponsor/game-time/page.tsx", "utf8");
const preview = readFileSync(
  "app/components/fan/P4pLiveChallengePreview.tsx",
  "utf8"
);
const demo = readFileSync("app/preview/game-time/page.tsx", "utf8");
const apply = readFileSync("apply-game-time-buy-first.mjs", "utf8");
const applyP4p = readFileSync("apply-predict-for-planet.mjs", "utf8");
const applyP4pPs1 = readFileSync("apply-predict-for-planet.ps1", "utf8");
const applySlot = readFileSync("apply-p4p-slot-timer.mjs", "utf8");

const introIdx = page.indexOf("Buy a {GAME_TIME_SLOT_MINUTES}-minute slot");
const nextIdx = page.indexOf("<P4pPredictNextBoard");
const clubIdx = page.indexOf("<ClubLeagueMenu");
const liveIdx = page.indexOf("<P4pLiveChallengePreview");
const taglineIdx = preview.indexOf("{P4P_TAGLINE}");
const liveCardIdx = preview.indexOf('data-testid="p4p-live-challenge"');

assert(
  page.includes("game-time-buy-first-v1") &&
    page.includes("P4pPredictNextBoard") &&
    page.includes('data-testid="p4p-game-time-buy"') &&
    page.includes('data-testid="p4p-game-time-live"') &&
    introIdx >= 0 &&
    nextIdx > introIdx &&
    clubIdx > nextIdx &&
    liveIdx > clubIdx,
  "Game-Time places What happens next and the buy form immediately under the intro, then the live challenge"
);

assert(
  preview.includes("game-time-buy-first-v1") &&
    preview.includes("P4pPredictNextBoard") &&
    preview.includes("{P4P_TAGLINE}") &&
    preview.includes('data-testid="p4p-tagline"') &&
    preview.includes("text-4xl") &&
    preview.includes("sm:text-5xl") &&
    taglineIdx >= 0 &&
    liveCardIdx > taglineIdx &&
    !preview.includes("What fans see on Predict-For Planet"),
  "The live challenge heading is a larger Predict. Participate. Power Climate Action"
);

assert(
  demo.includes("game-time-buy-first-v1") &&
    demo.includes("P4pPredictNextBoard") &&
    demo.includes("P4pLiveChallengePreview") &&
    demo.includes("ClubLeagueMenu") &&
    demo.indexOf("<P4pPredictNextBoard") <
      demo.indexOf("<P4pLiveChallengePreview") &&
    !demo.includes("What fans see on Predict-For Planet"),
  "Game-Time preview stacks the buy board above the live challenge"
);

assert(
  apply.includes('BRANCH = "cursor/game-time-buy-first-18f9"') &&
    apply.includes("game-time-buy-first-1") &&
    apply.includes("app/sponsor/game-time/page.tsx") &&
    apply.includes("app/components/fan/P4pLiveChallengePreview.tsx") &&
    applyP4p.includes('BRANCH = "cursor/game-time-buy-first-18f9"') &&
    applyP4p.includes("game-time-buy-first-1") &&
    applyP4p.includes("{P4P_TAGLINE}") &&
    applyP4p.includes('previewText.includes("What fans see on Predict-For Planet")') &&
    applyP4pPs1.includes("cursor/game-time-buy-first-18f9") &&
    applyP4pPs1.includes("game-time-buy-first-1") &&
    applyP4pPs1.includes("P4P_TAGLINE") &&
    applySlot.includes('BRANCH = "cursor/game-time-buy-first-18f9"') &&
    applySlot.includes("game-time-buy-first-1"),
  "PC overlays pull Game-Time buy-first from this branch"
);

if (failures.length > 0) {
  console.error("verify-game-time-buy-first failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-game-time-buy-first: ok");
