import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/club-sponsors-listings-18f9";
const FILES = [
  "app/lib/sponsor-listings.ts",
  "app/lib/partner-projects.ts",
  "app/lib/routes.ts",
  "app/services/sponsor-listings.service.ts",
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
  "app/sponsor/sponsor-nav.tsx",
  "app/preview/sponsor-listings/page.tsx",
  "scripts/verify-sponsor-listings.ts",
  "scripts/verify-sponsor-leaderboard.ts",
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
  )
) {
  failed += 1;
  console.error(
    "Sponsors listings are missing. Pull the files above, then hard-refresh."
  );
}

if (failed) process.exit(1);
console.log(
  "OK: Club Sponsors lists Global Brands and Local Businesses. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
