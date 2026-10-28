import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/predict-for-planet-18f9";
const MARKERS = new Set(["HowItWorks.tsx"]);
const FILES = [
  "app/lib/predict-for-planet.ts",
  "app/services/predict-for-planet.service.ts",
  "app/components/home/PredictForPlanet.tsx",
  "app/components/home/HowItWorks.tsx",
  "app/components/fan/PredictForPlanetPlay.tsx",
  "app/dashboard/supporter/components/FanNav.tsx",
  "app/dashboard/supporter/predict/page.tsx",
  "app/supporter/dashboard/predict/page.tsx",
  "app/preview/predict-for-planet/page.tsx",
  "app/sponsor/game-time/page.tsx",
  "app/components/sponsor/ClubMatchMenus.tsx",
  "app/lib/calendar-clubs.ts",
  "app/sponsor/register/page.tsx",
  "app/sponsor/sponsor-nav.tsx",
  "app/climate-sponsorship/page.tsx",
  "app/components/club/ClubSponsorsListings.tsx",
  "app/lib/home-stakeholders.ts",
  "app/lib/routes.ts",
  "app/lib/sponsor-listings.ts",
  "app/lib/sports.ts",
  "apply-match-sponsorship.mjs",
  "apply-match-sponsorship.ps1",
  "scripts/verify-predict-for-planet.ts",
  "scripts/verify-homepage.ts",
];

console.log("Folder:", process.cwd());

function findMarkerFiles(dir, depth, found) {
  if (depth > 6) return;
  let entries = [];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (
      entry.name === "node_modules" ||
      entry.name === ".next" ||
      entry.name === ".git"
    ) {
      continue;
    }
    const path = join(dir, entry.name);
    if (entry.isDirectory()) findMarkerFiles(path, depth + 1, found);
    else if (MARKERS.has(entry.name)) found.push(path);
  }
}

function appRootFromMarker(file) {
  return dirname(dirname(dirname(dirname(file))));
}

const markers = [];
findMarkerFiles(process.cwd(), 0, markers);
if (markers.length === 0) {
  console.error(
    "Could not find HowItWorks.tsx under this folder. In the SAME terminal where you run npm run dev, cd to S4C-platform and run this again."
  );
  process.exit(1);
}

const roots = [...new Set(markers.map(appRootFromMarker))];
console.log("Updating app roots:");
for (const root of roots) console.log(" ", root);

async function pullFile(root, rel) {
  const url = `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${BRANCH}/${rel}`;
  let lastError = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const dest = join(root, rel);
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, Buffer.from(await response.arrayBuffer()));
      console.log("Pulled", dest);
      return true;
    } catch (err) {
      lastError = err;
      await new Promise((resolve) => setTimeout(resolve, attempt * 400));
    }
  }
  console.error(
    `Could not pull ${rel}.`,
    lastError instanceof Error ? lastError.message : lastError
  );
  return false;
}

let failed = 0;
for (const root of roots) {
  for (const rel of FILES) {
    const ok = await pullFile(root, rel);
    if (!ok) failed += 1;
  }
}

for (const root of roots) {
  const how = join(root, "app/components/home/HowItWorks.tsx");
  const lib = join(root, "app/lib/predict-for-planet.ts");
  const register = join(root, "app/sponsor/register/page.tsx");
  const nav = join(root, "app/dashboard/supporter/components/FanNav.tsx");
  const howText = existsSync(how) ? readFileSync(how, "utf8") : "";
  const libText = existsSync(lib) ? readFileSync(lib, "utf8") : "";
  const registerText = existsSync(register) ? readFileSync(register, "utf8") : "";
  const navText = existsSync(nav) ? readFileSync(nav, "utf8") : "";
  if (
    !howText.includes("s4p-predict-for-planet-v1") ||
    !howText.includes("PredictForPlanetPhone") ||
    howText.includes("Plan Your Travel")
  ) {
    failed += 1;
    console.error("Still old How S4P Works Step 4:", how);
  } else {
    console.log("Updated How S4P Works Step 4:", how);
  }
  if (
    !libText.includes("s4p-predict-for-planet-v1") ||
    !libText.includes("Handball offence") ||
    !libText.includes("VAR referee review") ||
    !libText.includes("pickSponsoredGameTimeMatch")
  ) {
    failed += 1;
    console.error("Still old Predict-For Planet model:", lib);
  } else {
    console.log("Updated Predict-For Planet model:", lib);
  }
  if (
    !registerText.includes("GAME_TIME_PRODUCT_LABEL") ||
    !registerText.includes('name="sponsor-product"')
  ) {
    failed += 1;
    console.error("Still old sponsor register:", register);
  } else {
    console.log("Updated sponsor register:", register);
  }
  if (!navText.includes('label: "P4P"')) {
    failed += 1;
    console.error("Still old fan nav:", nav);
  } else {
    console.log("Updated fan nav:", nav);
  }
}

if (failed) process.exit(1);
console.log(
  "OK: Predict-For Planet is How S4P Works Step 4. Do not re-run the listings overlay or Match-Sponsorship overlay after this. In the npm run dev terminal: Ctrl+C, then npm run dev, then Ctrl+F5. Open How S4P Works Step 4, or http://localhost:3000/preview/predict-for-planet"
);
