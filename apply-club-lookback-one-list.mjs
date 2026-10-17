import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/club-lookback-one-list-18f9";
const FILES = [
  "app/lib/sponsor-dashboard.ts",
  "app/club/dashboard/page.tsx",
  "scripts/verify-sponsor-dashboard.ts",
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

const page = "app/club/dashboard/page.tsx";
const helper = "app/lib/sponsor-dashboard.ts";
if (existsSync(page) && existsSync(helper)) {
  const src = readFileSync(page, "utf8");
  const lib = readFileSync(helper, "utf8");
  if (
    !src.includes("lookbackRecords") ||
    !src.includes("dedupeLookbackRecords") ||
    !lib.includes("LOOKBACK_MERGE_WINDOW_MS") ||
    !lib.includes("lookbackTimesClose")
  ) {
    failed += 1;
    console.error(
      "Lookback still lists the same five twice. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Match Day lookback now keeps one copy of the same project list. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
