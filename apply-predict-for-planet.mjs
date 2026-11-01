import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { dirname, join } from "path";

const BRANCH = "cursor/fan-p4p-drop-overlay-18f9";
const BUST = "fan-p4p-drop-overlay-1";
const MARKERS = new Set(["HowItWorks.tsx"]);
const FILES = [
  "app/lib/predict-for-planet.ts",
  "app/lib/score-for-planet.ts",
  "app/lib/sponsor-wallet.ts",
  "app/lib/sponsorship-auction.ts",
  "app/lib/sports.ts",
  "app/lib/sponsored-goal.ts",
  "app/lib/fan-register-copy.ts",
  "app/services/sponsored-goal.service.ts",
  "app/services/sponsor-wallet.service.ts",
  "app/lib/match-day-carbon-offset.ts",
  "app/climate-sponsorship/page.tsx",
  "app/climate-credits/page.tsx",
  "app/sponsor/offers/OfferSignOff.tsx",
  "app/components/sponsor/ClimateSponsorshipWallet.tsx",
  "app/services/predict-for-planet.service.ts",
  "scripts/verify-score-for-planet.ts",
  "app/lib/how-s4p-works.ts",
  "app/components/home/HomeTopBanner.tsx",
  "app/components/home/PhoneFrame.tsx",
  "app/components/home/PredictForPlanet.tsx",
  "app/components/home/HowItWorks.tsx",
  "app/components/home/HowS4pSelectMatch.tsx",
  "app/components/home/HowS4pPredictForPlanet.tsx",
  "app/components/home/HowYoureSupporting.tsx",
  "app/components/home/SelectMatchFixtures.tsx",
  "app/components/fan/PredictForPlanetPlay.tsx",
  "app/components/fan/P4pLiveChallengePreview.tsx",
  "app/dashboard/supporter/components/FanNav.tsx",
  "app/dashboard/supporter/components/FanTabBar.tsx",
  "app/dashboard/supporter/predict/page.tsx",
  "app/dashboard/supporter/preferences/page.tsx",
  "app/dashboard/supporter/vote/page.tsx",
  "app/components/fan/FanMyTeamsPanel.tsx",
  "app/components/fan/FanCiftTable.tsx",
  "app/components/fan/FanCampaignWorkspace.tsx",
  "app/supporter/dashboard/page.tsx",
  "app/supporter/dashboard/cift/page.tsx",
  "app/supporter/dashboard/climate-sponsors/page.tsx",
  "app/lib/s4p-impact-tables.ts",
  "app/services/s4p-impact-tables.service.ts",
  "scripts/verify-fan-five-tabs.ts",
  "app/supporter/dashboard/predict/page.tsx",
  "app/preview/predict-for-planet/page.tsx",
  "app/preview/fan-p4p/page.tsx",
  "scripts/verify-fan-p4p-drop-overlay.ts",
  "app/sponsor/game-time/page.tsx",
  "app/sponsor/local/register/page.tsx",
  "app/sponsor/wallet/page.tsx",
  "app/components/sponsor/ClubMatchMenus.tsx",
  "app/components/sponsor/MatchDayLockIn.tsx",
  "app/club/dashboard/page.tsx",
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
  "scripts/verify-how-s4p-split.ts",
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
  const url = `https://raw.githubusercontent.com/GOSTECH21/S4C-platform/${BRANCH}/${rel}?v=${BUST}`;
  let lastError = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, { cache: "no-store" });
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
  const play = join(root, "app/components/fan/PredictForPlanetPlay.tsx");
  const phone = join(root, "app/components/home/PredictForPlanet.tsx");
  const gameTime = join(root, "app/sponsor/game-time/page.tsx");
  const preview = join(root, "app/components/fan/P4pLiveChallengePreview.tsx");
  const register = join(root, "app/sponsor/register/page.tsx");
  const nav = join(root, "app/dashboard/supporter/components/FanTabBar.tsx");
  const banner = join(root, "app/components/home/HomeTopBanner.tsx");
  const howText = existsSync(how) ? readFileSync(how, "utf8") : "";
  const bannerText = existsSync(banner) ? readFileSync(banner, "utf8") : "";
  const libText = existsSync(lib) ? readFileSync(lib, "utf8") : "";
  const playText = existsSync(play) ? readFileSync(play, "utf8") : "";
  const phoneText = existsSync(phone) ? readFileSync(phone, "utf8") : "";
  const gameTimeText = existsSync(gameTime) ? readFileSync(gameTime, "utf8") : "";
  const previewText = existsSync(preview) ? readFileSync(preview, "utf8") : "";
  const registerText = existsSync(register) ? readFileSync(register, "utf8") : "";
  const navText = existsSync(nav) ? readFileSync(nav, "utf8") : "";
  if (
    !howText.includes("how-s4p-split-steps-v1") ||
    !howText.includes("HOW_S4P_ACCESS_JOIN") ||
    !howText.includes("hidden md:block") ||
    !howText.includes("data-phone-frame") ||
    howText.includes("Explore the six steps below") ||
    howText.includes("PredictForPlanetPhone") ||
    howText.includes("Plan Your Travel")
  ) {
    failed += 1;
    console.error("Still old How S4P Works six-step carousel:", how);
  } else {
    console.log("Updated How S4P Works Access & Join:", how);
  }
  if (
    !bannerText.includes("offset its Match Day carbon emissions") ||
    !bannerText.includes("Global Brands & Businesses") ||
    bannerText.includes("We help elite sports clubs, their fans, sponsors and partners")
  ) {
    failed += 1;
    console.error("Still old homepage hero copy:", banner);
  } else {
    console.log("Updated homepage hero Match Day offset copy:", banner);
  }
  if (
    !libText.includes("s4p-predict-for-planet-v7") ||
    !libText.includes("Handball offence") ||
    !libText.includes("VAR referee review") ||
    !libText.includes("pickSponsoredGameTimeMatch") ||
    !libText.includes("Fans engagement with this challenge") ||
    !libText.includes("p4pPlayIntroCopy") ||
    !libText.includes("P4P_ACCURACY_GBP")
  ) {
    failed += 1;
    console.error("Still old Predict-For Planet model:", lib);
  } else {
    console.log("Updated Predict-For Planet model:", lib);
  }
  if (
    !playText.includes("s4p-predict-for-planet-v7") ||
    !playText.includes('data-testid="p4p-powered-by"') ||
    !playText.includes("P4P_PREDICT_NEXT_LABEL") ||
    !playText.includes("if (!hydrated || !sponsored)") ||
    !playText.includes("P4P_FANS_ENGAGEMENT_LABEL") ||
    !playText.includes("FAN_CARBON_WALLET_LABEL") ||
    !playText.includes("awardP4pSlotEvent") ||
    playText.includes("bg-[#10262c]") ||
    playText.includes("text-[#f4f1e6]")
  ) {
    failed += 1;
    console.error("Still old dark P4P live board:", play);
  } else {
    console.log("Ivory live board with Predict what happens next:", play);
  }
  if (
    !phoneText.includes("s4p-predict-for-planet-v7") ||
    !phoneText.includes("#fffdf8") ||
    phoneText.includes("#0b1f14") ||
    !phoneText.includes("earnedGbp") ||
    phoneText.includes("12.4") ||
    !phoneText.includes("P4P_POWERED_BY_LABEL") ||
    !phoneText.includes("PhoneFrame")
  ) {
    failed += 1;
    console.error("Still old dark How S4P Works P4P phone:", phone);
  } else {
    console.log("Ivory How S4P Works P4P phone with sponsor mark:", phone);
  }
  if (
    !gameTimeText.includes("P4pLiveChallengePreview") ||
    !previewText.includes("What fans see on Predict-For Planet") ||
    !previewText.includes('data-testid="p4p-powered-by"') ||
    !previewText.includes("P4P_FANS_ENGAGEMENT_LABEL") ||
    previewText.includes("bg-[#10262c]")
  ) {
    failed += 1;
    console.error("Still old Game-Time page without the ivory P4P preview:", gameTime);
  } else {
    console.log("Game-Time shows ivory live board and sponsor mark:", gameTime);
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
  "OK: Homepage hero now says we help your team offset Match Day carbon emissions with climate projects funded by Global Brands & Businesses. Desktop still shows the How S4P phone mockups; a handset does not. Do not re-run the listings overlay or Match-Sponsorship overlay after this. In the npm run dev terminal: Ctrl+C, then delete the .next folder, then npm run dev, then Ctrl+F5. Open http://localhost:3000/"
);
