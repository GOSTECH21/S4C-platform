import { existsSync, readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  existsSync("public/images/platform-background.png"),
  "The quiet-wave wallpaper is still backed up"
);

const css = readFileSync("app/globals.css", "utf8");
assert(css.includes("--s4p-canvas: #f7f4e8"), "The live canvas is ivory paper");
assert(css.includes("--s4p-ink: #111111"), "Primary copy is black");
assert(css.includes("--s4p-mint: #2a8f4a"), "Accent copy is one green");
assert(css.includes("--s4p-gold: #2a8f4a"), "The old gold token is the same green");
assert(css.includes("--color-s4p-mark: #5bc662"), "S4P mark green stays for buttons");
assert(css.includes(".s4p-navy-panel"), "Info panels sit on paper glass");
assert(css.includes('url("/images/platform-background.png")'), "Quiet wave remains as a trial wallpaper");
assert(css.includes("html[data-theme=\"quiet-wave\"]"), "Quiet wave can still be tried");
assert(!css.includes("#0c3229"), "The old pitch-dusk canvas token is gone");

const home = readFileSync("app/components/home/HomeFrontPage.tsx", "utf8");
assert(!home.includes("#04140f") && !home.includes("#07150f"), "Home no longer uses near-black overlays");
assert(!home.includes("hero.png"), "Home no longer covers the canvas with the stadium hero photo");
assert(home.includes('text-s4p-mint">a brighter planet'), "A brighter planet is green");
assert(home.includes("Sport creates the moment."), "Sport creates the moment stays in the hero");
assert(home.includes("s4p-navy-panel"), "The stats strip uses a panel");

const tables = readFileSync("app/components/home/S4pImpactTables.tsx", "utf8");
assert(tables.includes("s4p-navy-panel"), "CILT sits on a panel");
assert(tables.includes("text-s4p-mint"), "CILT metrics are green");
assert(!tables.includes("text-amber-300"), "CILT no longer uses gold metric text");

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Ivory canvas: black copy, one green, lime reserved for buttons.");
