import { readFileSync } from "fs";
import {
  GAME_TIME_CARBON_WALLET_LABEL,
  GAME_TIME_DURATION_MINUTES,
  GAME_TIME_SLOT_COUNT,
  GAME_TIME_SLOT_MINUTES,
  MATCH_SPONSORSHIP_DAYS,
  P4P_CATEGORIES,
  P4P_ENGAGEMENT_GBP,
  P4P_WINDOW_MINUTES,
  P4P_WINDOWS_PER_MATCH,
  alreadyPredictedWindow,
  createGameTimeWallet,
  formatP4pGbp,
  gameTimePersistsUntil,
  gameTimeSlots,
  matchSponsorshipPersistsUntil,
  p4pCreditsByProject,
  p4pHowItWorksCaption,
  p4pWindows,
  recordP4pEngagement,
  remainingGameTimeGbp,
} from "../app/lib/predict-for-planet";
import {
  GAME_TIME_SPONSORSHIP_RANGE_LABEL,
  isGameTimeSponsorListing,
  isMatchSponsorListing,
} from "../app/lib/sponsor-listings";
import {
  SPONSOR_GAME_TIME_PATH,
  SUPPORTER_PREDICT_PATH,
} from "../app/lib/routes";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(P4P_CATEGORIES.length === 8, "Predict-For Planet has eight event categories");
assert(
  P4P_CATEGORIES.map((row) => row.label).join("|") ===
    [
      "Handball offence",
      "Foul committed",
      "Corner awarded",
      "Goal scored",
      "Yellow card issued",
      "Red card issued",
      "Penalty awarded",
      "VAR referee review",
    ].join("|"),
  "The eight P4P events match the in-game list"
);
assert(GAME_TIME_SLOT_MINUTES === 30, "Each Game-Time slot is 30 minutes");
assert(GAME_TIME_DURATION_MINUTES === 90, "A Game lasts 90 minutes");
assert(GAME_TIME_SLOT_COUNT === 3, "There are three 30-minute Game-Time slots");
assert(P4P_WINDOW_MINUTES === 5, "Fans predict in 5-minute slots");
assert(P4P_WINDOWS_PER_MATCH === 18, "A 90-minute Game has eighteen 5-minute slots");
assert(P4P_ENGAGEMENT_GBP === 0.1, "Every prediction is a £0.10 Engagement");
assert(MATCH_SPONSORSHIP_DAYS === 5, "Match-Sponsorship persists 5 days");
assert(
  gameTimeSlots()
    .map((slot) => slot.label)
    .join("|") === "0–30 minutes|30–60 minutes|60–90 minutes",
  "Game-Time slots are 0–30, 30–60 and 60–90 minutes"
);

const wallet = createGameTimeWallet({
  clubName: "Arsenal",
  brandName: "EA Sports",
  fixtureName: "Arsenal vs Chelsea",
  slotIndex: 0,
  sponsorshipGbp: 1,
});
assert(remainingGameTimeGbp(wallet) === 1, "A £1 Game-Time wallet starts at £1");

const first = recordP4pEngagement({
  fanId: "fan-1",
  clubName: "Arsenal",
  fixtureName: "Arsenal vs Chelsea",
  windowIndex: 0,
  categoryId: "corner",
  projectName: "Local Global Schools Solar",
  wallet,
  predictions: [],
});
assert(first.ok === true, "The first prediction in a 5-minute slot is an Engagement");
assert(first.ok && first.takenGbp === 0.1, "The Engagement takes £0.10");
assert(
  first.ok && remainingGameTimeGbp(first.wallet!) === 0.9,
  "£0.10 leaves the Game-Time Carbon Wallet"
);
assert(
  first.ok && first.prediction.projectName === "Local Global Schools Solar",
  "The Engagement names the fan's chosen Climate Project"
);

