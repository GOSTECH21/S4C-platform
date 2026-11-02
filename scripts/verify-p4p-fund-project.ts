import { readFileSync } from "fs";
import {
  FAN_CARBON_WALLET_LABEL,
  P4P_FUND_PROJECT_LABEL,
  awardP4pAccuracy,
  createGameTimeWallet,
  fanCarbonWalletFromPredictions,
  fundFanCarbonWalletToProject,
  p4pCreditsByProject,
  recordP4pEngagement,
} from "../app/lib/predict-for-planet";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  P4P_FUND_PROJECT_LABEL === "Fund your Project",
  "The Match Day Impact action is labelled Fund your Project"
);

const wallet = createGameTimeWallet({
  clubName: "Newcastle United",
  brandName: "American Express",
  fixtureName: "Newcastle United v Everton",
  slotIndex: 1,
  sponsorshipGbp: 2500,
});
const first = recordP4pEngagement({
  fanId: "fan-1",
  clubName: wallet.clubName,
  fixtureName: wallet.fixtureName,
  windowIndex: 6,
  categoryIds: ["handball", "foul", "corner"],
  projectName: "Wee Spoke Hub",
  wallet,
  predictions: [],
});
assert(first.ok === true, "A participation prediction banks into the Fan Carbon Wallet");
const accurate = awardP4pAccuracy({
  prediction: first.ok ? first.prediction : ({} as never),
  wallet: first.ok ? first.wallet : wallet,
  categoryId: "corner",
});
const predictions = [accurate.prediction];
assert(
  fanCarbonWalletFromPredictions(predictions, "fan-1").totalGbp === 0.4,
  "The Fan Carbon Wallet holds £0.40 before Fund your Project"
);

const empty = fundFanCarbonWalletToProject({
  fanId: "fan-1",
  clubName: wallet.clubName,
  fixtureName: wallet.fixtureName,
  projectName: "",
  predictions,
  allocations: [],
});
assert(
  empty.ok === false && String(empty.error ?? "").includes("Climate Project"),
  "Fund your Project needs a chosen Climate Project"
);

const funded = fundFanCarbonWalletToProject({
  fanId: "fan-1",
  clubName: wallet.clubName,
  fixtureName: wallet.fixtureName,
  projectName: "Edinburgh Building Retrofit Collective",
  predictions,
  allocations: [],
});
assert(
  funded.ok === true &&
    funded.allocation.amountGbp === 0.4 &&
    funded.allocation.projectName ===
      "Edinburgh Building Retrofit Collective" &&
    funded.remainingGbp === 0,
  "Fund your Project puts the Fan Carbon Wallet onto the chosen Climate Project"
);
assert(
  fanCarbonWalletFromPredictions(predictions, "fan-1", [
    funded.ok ? funded.allocation : ({} as never),
  ]).totalGbp === 0,
  "The Fan Carbon Wallet drops to £0.00 after Fund your Project"
);
assert(
  p4pCreditsByProject(predictions)[0]?.projectName === "Wee Spoke Hub",
  "Prediction credits keep the project named at submit"
);
const again = fundFanCarbonWalletToProject({
  fanId: "fan-1",
  clubName: wallet.clubName,
  fixtureName: wallet.fixtureName,
  projectName: "Edinburgh Building Retrofit Collective",
  predictions,
  allocations: [funded.ok ? funded.allocation : ({} as never)],
});
assert(
  again.ok === false &&
    String(again.error ?? "").includes(FAN_CARBON_WALLET_LABEL),
  "Fund your Project stays off when the Fan Carbon Wallet is empty"
);

const play = readFileSync(
  "app/components/fan/PredictForPlanetPlay.tsx",
  "utf8"
);
const lib = readFileSync("app/lib/predict-for-planet.ts", "utf8");
const service = readFileSync(
  "app/services/predict-for-planet.service.ts",
  "utf8"
);

assert(
  play.includes("p4p-fund-project-v1") &&
    play.includes("P4P_FUND_PROJECT_LABEL") &&
    play.includes('data-testid="p4p-fund-project"') &&
    play.includes("fundP4pProject") &&
    play.includes("listP4pProjectAllocations") &&
    play.indexOf("{P4P_CHOOSE_PROJECT_LABEL}") <
      play.indexOf('data-testid="p4p-fund-project"') &&
    play.indexOf('data-testid="p4p-fund-project"') >
      play.indexOf("{P4P_FAN_WALLET_SHORT_COPY}") &&
    lib.includes("p4p-fund-project-v1") &&
    lib.includes("fundFanCarbonWalletToProject") &&
    lib.includes('P4P_FUND_PROJECT_LABEL = "Fund your Project"') &&
    service.includes("p4p-fund-project-v1") &&
    service.includes("P4P_PROJECT_FUNDS_STORAGE") &&
    service.includes("fundP4pProject"),
  "Match Day Impact ends with Fund your Project after the Climate Project list"
);

if (failures.length > 0) {
  console.error("verify-p4p-fund-project failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-p4p-fund-project: ok");
