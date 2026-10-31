import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/club-scores-copy-18f9";
const BUST = "club-scores-copy-1";
const FILES = [
  "app/components/home/HomeJoinMission.tsx",
  "scripts/verify-club-scores-copy.ts",
  "scripts/verify-club-passion-copy.ts",
  "scripts/verify-mobile-headline-size.ts",
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

const join = "app/components/home/HomeJoinMission.tsx";
if (existsSync(join)) {
  const src = readFileSync(join, "utf8");
  if (
    !src.includes("club-scores-copy-v1") ||
    !src.includes(
      "Turn Match Day Scores into sponsored funding for Climate Projects"
    ) ||
    !src.includes("club-cta-one-line-v1") ||
    !src.includes("whitespace-nowrap")
  ) {
    failed += 1;
    console.error(
      "The club-director heading or Explore club partnership tab is not in place. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("app/components/home/HomeJoinMission.tsx is missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Club-director heading is now Turn Match Day Scores into sponsored funding for Climate Projects, and Explore club partnership fits on one line. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
