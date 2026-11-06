import { existsSync, readFileSync } from "fs";
import { spawnSync } from "child_process";

const PIN = "cb14b63";
const BRANCH = "cursor/matchrav-journey-ops-18f9";
const FILES = [
  "app/lib/matchrav.ts",
  "app/lib/matchrav-journey.ts",
  "app/lib/project-site.ts",
  "app/lib/routes.ts",
  "app/components/fan/FanMatchravPanel.tsx",
  "app/supporter/dashboard/matchrav/page.tsx",
  "app/components/admin/MatchravOpsBoard.tsx",
  "app/admin/matchrav/page.tsx",
  "app/preview/matchrav-ops/page.tsx",
  "app/api/fan/matchrav-fixtures/route.ts",
  "app/layout/Sidebar.tsx",
  "apply-matchrav-journey.mjs",
  "apply-matchrav-journey.ps1",
  "scripts/verify-matchrav-journey.ts",
];

console.log("Working folder:", process.cwd());
console.log("LIVE page: http://localhost:3000/supporter/dashboard/matchrav");
console.log("Ops page: http://localhost:3000/preview/matchrav-ops");
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
    const checkout = spawnSync(
      "git",
      ["checkout", `origin/${BRANCH}`, "--", ...FILES],
      { encoding: "utf8" }
    );
    if (checkout.status === 0) {
      console.log("Checked out Matchrav journey files from origin/" + BRANCH + ".");
    }
  }
}

let failed = 0;
const panel = existsSync("app/components/fan/FanMatchravPanel.tsx")
  ? readFileSync("app/components/fan/FanMatchravPanel.tsx", "utf8")
  : "";
const journey = existsSync("app/lib/matchrav.ts")
  ? readFileSync("app/lib/matchrav.ts", "utf8")
  : "";
if (
  !panel.includes("data-matchrav-fixture") ||
  !panel.includes("data-matchrav-privacy") ||
  !journey.includes("matchrav-journey-ops-v1") ||
  panel.includes("PhoneFrame")
) {
  failed += 1;
  console.error("The Matchrav journey files did not land.");
}

if (failed) process.exit(1);
console.log(
  "OK: Matchrav now plans fixtures, origin, routes, return trips and privacy. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
