import { existsSync, readFileSync } from "fs";
import { spawnSync } from "child_process";

const PIN = "pending";
const BRANCH = "cursor/my-s4p-streamline-18f9";
const FILES = [
  "app/lib/fan-register-copy.ts",
  "app/components/fan/FanMyTeamsPanel.tsx",
  "app/components/fan/ClimateProjectSponsors.tsx",
  "app/preview/my-s4p-teams/page.tsx",
  "app/preview/my-s4p/page.tsx",
  "scripts/verify-my-s4p-streamline.ts",
  "scripts/verify-my-s4p-teams-accordion.ts",
  "scripts/verify-wallet-vote.ts",
  "apply-my-s4p-streamline.mjs",
  "apply-my-s4p-streamline.ps1",
];

console.log("Working folder:", process.cwd());
console.log("PIN:", PIN);
console.log("LIVE page: http://localhost:3000/preview/my-s4p");
if (!existsSync("app/components/fan/FanMyTeamsPanel.tsx")) {
  console.error(
    "This is not the S4C-platform folder. cd into the folder that contains app/components/fan/FanMyTeamsPanel.tsx, then run this script again."
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

const panel = existsSync("app/components/fan/FanMyTeamsPanel.tsx")
  ? readFileSync("app/components/fan/FanMyTeamsPanel.tsx", "utf8")
  : "";
const sponsors = existsSync("app/components/fan/ClimateProjectSponsors.tsx")
  ? readFileSync("app/components/fan/ClimateProjectSponsors.tsx", "utf8")
  : "";
if (
  !panel.includes('data-saved-teams-accordion="saved-teams-accordion-v1"') ||
  !sponsors.includes("data-sponsor-fund-strip") ||
  !sponsors.includes("LOCAL_SPONSOR_FUND_SLOTS") ||
  sponsors.includes("Climate Project Sponsor")
) {
  console.error("The streamlined My S4P files did not land.");
  process.exit(1);
}
console.log(
  "OK: My S4P now accordion-hides saved teams and uses Logo / Name / Wallet / Projects / FUND-IT strips. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
