import { existsSync, readFileSync } from "fs";
import {
  DEFAULT_S4P_THEME,
  S4P_THEME_BOOT_SCRIPT,
  S4P_THEME_STORAGE_KEY,
  S4P_THEMES,
  isS4pThemeId,
} from "../app/lib/s4p-themes";
import { DESIGN_PREVIEW_PATH } from "../app/lib/routes";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(DEFAULT_S4P_THEME === "ivory-canvas", "Ivory canvas is the live restore point");
assert(S4P_THEMES[0].id === "ivory-canvas" && S4P_THEMES[0].restore, "Ivory canvas is first and marked restore");
assert(
  S4P_THEMES.map((theme) => theme.id).join(",") ===
    "ivory-canvas,quiet-wave,vivid-wave,navy-night,forest-dusk",
  "Ivory is live; four earlier looks remain as trials"
);
assert(isS4pThemeId("quiet-wave") && !isS4pThemeId("neon"), "Theme ids are allowlisted");
assert(S4P_THEME_STORAGE_KEY === "s4p-theme-v2", "Trials persist under a fresh key so ivory actually lands");
assert(
  readFileSync("app/lib/s4p-themes.ts", "utf8").includes("s4p-theme-change") &&
    readFileSync("app/components/ThemeTrialBanner.tsx", "utf8").includes(
      "S4P_THEME_CHANGE_EVENT"
    ) &&
    readFileSync("app/components/design/DesignThemePicker.tsx", "utf8").includes(
      "S4P_THEME_CHANGE_EVENT"
    ),
  "The restore bar updates in the same tab when a trial is applied"
);
assert(
  S4P_THEME_BOOT_SCRIPT.includes('localStorage.getItem("s4p-theme-v2")') &&
    S4P_THEME_BOOT_SCRIPT.includes("quiet-wave") &&
    S4P_THEME_BOOT_SCRIPT.includes("ivory-canvas"),
  "The boot script allowlists every trial before paint"
);

assert(existsSync("public/images/themes/quiet-wave.png"), "Quiet wave wallpaper is backed up");
assert(existsSync("public/images/themes/vivid-wave.png"), "Original Image 2 is backed up as vivid wave");

const css = readFileSync("app/globals.css", "utf8");
assert(css.includes("--s4p-canvas: #f7f4e8"), "Default canvas is ivory paper");
assert(css.includes('html[data-theme="quiet-wave"]'), "Quiet wave has a data-theme");
assert(css.includes('html[data-theme="vivid-wave"]'), "Vivid wave has a data-theme");
assert(css.includes('html[data-theme="navy-night"]'), "Navy night has a data-theme");
assert(css.includes('html[data-theme="forest-dusk"]'), "Forest dusk has a data-theme");
assert(css.includes('html[data-theme="ivory-canvas"]'), "Ivory canvas has a data-theme");
assert(css.includes("--s4p-ink: #111111"), "Live copy is black");
assert(css.includes("--s4p-mint: #2a8f4a"), "Live accent copy is green");
assert(css.includes("color-scheme: light"), "Ivory canvas is a light colour scheme");

const layout = readFileSync("app/layout.tsx", "utf8");
assert(layout.includes("data-theme={DEFAULT_S4P_THEME}"), "HTML defaults to ivory canvas");
assert(layout.includes("ThemeBootScript"), "A pre-paint script restores a saved trial");
assert(layout.includes("ThemeTrialBanner"), "A restore bar is on every page during a trial");
assert(layout.includes("suppressHydrationWarning"), "Theme attribute mismatches are expected");

const picker = readFileSync("app/components/design/DesignThemePicker.tsx", "utf8");
assert(picker.includes("Restore current design"), "The picker can restore ivory canvas");
assert(picker.includes("Try this look"), "Each trial can be applied");
assert(picker.includes("restoreDefaultTheme"), "Restore applies the live ivory design");

const preview = readFileSync("app/preview/design/page.tsx", "utf8");
assert(preview.includes("DesignThemePicker"), "The design preview hosts the picker");
assert(preview.includes("Ivory canvas is the live design"), "Copy names the live look");

const footer = readFileSync("app/components/home/Footer.tsx", "utf8");
assert(
  footer.includes("DESIGN_PREVIEW_PATH") && footer.includes("Try a design"),
  "Footer links to the design trials"
);
assert(DESIGN_PREVIEW_PATH === "/preview/design", "Design trials live at /preview/design");

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Ivory canvas is live; Quiet wave and the other looks remain as trials.");
