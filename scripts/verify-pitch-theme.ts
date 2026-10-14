import { existsSync, readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  existsSync("public/images/platform-background.png"),
  "The quiet-wave wallpaper is still backed up"
);
assert(
  existsSync("public/images/home/s4p-mark.png") &&
    readFileSync("public/images/home/s4p-mark.png")[25] === 6,
  "The S4P mark is a transparent PNG so the paper shows through"
);

const css = readFileSync("app/globals.css", "utf8");
assert(css.includes("--s4p-canvas: #f7f4e8"), "The live canvas is ivory paper");
assert(css.includes("--s4p-ink: #000000"), "Primary copy is true black");
assert(css.includes("--s4p-mint: #0c5c2c"), "Accent copy is a darker green on paper");
assert(css.includes("--s4p-gold: #0c5c2c"), "The old gold token is the same green");
assert(css.includes("-webkit-font-smoothing: auto"), "Ivory type uses subpixel smoothing so it stays sharp");
assert(
  !readFileSync("app/layout.tsx", "utf8").includes("antialiased"),
  "The greying antialiased class is off the live canvas"
);
assert(
  !readFileSync("app/components/home/HomeFrontPage.tsx", "utf8").includes("drop-shadow md:text-6xl"),
  "Hero headlines no longer sit in a grey drop-shadow"
);
assert(css.includes("--color-s4p-mark: #5bc662"), "S4P mark green stays for buttons");
assert(css.includes(".s4p-navy-panel"), "Info panels sit on paper glass");
assert(
  css.includes('[class*="bg-black/"]') &&
    css.includes('[class*="bg-emerald-950"]') &&
    css.includes('[class~="bg-green-400"]') &&
    css.includes('[class*="bg-green-950"]') &&
    css.includes('[class*="bg-zinc-900"]'),
  "Dark green, black and zinc fills remap to paper; lime stays on buttons"
);
assert(
  readFileSync("app/components/fan/MyTeamsList.tsx", "utf8").includes(
    "border-emerald-400/40 bg-slate-900"
  ) &&
    !readFileSync("app/components/fan/MyTeamsList.tsx", "utf8").includes(
      "bg-green-400 p-4"
    ),
  "My Teams club cards sit on paper, not mint-green fills"
);
assert(css.includes('url("/images/platform-background.png")'), "Quiet wave remains as a trial wallpaper");
assert(css.includes("html[data-theme=\"quiet-wave\"]"), "Quiet wave can still be tried");
assert(!css.includes("#0c3229"), "The old pitch-dusk canvas token is gone");

const home = readFileSync("app/components/home/HomeFrontPage.tsx", "utf8");
assert(!home.includes("#04140f") && !home.includes("#07150f"), "Home no longer uses near-black overlays");
assert(!home.includes("hero.png"), "Home no longer covers the canvas with the stadium hero photo");
assert(
  home.includes("Turn Goals") && home.includes('text-s4p-mint">into Action'),
  "Turn Goals into Action uses mint on the second line"
);
assert(
  home.includes("SCORE-FOR-PLANET") &&
    home.includes("Every score counts") &&
    !home.includes("Sport creates the moment."),
  "SCORE-FOR-PLANET lockup replaces the old Sport creates the moment stack"
);
assert(home.includes("s4p-navy-panel"), "The stats strip uses a panel");
assert(home.includes('src="/images/home/s4p-mark.png"'), "Home still uses the S4P mark");
assert(!home.includes("drop-shadow-2xl"), "The mark has no dark box-shadow behind it");
assert(home.includes("unoptimized"), "The mark is served as the transparent PNG, not a flattened optimized copy");

const tables = readFileSync("app/components/home/S4pImpactTables.tsx", "utf8");
assert(tables.includes("s4p-navy-panel"), "CILT sits on a panel");
assert(tables.includes("text-s4p-mint"), "CILT metrics are green");
assert(!tables.includes("text-amber-300"), "CILT no longer uses gold metric text");

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Ivory canvas: black copy, one green, lime reserved for buttons.");
