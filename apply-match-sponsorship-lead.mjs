import { existsSync, readFileSync } from "fs";
import { spawnSync } from "child_process";

const PIN = "c870fd4";
const BRANCH = "cursor/match-sponsorship-lead-18f9";
const FILES = [
  "app/components/fan/CampaignMatchHeader.tsx",
  "app/components/fan/FanCampaignWorkspace.tsx",
  "app/lib/sponsorship-auction.ts",
  "app/preview/my-s4p/page.tsx",
  "app/preview/rangers-headline/page.tsx",
  "apply-match-sponsorship-lead.ps1",
];

console.log("Working folder:", process.cwd());
console.log("LIVE page: http://localhost:3000/supporter/dashboard");
if (!existsSync("app/components/fan/FanCampaignWorkspace.tsx")) {
  console.error(
    "This is not the S4C-platform folder. cd into the folder that contains app/components/fan/FanCampaignWorkspace.tsx, then run this script again."
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

const header = existsSync("app/components/fan/CampaignMatchHeader.tsx")
  ? readFileSync("app/components/fan/CampaignMatchHeader.tsx", "utf8")
  : "";
if (!header.includes("matchSponsorshipHeading") || !header.includes("Sponsored By")) {
  console.error("The Match Sponsorship heading files did not land.");
  process.exit(1);
}
console.log(
  "OK: Club line is Match Sponsorship, then the Climate Campaign, then Sponsored By. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
