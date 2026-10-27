import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/match-sponsorship-18f9";
const FILES = [
  "app/lib/sponsor-listings.ts",
  "app/lib/sponsor-wallet.ts",
  "app/lib/sponsor-card-payment.ts",
  "app/lib/sponsorship-auction.ts",
  "app/lib/match-day-carbon-offset.ts",
  "app/lib/climate-sponsors.ts",
  "app/lib/sponsor-dashboard.ts",
  "app/lib/sports.ts",
  "app/lib/global-match-day.ts",
  "app/components/club/ClubSponsorsListings.tsx",
  "app/components/club/MatchDayFolderPanel.tsx",
  "app/components/sponsor/ClimateSponsorshipWallet.tsx",
  "app/components/sponsor/SponsorInviteInbox.tsx",
  "app/components/sponsor/FundedClimateProjectsList.tsx",
  "app/club/dashboard/page.tsx",
  "app/sponsor/register/page.tsx",
  "app/sponsor/invitations/page.tsx",
  "app/sponsor/offers/OfferSignOff.tsx",
  "app/climate-sponsorship/page.tsx",
  "app/climate-credits/page.tsx",
  "app/preview/sponsor-listings/page.tsx",
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

if (
  !read("app/lib/sponsor-listings.ts").includes("MATCH_SPONSORSHIP_LABEL") ||
  !read("app/lib/sponsor-listings.ts").includes("matchSponsorshipGbpFrom") ||
  !read("app/lib/sponsor-wallet.ts").includes("PLATFORM_FEE_RATE = 0.05") ||
  !read("app/lib/sponsor-wallet.ts").includes("matchSponsorshipTopUp") ||
  !read("app/sponsor/register/page.tsx").includes("MATCH_SPONSORSHIP_RANGE_LABEL") ||
  read("app/sponsor/register/page.tsx").includes("Sponsorship/Goal range") ||
  !read("app/components/sponsor/SponsorInviteInbox.tsx").includes(
    "MATCH_SPONSORSHIP_COMMIT_LABEL"
  ) ||
  read("app/components/sponsor/ClimateSponsorshipWallet.tsx").includes(
    "Sponsorship/Goal-Scored"
  ) ||
  !read("app/components/sponsor/ClimateSponsorshipWallet.tsx").includes(
    "matchSponsorshipTopUp"
  ) ||
  !read("app/lib/sponsor-card-payment.ts").includes("5% Platform Fee") ||
  !read("app/sponsor/offers/OfferSignOff.tsx").includes("5% Platform Fee") ||
  !read("app/lib/climate-sponsors.ts").includes("Match-Sponsorship")
) {
  failed += 1;
  console.error(
    "Match-Sponsorship files are missing. Pull the files above, then hard-refresh."
  );
}

if (failed) process.exit(1);
console.log(
  "OK: Lead Climate Sponsors now enter one Match-Sponsorship plus a 5% Platform Fee via Stripe. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
