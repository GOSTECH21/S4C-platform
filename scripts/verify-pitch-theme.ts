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
assert(css.includes("--color-s4p-mark: #5bc662"), "S4P mark green is unchanged");
assert(css.includes("--color-slate-600: #3d8f76"), "Mid slate stays a green shade");
assert(!css.includes("#0a0a0a"), "The old black canvas token is gone");
assert(!css.includes("#f4f1e8"), "The off-white canvas token is gone from the page fill");
assert(!css.includes("#0c3229"), "The old pitch-dusk canvas token is gone");

const home = readFileSync("app/components/home/HomeFrontPage.tsx", "utf8");
assert(!home.includes("#04140f") && !home.includes("#07150f"), "Home no longer uses near-black overlays");
assert(!home.includes("hero.png"), "Home no longer covers the wallpaper with the stadium hero photo");

const card = readFileSync("app/components/fan/MatchDayProjectCard.tsx", "utf8");
assert(!card.includes("#07150f"), "Project cards no longer use a near-black fill");

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Wave wallpaper: green–navy background on every page, greens retained.");
