import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/join-community-tab-18f9";
const BUST = "join-community-tab-1";
const FILES = [
  "app/lib/home-hero.ts",
  "app/components/home/HomeTopBanner.tsx",
  "app/components/home/HomeFrontPage.tsx",
  "scripts/verify-join-community-tab.ts",
  "scripts/verify-home-mobile-simplify.ts",
  "scripts/verify-homepage.ts",
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
const front = "app/components/home/HomeFrontPage.tsx";
if (existsSync(banner) && existsSync(front)) {
  const bannerSrc = readFileSync(banner, "utf8");
  const frontSrc = readFileSync(front, "utf8");
  const intro = bannerSrc.slice(
    bannerSrc.indexOf("data-home-mobile-intro"),
    bannerSrc.indexOf("<HeadlineAndFeatures")
  );
  if (
    intro.includes("JoinRoleTabs") ||
    !bannerSrc.includes("HOME_JOIN_COMMUNITY_LABEL") ||
    !bannerSrc.includes("join-community-v1") ||
    !frontSrc.includes("data-how-s4p-desktop")
  ) {
    failed += 1;
    console.error(
      "The mobile homepage still has Fan/Clubs tabs or How S4P Works. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("Homepage files are missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Mobile homepage now uses Join the Community under the global sports copy, and How S4P Works is desktop-only. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
