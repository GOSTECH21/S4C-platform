import { existsSync, readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  existsSync("public/images/platform-background.png"),
  "The green–navy wave wallpaper is in public/images"
);

const css = readFileSync("app/globals.css", "utf8");
assert(
  css.includes('url("/images/platform-background.png")'),
  "Every page uses the wave wallpaper as the background"
);
assert(css.includes("background-attachment: fixed"), "The wallpaper stays fixed behind every page");
assert(css.includes("--s4p-ivory: #f7f4e8"), "Primary copy is ivory");
assert(css.includes("--s4p-mint: #8fe388"), "Green on dark blue is mint, not fluorescent lime");
assert(css.includes("--color-s4p-mark: #5bc662"), "S4P mark green stays for buttons and icons");
assert(css.includes(".s4p-navy-panel"), "Info panels sit on a consistent navy glass");
assert(css.includes("#082a46"), "Canvas falls back to deep navy");
assert(css.includes("#0b4a4a"), "Teal is in the atmosphere overlay");
assert(css.includes("#176b4a"), "Restrained emerald is in the atmosphere overlay");
assert(!css.includes("#0a0a0a"), "The old black canvas token is gone");
assert(!css.includes("#0c3229"), "The old pitch-dusk canvas token is gone");

const home = readFileSync("app/components/home/HomeFrontPage.tsx", "utf8");
assert(!home.includes("#04140f") && !home.includes("#07150f"), "Home no longer uses near-black overlays");
assert(!home.includes("hero.png"), "Home no longer covers the wallpaper with the stadium hero photo");
assert(home.includes('text-s4p-mint">a brighter planet'), "A brighter planet is mint");
assert(home.includes("Sport creates the moment."), "Sport creates the moment is ivory");
assert(home.includes("s4p-navy-panel"), "The stats strip uses navy glass");

const tables = readFileSync("app/components/home/S4pImpactTables.tsx", "utf8");
assert(tables.includes("s4p-navy-panel"), "CILT sits on navy glass");

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Quiet wave: ivory copy, mint accents, navy panels, lime reserved for UI.");
