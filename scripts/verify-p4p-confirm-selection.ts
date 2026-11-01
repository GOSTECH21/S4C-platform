import { readFileSync } from "fs";
import {
  P4P_PARTICIPATION_GBP,
  p4pBankSlotIfComplete,
  p4pEmptySlotBoard,
} from "../app/lib/predict-for-planet";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const phone = readFileSync("app/components/home/PredictForPlanet.tsx", "utf8");
const select = readFileSync(
  "app/components/home/HowS4pSelectMatch.tsx",
  "utf8"
);

let pending = p4pEmptySlotBoard(3);
pending = {
  ...pending,
  picked: ["handball", "corner", "red-card"],
};
assert(
  pending.walletGbp === 0 && pending.bankedWindowIndex === null,
  "Choosing 3 events stays pending until Confirm"
);
const honoured = p4pBankSlotIfComplete(pending);
assert(
  honoured.walletGbp === P4P_PARTICIPATION_GBP &&
    honoured.bankedWindowIndex === 3,
  "Confirm your Selection banks the £0.10 participation"
);

assert(
  phone.includes('data-p4p-confirm-selection="p4p-confirm-selection-v1"') &&
    phone.includes("Confirm your Selection") &&
    phone.includes("confirmPicks") &&
    phone.includes("p4pBankSlotIfComplete(current)") &&
    !phone.includes("return p4pBankSlotIfComplete({ ...current, picked: pickedNext })") &&
    phone.includes("alreadyBanked || (full && !selected)"),
  "Confirm your Selection sits at the bottom of the P4P board and is the only way picks are honoured"
);

assert(
  !select.includes("Confirm your Selection") &&
    !select.includes("data-confirm-club-selection") &&
    !select.includes("ConfirmClubSelection"),
  "Confirm your Selection is removed from Select Match"
);

if (failures.length > 0) {
  console.error("verify-p4p-confirm-selection failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-p4p-confirm-selection: ok");
