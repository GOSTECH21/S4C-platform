import { existsSync, readFileSync } from "fs";
import { spawnSync } from "child_process";

const PIN = "pending";
const BRANCH = "cursor/fund-strip-fit-phone-18f9";
const FILES = [
  "app/components/fan/ClimateProjectSponsors.tsx",
  "scripts/verify-my-s4p-streamline.ts",
  "apply-fund-strip-fit-phone.mjs",
  "apply-fund-strip-fit-phone.ps1",
];

console.log("Working folder:", process.cwd());
console.log("PIN:", PIN);
console.log("LIVE page: http://localhost:3000/preview/my-s4p");
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
    spawnSync("git", ["checkout", `origin/${BRANCH}`, "--", ...FILES], {
      encoding: "utf8",
    });
  }
}

const sponsors = existsSync("app/components/fan/ClimateProjectSponsors.tsx")
  ? readFileSync("app/components/fan/ClimateProjectSponsors.tsx", "utf8")
  : "";
if (
  !sponsors.includes('data-fund-strip-fit="phone-stack-v1"') ||
  sponsors.includes("overflow-x-auto") ||
  sponsors.includes("w-[36rem]")
) {
  console.error("The phone-fit FUND-IT strips did not land.");
  process.exit(1);
}
console.log(
  "OK: FUND-IT strips now show Logo, Name, Wallet, Projects and FUND-IT without scrolling sideways. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
