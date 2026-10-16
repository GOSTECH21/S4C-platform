import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/season-2026-27-clubs-18f9";
const FILES = [
  "app/lib/sporting-calendar-leagues.ts",
  "app/lib/current-season.ts",
  "app/lib/upcoming-matches.ts",
  "scripts/verify-register-clubs.ts",
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

const leagues = "app/lib/sporting-calendar-leagues.ts";
if (existsSync(leagues)) {
  const src = readFileSync(leagues, "utf8");
  const premier = src.match(
    /export const PREMIER_LEAGUE_TEAMS[\s\S]*?^];/m
  )?.[0] ?? "";
  if (
    !premier.includes('t("Coventry City"') ||
    premier.includes('t("Burnley"') ||
    !src.includes('t("St Johnstone"') ||
    src.includes('t("Livingston"')
  ) {
    failed += 1;
    console.error(
      "The 2026/27 club lists did not land. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Register as Sponsor lists 2026/27 clubs in every league. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5). Premier League now has Coventry, Hull and Ipswich instead of Burnley, West Ham and Wolves."
);
