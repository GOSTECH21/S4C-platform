import { existsSync, readFileSync } from "fs";
import { spawnSync } from "child_process";

const PIN = "pending";
const BRANCH = "cursor/lead-fund-it-take-18f9";
const FILES = [
  "app/components/fan/ClimateProjectSponsors.tsx",
  "app/components/fan/FanCampaignWorkspace.tsx",
  "app/services/match-day-folder.service.ts",
  "apply-lead-fund-it-take.ps1",
  "scripts/verify-wallet-vote.ts",
];

console.log("Working folder:", process.cwd());
console.log("LIVE page: http://localhost:3000/dashboard/supporter/vote");
if (!existsSync("app/components/fan/ClimateProjectSponsors.tsx")) {
  console.error(
    "This is not the S4C-platform folder. cd into the folder that contains app/components/fan/ClimateProjectSponsors.tsx, then run this script again."
  );
  process.exit(1);
}

if (existsSync(".git")) {
  const fetch = spawnSync("git", ["fetch", "origin", BRANCH], {
    encoding: "utf8",
  });
  if (fetch.status === 0) {
    const checkout = spawnSync(
      "git",
      ["checkout", `origin/${BRANCH}`, "--", ...FILES],
      { encoding: "utf8" }
    );
    if (checkout.status === 0) {
      console.log("Checked out Lead FUND-IT take files from origin/" + BRANCH + ".");
    }
  }
}

let failed = 0;
const ui = existsSync("app/components/fan/ClimateProjectSponsors.tsx")
  ? readFileSync("app/components/fan/ClimateProjectSponsors.tsx", "utf8")
  : "";
if (
  !ui.includes('data-fund-it-native="lead-fund-it-take-v1"') ||
  !ui.includes('href="#lead-fund-it"')
) {
  failed += 1;
  console.error("The Lead FUND-IT take files did not land.");
}

if (failed) process.exit(1);
console.log(
  "OK: Tap a Climate Project, then press FUND-IT — £0.20 leaves the Lead wallet. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
