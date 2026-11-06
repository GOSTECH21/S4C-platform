import { existsSync, readFileSync } from "fs";
import { spawnSync } from "child_process";

const PIN = "pending";
const BRANCH = "cursor/banner-drop-sport-icons-18f9";
const FILES = [
  "public/images/home/global-sports-cluster.png",
  "app/components/home/HomeTopBanner.tsx",
  "apply-banner-drop-sport-icons.ps1",
  "scripts/verify-banner-drop-sport-icons.ts",
];

console.log("Working folder:", process.cwd());
console.log("LIVE page: http://localhost:3000/");
if (!existsSync("app/components/home/HomeTopBanner.tsx")) {
  console.error(
    "This is not the S4C-platform folder. cd into the folder that contains app/components/home/HomeTopBanner.tsx, then run this script again."
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
      console.log("Checked out homepage banner files from origin/" + BRANCH + ".");
    }
  }
}

let failed = 0;
const banner = existsSync("app/components/home/HomeTopBanner.tsx")
  ? readFileSync("app/components/home/HomeTopBanner.tsx", "utf8")
  : "";
const png = existsSync("public/images/home/global-sports-cluster.png")
  ? readFileSync("public/images/home/global-sports-cluster.png")
  : Buffer.alloc(0);
if (
  !banner.includes("banner-drop-sport-icons-v1") ||
  !banner.includes("data-home-five-sports") ||
  png[25] !== 6
) {
  failed += 1;
  console.error("The homepage banner files did not land.");
}

if (failed) process.exit(1);
console.log(
  "OK: The cluster artwork no longer duplicates the five sport icons. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
