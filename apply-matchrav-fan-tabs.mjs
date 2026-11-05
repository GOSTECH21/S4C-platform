import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/matchrav-fan-tabs-18f9";
const BUST = "matchrav-fan-tabs-1";
const FILES = [
  "app/lib/matchrav.ts",
  "app/components/home/HomeJoinMission.tsx",
  "scripts/verify-matchrav-fan-tabs.ts",
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
const matchrav = "app/lib/matchrav.ts";
if (existsSync(join) && existsSync(matchrav)) {
  const joinSrc = readFileSync(join, "utf8");
  const matchravSrc = readFileSync(matchrav, "utf8");
  if (
    !matchravSrc.includes("matchrav-fan-tabs-v1") ||
    !matchravSrc.includes("Matchrav") ||
    matchravSrc.includes("Matrav") ||
    !joinSrc.includes("grid-cols-3") ||
    !joinSrc.includes("JOIN_S4P_FREE_LABEL")
  ) {
    failed += 1;
    console.error(
      "The Matchrav fan tabs are not in place. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("Matchrav fan-join files are missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Fan panel now has Matchrav, P4P and S4P tabs. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
