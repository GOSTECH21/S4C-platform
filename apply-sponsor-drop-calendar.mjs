import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/sponsor-drop-calendar-18f9";
const BUST = "sponsor-drop-calendar-1";
const FILES = [
  "app/sponsor/sponsor-nav.tsx",
  "app/preview/sponsor-nav/page.tsx",
  "scripts/verify-sponsor-tabs-visible.ts",
  "scripts/verify-sponsor-dashboard.ts",
  "scripts/verify-sponsor-listings.ts",
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

const nav = "app/sponsor/sponsor-nav.tsx";
if (existsSync(nav)) {
  const navSrc = readFileSync(nav, "utf8");
  if (
    !navSrc.includes("sponsor-drop-calendar-v1") ||
    navSrc.includes("href={SPONSOR_CALENDAR_PATH}") ||
    navSrc.includes("s4pTabClass(onCalendar)")
  ) {
    failed += 1;
    console.error(
      "The Calendar tab is still in the sponsor header. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("Sponsor nav file is missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Calendar is off the sponsor header. Dashboard, Game-Time, Invitations and Logout stay. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
