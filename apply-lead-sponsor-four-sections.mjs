import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/lead-sponsor-four-sections-18f9";
const FILES = [
  "app/lib/lead-sponsor-home.ts",
  "app/components/sponsor/LeadSponsorHome.tsx",
  "app/components/sponsor/SponsorCistTable.tsx",
  "app/sponsor/dashboard/page.tsx",
  "app/preview/lead-sponsor-dashboard/page.tsx",
  "scripts/verify-lead-sponsor-home.ts",
  "scripts/verify-sponsor-dashboard.ts",
  "scripts/verify-sporting-calendar.ts",
  "scripts/verify-club-sponsor-tabs.ts",
  "scripts/verify-local-new-sponsorship.ts",
  "scripts/verify-match-day-carbon-offset.ts",
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

function read(rel) {
  return existsSync(rel) ? readFileSync(rel, "utf8") : "";
}

const dashboard = read("app/sponsor/dashboard/page.tsx");
const home = read("app/components/sponsor/LeadSponsorHome.tsx");
const lib = read("app/lib/lead-sponsor-home.ts");
if (
  !dashboard.includes("LeadSponsorHome") ||
  dashboard.includes("MatchDayLockIn") ||
  !home.includes("LEAD_AWAITING_TITLE") ||
  !home.includes("LEAD_APPROVED_TITLE") ||
  !home.includes("LEAD_PAID_TITLE") ||
  !home.includes("Section (d)") ||
  !lib.includes("Projects that are awaiting for my acceptance")
) {
  failed += 1;
  console.error(
    "Lead dashboard is missing the four sections. Pull the files above, then hard-refresh."
  );
}

if (failed) process.exit(1);
console.log(
  "OK: Lead Climate Sponsor Dashboard now shows only (a) awaiting acceptance, (b) approved, (c) paid, and (d) CIST. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
