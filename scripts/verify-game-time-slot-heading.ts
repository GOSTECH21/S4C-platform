import { readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const page = readFileSync("app/sponsor/game-time/page.tsx", "utf8");
const demo = readFileSync("app/preview/game-time/page.tsx", "utf8");
const apply = readFileSync("apply-game-time-slot-heading.mjs", "utf8");

assert(
  page.includes("game-time-slot-heading-v1") &&
    page.includes("{GAME_TIME_SLOT_MINUTES}-minute Game-Time slot") &&
    page.includes("mt-2 rounded-xl border") &&
    !page.includes("<legend") &&
    demo.includes("game-time-slot-heading-v1") &&
    demo.includes("{GAME_TIME_SLOT_MINUTES}-minute Game-Time slot") &&
    demo.includes("mt-2 rounded-xl border") &&
    !demo.includes("<legend"),
  "The 30-minute Game-Time slot label sits above the radio box, not on the border"
);

assert(
  apply.includes('BRANCH = "cursor/game-time-sponsored-by-18f9"') &&
    apply.includes("game-time-sponsored-by-1") &&
    apply.includes("app/lib/predict-for-planet.ts"),
  "PC overlay pulls the slot label fix from the Sponsored By branch"
);

if (failures.length > 0) {
  console.error("verify-game-time-slot-heading failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-game-time-slot-heading: ok");
