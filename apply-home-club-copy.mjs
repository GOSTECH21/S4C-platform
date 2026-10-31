import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/home-club-copy-18f9";
const BUST = "home-club-copy-1";
const FILES = [
  "app/components/home/HomeTopBanner.tsx",
  "app/components/home/HomeRoleSection.tsx",
  "app/lib/home-stakeholders.ts",
  "scripts/verify-home-club-copy.ts",
  "scripts/verify-homepage.ts",
  "scripts/verify-role-tabs-mobile.ts",
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

const banner = "app/components/home/HomeTopBanner.tsx";
const roles = "app/components/home/HomeRoleSection.tsx";
const stakeholders = "app/lib/home-stakeholders.ts";
if (existsSync(banner) && existsSync(roles) && existsSync(stakeholders)) {
  const bannerSrc = readFileSync(banner, "utf8");
  const rolesSrc = readFileSync(roles, "utf8");
  const clubSrc = readFileSync(stakeholders, "utf8");
  if (
    !bannerSrc.includes("We help your club address match-day carbon emissions") ||
    !clubSrc.includes(
      "through funded, measurable climate projects"
    ) ||
    !rolesSrc.includes("Built for") ||
    rolesSrc.includes("of Fans Worldwide")
  ) {
    failed += 1;
    console.error(
      "The homepage copy is still the old version. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("Homepage files are missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Homepage now uses the club support line, Sports Clubs measurable-projects copy, and Built for Fans Worldwide. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
