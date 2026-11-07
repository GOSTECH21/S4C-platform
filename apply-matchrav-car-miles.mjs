import { existsSync, readFileSync } from "fs";
import { spawnSync } from "child_process";

const PIN = "pending";
const BRANCH = "cursor/matchrav-car-miles-18f9";
const FILES = [
  "app/lib/matchrav-journey.ts",
  "app/lib/project-site.ts",
  "app/components/fan/FanMatchravPanel.tsx",
  "scripts/verify-matchrav-journey.ts",
  "scripts/verify-project-site.ts",
  "apply-matchrav-car-miles.mjs",
  "apply-matchrav-car-miles.ps1",
];

console.log("Working folder:", process.cwd());
console.log("PIN:", PIN);
console.log("LIVE page: http://localhost:3000/supporter/dashboard/matchrav");
if (!existsSync("app/components/fan/FanMatchravPanel.tsx")) {
  console.error(
    "This is not the S4C-platform folder. cd into the folder that contains app/components/fan/FanMatchravPanel.tsx, then run this script again."
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

const panel = existsSync("app/components/fan/FanMatchravPanel.tsx")
  ? readFileSync("app/components/fan/FanMatchravPanel.tsx", "utf8")
  : "";
const journey = existsSync("app/lib/matchrav-journey.ts")
  ? readFileSync("app/lib/matchrav-journey.ts", "utf8")
  : "";
if (
  !panel.includes("milesFromOriginToDestination") ||
  !panel.includes("data-matchrav-miles") ||
  !journey.includes("destinationPoint") ||
  !journey.includes("milesFromOriginToDestination")
) {
  console.error("The Matchrav car miles files did not land.");
  process.exit(1);
}
console.log(
  "OK: Matchrav now fills Outbound distance when origin, destination and Car are set. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