const second = recordP4pEngagement({
  fanId: "fan-1",
  clubName: "Arsenal",
  fixtureName: "Arsenal vs Chelsea",
  windowIndex: 0,
  categoryId: "goal",
  projectName: "Local Global Schools Solar",
  wallet: first.ok ? first.wallet : wallet,
  predictions: first.ok ? [first.prediction] : [],
});
assert(second.ok === false, "A fan may make only 1 Prediction in each 5-minute slot");
assert(
  alreadyPredictedWindow(
    first.ok ? [first.prediction] : [],
    "fan-1",
    "Arsenal vs Chelsea",
    0
  ),
  "The 1-prediction rule is keyed by fan, fixture and 5-minute slot"
);

const otherSlot = recordP4pEngagement({
  fanId: "fan-1",
  clubName: "Arsenal",
  fixtureName: "Arsenal vs Chelsea",
  windowIndex: 7,
  categoryId: "foul",
  projectName: "Wee Spoke Hub",
  wallet: first.ok ? first.wallet : wallet,
  predictions: first.ok ? [first.prediction] : [],
});
assert(
  otherSlot.ok === false,
  "A 0–30 Game-Time wallet cannot pay for a 30–60 prediction"
);

const empty = createGameTimeWallet({
  clubName: "Arsenal",
  brandName: "EA Sports",
  fixtureName: "Arsenal vs Chelsea",
  slotIndex: 0,
  sponsorshipGbp: 0.05,
});
empty.allocatedGbp = 0.05;
const lastPence = recordP4pEngagement({
  fanId: "fan-2",
  clubName: "Arsenal",
  fixtureName: "Arsenal vs Chelsea",
  windowIndex: 1,
  categoryId: "var",
  projectName: "Porty Community Energy",
  wallet: empty,
  predictions: [],
});
assert(
  lastPence.ok && lastPence.takenGbp === 0,
  "When the Game-Time Carbon Wallet is £0.00 the prediction still records and takes nothing"
);

const credits = p4pCreditsByProject(first.ok ? [first.prediction] : []);
assert(
  credits[0]?.projectName === "Local Global Schools Solar" &&
    credits[0]?.amountGbp === 0.1,
  "Taken cash is grouped onto the chosen Climate Project"
);

const kickoff = new Date("2026-08-15T15:00:00.000Z");
assert(
  gameTimePersistsUntil(kickoff).getTime() - kickoff.getTime() ===
    GAME_TIME_DURATION_MINUTES * 60 * 1000,
  "Game-Time Sponsorship persists 90 minutes"
);
assert(
  matchSponsorshipPersistsUntil(kickoff).getTime() - kickoff.getTime() ===
    MATCH_SPONSORSHIP_DAYS * 24 * 60 * 60 * 1000,
  "Match-Sponsorship persists 5 days"
);

assert(
  p4pHowItWorksCaption().includes(GAME_TIME_CARBON_WALLET_LABEL) &&
    p4pHowItWorksCaption().includes(formatP4pGbp(P4P_ENGAGEMENT_GBP)),
  "How S4P Works Step 04 explains the £0.10 Game-Time Carbon Wallet take"
);
assert(
  p4pWindows()[3]?.label === "15–20 min" && p4pWindows()[3]?.slotIndex === 0,
  "Minute 15 sits in the first 30-minute Game-Time slot"
);

assert(
  isMatchSponsorListing({
    id: "g1",
    kind: "global",
    brandName: "Puma",
    contactName: "Pat",
    email: "pat@puma.test",
    createdAt: kickoff.toISOString(),
  }) &&
    isGameTimeSponsorListing({
      id: "g2",
      kind: "global",
      brandName: "EA Sports",
      contactName: "Alex",
      email: "alex@ea.test",
      product: "game-time",
      createdAt: kickoff.toISOString(),
    }),
  "Unset product stays Match-Sponsor; product game-time is Game-Time only"
);

