import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/turn-goals-into-action-18f9";
const FILES = [
  "app/components/home/HomeFrontPage.tsx",
  "scripts/verify-homepage.ts",
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

const home = "app/components/home/HomeFrontPage.tsx";
if (existsSync(home)) {
  const src = readFileSync(home, "utf8");
  if (
    !src.includes("Turn Goals") ||
    !src.includes('text-s4p-mint">into Action') ||
    src.includes("a brighter planet")
  ) {
    failed += 1;
    console.error(
      "Homepage is missing Turn Goals into Action. Pull the files above, then hard-refresh."
    );
  }
}

if (failed) process.exit(1);
console.log(
  "OK: the homepage headline is Turn Goals into Action. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
