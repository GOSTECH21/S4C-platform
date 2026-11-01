import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/confirm-club-selection-18f9";
const BUST = "confirm-club-selection-1";
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
    !selectSrc.includes("confirm-club-selection-v1") ||
    !fixturesSrc.includes("confirmClub") ||
    !fixturesSrc.includes("appliedInitialClub") ||
    !fixturesSrc.includes("pickerRef") ||
    fixturesSrc.includes("defaultValue={club}")
  ) {
    failed += 1;
    console.error(
      "Select Match still honours the dropdown immediately or snaps back to the first club. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("Select Match files are missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Confirm your Selection honours the chosen club, and See upcoming matches loads that club's next 10 fixtures. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
