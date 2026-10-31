import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/mobile-headline-size-18f9";
const BUST = "mobile-headline-size-1";
const FILES = [
  "app/components/home/HomeTopBanner.tsx",
  "app/components/home/HomeJoinMission.tsx",
  "scripts/verify-mobile-headline-size.ts",
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
const join = "app/components/home/HomeJoinMission.tsx";
if (existsSync(banner) && existsSync(join)) {
  const bannerSrc = readFileSync(banner, "utf8");
  const joinSrc = readFileSync(join, "utf8");
  if (
    !bannerSrc.includes("mobile-headline-size-v1") ||
    !bannerSrc.includes("text-[1.85rem]") ||
    !joinSrc.includes("text-[1.45rem]")
  ) {
    failed += 1;
    console.error(
      "The mobile headlines are still the large type. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("Homepage files are missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: A GLOBAL SPORTS now fits four lines on a phone, and the match-day passion heading is smaller. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
