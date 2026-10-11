import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/design-theme-preview-18f9";
const FILES = [
  "app/globals.css",
  "app/layout.tsx",
  "app/lib/s4p-themes.ts",
  "app/lib/routes.ts",
  "app/components/ThemeBootScript.tsx",
  "app/components/ThemeTrialBanner.tsx",
  "app/components/design/DesignThemePicker.tsx",
  "app/preview/design/page.tsx",
  "app/components/home/Footer.tsx",
  "scripts/verify-design-themes.ts",
  "scripts/verify-pitch-theme.ts",
  "public/images/themes/quiet-wave.png",
  "public/images/themes/vivid-wave.png",
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
  "OK: Quiet wave is backed up. Open /preview/design to try Vivid wave, Navy night, Forest dusk or Ivory canvas. Restore current design puts Quiet wave back. Stop npm run dev, start it again, and hard-refresh."
);
