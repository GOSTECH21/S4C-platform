import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/match-day-carbon-offset-18f9";
const FILES = [
  "app/lib/match-day-carbon-offset.ts",
  "app/lib/climate-sponsors.ts",
  "app/lib/match-day-branding.ts",
  "app/lib/sponsor-completion-flow.ts",
  "app/services/climate-sponsors.service.ts",
  "app/services/sponsor-offers.service.ts",
  "app/services/club-match-day.service.ts",
  "app/sponsor/wallet/page.tsx",
  "app/sponsor/dashboard/page.tsx",
  "app/sponsor/offers/page.tsx",
  "app/sponsor/offers/OfferSignOff.tsx",
  "app/sponsor/offers/OfferSignOffPage.tsx",
  "app/club/dashboard/page.tsx",
  "app/preview/match-day-carbon-offset/page.tsx",
  "scripts/verify-match-day-carbon-offset.ts",
  "scripts/verify-sponsor-dashboard.ts",
  "scripts/verify-sponsor-completion-flow.ts",
  "scripts/verify-climate-sponsors.ts",
  "scripts/verify-lead-tab-after-signoff.ts",
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

const dashboard = "app/sponsor/dashboard/page.tsx";
if (existsSync(dashboard)) {
  const src = readFileSync(dashboard, "utf8");
  if (!src.includes("Match Day carbon footprint offset")) {
    failed += 1;
    console.error(
      "Dashboard is missing Match Day carbon footprint offset copy. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Sponsors sign off the Club's Match Day carbon footprint offset after the wallet. The five Climate Projects are a record for sponsors and the FUND-IT list for fans. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
