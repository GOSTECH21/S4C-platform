import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/fan-p4p-drop-overlay-18f9";
const BUST = "fan-p4p-drop-overlay-1";
const FILES = [
  "app/lib/predict-for-planet.ts",
  "app/components/home/PredictForPlanet.tsx",
  "app/components/home/HowS4pPredictForPlanet.tsx",
  "app/components/fan/PredictForPlanetPlay.tsx",
  "app/dashboard/supporter/vote/page.tsx",
  "app/supporter/dashboard/predict/page.tsx",
  "app/preview/p4p-donate/page.tsx",
  "scripts/verify-p4p-wallet-full-time.ts",
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
const vote = "app/dashboard/supporter/vote/page.tsx";
const fan = "app/supporter/dashboard/predict/page.tsx";
if (existsSync(phone) && existsSync(vote) && existsSync(fan)) {
  const phoneSrc = readFileSync(phone, "utf8");
  const voteSrc = readFileSync(vote, "utf8");
  const fanSrc = readFileSync(fan, "utf8");
  if (
    !phoneSrc.includes("p4p-wallet-held-v1") ||
    !phoneSrc.includes("p4p-donate-funding-v1") ||
    !voteSrc.includes("Here are Climate Projects to donate your funding") ||
    !fanSrc.includes("showPhone={false}")
  ) {
    failed += 1;
    console.error(
      "Game-Time Wallet still resets before 90 minutes, or Climate Projects is missing the donate message. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("Predict-For Planet files are missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Game-Time Wallet holds until 90 minutes, then fans see Climate Projects to donate your funding. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
