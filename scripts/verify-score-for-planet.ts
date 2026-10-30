import { readFileSync } from "fs";
import {
  FAN_PARTICIPATION_POOL_RATE,
  SCORE_IMPACT_POOL_RATE,
  SCORE_IMPACT_TRANCHE_MAX_GBP,
  SCORE_IMPACT_TRANCHE_MIN_GBP,
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
assert(
  fanParticipationPoolGbp(10000) === 8000 && scoreImpactPoolGbp(10000) === 2000,
  "£10,000 splits into £8,000 fan pool and £2,000 score pool"
);
assert(
  scoreImpactTranches(2000).join("|") === "1000|1000",
  "A £2,000 Score Impact Pool unlocks in two £1,000 tranches"
);
assert(
  scoreImpactTranches(4000).every(
    (part) =>
      part >= SCORE_IMPACT_TRANCHE_MIN_GBP &&
      part <= SCORE_IMPACT_TRANCHE_MAX_GBP
  ) && scoreImpactTranches(4000).reduce((sum, part) => sum + part, 0) === 4000,
  "A £4,000 Score Impact Pool uses £1,000–£1,500 tranches that exhaust the pool"
);
assert(
  scoreImpactUnlockedGbp({ matchSponsorshipGbp: 10000, goalsScored: 0 }) === 0,
  "No score keeps the Score Impact Pool locked"
);
assert(
  scoreImpactUnlockedGbp({ matchSponsorshipGbp: 10000, goalsScored: 1 }) === 1000,
  "The first score unlocks the first tranche"
);
assert(
  scoreImpactUnlockedGbp({ matchSponsorshipGbp: 10000, goalsScored: 2 }) === 2000,
  "The second score exhausts a £2,000 Score Impact Pool"
);
assert(
  scoreImpactUnlockedGbp({ matchSponsorshipGbp: 10000, goalsScored: 5 }) === 2000,
  "Further scores do not unlock more than 20%"
);
assert(
  furtherScoresAddLiability(10000, 2) === false,
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
  }) === 10000,
  "A 0–0 still commits 100% under the post-match rule"
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
  remainingGbp({ ...lead, goalsScored: 1 }) === 9000,
  "First Arsenal Goal unlocks £1,000 of Score Impact Pool"
);
assert(
  remainingGbp({ ...lead, goalsScored: 3 }) === 10000,
  "Extra Goals after the pool is unlocked do not add cash"
);
assert(
  remainingGbp(settleLeadScoreImpactPool(lead)) === 10000,
  "Full-time settle adds locked Score Impact Pool to the pot"
);

const p4p = readFileSync("app/lib/predict-for-planet.ts", "utf8");
const climate = readFileSync("app/climate-sponsorship/page.tsx", "utf8");
assert(
  p4p.includes("seven Predict-For Planet events") &&
    climate.includes("Goal scored is exclusive to") &&
    climate.includes("Score Impact Pool") &&
    readFileSync("app/components/home/PredictForPlanet.tsx", "utf8").includes(
      "Seven {P4P_SHORT} prediction categories"
    ),
  "Copy moves Goal scored off P4P and onto S4P"
);
assert(
  readFileSync("app/services/sponsor-wallet.service.ts", "utf8").includes(
    "settleLeadWalletsForMatchFinish"
  ),
  "Full-time settle writes leftover Score Impact Pool into the Carbon Wallet"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "S4P: 80% Fan Participation Pool, 20% Score Impact Pool in £1,000–£1,500 tranches; P4P has 7 predictions."
);
