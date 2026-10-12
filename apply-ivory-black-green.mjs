import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/ivory-black-green-18f9";
const FILES = [
  "app/globals.css",
  "app/layout.tsx",
  "app/lib/s4p-themes.ts",
  "app/lib/routes.ts",
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

function ensureDesignPreviewPath() {
  const line = 'export const DESIGN_PREVIEW_PATH = "/preview/design";';
  for (const rel of ["app/lib/routes.ts", "app/lib/s4p-themes.ts"]) {
    if (!existsSync(rel)) continue;
    let src = readFileSync(rel, "utf8");
    if (src.includes('export { DESIGN_PREVIEW_PATH } from "./s4p-themes"')) {
      src = src.replace(
        /export \{ DESIGN_PREVIEW_PATH \} from "\.\/s4p-themes";?/,
        line
      );
      writeFileSync(rel, src);
      console.log("Replaced s4p-themes re-export in", rel);
      continue;
    }
    if (/export const DESIGN_PREVIEW_PATH/.test(src)) {
      console.log(rel, "already exports DESIGN_PREVIEW_PATH");
      continue;
    }
    if (src.includes("GLOBAL_SCHOOLS_SOLAR_PATH")) {
      src = src.replace(
        /export const GLOBAL_SCHOOLS_SOLAR_PATH = "\/global-schools-solar";/,
        `$&\n${line}`
      );
    } else if (src.includes('export const DEFAULT_S4P_THEME')) {
      src = src.replace(
        /export const DEFAULT_S4P_THEME = "[^"]+";/,
        `$&\n${line}`
      );
    } else {
      src += `\n${line}\n`;
    }
    writeFileSync(rel, src);
    console.log("Patched", rel);
  }
}

ensureDesignPreviewPath();

if (failed) process.exit(1);
console.log(
  "OK: Ivory canvas is live on every page. Copy is black or green; the Climate Impact Table gold is that same green. Stop npm run dev, start it again, and hard-refresh."
);
