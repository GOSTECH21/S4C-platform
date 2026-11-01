import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/fan-p4p-drop-overlay-18f9";
const BUST = "fan-p4p-drop-overlay-1";
const FILES = [
  "app/components/home/HowS4pPredictForPlanet.tsx",
  "app/supporter/dashboard/predict/page.tsx",
  "app/preview/fan-p4p/page.tsx",
  "scripts/verify-fan-p4p-drop-overlay.ts",
  "scripts/verify-how-s4p-split.ts",
  "scripts/verify-predict-for-planet.ts",
];

let failed = 0;
for (const rel of FILES) {
  const url = `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${BRANCH}/${rel}?v=${BUST}`;
  try {
    const response = await fetch(url, { cache: "no-store" });
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

const fan = "app/supporter/dashboard/predict/page.tsx";
const section = "app/components/home/HowS4pPredictForPlanet.tsx";
const preview = "app/preview/fan-p4p/page.tsx";
if (existsSync(fan) && existsSync(section) && existsSync(preview)) {
  const fanSrc = readFileSync(fan, "utf8");
  const sectionSrc = readFileSync(section, "utf8");
  const previewSrc = readFileSync(preview, "utf8");
  if (
    !fanSrc.includes("showPhone={false}") ||
    !sectionSrc.includes("showPhone") ||
    !fanSrc.includes("PredictForPlanetPlay") ||
    !previewSrc.includes("showPhone={false}")
  ) {
    failed += 1;
    console.error(
      "Fan P4P still shows the duplicate demo phone. Pull the files above, then hard-refresh."
    );
  }
} else {
  failed += 1;
  console.error("Fan P4P files are missing.");
}

if (failed) process.exit(1);
console.log(
  "OK: Logged-in fan P4P keeps the intro and live challenge, without the duplicate demo phone. Stop npm run dev, start it again, and hard-refresh (Ctrl+F5)."
);
