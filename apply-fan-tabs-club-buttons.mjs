import { existsSync, readFileSync } from "fs";
import { spawnSync } from "child_process";

const PIN = "335732f";
const BRANCH = "cursor/fan-tabs-club-buttons-18f9";
const FILES = [
  "app/dashboard/supporter/components/FanTabBar.tsx",
  "app/preview/fan-tabs/page.tsx",
  "scripts/verify-fan-five-tabs.ts",
  "scripts/verify-matchrav-fan-account.ts",
  "scripts/verify-sponsor-leaderboard.ts",
  "apply-fan-tabs-club-buttons.mjs",
  "apply-fan-tabs-club-buttons.ps1",
];

console.log("Working folder:", process.cwd());
console.log("PIN:", PIN);
console.log("LIVE page: http://localhost:3000/preview/fan-tabs");
if (!existsSync("app/dashboard/supporter/components/FanTabBar.tsx")) {
  console.error(
    "This is not the S4C-platform folder. cd into the folder that contains app/dashboard/supporter/components/FanTabBar.tsx, then run this script again."
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

const tabs = existsSync("app/dashboard/supporter/components/FanTabBar.tsx")
  ? readFileSync("app/dashboard/supporter/components/FanTabBar.tsx", "utf8")
  : "";
if (
  !tabs.includes('data-fan-tabs-style="club-buttons"') ||
  !tabs.includes("s4pTabClass") ||
  !tabs.includes("flex flex-wrap items-center gap-2") ||
  tabs.includes("grid-cols-6")
) {
  console.error("The Club-style supporter tabs did not land.");
  process.exit(1);
}
console.log(
  "OK: Supporter tabs now wrap like Club Select Match. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
