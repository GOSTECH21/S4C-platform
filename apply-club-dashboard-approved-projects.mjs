import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/club-dashboard-approved-projects-18f9";
const FILES = [
  "app/club/dashboard/page.tsx",
  "app/lib/voting-window.ts",
  "app/lib/partner-projects.ts",
  "scripts/verify-club-match-day.ts",
  "scripts/verify-voting-window.ts",
  "scripts/verify-wallet-vote.ts",
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
if (existsSync(page)) {
  const src = readFileSync(page, "utf8");
  if (
    src.indexOf("Approved Projects") > src.indexOf("<ClubClimateSponsorTabs") ||
    !src.includes("Approved Projects") ||
    src.includes("MatchDayFolderPanel") ||
    src.includes("Voted-For Projects") ||
    src.includes("Signed copy of the sponsorship") ||
    !src.includes("Selected and Funded Projects, kept for lookback")
  ) {
    failed += 1;
    console.error(
      "Club dashboard layout did not land. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: S4P Climate Projects sits above Our Climate Sponsors. Approved Projects replace the Match-Day folder. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
