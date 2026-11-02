import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/p4p-public-board-18f9";
const BUST = "p4p-public-board-1";
const FILES = [
  "app/lib/predict-for-planet.ts",
  "app/components/fan/PredictForPlanetPlay.tsx",
  "app/components/home/HowS4pPredictForPlanet.tsx",
  "app/supporter/dashboard/predict/page.tsx",
  "app/preview/fan-p4p/page.tsx",
  "scripts/verify-p4p-public-board.ts",
  "scripts/verify-fan-p4p-drop-overlay.ts",
  "scripts/verify-predict-for-planet.ts",
  "scripts/verify-p4p-wallet-full-time.ts",
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

const play = "app/components/fan/PredictForPlanetPlay.tsx";
if (existsSync(play)) {
  const playSrc = readFileSync(play, "utf8");
  if (
    !playSrc.includes("p4p-public-board-v1") ||
    !playSrc.includes("p4p-sponsored-game") ||
    playSrc.includes("P4P_LIVE_CHALLENGE_LABEL") ||
    playSrc.includes("If one of the 3 chosen events is awarded")
  ) {
    failed += 1;
    console.error(
      "Fan P4P is still the old live-challenge layout. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("Predict-For Planet play file is missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Fan P4P is the public board: intro, sponsored game, Make your prediction with the green tab, awards only if any, then Match Day Impact. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
