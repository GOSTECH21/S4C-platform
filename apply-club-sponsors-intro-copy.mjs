import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/club-sponsors-intro-copy-18f9";
const FILES = [
  "app/components/club/ClubClimateSponsorTabs.tsx",
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

const tabs = "app/components/club/ClubClimateSponsorTabs.tsx";
if (existsSync(tabs)) {
  const src = readFileSync(tabs, "utf8");
  if (
    !src.includes("CLUB_DASHBOARD_SPONSORS_INTRO") ||
    !src.includes(
      "Interested Lead Climate Sponsors & Local Business Climate Sponsors who signed up to sponsor your Club will automatically appear here. Only one Lead Climate Sponsor is allowed on each Match Day. Four Local Business Climate Sponsors are accepted each Match Day."
    ) ||
    src.includes("head-to-head Match") ||
    src.includes("Any second Lead Climate")
  ) {
    failed += 1;
    console.error(
      "Our Climate Sponsors intro copy did not land. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Our Climate Sponsors now uses the shorter Lead and Local intro. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
