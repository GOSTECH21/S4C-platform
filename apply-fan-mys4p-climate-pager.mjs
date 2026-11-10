import { existsSync, readFileSync } from "fs";
import { spawnSync } from "child_process";

const PIN = "120f4fa";
const BRANCH = "cursor/fan-mys4p-climate-pager-18f9";
const FILES = [
  "app/lib/fan-match-meta.ts",
  "app/lib/fan-climate-project-cards.ts",
  "app/components/fan/CampaignMatchHeader.tsx",
  "app/components/fan/FanClimateProjectPager.tsx",
  "app/components/fan/FanCampaignWorkspace.tsx",
  "app/components/fan/InviteFriendsRemainingFunds.tsx",
  "app/components/fan/ClimateProjectSponsors.tsx",
  "app/dashboard/supporter/components/FanTabBar.tsx",
  "app/dashboard/supporter/vote/page.tsx",
  "app/supporter/dashboard/climate-sponsors/page.tsx",
  "app/preview/my-s4p/page.tsx",
  "app/preview/fan-tabs/page.tsx",
  "scripts/verify-fan-mys4p-climate-pager.ts",
  "apply-fan-mys4p-climate-pager.mjs",
];

console.log("Working folder:", process.cwd());
console.log("PIN:", PIN);
console.log("LIVE page: http://localhost:3000/preview/my-s4p");
if (!existsSync("app/components/fan/FanClimateProjectPager.tsx")) {
  console.error(
    "This is not the S4C-platform folder. cd into the folder that contains app/components/fan/FanClimateProjectPager.tsx, then run this script again."
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

const workspace = existsSync("app/components/fan/FanCampaignWorkspace.tsx")
  ? readFileSync("app/components/fan/FanCampaignWorkspace.tsx", "utf8")
  : "";
const tabs = existsSync("app/dashboard/supporter/components/FanTabBar.tsx")
  ? readFileSync("app/dashboard/supporter/components/FanTabBar.tsx", "utf8")
  : "";
if (
  !workspace.includes("FanClimateProjectPager") ||
  workspace.includes("Climate Projects List") ||
  tabs.includes('label: "Climate Projects"') ||
  !tabs.includes('data-fan-tabs="5"')
) {
  console.error("My S4P Climate Project pager did not land.");
  process.exit(1);
}
console.log(
  "OK: Climate Projects now live inside My S4P. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
