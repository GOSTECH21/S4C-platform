import { readFileSync } from "fs";
import {
  GAME_TIME_CARBON_WALLET_LABEL,
  GAME_TIME_DURATION_MINUTES,
  GAME_TIME_SLOT_COUNT,
  GAME_TIME_SLOT_MINUTES,
  MATCH_SPONSORSHIP_DAYS,
  P4P_CATEGORIES,
  P4P_ACCURACY_GBP,
  P4P_CORRECT_TOTAL_GBP,
  P4P_ENGAGEMENT_GBP,
  P4P_FANS_ENGAGEMENT_LABEL,
  P4P_PARTICIPATION_GBP,
  awardP4pAccuracy,
  fanCarbonWalletFromPredictions,
  p4pPlayIntroCopy,
  p4pPredictionAmounts,
  P4P_WINDOW_MINUTES,
  P4P_WINDOWS_PER_MATCH,
  alreadyPredictedWindow,
  createGameTimeWallet,
  firstFundedWindowIndex,
  liveGameTimeSlotIndex,
  liveWindowIndexForSlot,
  formatP4pGbp,
  gameTimePersistsUntil,
  gameTimeSlots,
  gameTimeWalletMatchesMatch,
  matchSponsorshipPersistsUntil,
  p4pCreditsByProject,
  p4pHowItWorksCaption,
  p4pWindows,
  pickSponsoredGameTimeMatch,
  recordP4pEngagement,
  remainingGameTimeGbp,
  gameTimeSponsorshipTopUp,
  windowsForGameTimeSlot,
  isWindowInGameTimeSlot,
  p4pLiveChallenge,
  p4pWindowCountdown,
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
import { sportingCalendarClubCount } from "../app/lib/calendar-clubs";

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
assert(P4P_ENGAGEMENT_GBP === 0.1, "Participating earns £0.10");
assert(P4P_PARTICIPATION_GBP === 0.1, "Participation is £0.10");
assert(P4P_ACCURACY_GBP === 0.3, "The right event earns another £0.30");
assert(P4P_CORRECT_TOTAL_GBP === 0.4, "A correct prediction totals £0.40");
assert(
  P4P_FANS_ENGAGEMENT_LABEL === "Fans engagement with this challenge",
  "Live board label is Fans engagement with this challenge"
);
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
assert(
  first.ok && p4pPredictionAmounts(first.prediction).participationGbp === 0.1,
  "The first take is £0.10 participation into the Fan Carbon Wallet"
);
const accurate = awardP4pAccuracy({
  prediction: first.ok ? first.prediction : ({} as never),
  wallet: first.ok ? first.wallet : wallet,
  categoryId: "corner",
});
assert(accurate.takenGbp === 0.3, "Awarding Corner pays the extra £0.30");
assert(
  p4pPredictionAmounts(accurate.prediction).totalGbp === 0.4,
  "A correct Corner prediction totals £0.40"
);
assert(
  remainingGameTimeGbp(accurate.wallet!) === 0.6,
  "£0.40 has left the Game-Time Carbon Wallet after a correct prediction"
);
assert(
  fanCarbonWalletFromPredictions([accurate.prediction], "fan-1").totalGbp === 0.4,
  "The Fan Carbon Wallet records the £0.40 for the chosen Climate Project"
);
const miss = awardP4pAccuracy({
  prediction: first.ok ? first.prediction : ({} as never),
  wallet: first.ok ? first.wallet : wallet,
  categoryId: "goal",
});
assert(miss.takenGbp === 0, "A Goal awarded does not pay a Corner prediction");
const twice = awardP4pAccuracy({
  prediction: accurate.prediction,
  wallet: accurate.wallet,
  categoryId: "corner",
});
assert(twice.takenGbp === 0, "Accuracy is paid only once");
assert(
  p4pPlayIntroCopy().includes("Participating earns you £0.10") &&
    p4pPlayIntroCopy().includes("Predicting the right event gives you £0.30"),
  "P4P intro copy states participation £0.10 and accuracy £0.30"
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
  lastPence.ok === false,
  "When the Game-Time Carbon Wallet is £0.00 the prediction is refused"
);

const missingWallet = recordP4pEngagement({
  fanId: "fan-3",
  clubName: "Hearts",
  fixtureName: "Hearts vs Chelsea",
  windowIndex: 0,
  categoryId: "corner",
  projectName: "Wee Spoke Hub",
  wallet: null,
  predictions: [],
});
assert(
  missingWallet.ok === false,
  "A prediction without a Game-Time Carbon Wallet is refused"
);

const heartsWallet = createGameTimeWallet({
  clubName: "Heart of Midlothian",
  brandName: "Diageo",
  fixtureName: "Heart of Midlothian v Rangers",
  slotIndex: 1,
  sponsorshipGbp: 10,
});
assert(
  gameTimeWalletMatchesMatch(
    heartsWallet,
    "Hearts",
    "Hearts vs Rangers"
  ),
  "Game-Time wallets match vs/v fixture spelling and Hearts aliases"
);
assert(
  pickSponsoredGameTimeMatch([heartsWallet], ["Hearts"])?.fixtureName ===
    "Heart of Midlothian v Rangers",
  "P4P uses the Match the Game-Time Sponsor put money on, not an invented fixture"
);
assert(
  pickSponsoredGameTimeMatch([], ["Hearts"]) === null,
  "P4P has no Match until a Game-Time Sponsor funds a Carbon Wallet"
);
const unpaidWallet = createGameTimeWallet({
  clubName: "Arsenal",
  brandName: "Budweiser Europe",
  fixtureName: "Liverpool v Arsenal",
  slotIndex: 1,
  sponsorshipGbp: 2500,
  paidAt: null,
});
assert(
  pickSponsoredGameTimeMatch([unpaidWallet], ["Arsenal"]) === null,
  "Fans cannot take £0.10 until Game-Time payment is confirmed"
);
assert(
  pickSponsoredGameTimeMatch(
    [
      unpaidWallet,
      createGameTimeWallet({
        clubName: "Arsenal",
        brandName: "Budweiser Europe",
        fixtureName: "Liverpool v Arsenal",
        slotIndex: 1,
        sponsorshipGbp: 2500,
      }),
    ],
    ["Hearts"]
  )?.fixtureName === "Liverpool v Arsenal",
  "P4P headline is the Match the Game-Time Sponsor paid for"
);
assert(
  gameTimeSponsorshipTopUp(2500).paidGbp === 2625 &&
    gameTimeSponsorshipTopUp(2500).platformFeeGbp === 125,
  "Game-Time Stripe charge is the wallet amount plus a 5% Platform Fee"
);
assert(
  sportingCalendarClubCount() > 3,
  "Game-Time Club list is every club on the platform, not the three-club demo"
);
assert(
  firstFundedWindowIndex([heartsWallet], "Hearts", "Hearts vs Rangers") === 6,
  "The first 5-minute slot sits inside the funded 30-minute Game-Time slot"
);
const liveKickoff = new Date().toISOString();
const slotWallets = [0, 1, 2].map((slotIndex) =>
  createGameTimeWallet({
    clubName: "Arsenal",
    brandName: "EA Sports",
    fixtureName: "Arsenal vs Chelsea",
    slotIndex,
    sponsorshipGbp: 2,
    kickoffAt: liveKickoff,
  })
);
assert(
  liveGameTimeSlotIndex(liveKickoff) === 0,
  "Just after kick-off the live Game-Time slot is 0–30"
);
assert(
  pickSponsoredGameTimeMatch(slotWallets)?.slotIndex === 0,
  "P4P stays on the live 0–30 slot instead of a later unused slot"
);
assert(
  firstFundedWindowIndex(slotWallets, "Arsenal", "Arsenal vs Chelsea") === 0,
  "The live 5-minute window at kick-off is 0–5 minutes"
);
const later = new Date(Date.now() - 62 * 60 * 1000).toISOString();
assert(
  liveGameTimeSlotIndex(later) === 2,
  "At minute 62 the live Game-Time slot is 60–90"
);
assert(
  liveWindowIndexForSlot(later, 2) === 12,
  "At minute 62 the live 5-minute window is 60–65"
);
assert(
  pickSponsoredGameTimeMatch(
    slotWallets.map((row) => ({ ...row, kickoffAt: later }))
  )?.slotIndex === 2,
  "During 60–90 P4P uses the live Game-Time slot even if earlier slots still have cash"
);
assert(
  windowsForGameTimeSlot(1)
    .map((row) => row.label)
    .join("|") === "30–35 min|35–40 min|40–45 min|45–50 min|50–55 min|55–60 min",
  "A 30–60 Game-Time slot only offers those six 5-minute windows"
);
assert(
  !windowsForGameTimeSlot(1).some((row) => row.label.startsWith("20–25")) &&
    !isWindowInGameTimeSlot(4, 1),
  "20–25 min is not selectable when the Game-Time Sponsor bought 30–60 minutes"
);
assert(isWindowInGameTimeSlot(6, 1), "35–40 min sits inside the 30–60 Game-Time slot");
const kickoff = new Date("2026-08-15T15:00:00.000Z");
const liveBoard = p4pLiveChallenge(heartsWallet, [
  {
    id: "a",
    fanId: "fan-a",
    clubName: heartsWallet.clubName,
    fixtureName: heartsWallet.fixtureName,
    windowIndex: 6,
    categoryId: "corner",
    projectName: "Wee Spoke Hub",
    engagementGbp: 0.1,
    walletId: heartsWallet.id,
    at: kickoff.toISOString(),
  },
  {
    id: "b",
    fanId: "fan-b",
    clubName: heartsWallet.clubName,
    fixtureName: heartsWallet.fixtureName,
    windowIndex: 7,
    categoryId: "goal",
    projectName: "Wee Spoke Hub",
    engagementGbp: 0.1,
    walletId: heartsWallet.id,
    at: kickoff.toISOString(),
  },
  {
    id: "c",
    fanId: "fan-a",
    clubName: heartsWallet.clubName,
    fixtureName: heartsWallet.fixtureName,
    windowIndex: 0,
    categoryId: "foul",
    projectName: "Wee Spoke Hub",
    engagementGbp: 0.1,
    walletId: heartsWallet.id,
    at: kickoff.toISOString(),
  },
]);
assert(
  liveBoard.uniqueFans === 2 &&
    liveBoard.eligiblePredictions === 2 &&
    liveBoard.sponsorCommitmentGbp === 10 &&
    liveBoard.engagementTarget === 100,
  "Live challenge counts unique fans and eligible predictions in the funded 30-minute slot"
);
const liveClock = p4pWindowCountdown(
  kickoff,
  p4pWindows()[6],
  new Date("2026-08-15T15:32:00.000Z")
);
assert(
  liveClock.state === "live" && liveClock.label.includes("left"),
  "The 5-minute slot countdown shows time left while that window is live"
);
const endedClock = p4pWindowCountdown(
  kickoff,
  p4pWindows()[4],
  new Date("2026-08-15T15:32:00.000Z")
);
assert(
  endedClock.state === "ended",
  "A 20–25 minute window has ended once the Game is in the 30–60 slot"
);

const takeFromSponsor = recordP4pEngagement({
  fanId: "fan-hearts",
  clubName: heartsWallet.clubName,
  fixtureName: heartsWallet.fixtureName,
  windowIndex: 6,
  categoryId: "corner",
  projectName: "Wee Spoke Hub",
  wallet: heartsWallet,
  predictions: [],
});
assert(
  takeFromSponsor.ok &&
    takeFromSponsor.takenGbp === 0.1 &&
    remainingGameTimeGbp(takeFromSponsor.wallet!) === 9.9,
  "Predict · £0.10 takes that amount from the Game-Time Sponsor's Carbon Wallet"
);

const credits = p4pCreditsByProject(first.ok ? [first.prediction] : []);
assert(
  credits[0]?.projectName === "Local Global Schools Solar" &&
    credits[0]?.amountGbp === 0.1,
  "Taken cash is grouped onto the chosen Climate Project"
);

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
const fanNav =
  readFileSync("app/dashboard/supporter/components/FanNav.tsx", "utf8") +
  readFileSync(
    "app/dashboard/supporter/components/FanTabBar.tsx",
    "utf8"
  );
const sponsorNav = readFileSync("app/sponsor/sponsor-nav.tsx", "utf8");
const climatePage = readFileSync("app/climate-sponsorship/page.tsx", "utf8");
const listingsUi = readFileSync(
  "app/components/club/ClubSponsorsListings.tsx",
  "utf8"
);

assert(
  !howItWorks.includes("PredictForPlanetPhone") &&
    !howItWorks.includes("PredictForPlanetPanel") &&
    !howItWorks.includes("Plan Your Travel") &&
    !howItWorks.includes("Estimate your return distance") &&
    howItWorks.includes("HOW_S4P_ACCESS_JOIN") &&
    !howItWorks.includes("Explore the six steps below."),
  "How S4P Works homepage is Access & Join only; Predict-For Planet stays on the fan play page"
);
assert(
  phone.includes("P4P_CATEGORIES") &&
    phone.includes("Game-Time Wallet") &&
    phone.includes("1 prediction this slot") &&
    phone.includes("#fffdf8") &&
    phone.includes("P4P_POWERED_BY_LABEL") &&
    !phone.includes("#0b1f14"),
  "The Step 04 phone overlay is ivory with a sponsor mark beside What happens next"
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
    play.includes("Predict ·") &&
    play.includes("pickSponsoredGameTimeMatch") &&
    play.includes("No Game-Time Sponsor has funded a Match yet") &&
    play.includes("P4P_POWERED_BY_LABEL") &&
    play.includes("P4P_LIVE_CHALLENGE_LABEL") &&
    play.includes("P4P_TAGLINE") &&
    play.includes("P4P_MATCH_DAY_IMPACT_LABEL") &&
    play.includes("windowsForGameTimeSlot") &&
    play.includes("alreadyPredictedWindow") &&
    play.includes("p4p-slot-countdown") &&
    play.includes("BrandMark") &&
    play.includes("hydrated") &&
    play.includes('data-testid="p4p-powered-by"') &&
    play.includes("What happens next?") &&
    play.includes("s4p-predict-for-planet-v4") &&
    play.includes("p4pPlayIntroCopy") &&
    play.includes("P4P_FANS_ENGAGEMENT_LABEL") &&
    play.includes("awardP4pSlotEvent") &&
    play.includes("FAN_CARBON_WALLET_LABEL") &&
    !play.includes("bg-[#10262c]") &&
    !play.includes("text-[#f4f1e6]"),
  "Fans submit one P4P prediction into a chosen Climate Project on the sponsored Match"
);
const fanPredictPage = readFileSync(
  "app/supporter/dashboard/predict/page.tsx",
  "utf8"
);
assert(
  fanPredictPage.includes("preferredClubNames") &&
    fanPredictPage.includes("HowS4pPredictForPlanet") &&
    fanPredictPage.includes("PredictForPlanetPlay") &&
    !fanPredictPage.includes("vs Chelsea"),
  "Fan P4P shows Image P4P and the live board, and does not invent a vs Chelsea Match"
);
const gameTimePage = readFileSync("app/sponsor/game-time/page.tsx", "utf8");
assert(
    gameTimePage.includes("Select the Match you are buying Game-Time for.") &&
    !gameTimePage.includes("vs Chelsea") &&
    gameTimePage.includes("allPlatformClubs") &&
    gameTimePage.includes("Continue to payment") &&
    gameTimePage.includes("StripeCardPayment") &&
    gameTimePage.includes("confirmGameTimeCardPayment") &&
    gameTimePage.includes("resolveGameTimeSponsorBrand") &&
    gameTimePage.includes("P4pLiveChallengePreview"),
  "Game-Time lists every platform club, continues to Stripe payment, and shows the ivory P4P preview"
);
const gameTimePreview = readFileSync(
  "app/components/fan/P4pLiveChallengePreview.tsx",
  "utf8"
);
assert(
  gameTimePreview.includes("What fans see on Predict-For Planet") &&
    gameTimePreview.includes("What happens next?") &&
    gameTimePreview.includes('data-testid="p4p-powered-by"') &&
    gameTimePreview.includes("P4P_LIVE_CHALLENGE_LABEL") &&
    gameTimePreview.includes("P4P_FANS_ENGAGEMENT_LABEL") &&
    !gameTimePreview.includes("bg-[#10262c]"),
  "Game-Time P4P preview is ivory with the sponsor mark beside What happens next"
);
assert(
  gameTimePage.includes("PAY_WITH_CARD_LABEL") &&
    gameTimePage.includes("Fans can take £0.10 only after"),
  "Game-Time payment is the wallet amount plus the 5% Platform Fee via Stripe"
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
const applyP4pPs1 = readFileSync("apply-predict-for-planet.ps1", "utf8");
assert(
  applyP4p.includes('BRANCH = "cursor/fan-p4p-image-18f9"') &&
    applyP4p.includes("app/components/home/PredictForPlanet.tsx") &&
    applyP4p.includes("HowS4pPredictForPlanet") &&
    applyP4p.includes("Do not re-run the listings overlay") &&
    applyP4p.includes("pickSponsoredGameTimeMatch") &&
    applyP4p.includes("app/sponsor/game-time/page.tsx") &&
    applyP4p.includes("s4p-predict-for-planet-v4") &&
    applyP4p.includes("fan-p4p-image-1") &&
    applyP4p.includes("P4pLiveChallengePreview") &&
    applyP4p.includes("Fans engagement with this challenge") &&
    applyP4p.includes("p4pPlayIntroCopy") &&
    applyP4p.includes("FAN_CARBON_WALLET_LABEL") &&
    applyP4p.includes("Still old dark P4P live board") &&
    applyP4p.includes("/supporter/dashboard/predict") &&
    applyP4p.includes("HOW_S4P_ACCESS_JOIN") &&
    applyP4p.includes("HowS4pSelectMatch") &&
    applyP4p.includes("FanCiftTable") &&
    applyP4pPs1.includes("ClubMatchMenus") &&
    applyP4pPs1.includes("calendar-clubs") &&
    applyP4pPs1.includes("s4p-predict-for-planet-v4") &&
    applyP4pPs1.includes("fan-p4p-image-1") &&
    applyP4pPs1.includes("P4pLiveChallengePreview"),
  "PC overlay pulls Predict-For Planet last, with How S4P Works split, and does not re-run listings"
);
assert(
  listingsUi.includes("isMatchSponsorListing") &&
    readFileSync("app/supporter/dashboard/predict/page.tsx", "utf8").includes(
      "PredictForPlanetPlay"
    ) &&
    readFileSync("app/sponsor/game-time/page.tsx", "utf8").includes(
      "saveGameTimeCheckout"
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
  "Predict-For Planet: eight events, 30-minute Game-Time slots, £0.10 participation plus £0.30 for the right event."
);
