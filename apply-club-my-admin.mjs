import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const REFS = ["main", "cursor/club-my-admin-18f9"];
const BUST = "club-my-admin-pc-2";
const FILES = [
  "app/lib/club-selected-match.ts",
  "app/lib/club-address-book.ts",
  "app/lib/routes.ts",
  "app/lib/partner-projects.ts",
  "app/lib/sponsor-listings.ts",
  "app/lib/how-s4p-works.ts",
  "app/services/club-match-day.service.ts",
  "app/services/sponsor-listings.service.ts",
  "app/components/club/ClubNav.tsx",
  "app/components/club/ClubSelectedMatchBanner.tsx",
  "app/components/club/ClubChooseProjectsCopy.tsx",
  "app/components/club/ClubAddressBookPanel.tsx",
  "app/components/club/ClubSponsorsListings.tsx",
  "app/components/home/HowS4pSelectMatch.tsx",
  "app/components/home/SelectMatchFixtures.tsx",
  "app/club/dashboard/page.tsx",
  "app/club/admin/page.tsx",
  "app/club/projects/select/page.tsx",
  "app/club/sponsors/page.tsx",
  "app/preview/sponsor-listings/page.tsx",
  "scripts/verify-club-my-admin.ts",
  "scripts/verify-club-match-day.ts",
  "scripts/verify-sponsor-listings.ts",
  "scripts/verify-sponsor-leaderboard.ts",
  "scripts/verify-clear-club-data.ts",
];

async function pull(rel) {
  let lastError = "not found";
  for (const ref of REFS) {
    const url = `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${ref}/${rel}?v=${BUST}`;
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        lastError = `HTTP ${response.status}`;
        continue;
      }
      mkdirSync(dirname(join(rel)), { recursive: true });
      writeFileSync(rel, Buffer.from(await response.arrayBuffer()));
      console.log("Pulled", rel);
      return true;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }
  console.error(
    `Could not pull ${rel}. Stay in the S4C-platform folder and check the network.`,
    lastError
  );
  return false;
}

let failed = 0;
for (const rel of FILES) {
  if (!(await pull(rel))) failed += 1;
}

const nav = "app/components/club/ClubNav.tsx";
const picker = "app/club/projects/select/page.tsx";
const admin = "app/club/admin/page.tsx";
const fixtures = "app/components/home/SelectMatchFixtures.tsx";
if (
  existsSync(nav) &&
  existsSync(picker) &&
  existsSync(admin) &&
  existsSync(fixtures)
) {
  const navSrc = readFileSync(nav, "utf8");
  const pickerSrc = readFileSync(picker, "utf8");
  const adminSrc = readFileSync(admin, "utf8");
  const fixturesSrc = readFileSync(fixtures, "utf8");
  if (
    !navSrc.includes('label: "Select Match"') ||
    !navSrc.includes('label: "Choose Projects"') ||
    !navSrc.includes('label: "My Admin"') ||
    !pickerSrc.includes("SELECT_CLIMATE_PROJECTS_LABEL") ||
    !adminSrc.includes("ClubAddressBookPanel") ||
    !fixturesSrc.includes("rememberClubSelectedMatch")
  ) {
    failed += 1;
    console.error(
      "Club My Admin or Select Match is still in the old place. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("Club My Admin files are missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Select Match is bigger and registered, Choose Projects opens Select Climate Projects, and My Admin holds club details plus two Address Books. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
