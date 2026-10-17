import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/offers-club-projects-auto-18f9";
const FILES = [
  "app/lib/sponsor-completion-flow.ts",
  "app/lib/match-day-carbon-offset.ts",
  "app/services/club-match-day.service.ts",
  "app/services/sponsor-offers.service.ts",
  "app/sponsor/offers/page.tsx",
  "scripts/verify-sponsor-completion-flow.ts",
  "scripts/verify-sponsor-dashboard.ts",
  "scripts/verify-match-day-carbon-offset.ts",
  "scripts/verify-club-match-day.ts",
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

const offers = "app/services/sponsor-offers.service.ts";
const page = "app/sponsor/offers/page.tsx";
if (existsSync(offers) && existsSync(page)) {
  const service = readFileSync(offers, "utf8");
  const ui = readFileSync(page, "utf8");
  if (
    service.includes("isDemoClubName(offer.clubName)") ||
    !service.includes("stampOfferWithLockedUploads") ||
    !service.includes("findStoredClubSelectionByName") ||
    !ui.includes("appear here automatically") ||
    !ui.includes("MATCH_DAY_PROJECTS_WAITING_COPY")
  ) {
    failed += 1;
    console.error(
      "Automatic Match Day Climate Projects did not land. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Match Day Climate Projects now lists the locked club's five automatically. Sports Teams stays the 3-club demo. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
