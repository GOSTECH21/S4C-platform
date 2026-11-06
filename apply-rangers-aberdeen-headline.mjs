import { existsSync, readFileSync } from "fs";
import { spawnSync } from "child_process";

const PIN = "pending";
const BRANCH = "cursor/rangers-aberdeen-headline-18f9";
const FILES = [
  "app/lib/climate-sponsors.ts",
  "scripts/verify-club-sponsor-tabs.ts",
  "scripts/verify-rangers-headline.ts",
  "apply-rangers-aberdeen-headline.ps1",
];

console.log("Working folder:", process.cwd());
console.log("LIVE page: http://localhost:3000/dashboard/supporter/vote");
if (!existsSync("app/lib/climate-sponsors.ts")) {
  console.error(
    "This is not the S4C-platform folder. cd into the folder that contains app/lib/climate-sponsors.ts, then run this script again."
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
      console.log("Checked out Rangers v Aberdeen headline files from origin/" + BRANCH + ".");
    }
  }
}

const source = existsSync("app/lib/climate-sponsors.ts")
  ? readFileSync("app/lib/climate-sponsors.ts", "utf8")
  : "";
if (!source.includes("const funded = nextSignedOffFixtureForClub(options);")) {
  console.error("The Rangers v Aberdeen headline files did not land.");
  process.exit(1);
}
console.log(
  "OK: Climate Campaigns show the funded match (Rangers v Aberdeen), not the next unfunded fixture. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
