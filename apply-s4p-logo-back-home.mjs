import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/s4p-logo-back-home-18f9";
const BUST = "s4p-logo-back-home-1";
const FILES = [
  "app/components/S4PLockup.tsx",
  "app/components/GlobalSiteBar.tsx",
  "app/layout.tsx",
  "app/sponsor/layout.tsx",
  "app/sponsor/sponsor-nav.tsx",
  "app/sponsor/login/page.tsx",
  "app/dashboard/supporter/components/FanNav.tsx",
  "app/components/club/ClubNav.tsx",
  "app/components/auth/RoleLoginForm.tsx",
  "app/components/home/SolutionPage.tsx",
  "app/s4p-impact-tables/page.tsx",
  "app/layout/Navbar.tsx",
  "app/layout/Sidebar.tsx",
  "app/login/page.tsx",
  "app/preview/sponsor-nav/page.tsx",
  "app/preview/game-time/page.tsx",
  "app/preview/fan-tabs/page.tsx",
  "app/preview/cift/page.tsx",
  "scripts/verify-s4p-logo-back-home.ts",
  "scripts/verify-sponsor-tabs-visible.ts",
  "scripts/verify-game-time-sponsored-by.ts",
];

let failed = 0;
for (const rel of FILES) {
  const url = `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${BRANCH}/${rel}?v=${BUST}`;
  try {
    const response = await fetch(url, { cache: "no-store" });
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

const bar = "app/components/GlobalSiteBar.tsx";
const nav = "app/sponsor/sponsor-nav.tsx";
const lockup = "app/components/S4PLockup.tsx";
if (existsSync(bar) && existsSync(nav) && existsSync(lockup)) {
  const barSrc = readFileSync(bar, "utf8");
  const navSrc = readFileSync(nav, "utf8");
  const lockupSrc = readFileSync(lockup, "utf8");
  if (
    !barSrc.includes("s4p-logo-back-home-v1") ||
    !barSrc.includes("S4PBrandRow") ||
    !lockupSrc.includes("/images/home/s4p-lockup.png") ||
    !lockupSrc.includes("← Back to home") ||
    !navSrc.includes("data-sponsor-logged-out") ||
    !navSrc.includes("Logout")
  ) {
    failed += 1;
    console.error(
      "Pages are still missing the Score-For-Planet lockup, Back to home, or Logout. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("Lockup and Back to home files are missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Every page except Home shows the S4P lockup and a Back to home button; Sponsor Login has a Logout tab. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
