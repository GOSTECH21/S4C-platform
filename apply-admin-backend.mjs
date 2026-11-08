import { existsSync, readFileSync } from "fs";
import { spawnSync } from "child_process";

const PIN = "8504851";
const BRANCH = "cursor/admin-backend-18f9";
const FILES = [
  "app/lib/admin-backend.ts",
  "app/services/admin-backend.service.ts",
  "app/components/admin/AdminBackendHome.tsx",
  "app/components/admin/AdminNav.tsx",
  "app/admin/page.tsx",
  "app/admin/catalogue/page.tsx",
  "app/layout/Sidebar.tsx",
  "app/layout/Header.tsx",
  "app/layout/AppLayout.tsx",
  "app/lib/routes.ts",
  "app/lib/climate-sponsors.ts",
  "app/lib/lead-project-folder.ts",
  "app/lib/matchrav-journey.ts",
  "app/preview/admin-backend/page.tsx",
  "app/services/club-match-day.service.ts",
  "app/services/sponsor-auth.service.ts",
  "app/services/teams.service.ts",
  "app/services/predict-for-planet.service.ts",
  "app/services/match-day-folder.service.ts",
  "app/components/fan/FanMatchravPanel.tsx",
  "scripts/verify-admin-backend.ts",
  "apply-admin-backend.mjs",
  "apply-admin-backend.ps1",
];

console.log("Working folder:", process.cwd());
console.log("PIN:", PIN);
console.log("LIVE page: http://localhost:3000/preview/admin-backend");
if (!existsSync("app/components/admin/AdminBackendHome.tsx")) {
  console.error(
    "This is not the S4C-platform folder. cd into the folder that contains app/components/admin/AdminBackendHome.tsx, then run this script again."
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

const sidebar = existsSync("app/layout/Sidebar.tsx")
  ? readFileSync("app/layout/Sidebar.tsx", "utf8")
  : "";
const home = existsSync("app/components/admin/AdminBackendHome.tsx")
  ? readFileSync("app/components/admin/AdminBackendHome.tsx", "utf8")
  : "";
const nav = existsSync("app/components/admin/AdminNav.tsx")
  ? readFileSync("app/components/admin/AdminNav.tsx", "utf8")
  : "";
if (
  !sidebar.includes("Backend") ||
  sidebar.includes("Registered participants") ||
  !home.includes("data-admin-segment={segment.id}") ||
  !home.includes("s4pTabClass") ||
  !home.includes("Keep") ||
  !nav.includes("md:hidden") ||
  !nav.includes("s4pTabClass")
) {
  console.error("The Admin backend did not land on mobile.");
  process.exit(1);
}
console.log(
  "OK: Admin is the platform backend with four short phone tabs. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
