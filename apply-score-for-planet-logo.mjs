import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/score-for-planet-logo-18f9";
const FILES = [
  "public/images/home/s4p-mark.png",
  "app/components/home/HomeFrontPage.tsx",
  "app/components/home/HowItWorks.tsx",
  "app/components/home/Footer.tsx",
  "app/layout.tsx",
  "scripts/verify-homepage.ts",
  "scripts/verify-pitch-theme.ts",
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

const home = "app/components/home/HomeFrontPage.tsx";
const how = "app/components/home/HowItWorks.tsx";
const footer = "app/components/home/Footer.tsx";
const mark = "public/images/home/s4p-mark.png";
if (existsSync(home) && existsSync(mark)) {
  const src = readFileSync(home, "utf8");
  const png = readFileSync(mark);
  if (!src.includes("SCORE-FOR-PLANET") || png[25] !== 6) {
    failed += 1;
    console.error(
      "The homepage mark is not the SCORE-FOR-PLANET lockup. Pull the files above, then hard-refresh."
    );
  }
}
if (existsSync(how) && readFileSync(how, "utf8").includes("Score-For-Our-Planet")) {
  failed += 1;
  console.error("How It Works still says Score-For-Our-Planet.");
}
if (
  existsSync(footer) &&
  readFileSync(footer, "utf8").includes("Score-For-Our-Planet")
) {
  failed += 1;
  console.error("Footer still says Score-For-Our-Planet.");
}

if (failed) process.exit(1);
console.log(
  "OK: the homepage uses the SCORE-FOR-PLANET lockup. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
