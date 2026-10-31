import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/explore-club-partnership-18f9";
const BUST = "explore-club-partnership-1";
const FILES = [
  "app/components/home/HomeJoinMission.tsx",
  "scripts/verify-club-passion-copy.ts",
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
    !src.includes(
      "Turn match-day passion into sponsorship revenue and climate action"
    ) ||
    !src.includes("Give your club a new way to engage supporters") ||
    !src.includes("From scoring moments to live fan predictions") ||
    !src.includes("Explore club partnership") ||
    !src.includes("CLUB_REGISTER_PATH") ||
    src.includes("Emissions measurement")
  ) {
    failed += 1;
    console.error(
      "The Explore club partnership tab is not in place. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("app/components/home/HomeJoinMission.tsx is missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Club-director panel now has the Explore club partnership tab. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
