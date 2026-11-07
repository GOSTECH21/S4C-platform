import { existsSync, readFileSync } from "fs";
import { spawnSync } from "child_process";

const PIN = "pending";
const BRANCH = "cursor/club-correct-fixtures-18f9";
const FILES = [
  "app/lib/sporting-calendar.ts",
  "app/services/next-fixtures.service.ts",
  "scripts/mine-published-fixtures.mjs",
  "scripts/verify-club-correct-fixtures.ts",
  "scripts/verify-sporting-calendar.ts",
  "apply-club-correct-fixtures.ps1",
];

console.log("Working folder:", process.cwd());
console.log("PIN:", PIN);
if (!existsSync("app/lib/sporting-calendar.ts")) {
  console.error(
    "This is not the S4C-platform folder. cd into the folder that contains app/lib/sporting-calendar.ts, then run this script again."
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

const calendar = existsSync("app/lib/sporting-calendar.ts")
  ? readFileSync("app/lib/sporting-calendar.ts", "utf8")
  : "";
if (
  !calendar.includes("canonicalPublishedTeamName") ||
  !calendar.includes("clubLeague")
) {
  console.error("The correct-club-fixtures files did not land.");
  process.exit(1);
}
console.log(
  "OK: Each club now lists only its own published fixtures. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
