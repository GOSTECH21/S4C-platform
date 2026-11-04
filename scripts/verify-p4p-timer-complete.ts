import { readFileSync } from "fs";
import {
  P4P_AWAITING_NEW_SPONSORED_LABEL,
  P4P_SLOT_COMPLETE_LABEL,
  P4P_WINDOW_TIMER_LABEL,
  P4P_WINDOWS_PER_SLOT,
  alreadyPredictedWindow,
  createGameTimeWallet,
  formatP4pClock,
  gameTimeSlotIsComplete,
  gameTimeSlotPredictionsPlayed,
  gameTimeSlotWindowsEnded,
  p4pCalendarDayKey,
  p4pIsAfterMatchDay,
  p4pWindowCountdown,
  pickSponsoredGameTimeMatch,
  windowsForGameTimeSlot,
  type P4pPrediction,
} from "../app/lib/predict-for-planet";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const matchDay = new Date(2026, 10, 7, 15, 0, 0);
const nextDay = new Date(2026, 10, 8, 9, 15, 0);
const sameEvening = new Date(2026, 10, 7, 22, 40, 0);

assert(
  p4pCalendarDayKey(matchDay) === "2026-11-07" &&
    p4pCalendarDayKey(nextDay) === "2026-11-08",
  "Match Day and the next login are compared as calendar dates"
);
assert(
  !p4pIsAfterMatchDay(matchDay, sameEvening) &&
    p4pIsAfterMatchDay(matchDay, nextDay),
  "A 7 November Match Day is still live that evening and awaiting on 8 November"
);
assert(
  P4P_AWAITING_NEW_SPONSORED_LABEL === "Awaiting New Sponsored P4P" &&
    P4P_SLOT_COMPLETE_LABEL === "COMPLETE" &&
    P4P_WINDOW_TIMER_LABEL === "5-minute timer",
  "P4P uses Awaiting New Sponsored P4P, COMPLETE, and 5-minute timer copy"
);

const slot0Live = new Date(matchDay.getTime() + 12 * 60 * 1000);
const slot0Done = new Date(matchDay.getTime() + 30 * 60 * 1000);
const slot1Live = new Date(matchDay.getTime() + 42 * 60 * 1000);
assert(
  !gameTimeSlotWindowsEnded(matchDay, 0, slot0Live) &&
    gameTimeSlotWindowsEnded(matchDay, 0, slot0Done) &&
    !gameTimeSlotWindowsEnded(matchDay, 1, slot0Done) &&
    gameTimeSlotWindowsEnded(matchDay, 1, new Date(matchDay.getTime() + 60 * 60 * 1000)),
  "A 30-minute Game-Time slot is complete only after all six 5-minute windows have ended"
);
assert(
  gameTimeSlotIsComplete({
    kickoffAt: matchDay,
    slotIndex: 0,
    now: slot0Done,
  }) &&
    !gameTimeSlotIsComplete({
      kickoffAt: matchDay,
      slotIndex: 1,
      now: slot0Done,
    }),
  "COMPLETE follows the 30-minute slot, not a later unused slot"
);

const liveWindow = windowsForGameTimeSlot(1)[2];
const liveClock = p4pWindowCountdown(matchDay, liveWindow, slot1Live);
assert(
  liveClock.state === "live" &&
    liveClock.remainingSeconds === 180 &&
    formatP4pClock(liveClock.remainingSeconds) === "3:00",
  "The 5-minute timer counts down inside the selected interval"
);

const fanPredictions: P4pPrediction[] = windowsForGameTimeSlot(1).map(
  (row, index) => ({
    id: `pred-${index}`,
    fanId: "fan-1",
    clubName: "Newcastle United",
    fixtureName: "Newcastle United v Everton",
    windowIndex: row.index,
    categoryId: "corner",
    categoryIds: ["corner", "foul", "handball"],
    projectName: "Wee Spoke Hub",
    engagementGbp: 0.1,
    walletId: "wallet",
    at: matchDay.toISOString(),
  })
);
assert(
  P4P_WINDOWS_PER_SLOT === 6 &&
    gameTimeSlotPredictionsPlayed(
      fanPredictions,
      "fan-1",
      "Newcastle United v Everton",
      1
    ) &&
    !gameTimeSlotPredictionsPlayed(
      fanPredictions.slice(0, 5),
      "fan-1",
      "Newcastle United v Everton",
      1
    ) &&
    alreadyPredictedWindow(
      fanPredictions,
      "fan-1",
      "Newcastle United v Everton",
      fanPredictions[0].windowIndex
    ),
  "Six played predictions in a 30-minute slot also mark that slot COMPLETE"
);
assert(
  gameTimeSlotIsComplete({
    kickoffAt: matchDay,
    slotIndex: 1,
    now: slot0Live,
    predictions: fanPredictions,
    fanId: "fan-1",
    fixtureName: "Newcastle United v Everton",
  }),
  "COMPLETE is true once all six interval predictions are played, even if time remains"
);

const yesterdayWallet = createGameTimeWallet({
  clubName: "Newcastle United",
  brandName: "American Express",
  fixtureName: "Newcastle United v Everton",
  slotIndex: 1,
  sponsorshipGbp: 2500,
  kickoffAt: matchDay.toISOString(),
});
assert(
  pickSponsoredGameTimeMatch([yesterdayWallet], ["Newcastle United"], nextDay) ===
    null &&
    pickSponsoredGameTimeMatch(
      [yesterdayWallet],
      ["Newcastle United"],
      sameEvening
    )?.fixtureName === "Newcastle United v Everton",
  "The day after Match Day P4P has no sponsored Match; Match Day evening still does"
);

const play = readFileSync("app/components/fan/PredictForPlanetPlay.tsx", "utf8");
const lib = readFileSync("app/lib/predict-for-planet.ts", "utf8");
const completePreview = readFileSync(
  "app/preview/fan-p4p-complete/page.tsx",
  "utf8"
);
const awaitingPreview = readFileSync(
  "app/preview/fan-p4p-awaiting/page.tsx",
  "utf8"
);
const overlay = readFileSync("apply-p4p-timer-complete.mjs", "utf8");

assert(
  lib.includes("p4p-timer-complete-v1") &&
    lib.includes("p4pIsAfterMatchDay") &&
    lib.includes("gameTimeSlotIsComplete") &&
    lib.includes("P4P_AWAITING_NEW_SPONSORED_LABEL") &&
    play.includes("p4p-timer-complete-v1") &&
    play.includes('data-testid="p4p-slot-timer"') &&
    play.includes('data-p4p-slot-timer="p4p-timer-complete-v1"') &&
    play.includes("formatP4pClock") &&
    play.includes("P4P_WINDOW_TIMER_LABEL") &&
    play.includes("P4P_SLOT_COMPLETE_LABEL") &&
    play.includes('data-testid="p4p-slot-complete"') &&
    play.includes('data-testid="p4p-awaiting-sponsored"') &&
    play.includes("forceAwaiting") &&
    play.includes("p4pIsAfterMatchDay") &&
    play.includes("gameTimeSlotIsComplete") &&
    completePreview.includes("slotIndex: 0") &&
    completePreview.includes("COMPLETE_KICKOFF") &&
    awaitingPreview.includes("forceAwaiting") &&
    overlay.includes('STAMP = "p4p-timer-complete-v1"'),
  "Play shows a 5-minute timer, marks the slot COMPLETE, and awaits a new sponsored P4P the next day"
);

if (failures.length > 0) {
  console.error("verify-p4p-timer-complete failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-p4p-timer-complete: ok");
