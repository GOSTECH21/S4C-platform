import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/fan-p4p-drop-overlay-18f9";
const BUST = "fan-p4p-drop-overlay-1";
const FILES = [
  "app/lib/predict-for-planet.ts",
  "app/components/home/PredictForPlanet.tsx",
  "app/components/fan/PredictForPlanetPlay.tsx",
  "scripts/verify-p4p-slot-wipe.ts",
  "scripts/verify-p4p-slot-timer.ts",
  "scripts/verify-predict-for-planet.ts",
];

let failed = 0;
for (const rel of FILES) {
  const url = `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${BRANCH}/${rel}?v=${BUST}`;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    mkdirSync(dirname(join(rel)), { recursive: true });
    writeFileSync(rel, Buffer.from(await response.arrayBuffer()));
    console.log("Pulled", rel);
  } catch (err) {
    failed += 1;
    console.error(
      `Could not pull ${rel}. Stay in the S4C-platform folder and check the network.`,
      err instanceof Error ? err.message : err
    );
  }
}

const phone = "app/components/home/PredictForPlanet.tsx";
if (existsSync(phone)) {
  const src = readFileSync(phone, "utf8");
  if (
    !src.includes("p4p-slot-wipe-v1") ||
    !src.includes("p4pAdvanceSlotBoard") ||
    src.includes("picked.length === P4P_PREDICTIONS_PER_WINDOW ? P4P_PARTICIPATION_GBP : 0")
  ) {
    failed += 1;
    console.error(
      "P4P still resets the wallet with the picks. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("app/components/home/PredictForPlanet.tsx is missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: At 0:00 the previous slot picks wipe, and Game-Time Wallet keeps a running total. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
