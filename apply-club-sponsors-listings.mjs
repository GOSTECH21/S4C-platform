import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/club-sponsors-listings-18f9";
const FILES = [
  "app/lib/sponsor-listings.ts",
  "app/lib/partner-projects.ts",
  "app/lib/routes.ts",
  "app/lib/sponsor-card-payment.ts",
  "app/services/sponsor-listings.service.ts",
  "app/services/sponsor-card-payment.service.ts",
  "app/services/climate-sponsors.service.ts",
  "app/sponsor/offers/OfferSignOff.tsx",
  "app/sponsor/wallet/page.tsx",
  "app/sponsor/pay/page.tsx",
  "app/components/sponsor/ClimateSponsorshipWallet.tsx",
  "app/components/sponsor/ClubChosenProjectsPanel.tsx",
  "app/components/sponsor/StripeCardPayment.tsx",
  "app/components/sponsor/LeadSponsorHome.tsx",
  "app/components/club/ClubSponsorsListings.tsx",
  "app/components/club/ClubNav.tsx",
  "app/components/club/ClubClimateSponsorTabs.tsx",
  "app/components/sponsor/SponsorInviteInbox.tsx",
  "app/club/sponsors/page.tsx",
  "app/club/dashboard/page.tsx",
  "app/club/projects/select/page.tsx",
  "app/sponsor/register/page.tsx",
  "app/sponsor/local/register/page.tsx",
  "app/sponsor/invitations/page.tsx",
  "app/sponsor/login/page.tsx",
  "app/sponsor/sponsor-nav.tsx",
  "app/preview/sponsor-listings/page.tsx",
  "app/preview/sponsor-card-payment/page.tsx",
  "scripts/verify-sponsor-listings.ts",
  "scripts/verify-sponsor-leaderboard.ts",
  "scripts/verify-sponsor-card-payment.ts",
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
  !read("app/components/club/ClubNav.tsx").includes('label: "Sponsors"') ||
  !read("app/club/sponsors/page.tsx").includes("ClubSponsorsListings") ||
  !read("app/lib/sponsor-listings.ts").includes("GLOBAL_INVITE_WINDOW_HOURS") ||
  !read("app/sponsor/register/page.tsx").includes("Commitment Fee Range") ||
  !read("app/sponsor/local/register/page.tsx").includes("Sponsorship amount range") ||
  !read("app/club/dashboard/page.tsx").includes("Open Sponsors listings") ||
  read("app/sponsor/invitations/page.tsx").includes("SponsorNav") ||
  !read("app/sponsor/sponsor-nav.tsx").includes("sponsorInvitationsNavLabel") ||
  !read("app/components/sponsor/SponsorInviteInbox.tsx").includes(
    "INVITE_GBP_PER_GOAL_LABEL"
  ) ||
  !read("app/components/sponsor/SponsorInviteInbox.tsx").includes(
    "lockedInviteSummary"
  ) ||
  !read("app/components/sponsor/SponsorInviteInbox.tsx").includes(
    "INVITE_PROCEED_APPROVAL_LABEL"
  ) ||
  read("app/components/club/ClubSponsorsListings.tsx").includes("window.open(") ||
  !read("app/components/club/ClubSponsorsListings.tsx").includes(
    "Stay on this page"
  ) ||
  !read("app/lib/sponsor-listings.ts").includes("localInvitesDeliveredCopy") ||
  !read("app/components/sponsor/SponsorInviteInbox.tsx").includes(
    "LOCAL_INVITE_SIGN_LABEL"
  ) ||
  !read("app/sponsor/login/page.tsx").includes("localSponsorLoginPath") ||
  !read("app/lib/sponsor-card-payment.ts").includes("PAY_WITH_CARD_LABEL") ||
  !read("app/lib/routes.ts").includes("sponsorPayPath") ||
  !read("app/sponsor/wallet/page.tsx").includes("sponsorPayPath") ||
  read("app/sponsor/wallet/page.tsx").includes(
    "Sign off this Match Day sponsorship"
  ) ||
  !read("app/sponsor/pay/page.tsx").includes("StripeCardPayment") ||
  !read("app/services/sponsor-card-payment.service.ts").includes(
    "confirmMatchDayCardPayment"
  ) ||
  !read("app/components/sponsor/StripeCardPayment.tsx").includes(
    "PAY_WITH_CARD_LABEL"
  )
) {
  failed += 1;
  console.error(
    "Sponsors listings or card payment files are missing. Pull the files above, then hard-refresh."
  );
}

if (failed) process.exit(1);
console.log(
  "OK: Club Sponsors lists Global Brands and Local Businesses. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
