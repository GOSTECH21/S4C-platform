import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/club-tabs-lime-green-18f9";
const FILES = [
  "app/lib/s4p-tabs.ts",
  "app/components/club/ClubNav.tsx",
  "app/club/projects/select/page.tsx",
  "app/components/club/ClubClimateSponsorTabs.tsx",
  "app/sponsor/campaigns/select/page.tsx",
  "scripts/verify-club-match-day.ts",
  "scripts/verify-club-sponsor-tabs.ts",
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

const select = "app/club/projects/select/page.tsx";
if (existsSync(select)) {
  const src = readFileSync(select, "utf8");
  if (
    !src.includes("s4pTabClass") ||
    src.includes("border border-slate-700 text-slate-300")
  ) {
    failed += 1;
    console.error(
      "List 1 / List 2 tabs did not land in lime green. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Club tabs (nav, List 1 / List 2, Lead / Local) use the lime green. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
