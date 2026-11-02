import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/p4p-fund-project-18f9";
const BUST = "p4p-fund-project-1";
const FILES = [
  "app/lib/predict-for-planet.ts",
  "app/services/predict-for-planet.service.ts",
  "app/components/fan/PredictForPlanetPlay.tsx",
  "scripts/verify-p4p-fund-project.ts",
  "scripts/verify-p4p-public-board.ts",
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

const play = "app/components/fan/PredictForPlanetPlay.tsx";
if (existsSync(play)) {
  const playSrc = readFileSync(play, "utf8");
  if (
    !playSrc.includes("p4p-fund-project-v1") ||
    !playSrc.includes("P4P_FUND_PROJECT_LABEL") ||
    !playSrc.includes('data-testid="p4p-fund-project"')
  ) {
    failed += 1;
    console.error(
      "Match Day Impact is still missing Fund your Project. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("Predict-For Planet play file is missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Match Day Impact ends with Fund your Project, which puts the Fan Carbon Wallet onto the chosen Climate Project. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
