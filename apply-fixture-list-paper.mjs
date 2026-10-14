import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/fixture-list-paper-18f9";
const FILES = [
  "app/components/sponsor/MatchSponsorshipPicker.tsx",
  "app/globals.css",
  "scripts/verify-club-sponsor-tabs.ts",
  "scripts/verify-pitch-theme.ts",
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

const picker = "app/components/sponsor/MatchSponsorshipPicker.tsx";
if (existsSync(picker)) {
  const src = readFileSync(picker, "utf8");
  if (src.includes("bg-black/") || src.includes("bg-emerald-950")) {
    failed += 1;
    console.error(
      "Fixture lists still use dark overlays. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: fixture lists sit on paper. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