const howItWorks = readFileSync("app/components/home/HowItWorks.tsx", "utf8");
const phone = readFileSync("app/components/home/PredictForPlanet.tsx", "utf8");
const register = readFileSync("app/sponsor/register/page.tsx", "utf8");
const play = readFileSync("app/components/fan/PredictForPlanetPlay.tsx", "utf8");
const fanNav = readFileSync("app/dashboard/supporter/components/FanNav.tsx", "utf8");
const sponsorNav = readFileSync("app/sponsor/sponsor-nav.tsx", "utf8");
const climatePage = readFileSync("app/climate-sponsorship/page.tsx", "utf8");
const listingsUi = readFileSync(
  "app/components/club/ClubSponsorsListings.tsx",
  "utf8"
);

assert(
  howItWorks.includes('title: "Predict-For Planet"') &&
    howItWorks.includes("PredictForPlanetPhone") &&
    howItWorks.includes("PredictForPlanetPanel") &&
    !howItWorks.includes("Plan Your Travel") &&
    !howItWorks.includes("Estimate your return distance"),
  "How S4P Works Step 04 is Predict-For Planet, not Plan Your Travel"
);
assert(
  phone.includes("P4P_CATEGORIES") &&
    phone.includes("Game-Time Wallet") &&
    phone.includes("1 prediction this slot"),
  "The Step 04 phone overlay lists the eight P4P events"
);
assert(
  register.includes("GAME_TIME_PRODUCT_LABEL") &&
    register.includes('name="sponsor-product"') &&
    register.includes("SPONSOR_GAME_TIME_PATH") &&
    register.includes("product,") &&
    register.includes(GAME_TIME_SPONSORSHIP_RANGE_LABEL) === false &&
    register.includes("GAME_TIME_SPONSORSHIP_RANGE_LABEL"),
  "Global Brand register chooses Match-Sponsor or Game-Time Sponsor"
);
assert(
  play.includes("submitP4pPrediction") &&
    play.includes("Climate Project") &&
    play.includes("Predict ·"),
  "Fans submit one P4P prediction into a chosen Climate Project"
);
assert(
  fanNav.includes("SUPPORTER_PREDICT_PATH") &&
    fanNav.includes('label: "P4P"') &&
    SUPPORTER_PREDICT_PATH === "/supporter/dashboard/predict",
  "Fan nav has a P4P tab"
);
assert(
  sponsorNav.includes("SPONSOR_GAME_TIME_PATH") &&
    sponsorNav.includes("Game-Time") &&
    SPONSOR_GAME_TIME_PATH === "/sponsor/game-time",
  "Global Brand nav has a Game-Time tab"
);
assert(
  climatePage.includes("How Game-Time Sponsorship works") &&
    climatePage.includes("Game-Time Carbon Wallet"),
  "Climate Sponsorship explains Game-Time as the P4P engagement product"
);
const applyP4p = readFileSync("apply-predict-for-planet.mjs", "utf8");
assert(
  applyP4p.includes('BRANCH = "cursor/predict-for-planet-18f9"') &&
    applyP4p.includes("PredictForPlanetPhone") &&
    applyP4p.includes("Do not re-run the listings overlay"),
  "PC overlay pulls Predict-For Planet last and does not re-run listings"
);
assert(
  listingsUi.includes("isMatchSponsorListing") &&
    readFileSync("app/supporter/dashboard/predict/page.tsx", "utf8").includes(
      "PredictForPlanetPlay"
    ) &&
    readFileSync("app/sponsor/game-time/page.tsx", "utf8").includes(
      "depositGameTimeSponsorship"
    ) &&
    readFileSync("app/preview/predict-for-planet/page.tsx", "utf8").includes(
      "seedWallet"
    ),
  "Game-Time deposit, fan P4P and the preview are wired; clubs invite Match-Sponsors only"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Predict-For Planet: eight events, 30-minute Game-Time slots, £0.10 Engagements until the wallet is £0.00."
);
