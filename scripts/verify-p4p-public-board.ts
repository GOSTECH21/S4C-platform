import { readFileSync } from "fs";
import {
  P4P_ELIGIBLE_PREDICTIONS_LABEL,
  P4P_FAN_WALLET_SHORT_COPY,
} from "../app/lib/predict-for-planet";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const play = readFileSync(
  "app/components/fan/PredictForPlanetPlay.tsx",
  "utf8"
);
const intro = readFileSync(
  "app/components/home/HowS4pPredictForPlanet.tsx",
  "utf8"
);
const fan = readFileSync("app/supporter/dashboard/predict/page.tsx", "utf8");

assert(
  P4P_ELIGIBLE_PREDICTIONS_LABEL ===
    "Total eligible predictions submitted" &&
    P4P_FAN_WALLET_SHORT_COPY ===
      "These amounts go to your chosen Climate Projects",
  "Public P4P copy for eligible predictions and the Fan Carbon Wallet is short and specific"
);

assert(
  intro.includes("PredictForPlanetPanel") &&
    fan.includes("HowS4pPredictForPlanet") &&
    fan.includes("PredictForPlanetPlay") &&
    fan.indexOf("HowS4pPredictForPlanet") < fan.indexOf("PredictForPlanetPlay"),
  "The P4P intro narrative stays above the live prediction board"
);

assert(
  play.includes("p4p-public-board-v1") &&
    play.includes("p4p-sponsored-game") &&
    play.includes("{liveFixture}") &&
    play.includes("P4P_MAKE_PREDICTION_LABEL") &&
    play.includes("Predict 3 events ·") &&
    play.indexOf('data-testid="p4p-sponsored-game"') <
      play.indexOf("{P4P_MAKE_PREDICTION_LABEL}") &&
    play.indexOf("{P4P_MAKE_PREDICTION_LABEL}") <
      play.indexOf("Predict 3 events ·") &&
    play.indexOf("Predict 3 events ·") <
      play.indexOf('data-testid="p4p-awarded-slot"') &&
    play.indexOf("Predict 3 events ·") <
      play.indexOf('data-testid="p4p-match-day-impact"'),
  "The sponsored game, Make your prediction, and the green predict tab come before awards and impact"
);

assert(
  play.includes("awardedThisSlot.length > 0") &&
    play.includes("Awarded in this 5-minute slot") &&
    !play.includes("If one of the 3 chosen events is awarded") &&
    !play.includes("awardEvent") &&
    !play.includes("awardP4pSlotEvent"),
  "Awards only list events that were awarded, with no helper copy and no award buttons"
);

assert(
  !play.includes("P4P_LIVE_CHALLENGE_LABEL") &&
    !play.includes("P4P_FANS_ENGAGEMENT_LABEL") &&
    !play.includes("Unique fans participating") &&
    !play.includes("Climate funding unlocked") &&
    !play.includes("Sponsor commitment") &&
    !play.includes("Here are Climate Projects to donate your funding") &&
    play.includes("P4P_ELIGIBLE_PREDICTIONS_LABEL"),
  "The live-challenge card is gone; eligible predictions move into Match Day Impact"
);

assert(
  play.indexOf('data-testid="p4p-match-day-impact"') <
    play.indexOf('data-testid="p4p-eligible-predictions"') &&
    play.indexOf('data-testid="p4p-eligible-predictions"') <
      play.indexOf("{P4P_FAN_WALLET_SHORT_COPY}") &&
    play.indexOf("{P4P_FAN_WALLET_SHORT_COPY}") <
      play.indexOf("{P4P_CHOOSE_PROJECT_LABEL}") &&
    play.indexOf("{P4P_CHOOSE_PROJECT_LABEL}") <
      play.indexOf('data-testid="p4p-fund-project"') &&
    play.includes("P4P_FUND_PROJECT_LABEL") &&
    play.lastIndexOf("Predict 3 events ·") <
      play.indexOf('data-testid="p4p-match-day-impact"'),
  "Match Day Impact is Game-Time Wallet, eligible predictions, Fan Carbon Wallet, the Climate Project list, then Fund your Project, with no green predict tab"
);

if (failures.length > 0) {
  console.error("verify-p4p-public-board failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-p4p-public-board: ok");
