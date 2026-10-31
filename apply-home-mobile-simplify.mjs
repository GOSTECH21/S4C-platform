import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/home-mobile-simplify-18f9";
const BUST = "home-mobile-simplify-1";
const FILES = [
  "app/lib/home-hero.ts",
  "app/components/home/HomeTopBanner.tsx",
  "app/components/home/HomeFrontPage.tsx",
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
if (existsSync(banner)) {
  const src = readFileSync(banner, "utf8");
  if (
    !src.includes("home-mobile-simplify-v1") ||
    !src.includes("EVERY SCORE COUNTS") ||
    !src.includes("Join as a Fan") ||
    !src.includes("For Sports Clubs") ||
    !src.includes("Join Free")
  ) {
    failed += 1;
    console.error(
      "The mobile homepage is still the congested header. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Mobile homepage now opens with the compact header, five-sports banner, Join as a Fan and For Sports Clubs. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
