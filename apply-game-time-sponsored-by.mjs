import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/game-time-sponsored-by-18f9";
const BUST = "game-time-sponsored-by-1";
const FILES = [
  "app/lib/predict-for-planet.ts",
  "app/lib/s4p-tabs.ts",
  "app/components/fan/P4pLiveChallengePreview.tsx",
  "app/sponsor/game-time/page.tsx",
  "app/sponsor/layout.tsx",
  "app/preview/game-time/page.tsx",
  "app/preview/sponsor-nav/page.tsx",
  "scripts/verify-game-time-sponsored-by.ts",
  "scripts/verify-game-time-slot-heading.ts",
  "scripts/verify-game-time-buy-first.ts",
  "scripts/verify-predict-for-planet.ts",
  "scripts/verify-sponsor-tabs-visible.ts",
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

const board = "app/components/fan/P4pLiveChallengePreview.tsx";
const layout = "app/sponsor/layout.tsx";
if (existsSync(board) && existsSync(layout)) {
  const boardSrc = readFileSync(board, "utf8");
  const layoutSrc = readFileSync(layout, "utf8");
  if (
    !boardSrc.includes("game-time-sponsored-by-v1") ||
    !boardSrc.includes("P4P_GAME_TIME_PREDICT_LABEL") ||
    !boardSrc.includes('data-testid="p4p-sponsored-by"') ||
    boardSrc.includes("P4P_POWERED_BY_LABEL") ||
    !layoutSrc.includes("S4P_SPONSOR_MARK")
  ) {
    failed += 1;
    console.error(
      "Game-Time is still missing Sponsored By logo space or S4P SPONSOR. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("Game-Time files are missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Game-Time shows Predict what happens next beside a Sponsored By logo slot, and the header says S4P SPONSOR. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
