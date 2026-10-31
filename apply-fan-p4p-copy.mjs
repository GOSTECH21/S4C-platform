import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/fan-p4p-copy-18f9";
const BUST = "fan-p4p-copy-1";
const FILES = [
  "app/components/home/HomeJoinMission.tsx",
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
if (existsSync(join)) {
  const src = readFileSync(join, "utf8");
  if (
    !src.includes("fan-p4p-copy-v1") ||
    !src.includes("Predict-4-Planet (P4P)") ||
    src.includes("take part in match-day activities")
  ) {
    failed += 1;
    console.error(
      "The fan join copy is still the old version. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("app/components/home/HomeJoinMission.tsx is missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Fan join panel now mentions Predict-4-Planet (P4P). Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
