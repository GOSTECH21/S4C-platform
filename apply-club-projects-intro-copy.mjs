import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/club-projects-intro-copy-18f9";
const FILES = [
  "app/lib/partner-projects.ts",
  "scripts/verify-club-match-day.ts",
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

const helper = "app/lib/partner-projects.ts";
if (existsSync(helper)) {
  const src = readFileSync(helper, "utf8");
  if (
    !src.includes(
      "Press the blue S4P Climate Projects button to choose only one Featured Global Schools Solar project"
    ) ||
    src.includes("Open S4P Climate Projects to choose only one Featured")
  ) {
    failed += 1;
    console.error(
      "Club dashboard S4P Climate Projects intro copy did not land. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Club dashboard now says Press the blue S4P Climate Projects button first. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
