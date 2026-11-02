import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/game-time-sponsored-by-18f9";
const BUST = "game-time-sponsored-by-1";
const FILES = [
  "app/lib/predict-for-planet.ts",
  "app/components/fan/P4pLiveChallengePreview.tsx",
  "app/sponsor/game-time/page.tsx",
  "app/preview/game-time/page.tsx",
  "scripts/verify-game-time-buy-first.ts",
  "scripts/verify-game-time-slot-heading.ts",
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

const page = "app/sponsor/game-time/page.tsx";
const preview = "app/components/fan/P4pLiveChallengePreview.tsx";
if (existsSync(page) && existsSync(preview)) {
  const pageSrc = readFileSync(page, "utf8");
  const previewSrc = readFileSync(preview, "utf8");
  const nextIdx = pageSrc.indexOf("P4pPredictNextBoard");
  const clubIdx = pageSrc.indexOf("ClubLeagueMenu");
  const liveIdx = pageSrc.indexOf("P4pLiveChallengePreview");
  if (
    !pageSrc.includes("game-time-buy-first-v1") ||
    !previewSrc.includes("{P4P_TAGLINE}") ||
    previewSrc.includes("What fans see on Predict-For Planet") ||
    nextIdx < 0 ||
    clubIdx < nextIdx ||
    liveIdx < clubIdx
  ) {
    failed += 1;
    console.error(
      "Game-Time is still missing the buy-first layout. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("Game-Time files are missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Game-Time puts What happens next and the buy form under the intro, then the live challenge under a larger Predict. Participate. Power Climate Action. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
