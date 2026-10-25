import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/score-sponsored-climate-18f9";
const OLD = "Turn every match into a climate action opportunity";
const NEXT = "Turn every score in a match into a sponsored climate action";
const FILES = [
  "app/components/home/HomeJoinMission.tsx",
  "scripts/verify-homepage.ts",
];

function patch(src) {
  return src.replaceAll(OLD, NEXT);
}

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
  const before = readFileSync(join, "utf8");
  const after = patch(before);
  if (after !== before) {
    writeFileSync(join, after);
    console.log("Patched", join);
  }
  const src = readFileSync(join, "utf8");
  if (!src.includes(NEXT) || src.includes(OLD)) {
    failed += 1;
    console.error(
      "The club-director heading is not in place. Run the curl command from the S4C-platform folder, then hard-refresh."
    );
  } else {
    console.log("Heading now reads:", NEXT);
  }
} else {
  failed += 1;
  console.error("app/components/home/HomeJoinMission.tsx is missing.");
}

if (failed) process.exit(1);
console.log(
  "OK. Stop npm run dev, start it again, then hard-refresh (Ctrl+F5) at http://localhost:3000."
);
