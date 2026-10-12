import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/sharper-ivory-type-18f9";
const FILES = [
  "app/globals.css",
  "app/layout.tsx",
  "app/styles/theme.ts",
  "app/components/home/HomeFrontPage.tsx",
  "scripts/verify-pitch-theme.ts",
  "scripts/verify-homepage.ts",
  "scripts/verify-design-themes.ts",
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

if (failed) process.exit(1);
console.log(
  "OK: black and green copy is darker and sharper on the ivory paper. Stop npm run dev, start it again, and hard-refresh."
);
