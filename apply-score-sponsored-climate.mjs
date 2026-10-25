import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/score-sponsored-climate-18f9";
const FILES = [
  "app/components/home/HomeJoinMission.tsx",
  "scripts/verify-homepage.ts",
];

let failed = 0;
for (const rel of FILES) {
  const url = `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${BRANCH}/${rel}`;
  try {
    const response = await fetch(url);
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
    !src.includes("Turn every score in a match into a sponsored climate action") ||
    src.includes("Turn every match into a climate action opportunity")
  ) {
    failed += 1;
    console.error(
      "The club-director heading is not in place. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: club heading is Turn every score in a match into a sponsored climate action. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
