import { readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const css = readFileSync("app/globals.css", "utf8");
assert(css.includes("--s4p-canvas: #f4f1e8"), "Page canvas is off-white, not black");
assert(css.includes("--color-slate-950: #f4f1e8"), "Slate canvas token is off-white");
assert(css.includes("--s4p-ink: #14352c"), "Primary text is forest ink on paper");
assert(css.includes("--color-s4p-mark: #5bc662"), "S4P mark green is unchanged");
assert(css.includes("--color-slate-600: #3d8f76"), "Mid slate stays a green shade");
assert(css.includes("color-scheme: light"), "Native controls use the light color scheme");
assert(!css.includes("#0a0a0a"), "The old black canvas token is gone");
assert(!css.includes("#0c3229"), "The old pitch-dusk canvas token is gone");
assert(css.includes("rgba(91, 198, 98"), "The canvas keeps a green glow");
assert(css.includes("radial-gradient"), "The canvas has a soft green glow");

const home = readFileSync("app/components/home/HomeFrontPage.tsx", "utf8");
assert(!home.includes("#04140f") && !home.includes("#07150f"), "Home no longer uses near-black overlays");
assert(home.includes("from-slate-950/65"), "Hero overlay is a light paper wash, not a black veil");

const card = readFileSync("app/components/fan/MatchDayProjectCard.tsx", "utf8");
assert(!card.includes("#07150f"), "Project cards use the lifted paper surface");

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Off-white theme: paper canvas, forest ink, retained greens.");
