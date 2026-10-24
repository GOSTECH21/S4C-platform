import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/local-all-clubs-18f9";
const FILES = [
  "app/components/sponsor/MatchSponsorshipPicker.tsx",
  "scripts/verify-club-sponsor-tabs.ts",
  "scripts/verify-local-leeds-fixtures.ts",
];

let failed = 0;
for (const rel of FILES) {
  const url = `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${BRANCH}/${rel}`;
  try {
    const response = await fetch(url);
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

const picker = "app/components/sponsor/MatchSponsorshipPicker.tsx";
if (existsSync(picker)) {
  const src = readFileSync(picker, "utf8");
  if (
    src.includes("DEMO_CLUB_NAMES") ||
    src.includes("demoFixturesForClub") ||
    src.includes("Arsenal fixture list") ||
    !src.includes("calendarFixturesForClub") ||
    !src.includes("Choose any club on the Sporting Calendar first")
  ) {
    failed += 1;
    console.error(
      "Local Sponsor still shows the three demo fixture lists. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Local Sponsor waits for any Sporting Calendar club. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
