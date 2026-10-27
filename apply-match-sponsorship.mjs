import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/match-sponsorship-18f9";
const FILES = [
  "app/lib/sponsor-listings.ts",
  "app/lib/sponsor-wallet.ts",
  "app/lib/sponsor-card-payment.ts",
  "app/lib/sponsorship-auction.ts",
  "app/lib/sponsor-completion-flow.ts",
  "app/services/sponsor-offers.service.ts",
  "app/lib/match-day-carbon-offset.ts",
  "app/lib/climate-sponsors.ts",
  "app/lib/sponsor-dashboard.ts",
  "app/lib/sports.ts",
  "app/lib/global-match-day.ts",
  "app/components/club/ClubSponsorsListings.tsx",
  "app/components/club/MatchDayFolderPanel.tsx",
  "app/components/sponsor/ClimateSponsorshipWallet.tsx",
  "app/components/sponsor/ClubChosenProjectsPanel.tsx",
  "app/components/sponsor/SponsorInviteInbox.tsx",
  "app/components/sponsor/FundedClimateProjectsList.tsx",
  "app/club/dashboard/page.tsx",
  "app/sponsor/register/page.tsx",
  "app/sponsor/invitations/page.tsx",
  "app/sponsor/wallet/page.tsx",
  "app/sponsor/offers/OfferSignOff.tsx",
  "app/climate-sponsorship/page.tsx",
  "app/climate-credits/page.tsx",
  "app/preview/sponsor-listings/page.tsx",
  "app/preview/sponsor-card-payment/page.tsx",
  "app/preview/match-day-carbon-offset/page.tsx",
];

async function pullFile(rel) {
  const url = `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${BRANCH}/${rel}`;
  let lastError = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      mkdirSync(dirname(join(rel)), { recursive: true });
      writeFileSync(rel, Buffer.from(await response.arrayBuffer()));
      console.log("Pulled", rel);
      return true;
    } catch (err) {
      lastError = err;
      await new Promise((resolve) => setTimeout(resolve, attempt * 400));
    }
  }
  console.error(
    `Could not pull ${rel}. Stay in the S4C-platform folder and check the network.`,
    lastError instanceof Error ? lastError.message : lastError
  );
  return false;
}

let failed = 0;
for (const rel of FILES) {
  const ok = await pullFile(rel);
  if (!ok) failed += 1;
}

function read(rel) {
  return existsSync(rel) ? readFileSync(rel, "utf8") : "";
}

const wallet = read("app/components/sponsor/ClimateSponsorshipWallet.tsx");
const record = read("app/lib/match-day-carbon-offset.ts");
const payCopy = read("app/lib/sponsor-card-payment.ts");
const checks = [
  [
    wallet.includes("matchSponsorshipTopUp") &&
      wallet.includes("MATCH_SPONSORSHIP_LABEL") &&
      wallet.includes("PLATFORM_FEE_LABEL"),
    "ClimateSponsorshipWallet is still the old Commitment Fee form.",
  ],
  [
    !wallet.includes("Commitment Fee (Day 1)") &&
      !wallet.includes("Sponsorship/Goal-Scored") &&
      !wallet.includes("Maximum Sponsorship Amount"),
    "ClimateSponsorshipWallet still contains Commitment Fee or Sponsorship/Goal-Scored.",
  ],
  [
    record.includes("one Match-Sponsorship") &&
      !record.includes("Goals-scored Climate Projects"),
    "Match Day record copy still says Goals-scored Climate Projects.",
  ],
  [
    payCopy.includes("Match-Sponsorship plus the 5% Platform Fee"),
    "Wallet confirmation copy is still the old Commitment Fee text.",
  ],
];

for (const [ok, message] of checks) {
  if (!ok) {
    failed += 1;
    console.error(message);
  }
}

if (failed) process.exit(1);
console.log(
  "OK: The American Express wallet is now one Match-Sponsorship plus a 5% Platform Fee. Stop npm run dev, delete the .next folder, start npm run dev again, then hard-refresh (Ctrl+F5)."
);
