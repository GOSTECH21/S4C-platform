import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { dirname, join } from "path";
import { spawnSync } from "child_process";

const REFS = ["main", "cursor/club-pc-no-phone-frame-18f9", "ce77eee", "cursor/club-projects-local-national-18f9", "cursor/club-my-admin-18f9"];
const BUST = "club-my-admin-slim-1";
const SELF = "apply-club-my-admin.mjs";
const FILES = [
  "app/components/home/PhoneFrame.tsx",
  "app/lib/club-selected-match.ts",
  "app/lib/club-address-book.ts",
  "app/lib/routes.ts",
  "app/lib/partner-projects.ts",
  "app/lib/s4p-climate-projects.ts",
  "app/lib/project-site.ts",
  "app/lib/stadium-nearby-projects.ts",
  "app/lib/sponsor-listings.ts",
  "app/lib/how-s4p-works.ts",
  "app/lib/local-sponsor.ts",
  "app/lib/club-registration.ts",
  "app/services/club-match-day.service.ts",
  "app/services/sponsor-listings.service.ts",
  "app/services/local-sponsor.service.ts",
  "app/components/club/ClubNav.tsx",
  "app/components/club/ClubSelectedMatchBanner.tsx",
  "app/components/club/ClubChooseProjectsCopy.tsx",
  "app/components/club/ClubClimateProjectScopeChooser.tsx",
  "app/components/club/ClubAddressBookPanel.tsx",
  "app/components/club/ClubAdminClubDetails.tsx",
  "app/components/club/ClubAdminLookbackAndCilt.tsx",
  "app/components/club/ClubSponsorsListings.tsx",
  "app/components/home/HowS4pSelectMatch.tsx",
  "app/components/home/SelectMatchFixtures.tsx",
  "app/club/dashboard/page.tsx",
  "app/club/admin/page.tsx",
  "app/club/projects/select/page.tsx",
  "app/club/sponsors/page.tsx",
  "app/preview/sponsor-listings/page.tsx",
  "app/preview/club-admin/page.tsx",
  "app/preview/club-choose-projects/page.tsx",
  "scripts/verify-club-my-admin.ts",
  "scripts/verify-club-match-day.ts",
  "scripts/verify-sponsor-listings.ts",
  "scripts/verify-sponsor-leaderboard.ts",
  "scripts/verify-clear-club-data.ts",
];

if (process.env.S4P_OVERLAY_SELF !== "1") {
  const localSelf = existsSync(SELF) ? readFileSync(SELF, "utf8") : "";
  if (localSelf.includes(`BUST = "${BUST}"`)) {
    // Already the current overlay; do not replace it with an older GitHub copy.
  } else {
  let refreshed = false;
  for (const ref of REFS) {
    const url = `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${ref}/${SELF}?v=${BUST}&t=${Date.now()}`;
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) continue;
      const buf = Buffer.from(await response.arrayBuffer());
      const current = existsSync(SELF) ? readFileSync(SELF) : Buffer.alloc(0);
      if (current.equals(buf)) {
        refreshed = true;
        break;
      }
      writeFileSync(SELF, buf);
      console.log("Updated", SELF, "from", ref);
      const rerun = spawnSync(process.execPath, [SELF], {
        stdio: "inherit",
        env: { ...process.env, S4P_OVERLAY_SELF: "1" },
      });
      process.exit(rerun.status ?? 1);
    } catch {
      // try the next ref
    }
  }
  if (!refreshed) {
    console.log("Could not refresh", SELF, "from GitHub; using the local copy.");
  }
  }
}

async function pull(rel) {
  let lastError = "not found";
  for (const ref of REFS) {
    const url = `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${ref}/${rel}?v=${BUST}&t=${Date.now()}`;
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

try {
  rmSync(".next", { recursive: true, force: true });
  console.log("Cleared .next so Next.js cannot keep the old Club pages.");
} catch {
  console.log("Could not clear .next; stop npm run dev, delete the .next folder, then start it again.");
}

const nav = "app/components/club/ClubNav.tsx";
const picker = "app/club/projects/select/page.tsx";
const admin = "app/club/admin/page.tsx";
const dashboard = "app/club/dashboard/page.tsx";
const fixtures = "app/components/home/SelectMatchFixtures.tsx";
const localService = "app/services/local-sponsor.service.ts";
const lookback = "app/components/club/ClubAdminLookbackAndCilt.tsx";
const chooser = "app/components/club/ClubClimateProjectScopeChooser.tsx";
if (
  existsSync(nav) &&
  existsSync(picker) &&
  existsSync(admin) &&
  existsSync(dashboard) &&
  existsSync(fixtures) &&
  existsSync(localService) &&
  existsSync(lookback) &&
  existsSync(chooser)
) {
  const navSrc = readFileSync(nav, "utf8");
  const pickerSrc = readFileSync(picker, "utf8");
  const adminSrc = readFileSync(admin, "utf8");
  const dashboardSrc = readFileSync(dashboard, "utf8");
  const fixturesSrc = readFileSync(fixtures, "utf8");
  const localServiceSrc = readFileSync(localService, "utf8");
  const lookbackSrc = readFileSync(lookback, "utf8");
  const chooserSrc = readFileSync(chooser, "utf8");
  if (
    !navSrc.includes('label: "Select Match"') ||
    !navSrc.includes('label: "Choose Projects"') ||
    !navSrc.includes('label: "My Admin"') ||
    !pickerSrc.includes("SELECT_CLIMATE_PROJECTS_LABEL") ||
    !pickerSrc.includes("ClubClimateProjectScopeChooser") ||
    !chooserSrc.includes("CLIMATE_PROJECT_SCOPE_PROMPT") ||
    dashboardSrc.includes("<ClubClimateSponsorTabs") ||
    !dashboardSrc.includes("club-choose-projects-scopes-v1") ||
    !adminSrc.includes("ClubAddressBookPanel") ||
    !adminSrc.includes("ClubAdminLookbackAndCilt") ||
    !fixturesSrc.includes("rememberClubSelectedMatch") ||
    !fixturesSrc.includes('framed={mode !== "club"}') ||
    !localServiceSrc.includes("hydrateLocalSponsorRecords") ||
    !lookbackSrc.includes("Match Day File Record") ||
    !lookbackSrc.includes("S4P Climate Impact League Table") ||
    dashboardSrc.includes("Selected and Funded Projects, kept for lookback") ||
    dashboardSrc.includes("S4P Climate Impact League Table")
  ) {
    failed += 1;
    console.error(
      "Lookback and CILT are still on Select Match, or Choose Projects is still the old numbered list. Stay in the S4C-platform folder, re-download apply-club-choose-projects.mjs, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("Club My Admin files are missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Lookback and CILT are on My Admin, not Select Match. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5). Then open My Admin."
);
