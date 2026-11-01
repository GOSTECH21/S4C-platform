import { readFileSync } from "fs";
import {
  GAME_TIME_DURATION_MINUTES,
  P4P_DONATE_FUNDING_MESSAGE,
  P4P_PARTICIPATION_GBP,
  p4pAdvanceSlotBoard,
  p4pBankSlotIfComplete,
  p4pDonateProjectsPath,
  p4pEmptySlotBoard,
  p4pMatchIsFullTime,
} from "../app/lib/predict-for-planet";
import { SUPPORTER_PROJECTS_PATH } from "../app/lib/routes";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  P4P_DONATE_FUNDING_MESSAGE ===
    "Here are Climate Projects to donate your funding",
  "Full-time copy is Here are Climate Projects to donate your funding"
);

let board = p4pEmptySlotBoard(3);
board = p4pBankSlotIfComplete({
  ...board,
  picked: ["handball", "corner", "red-card"],
});
board = p4pAdvanceSlotBoard(board, 4);
board = p4pBankSlotIfComplete({
  ...board,
  picked: ["foul", "penalty", "var"],
});
assert(
  board.walletGbp === P4P_PARTICIPATION_GBP * 2 && board.fullTime === false,
  "Game-Time Wallet stacks across 5-minute slots for the whole 90 minutes"
);

assert(
  p4pAdvanceSlotBoard(
    { ...board, windowIndex: 3, bankedWindowIndex: 3 },
    0
  ).fullTime === false,
  "Jumping from a mid-match slot to an earlier clock index is not full time"
);

const fullTime = p4pAdvanceSlotBoard(
  { ...board, windowIndex: 17, bankedWindowIndex: 17 },
  0
);
assert(
  fullTime.fullTime === true &&
    fullTime.walletGbp === P4P_PARTICIPATION_GBP * 2 &&
    p4pAdvanceSlotBoard(fullTime, 1).walletGbp === P4P_PARTICIPATION_GBP * 2,
  "At 90 minutes the wallet stays held and the board goes full time"
);

const kickoff = new Date("2026-11-01T10:00:00Z");
assert(
  p4pMatchIsFullTime(
    kickoff,
    new Date(kickoff.getTime() + GAME_TIME_DURATION_MINUTES * 60 * 1000)
  ) &&
    !p4pMatchIsFullTime(
      kickoff,
      new Date(kickoff.getTime() + 45 * 60 * 1000)
    ),
  "Full time is 90 minutes after kickoff"
);

assert(
  p4pDonateProjectsPath(0.2).startsWith(`${SUPPORTER_PROJECTS_PATH}?`) &&
    p4pDonateProjectsPath(0.2).includes("p4pDonate=1") &&
    p4pDonateProjectsPath(0.2).includes("wallet=0.2"),
  "Full time defaults fans onto the Climate Projects list"
);

const phone = readFileSync("app/components/home/PredictForPlanet.tsx", "utf8");
const vote = readFileSync("app/dashboard/supporter/vote/page.tsx", "utf8");
const play = readFileSync(
  "app/components/fan/PredictForPlanetPlay.tsx",
  "utf8"
);
const predictPage = readFileSync(
  "app/supporter/dashboard/predict/page.tsx",
  "utf8"
);
const donatePreview = readFileSync(
  "app/preview/p4p-donate/page.tsx",
  "utf8"
);

assert(
  phone.includes('data-p4p-wallet-held="p4p-wallet-held-v1"') &&
    phone.includes('data-p4p-donate-funding="p4p-donate-funding-v1"') &&
    phone.includes("Here are Climate Projects to donate your funding") &&
    phone.includes("P4P_FALLBACK_PROJECTS") &&
    phone.includes("p4pDonateProjectsPath") &&
    phone.includes("donateOnFullTime") &&
    phone.includes("board.fullTime") &&
    vote.includes('data-p4p-donate-funding="p4p-donate-funding-v1"') &&
    vote.includes("Here are Climate Projects to donate your funding") &&
    vote.includes("P4P_FALLBACK_PROJECTS") &&
    play.includes("p4pMatchIsFullTime") &&
    play.includes("p4pDonateProjectsPath") &&
    play.includes("Here are Climate Projects to donate your funding") &&
    predictPage.includes("donateOnFullTime") &&
    predictPage.includes("showPhone={false}") &&
    donatePreview.includes("Here are Climate Projects to donate your funding") &&
    donatePreview.includes("forceFullTime") &&
    donatePreview.includes("initialWalletGbp={0.2}"),
  "P4P holds the wallet until full time, then shows the donate message and Climate Projects list"
);

if (failures.length > 0) {
  console.error("verify-p4p-wallet-full-time failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-p4p-wallet-full-time: ok");
