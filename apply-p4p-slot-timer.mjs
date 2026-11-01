import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/p4p-wallet-full-time-18f9";
const BUST = "p4p-wallet-full-time-1";
const FILES = [
  "app/lib/predict-for-planet.ts",
  "app/components/home/PredictForPlanet.tsx",
  "app/components/fan/PredictForPlanetPlay.tsx",
  "app/components/fan/P4pLiveChallengePreview.tsx",
  "scripts/verify-p4p-slot-timer.ts",
  "scripts/verify-predict-for-planet.ts",
  "scripts/verify-score-for-planet.ts",
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
    !src.includes("p4p-slot-timer-v1") ||
    !src.includes("P4P_PREDICT_NEXT_LABEL") ||
    src.includes("Global Brands buy a 30-minute Game-Time slot") ||
    src.includes("What happens next?")
  ) {
    failed += 1;
    console.error(
      "P4P phone is still missing the slot timer or still shows the Global Brands box. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("app/components/home/PredictForPlanet.tsx is missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: P4P drops the Global Brands box, adds a resetting 5-minute slot timer, club logos, and a larger sponsor promo. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
