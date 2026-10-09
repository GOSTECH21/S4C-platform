import { readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const css = readFileSync("app/globals.css", "utf8");
assert(css.includes("--color-slate-950: #0c3229"), "Page canvas is pitch green, not black");
assert(css.includes("--color-white: #fff8ec"), "Primary text is cream, not harsh white");
assert(css.includes("--color-slate-400: #b6e3cf"), "Muted copy is mint and readable");
assert(!css.includes("#0a0a0a"), "The old black canvas token is gone");
assert(css.includes("radial-gradient"), "The canvas has a pitch-dusk glow");

const home = readFileSync("app/components/home/HomeFrontPage.tsx", "utf8");
assert(!home.includes("#04140f") && !home.includes("#07150f"), "Home no longer uses near-black overlays");

const card = readFileSync("app/components/fan/MatchDayProjectCard.tsx", "utf8");
assert(!card.includes("#07150f"), "Project cards use the lifted pitch surface");

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Pitch-dusk theme: readable forest canvas, cream headlines, mint copy.");
