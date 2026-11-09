import { existsSync, readFileSync } from "fs";
import { spawnSync } from "child_process";

const PIN = "989b1b9";
const BRANCH = "cursor/matchrav-ticket-stadium-18f9";
const FILES = [
  "app/lib/matchrav.ts",
  "app/lib/match-day-travel.ts",
  "app/lib/matchrav-journey.ts",
  "app/components/fan/FanMatchravPanel.tsx",
  "scripts/verify-matchrav-journey.ts",
  "scripts/verify-match-day-travel.ts",
  "scripts/verify-matchrav-fan-tabs.ts",
  "scripts/verify-fan-p4p-copy.ts",
  "scripts/verify-homepage.ts",
  "apply-matchrav-ticket-stadium.mjs",
  "apply-matchrav-ticket-stadium.ps1",
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
const matchrav = existsSync("app/lib/matchrav.ts")
  ? readFileSync("app/lib/matchrav.ts", "utf8")
  : "";
if (
  !panel.includes("MATCHRAV_STADIUM_HEADING") ||
  !panel.includes("data-matchrav-ticket") ||
  !panel.includes("data-matchrav-fund") ||
  !matchrav.includes("Travels before & after the match") ||
  !matchrav.includes("Travel ticket evidence")
) {
  console.error("The Matchrav ticket and stadium files did not land.");
  process.exit(1);
}
console.log(
  "OK: Matchrav now uses the match stadium, Flight, and ticket evidence. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
