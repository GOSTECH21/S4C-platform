import { readFileSync } from "fs";
import {
  FAN_PARTICIPATION_POOL_RATE,
  SCORE_IMPACT_POOL_RATE,
  SCORE_IMPACT_TRANCHE_COUNT,
  S4P_CAMPAIGN_DAYS,
  fanParticipationPoolGbp,
  furtherScoresAddLiability,
  s4pSpendableGbp,
  scoreImpactPoolGbp,
  scoreImpactTranches,
  scoreImpactUnlockedGbp,
} from "../app/lib/score-for-planet";
import { P4P_CATEGORIES } from "../app/lib/predict-for-planet";
import {
  committedGbp,
  createLeadWallet,
  remainingGbp,
  settleLeadScoreImpactPool,
} from "../app/lib/sponsor-wallet";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(S4P_CAMPAIGN_DAYS === 5, "S4P Match-Sponsorship is a five-day campaign");
assert(FAN_PARTICIPATION_POOL_RATE === 0.8, "Fan Participation Pool is 80%");
assert(SCORE_IMPACT_POOL_RATE === 0.2, "Score Impact Pool is 20%");
assert(SCORE_IMPACT_TRANCHE_COUNT === 3, "Score Impact Pool unlocks in thirds");
assert(
  fanParticipationPoolGbp(10000) === 8000 && scoreImpactPoolGbp(10000) === 2000,
  "£10,000 splits into £8,000 fan pool and £2,000 score pool"
);
assert(
  scoreImpactTranches(2000).join("|") === "666.67|666.67|666.66",
  "A £2,000 Score Impact Pool unlocks in three equal thirds"
);
assert(
  scoreImpactTranches(800).reduce((sum, part) => sum + part, 0) === 800 &&
    scoreImpactTranches(800).length === 3,
  "A £800 Score Impact Pool is three thirds that exhaust the pool"
);
assert(
  scoreImpactUnlockedGbp({ matchSponsorshipGbp: 10000, goalsScored: 0 }) === 0,
  "No score keeps the Score Impact Pool locked"
);
assert(
  scoreImpactUnlockedGbp({ matchSponsorshipGbp: 10000, goalsScored: 1 }) ===
    666.67,
  "The first score unlocks the first third"
);
assert(
  scoreImpactUnlockedGbp({ matchSponsorshipGbp: 10000, goalsScored: 2 }) ===
    1333.34,
  "The second score unlocks two thirds"
);
assert(
  scoreImpactUnlockedGbp({ matchSponsorshipGbp: 10000, goalsScored: 3 }) === 2000,
  "The third score exhausts the 20% Score Impact Pool"
);
assert(
  scoreImpactUnlockedGbp({ matchSponsorshipGbp: 10000, goalsScored: 5 }) === 2000,
  "Further scores do not unlock more than 20%"
);
assert(
  furtherScoresAddLiability(10000, 3) === false,
  "Once the Score Impact Pool is unlocked, further scores add no liability"
);
assert(
  s4pSpendableGbp({ matchSponsorshipGbp: 10000, goalsScored: 0 }) === 8000,
  "Before kick-off fans can only use the Fan Participation Pool"
);
assert(
  s4pSpendableGbp({
    matchSponsorshipGbp: 10000,
    goalsScored: 0,
    matchFinished: true,
  }) === 8000,
  "A 0–0 does not unlock the Score Impact Pool"
);
assert(
  P4P_CATEGORIES.length === 7 &&
    !P4P_CATEGORIES.some((row) => row.label === "Goal scored"),
  "P4P has seven predictions and Goal scored is exclusive to S4P"
);

const lead = createLeadWallet({
  clubName: "Arsenal",
  brandName: "Puma",
  commitmentFeeGbp: 10000,
});
assert(remainingGbp(lead) === 8000, "Lead wallet opens with the 80% pool");
assert(
  committedGbp(lead) === 10000,
  "The committed Match-Sponsorship stays at 100% of £X"
);
assert(
  remainingGbp({ ...lead, goalsScored: 1 }) === 8666.67,
  "First Arsenal Goal unlocks one-third of the Score Impact Pool"
);
assert(
  remainingGbp({ ...lead, goalsScored: 3 }) === 10000,
  "Three Goals exhaust the Score Impact Pool"
);
assert(
  remainingGbp(settleLeadScoreImpactPool(lead)) === 8000,
  "A 0–0 settle does not add locked Score Impact Pool"
);

const p4p = readFileSync("app/lib/predict-for-planet.ts", "utf8");
const climate = readFileSync("app/climate-sponsorship/page.tsx", "utf8");
const credits = readFileSync("app/climate-credits/page.tsx", "utf8");
assert(
  p4p.includes("seven Predict-For Planet events") &&
    climate.includes("Goal scored is exclusive to") &&
    climate.includes("Score Impact Pool") &&
    climate.includes("Sponsorship Director") &&
    climate.includes("S4P_THIRD_UNLOCK_COPY") &&
    !climate.includes("via Stripe") &&
    !climate.includes("Sponsorship Manager logs in") &&
    readFileSync("app/components/home/PredictForPlanet.tsx", "utf8").includes(
      "Seven {P4P_SHORT} prediction categories"
    ),
  "Copy moves Goal scored off P4P and onto S4P thirds unlock"
);
assert(
  credits.includes(
    "Climate Credits are the Match-Sponsorship cash brands commit to a Match"
  ) &&
    credits.includes("Your Donation") &&
    credits.includes("Take £0.20 once from each") &&
    !credits.includes("via Stripe") &&
    !credits.includes("FUND-IT takes") &&
    credits.includes("S4P_THIRD_UNLOCK_COPY"),
  "Climate Credits intro, donation copy and thirds unlock are in place"
);
assert(
  readFileSync("app/lib/sports.ts", "utf8").includes("can also be a Game-Time") &&
    readFileSync("app/lib/sports.ts", "utf8").includes(
      "80% is the Fan Participation Pool for the Campaign"
    ),
  "Football uses also-be Game-Time and other sports name the 80% pool"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "S4P: 80% Fan Participation Pool, 20% Score Impact Pool in thirds; 0–0 unlocks nothing; P4P has 7 predictions."
);
