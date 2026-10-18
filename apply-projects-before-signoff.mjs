import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/projects-before-signoff-18f9";
const FILES = [
  "app/lib/match-day-carbon-offset.ts",
  "app/lib/global-match-day.ts",
  "app/components/sponsor/ClubChosenProjectsPanel.tsx",
  "app/components/sponsor/MatchDayLockIn.tsx",
  "app/sponsor/wallet/page.tsx",
  "app/sponsor/dashboard/page.tsx",
  "app/sponsor/offers/page.tsx",
  "app/sponsor/offers/OfferSignOff.tsx",
  "app/sponsor/offers/OfferSignOffPage.tsx",
  "app/services/sponsor-offers.service.ts",
  "app/preview/match-day-carbon-offset/page.tsx",
  "app/preview/match-day-lock-in/page.tsx",
  "scripts/verify-projects-before-signoff.ts",
  "scripts/verify-sponsor-dashboard.ts",
  "scripts/verify-match-day-carbon-offset.ts",
  "scripts/verify-sponsor-completion-flow.ts",
  "scripts/verify-sporting-calendar.ts",
  "scripts/verify-local-new-sponsorship.ts",
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

const lockIn = "app/components/sponsor/MatchDayLockIn.tsx";
const wallet = "app/sponsor/wallet/page.tsx";
const panel = "app/components/sponsor/ClubChosenProjectsPanel.tsx";
if (existsSync(lockIn) && existsSync(wallet) && existsSync(panel)) {
  const lockSrc = readFileSync(lockIn, "utf8");
  const walletSrc = readFileSync(wallet, "utf8");
  const panelSrc = readFileSync(panel, "utf8");
  if (
    !lockSrc.includes("ClubChosenProjectsPanel") ||
    !walletSrc.includes("chosenProjectsReadyForMatchDay") ||
    !walletSrc.includes("MATCH_DAY_SIGNOFF_PENDING_COPY") ||
    !panelSrc.includes("MATCH_DAY_PENDING_APPROVAL_LABEL")
  ) {
    failed += 1;
    console.error(
      "Projects-before-sign-off files did not land. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Typing a Club shows that Club's Climate Projects. Sign-off waits until those Projects are visible; otherwise it stays pending approval. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
