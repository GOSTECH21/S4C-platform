import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/league-fixture-accordion-18f9";
const FILES = [
  "app/lib/fixture-accordion.ts",
  "app/components/sponsor/SportingCalendarBoard.tsx",
  "app/components/sponsor/MatchSponsorshipPicker.tsx",
  "scripts/verify-sporting-calendar.ts",
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

const helper = "app/lib/fixture-accordion.ts";
const board = "app/components/sponsor/SportingCalendarBoard.tsx";
if (existsSync(helper) && existsSync(board)) {
  const lib = readFileSync(helper, "utf8");
  const ui = readFileSync(board, "utf8");
  if (
    !lib.includes("FIXTURE_ACCORDION_PREVIEW = 2") ||
    !ui.includes("toggleLeague") ||
    !ui.includes("visibleAccordionItems") ||
    !ui.includes("aria-expanded")
  ) {
    failed += 1;
    console.error(
      "The league fixture accordion did not land. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: leagues with more than two Matches collapse until you click the league heading. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5). Open /preview/sporting-calendar and pick a Saturday."
);
