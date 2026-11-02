import { readFileSync } from "fs";
import { P4P_SPONSOR_PREDICT_LABEL } from "../app/lib/predict-for-planet";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const lib = readFileSync("app/lib/predict-for-planet.ts", "utf8");
const preview = readFileSync(
  "app/components/fan/P4pLiveChallengePreview.tsx",
  "utf8"
);
const page = readFileSync("app/sponsor/game-time/page.tsx", "utf8");
const demo = readFileSync("app/preview/game-time/page.tsx", "utf8");
const apply = readFileSync("apply-game-time-slot-heading.mjs", "utf8");

assert(
  P4P_SPONSOR_PREDICT_LABEL === "What Fans will predict on" &&
    lib.includes('P4P_SPONSOR_PREDICT_LABEL = "What Fans will predict on"') &&
    lib.includes("game-time-slot-heading-v1"),
  "The sponsor Game-Time heading is What Fans will predict on"
);

assert(
  preview.includes("game-time-slot-heading-v1") &&
    preview.includes("P4P_SPONSOR_PREDICT_LABEL") &&
    !preview.includes("P4P_PREDICT_NEXT_LABEL") &&
    preview.includes('className="text-sm font-black text-slate-700"') &&
    preview.includes("{P4P_SPONSOR_PREDICT_LABEL}"),
  "The Game-Time event board uses the sponsor heading, not Predict what happens next"
);

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
  apply.includes('BRANCH = "cursor/game-time-slot-heading-18f9"') &&
    apply.includes("game-time-slot-heading-1") &&
    apply.includes("P4P_SPONSOR_PREDICT_LABEL") &&
    apply.includes("app/lib/predict-for-planet.ts"),
  "PC overlay pulls the sponsor heading and slot label fix"
);

if (failures.length > 0) {
  console.error("verify-game-time-slot-heading failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-game-time-slot-heading: ok");
