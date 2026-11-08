import { existsSync, readFileSync } from "fs";
import { spawnSync } from "child_process";

const PIN = "1893384";
const BRANCH = "cursor/local-sponsor-abcd-18f9";
const FILES = [
  "app/lib/lead-sponsor-home.ts",
  "app/components/sponsor/LeadSponsorHome.tsx",
  "app/components/sponsor/LocalSignedSponsorHome.tsx",
  "app/sponsor/local/page.tsx",
  "app/sponsor/wallet/page.tsx",
  "app/preview/local-wallet/page.tsx",
  "app/preview/local-sponsor-home/page.tsx",
  "scripts/verify-local-sponsor-abcd.ts",
  "scripts/verify-local-new-sponsorship.ts",
  "scripts/verify-local-lobi-home.ts",
  "scripts/verify-lead-sponsor-home.ts",
  "apply-local-sponsor-abcd.mjs",
  "apply-local-sponsor-abcd.ps1",
];

console.log("Working folder:", process.cwd());
console.log("PIN:", PIN);
console.log("LIVE page: http://localhost:3000/preview/local-sponsor-home");
if (!existsSync("app/components/sponsor/LocalSignedSponsorHome.tsx")) {
  console.error(
    "This is not the S4C-platform folder. cd into the folder that contains app/components/sponsor/LocalSignedSponsorHome.tsx, then run this script again."
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

const wallet = existsSync("app/sponsor/wallet/page.tsx")
  ? readFileSync("app/sponsor/wallet/page.tsx", "utf8")
  : "";
const localUi = existsSync("app/components/sponsor/LocalSignedSponsorHome.tsx")
  ? readFileSync("app/components/sponsor/LocalSignedSponsorHome.tsx", "utf8")
  : "";
if (
  !wallet.includes("allPlatformClubs") ||
  wallet.includes("Select a club from Premier League or Scottish Premiership") ||
  !localUi.includes("SponsorAbcdSections") ||
  !localUi.includes('data-local-abcd="local-abcd-v1"')
) {
  console.error("The Local all-clubs picker and A-D sections did not land.");
  process.exit(1);
}
console.log(
  "OK: Local New Sponsorship lists every club on the platform, and Local login shows sections A-D. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
