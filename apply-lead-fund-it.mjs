import { existsSync, readFileSync } from "fs";
import { spawnSync } from "child_process";

const PIN = "pending";
const BRANCH = "cursor/rangers-lead-fund-it-18f9";
const FILES = [
  "app/lib/dual-sponsor.ts",
  "app/lib/sponsor-wallet.ts",
  "app/components/fan/ClimateProjectSponsors.tsx",
  "app/components/fan/FanCampaignWorkspace.tsx",
  "app/services/match-day-folder.service.ts",
  "app/services/match-day-branding.service.ts",
  "apply-lead-fund-it.ps1",
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
      console.log("Checked out Rangers Lead FUND-IT files from origin/" + BRANCH + ".");
    }
  }
}

let failed = 0;
const ui = existsSync("app/components/fan/ClimateProjectSponsors.tsx")
  ? readFileSync("app/components/fan/ClimateProjectSponsors.tsx", "utf8")
  : "";
const folder = existsSync("app/services/match-day-folder.service.ts")
  ? readFileSync("app/services/match-day-folder.service.ts", "utf8")
  : "";
if (
  !ui.includes('data-lead-fund-it="lead-fund-it-v1"') ||
  !ui.includes("Tap a Climate Project") ||
  !folder.includes("resolveFanVoteWallet")
) {
  failed += 1;
  console.error("The Rangers Lead FUND-IT files did not land.");
}

if (failed) process.exit(1);
console.log(
  "OK: Tap a Climate Project on the Rangers Lead wallet, then press FUND-IT. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
