import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/sponsor-dashboard-tabs-18f9";
const FILES = [
  "app/sponsor/sponsor-nav.tsx",
  "app/sponsor/dashboard/page.tsx",
  "app/components/sponsor/ClubNetworkPicker.tsx",
  "app/globals.css",
  "scripts/verify-sponsor-dashboard.ts",
];

let failed = 0;
for (const rel of FILES) {
  const url = `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${BRANCH}/${rel}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    mkdirSync(dirname(join(rel)), { recursive: true });
    writeFileSync(rel, Buffer.from(await response.arrayBuffer()));
    console.log("Pulled", rel);
  } catch (err) {
    failed += 1;
    console.error(
      `Could not pull ${rel}. Stay in the S4C-platform folder and check the network.`,
      err instanceof Error ? err.message : err
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Dashboard and Logout sit on one line; lime tabs use black copy. Stop npm run dev, start it again, and hard-refresh."
);
