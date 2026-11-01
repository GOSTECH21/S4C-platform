import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/fan-p4p-tabs-18f9";
const BUST = "fan-p4p-tabs-1";
const FILES = [
  "app/components/home/HomeJoinMission.tsx",
  "app/components/home/HomeFrontPage.tsx",
  "app/components/home/HomeRoleSection.tsx",
  "scripts/verify-fan-p4p-copy.ts",
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
const front = "app/components/home/HomeFrontPage.tsx";
if (existsSync(join) && existsSync(front)) {
  const joinSrc = readFileSync(join, "utf8");
  const frontSrc = readFileSync(front, "utf8");
  if (
    !joinSrc.includes("fan-p4p-tabs-v1") ||
    !joinSrc.includes("Over 50% of a Match Day carbon emissions") ||
    !joinSrc.includes("Play P4P") ||
    !frontSrc.includes("showFanP4P")
  ) {
    failed += 1;
    console.error(
      "The fan P4P tabs are not in place. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("Fan join files are missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Fan panel now has Match Day emissions copy plus Join free and Play P4P tabs. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
