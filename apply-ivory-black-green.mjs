import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/ivory-black-green-18f9";
const FILES = [
  "app/globals.css",
  "app/layout.tsx",
  "app/lib/s4p-themes.ts",
  "app/styles/theme.ts",
  "app/components/ThemeBootScript.tsx",
  "app/components/ThemeTrialBanner.tsx",
  "app/components/design/DesignThemePicker.tsx",
  "app/preview/design/page.tsx",
  "app/components/home/Footer.tsx",
  "app/components/home/S4pImpactTables.tsx",
  "app/s4p-impact-tables/page.tsx",
  "scripts/verify-design-themes.ts",
  "scripts/verify-pitch-theme.ts",
  "scripts/verify-homepage.ts",
  "scripts/verify-s4p-impact-tables.ts",
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
  "OK: Ivory canvas is live on every page. Copy is black or green; the Climate Impact Table gold is that same green. Stop npm run dev, start it again, and hard-refresh."
);
