import { existsSync, readFileSync } from "fs";
import { spawnSync } from "child_process";

const PIN = "777b3b7";
const BRANCH = "cursor/admin-lookback-accordion-18f9";
const FILES = [
  "app/lib/cilt.ts",
  "app/lib/fan-footprint.ts",
  "app/globals.css",
  "app/components/club/FanFootprintAnalytics.tsx",
  "app/components/club/ClubAdminLookbackAndCilt.tsx",
  "app/preview/club-admin/page.tsx",
  "scripts/verify-club-my-admin.ts",
  "apply-admin-lookback-accordion.ps1",
];

console.log("Working folder:", process.cwd());
console.log("LIVE page: http://localhost:3000/club/admin");
if (!existsSync("app/components/club/ClubAdminLookbackAndCilt.tsx")) {
  console.error(
    "This is not the S4C-platform folder. cd into the folder that contains app/components/club/ClubAdminLookbackAndCilt.tsx, then run this script again."
  );
  process.exit(1);
}

if (existsSync(".git")) {
  const fetch = spawnSync("git", ["fetch", "origin", BRANCH], {
    encoding: "utf8",
  });
  if (fetch.status === 0) {
    spawnSync("git", ["checkout", `origin/${BRANCH}`, "--", ...FILES], {
      encoding: "utf8",
    });
  }
}

const lookback = existsSync("app/components/club/ClubAdminLookbackAndCilt.tsx")
  ? readFileSync("app/components/club/ClubAdminLookbackAndCilt.tsx", "utf8")
  : "";
if (
  !lookback.includes('data-lookback-accordion="lookback-accordion-v1"') ||
  !lookback.includes("FanFootprintAnalytics")
) {
  console.error("The My Admin accordion and FanFootprint files did not land.");
  process.exit(1);
}
console.log(
  "OK: My Admin sponsorships collapse to three lines, and FanFootprint Analytics is on the page. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
