import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/real-fixtures-18f9";
const FILES = [
  "app/data/published-fixtures.json",
  "app/lib/sporting-calendar.ts",
  "app/lib/global-match-day.ts",
  "scripts/mine-published-fixtures.py",
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

const calendar = "app/lib/sporting-calendar.ts";
const picks = "app/lib/global-match-day.ts";
const jsonPath = "app/data/published-fixtures.json";
if (existsSync(calendar) && existsSync(picks) && existsSync(jsonPath)) {
  const catalog = readFileSync(calendar, "utf8");
  const example = readFileSync(picks, "utf8");
  const published = readFileSync(jsonPath, "utf8");
  if (
    !catalog.includes("published-fixtures.json") ||
    catalog.includes("function generateLeague") ||
    !example.includes("Chelsea v Manchester United") ||
    !published.includes("Chelsea v Manchester United") ||
    !published.includes("Dundee United")
  ) {
    failed += 1;
    console.error(
      "Published 2026/27 fixtures did not land. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: real 2026/27 fixtures are on this PC. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5). Open /sponsor/calendar or /preview/sporting-calendar and pick Saturday 31 October 2026."
);
