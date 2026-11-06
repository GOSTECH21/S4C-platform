import { existsSync, readFileSync } from "fs";
import { spawnSync } from "child_process";

const PIN = "b165ba0";
const BRANCH = "cursor/gss-one-global-18f9";
const FILES = [
  "app/lib/featured-gss.ts",
  "app/lib/sccan-catalog.ts",
  "app/lib/featured-climate-country.ts",
  "app/lib/partner-projects.ts",
  "app/lib/voting-window.ts",
  "app/lib/predict-for-planet.ts",
  "app/lib/fan-votes.ts",
  "app/components/club/FeaturedGssPicker.tsx",
  "app/components/fan/FanCampaignWorkspace.tsx",
  "app/club/projects/select/page.tsx",
  "app/global-schools-solar/page.tsx",
  "app/services/club-match-day.service.ts",
  "app/sponsor/campaigns/select/page.tsx",
  "apply-gss-one-global.ps1",
  "scripts/verify-gss-one-global.ts",
];

console.log("Working folder:", process.cwd());
console.log("LIVE page: http://localhost:3000/club/s4p-climate-projects");
if (!existsSync("app/lib/featured-gss.ts")) {
  console.error(
    "This is not the S4C-platform folder. cd into the folder that contains app/lib/featured-gss.ts, then run this script again."
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
      console.log("Checked out one Global Schools Solar files from origin/" + BRANCH + ".");
    }
  }
}

let failed = 0;
const catalog = existsSync("app/lib/sccan-catalog.ts")
  ? readFileSync("app/lib/sccan-catalog.ts", "utf8")
  : "";
const picker = existsSync("app/components/club/FeaturedGssPicker.tsx")
  ? readFileSync("app/components/club/FeaturedGssPicker.tsx", "utf8")
  : "";
if (
  !catalog.includes('country: "Global"') ||
  catalog.includes("Featured · Local school near the stadium") ||
  !picker.includes("data-gss-one-global")
) {
  failed += 1;
  console.error("The one Global Schools Solar files did not land.");
}

if (failed) process.exit(1);
console.log(
  "OK: Global Schools Solar is one Featured project for every country. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
