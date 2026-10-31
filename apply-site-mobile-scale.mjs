import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/site-mobile-scale-18f9";
const BUST = "site-mobile-scale-1";
const FILES = [
  "app/layout.tsx",
  "app/globals.css",
  "app/components/calendar/CalendarMonthNav.tsx",
  "app/components/sponsor/SponsoredMatchCalendar.tsx",
  "app/components/sponsor/SportingCalendarBoard.tsx",
  "app/components/sponsor/ClubMatchCalendar.tsx",
  "app/components/sponsor/LocalSignedSponsorHome.tsx",
  "app/sponsor/layout.tsx",
  "app/sponsor/sponsor-nav.tsx",
  "app/sponsor/page.tsx",
  "app/supporter/dashboard/layout.tsx",
  "app/layout/AppLayout.tsx",
  "app/club/page.tsx",
  "app/club/dashboard/page.tsx",
  "app/components/home/HomeTopBanner.tsx",
  "scripts/verify-site-mobile-scale.ts",
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

const layout = "app/layout.tsx";
const css = "app/globals.css";
const calendar = "app/components/sponsor/SponsoredMatchCalendar.tsx";
if (existsSync(layout) && existsSync(css) && existsSync(calendar)) {
  const layoutSrc = readFileSync(layout, "utf8");
  const cssSrc = readFileSync(css, "utf8");
  const calSrc = readFileSync(calendar, "utf8");
  if (
    !layoutSrc.includes("site-mobile-scale-v1") ||
    !cssSrc.includes("@media (max-width: 639px)") ||
    !calSrc.includes("CalendarMonthNav")
  ) {
    failed += 1;
    console.error(
      "Phone pages are still using desktop padding. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("Site mobile scale files are missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Pages now scale to a phone width. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
