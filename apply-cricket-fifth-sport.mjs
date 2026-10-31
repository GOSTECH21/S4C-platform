import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/cricket-fifth-sport-18f9";
const BUST = "cricket-fifth-sport-1";
const FILES = [
  "app/lib/sports.ts",
  "app/lib/sporting-calendar-leagues.ts",
  "app/lib/sporting-calendar.ts",
  "app/lib/current-season.ts",
  "app/components/home/HomeTopBanner.tsx",
  "app/sponsor/campaigns/new/page.tsx",
  "app/components/sponsorship-builder/CompetitionStep.tsx",
  "app/data/sponsorship-products.ts",
  "app/dashboard/supporter/goal-alert/page.tsx",
  "scripts/verify-cricket-fifth-sport.ts",
  "scripts/verify-club-register-step1.ts",
  "scripts/verify-current-season.ts",
];

let failed = 0;
for (const rel of FILES) {
  const url = `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${BRANCH}/${rel}?v=${BUST}`;
  try {
    const response = await fetch(url, { cache: "no-store" });
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

const sports = "app/lib/sports.ts";
const banner = "app/components/home/HomeTopBanner.tsx";
if (existsSync(sports) && existsSync(banner)) {
  const sportsSrc = readFileSync(sports, "utf8");
  const bannerSrc = readFileSync(banner, "utf8");
  if (
    !sportsSrc.includes('name: "Cricket"') ||
    !bannerSrc.includes("cricket-fifth-sport-v1")
  ) {
    failed += 1;
    console.error(
      "Cricket is still missing from the five sports. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("Five-sports files are missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Cricket is the fifth sport on the phone. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
