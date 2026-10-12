import { existsSync, readFileSync, writeFileSync } from "fs";

const LINE = 'export const DESIGN_PREVIEW_PATH = "/preview/design";';

function ensure(rel, insertAfter) {
  if (!existsSync(rel)) {
    console.error(`Missing ${rel}. Stay in the S4C-platform folder.`);
    return false;
  }
  let src = readFileSync(rel, "utf8");
  if (src.includes('export { DESIGN_PREVIEW_PATH } from "./s4p-themes"')) {
    src = src.replace(
      /export \{ DESIGN_PREVIEW_PATH \} from "\.\/s4p-themes";?/,
      LINE
    );
    writeFileSync(rel, src);
    console.log("Replaced s4p-themes re-export in", rel);
    return true;
  }
  if (/export const DESIGN_PREVIEW_PATH/.test(src)) {
    console.log("OK:", rel, "already defines DESIGN_PREVIEW_PATH");
    return true;
  }
  if (insertAfter && src.includes(insertAfter)) {
    src = src.replace(insertAfter, `${insertAfter}\n${LINE}`);
  } else {
    src += `\n${LINE}\n`;
  }
  writeFileSync(rel, src);
  console.log("Patched", rel);
  return true;
}

const okRoutes = ensure(
  "app/lib/routes.ts",
  'export const GLOBAL_SCHOOLS_SOLAR_PATH = "/global-schools-solar";'
);
const okThemes = ensure(
  "app/lib/s4p-themes.ts",
  'export const DEFAULT_S4P_THEME = "ivory-canvas";'
);

if (!okRoutes || !okThemes) process.exit(1);
console.log(
  "OK: DESIGN_PREVIEW_PATH is defined. Stop npm run dev, start it again, and hard-refresh."
);
