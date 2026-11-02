import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/game-time-sponsored-by-18f9";
const BUST = "game-time-sponsored-by-1";
const FILES = [
  "app/lib/predict-for-planet.ts",
  "app/components/fan/P4pLiveChallengePreview.tsx",
  "app/sponsor/game-time/page.tsx",
  "app/preview/game-time/page.tsx",
  "scripts/verify-game-time-slot-heading.ts",
  "scripts/verify-game-time-buy-first.ts",
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

const preview = "app/components/fan/P4pLiveChallengePreview.tsx";
const page = "app/sponsor/game-time/page.tsx";
if (existsSync(preview) && existsSync(page)) {
  const previewSrc = readFileSync(preview, "utf8");
  const pageSrc = readFileSync(page, "utf8");
  if (
    !previewSrc.includes("game-time-slot-heading-v1") ||
    !pageSrc.includes("{GAME_TIME_SLOT_MINUTES}-minute Game-Time slot") ||
    pageSrc.includes("<legend")
  ) {
    failed += 1;
    console.error(
      "Game-Time still has the old heading or the slot label on the box border. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("Game-Time files are missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Game-Time now says What Fans will predict on, and the 30-minute slot label sits above the box. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
