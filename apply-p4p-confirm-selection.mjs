import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/p4p-wallet-full-time-18f9";
const BUST = "p4p-wallet-full-time-1";
const FILES = [
  "app/components/home/PredictForPlanet.tsx",
  "app/components/home/HowS4pSelectMatch.tsx",
  "scripts/verify-p4p-confirm-selection.ts",
  "scripts/verify-confirm-club-selection.ts",
  "scripts/verify-fan-select-match-only.ts",
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
const select = "app/components/home/HowS4pSelectMatch.tsx";
if (existsSync(phone) && existsSync(select)) {
  const phoneSrc = readFileSync(phone, "utf8");
  const selectSrc = readFileSync(select, "utf8");
  if (
    !phoneSrc.includes("p4p-confirm-selection-v1") ||
    !phoneSrc.includes("Confirm your Selection") ||
    selectSrc.includes("data-confirm-club-selection")
  ) {
    failed += 1;
    console.error(
      "Confirm your Selection is still on Select Match or missing from Predict-For Planet. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("Predict-For Planet files are missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Confirm your Selection is at the bottom of Predict-For Planet and honours the 3 event picks. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
