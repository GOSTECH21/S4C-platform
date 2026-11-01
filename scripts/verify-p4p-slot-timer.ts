import { readFileSync } from "fs";
import {
  P4P_PARTICIPATION_GBP,
  P4P_PREDICT_NEXT_LABEL,
  P4P_WINDOW_MINUTES,
  p4pAdvanceSlotBoard,
  p4pBankSlotIfComplete,
  p4pCyclingWindowClock,
  p4pEmptySlotBoard,
} from "../app/lib/predict-for-planet";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const phone = readFileSync("app/components/home/PredictForPlanet.tsx", "utf8");
const play = readFileSync("app/components/fan/PredictForPlanetPlay.tsx", "utf8");
const preview = readFileSync(
  "app/components/fan/P4pLiveChallengePreview.tsx",
  "utf8"
);

assert(
  P4P_PREDICT_NEXT_LABEL === "Predict what happens next?",
  "The heading is Predict what happens next?"
);

const midSlot = p4pCyclingWindowClock(
  new Date(15 * 60 * 1000 + 90 * 1000)
);
const nextSlot = p4pCyclingWindowClock(new Date(20 * 60 * 1000));
const wrapSlot = p4pCyclingWindowClock(new Date(90 * 60 * 1000));
assert(
  P4P_WINDOW_MINUTES === 5 &&
    midSlot.window.label === "15–20 min" &&
    midSlot.remainingSeconds === 210 &&
    nextSlot.window.label === "20–25 min" &&
    nextSlot.remainingSeconds === 300 &&
    wrapSlot.window.label === "0–5 min" &&
    wrapSlot.remainingSeconds === 300,
  "A 5-minute slot timer runs down, then resets on the next slot"
);

let board = p4pEmptySlotBoard(3);
board = p4pBankSlotIfComplete({
  ...board,
  picked: ["handball", "foul", "corner"],
});
assert(
  board.walletGbp === P4P_PARTICIPATION_GBP &&
    board.bankedWindowIndex === 3 &&
    board.picked.length === 3,
  "Completing 3 picks banks £0.10 into the running wallet"
);
board = p4pAdvanceSlotBoard(board, 4);
assert(
  board.windowIndex === 4 &&
    board.picked.length === 0 &&
    board.walletGbp === P4P_PARTICIPATION_GBP,
  "At 0:00 the previous slot picks wipe and the wallet total stays"
);
board = p4pBankSlotIfComplete({
  ...board,
  picked: ["yellow-card", "red-card", "penalty"],
});
assert(
  board.walletGbp === P4P_PARTICIPATION_GBP * 2 &&
    board.picked.length === 3,
  "The next slot adds another £0.10 on top of the previous winnings"
);

assert(
  phone.includes('data-p4p-slot-timer="p4p-slot-timer-v1"') &&
    phone.includes("p4pCyclingWindowClock") &&
    phone.includes("P4P_PREDICT_NEXT_LABEL") &&
    phone.includes("P4pClubCrest") &&
    phone.includes("fixtureSides(fixture)") &&
    phone.includes("data-p4p-window-label") &&
    phone.includes("h-12 w-12") &&
    phone.includes("text-[13px] font-black") &&
    phone.includes("font-black leading-4 text-black") &&
    phone.includes('data-p4p-participating="p4p-participating-v1"') &&
    phone.includes('data-p4p-slot-wipe="p4p-slot-wipe-v1"') &&
    phone.includes("p4pAdvanceSlotBoard") &&
    !phone.includes("Global Brands buy a 30-minute Game-Time slot") &&
    !phone.includes("What happens next?"),
  "The P4P phone has a slot timer, club logos, a larger sponsor block, and no Global Brands box"
);

assert(
  play.includes("P4P_PREDICT_NEXT_LABEL") &&
    play.includes('countdown?.state === "ended"') &&
    play.includes("countdown?.remainingSeconds === 0") &&
    play.includes("currentIndex + 1") &&
    play.includes("h-28 w-28") &&
    play.includes("text-base font-black") &&
    preview.includes("P4P_PREDICT_NEXT_LABEL") &&
    preview.includes("h-28 w-28") &&
    !play.includes("What happens next?") &&
    !preview.includes("What happens next?"),
  "Play and preview use Predict what happens next, auto-advance the slot, and promote the brand under the heading"
);

if (failures.length > 0) {
  console.error("verify-p4p-slot-timer failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-p4p-slot-timer: ok");
