import { readFileSync } from "fs";
import {
  P4P_PARTICIPATION_GBP,
  p4pAdvanceSlotBoard,
  p4pBankSlotIfComplete,
  p4pEmptySlotBoard,
} from "../app/lib/predict-for-planet";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const phone = readFileSync("app/components/home/PredictForPlanet.tsx", "utf8");
const play = readFileSync("app/components/fan/PredictForPlanetPlay.tsx", "utf8");

let board = p4pEmptySlotBoard(2);
board = p4pBankSlotIfComplete({
  ...board,
  picked: ["handball", "corner", "red-card"],
});
const afterWipe = p4pAdvanceSlotBoard(board, 3);
assert(
  board.walletGbp === P4P_PARTICIPATION_GBP &&
    afterWipe.picked.length === 0 &&
    afterWipe.walletGbp === P4P_PARTICIPATION_GBP,
  "Timer 0:00 wipes the previous 3 picks and keeps the £0.10 already won"
);
const secondSlot = p4pBankSlotIfComplete({
  ...afterWipe,
  picked: ["foul", "penalty", "var"],
});
assert(
  secondSlot.walletGbp === P4P_PARTICIPATION_GBP * 2,
  "The next slot adds participation on top of the running wallet"
);

assert(
  phone.includes('data-p4p-slot-wipe="p4p-slot-wipe-v1"') &&
    phone.includes("p4pAdvanceSlotBoard") &&
    phone.includes("p4pBankSlotIfComplete") &&
    phone.includes("board.walletGbp") &&
    play.includes("countdown?.remainingSeconds === 0") &&
    play.includes("fanCarbonWalletFromPredictions"),
  "The live board wipes picks at the end of a 5-minute slot and keeps cumulative winnings"
);

if (failures.length > 0) {
  console.error("verify-p4p-slot-wipe failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-p4p-slot-wipe: ok");
