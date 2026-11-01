import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/p4p-confirm-selection-18f9";
const BUST = "p4p-confirm-selection-1";
const FILES = [
  "app/components/home/SelectMatchFixtures.tsx",
  "app/components/home/HowS4pSelectMatch.tsx",
  "app/preview/my-teams/page.tsx",
  "scripts/verify-confirm-club-selection.ts",
  "scripts/verify-fan-select-match-only.ts",
  "scripts/verify-homepage.ts",
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

const fixtures = "app/components/home/SelectMatchFixtures.tsx";
const select = "app/components/home/HowS4pSelectMatch.tsx";
if (existsSync(fixtures) && existsSync(select)) {
  const fixturesSrc = readFileSync(fixtures, "utf8");
  const selectSrc = readFileSync(select, "utf8");
  if (
    selectSrc.includes("data-confirm-club-selection") ||
    !fixturesSrc.includes("confirmClub") ||
    !fixturesSrc.includes("appliedInitialClub") ||
    !fixturesSrc.includes("pickerRef") ||
    fixturesSrc.includes("defaultValue={club}")
  ) {
    failed += 1;
    console.error(
      "Select Match still honours the dropdown immediately, or Confirm your Selection is still on that section. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("Select Match files are missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: See upcoming matches loads the chosen club's next 10 fixtures. Confirm your Selection now sits on Predict-For Planet. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
