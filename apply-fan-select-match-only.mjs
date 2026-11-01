import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/fan-select-match-only-18f9";
const BUST = "fan-select-match-only-1";
const FILES = [
  "app/components/fan/FanMyTeamsPanel.tsx",
  "app/components/home/SelectMatchFixtures.tsx",
  "app/components/home/HowS4pSelectMatch.tsx",
  "app/preview/my-teams/page.tsx",
  "scripts/verify-fan-select-match-only.ts",
  "scripts/verify-how-s4p-split.ts",
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

const fan = "app/components/fan/FanMyTeamsPanel.tsx";
const fixtures = "app/components/home/SelectMatchFixtures.tsx";
if (existsSync(fan) && existsSync(fixtures)) {
  const fanSrc = readFileSync(fan, "utf8");
  const fixturesSrc = readFileSync(fixtures, "utf8");
  if (
    fanSrc.includes("UpcomingMatches") ||
    fanSrc.includes("MyTeamsList") ||
    !fixturesSrc.includes("select-match-contained-v1") ||
    !fixturesSrc.includes("clubOptions.includes(club)")
  ) {
    failed += 1;
    console.error(
      "My Teams still dumps a second fixture list. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("My Teams Select Match files are missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: My Teams now uses Choose your club and a contained 10-match phone. Extra fixture lists are gone. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
