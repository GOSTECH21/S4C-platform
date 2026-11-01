/* s4p-predict-for-planet-v7 */
/** Predict-For Planet (P4P): in-game fan engagement funded by Game-Time Sponsorship. */

import { sameNamedFixture, fixtureSides } from "./club-fixtures";
import { SUPPORTER_PROJECTS_PATH } from "./routes";
import { matchSponsorshipTopUp } from "./sponsor-wallet";
import { namesMatch } from "./upcoming-matches";

export const P4P_LABEL = "Predict-For Planet";
export const P4P_SHORT = "P4P";
export const GAME_TIME_SPONSORSHIP_LABEL = "Game-Time Sponsorship";
export const GAME_TIME_SPONSOR_LABEL = "Game-Time Sponsor";
export const GAME_TIME_CARBON_WALLET_LABEL = "Game-Time Carbon Wallet";
export const MATCH_SPONSOR_PRODUCT_LABEL = "Match-Sponsor";
export const GAME_TIME_PRODUCT_LABEL = "Game-Time Sponsor";
export const SPONSORED_BY_LABEL = "Sponsored by";
export const P4P_POWERED_BY_LABEL = "This Climate Challenge is powered by";
export const P4P_PREDICT_NEXT_LABEL = "Predict what happens next?";
export const P4P_LIVE_CHALLENGE_LABEL = "P4P Live Climate Challenge";
export const P4P_TAGLINE = "Predict. Participate. Power Climate Action";
export const P4P_MAKE_PREDICTION_LABEL = "Make your prediction";
export const P4P_CHOOSE_PROJECT_LABEL = "Choose your climate project";
export const P4P_MATCH_DAY_IMPACT_LABEL = "Your Match Day Impact";
export const P4P_LIVE_CHALLENGE_FOOTER =
  "Choose 3 of 7 events. Participating earns £0.10 for your Climate Project, right or wrong. If one of those events is awarded, you earn another £0.30.";
export const P4P_FANS_ENGAGEMENT_LABEL = "Fans engagement with this challenge";
export const FAN_CARBON_WALLET_LABEL = "Fan Carbon Wallet";
export const P4P_FALLBACK_PROJECTS = [
  "Local Global Schools Solar",
  "International Global Schools Solar",
  "Wee Spoke Hub",
  "Edinburgh Building Retrofit Collective",
  "Porty Community Energy",
];
export const P4P_DONATE_FUNDING_MESSAGE =
  "Here are Climate Projects to donate your funding";

/** Each Game-Time Sponsor buys one 30-minute slot of fan engagement. */
export const GAME_TIME_SLOT_MINUTES = 30;
/** A football Game-Time Sponsorship lasts the 90 minutes of play. */
export const GAME_TIME_DURATION_MINUTES = 90;
/** Match-Sponsorship stays live for five days after lock-in. */
export const MATCH_SPONSORSHIP_DAYS = 5;
/** Fans predict what will happen in this window. */
export const P4P_WINDOW_MINUTES = 5;
/** Three likely events per fan per 5-minute window, chosen from the seven P4P events. */
export const P4P_PREDICTIONS_PER_WINDOW = 3;
/** Participating in a 5-minute slot earns £0.10, right or wrong. */
export const P4P_ENGAGEMENT_GBP = 0.1;
export const P4P_PARTICIPATION_GBP = P4P_ENGAGEMENT_GBP;
/** Predicting the event that is awarded in that slot earns another £0.30. */
export const P4P_ACCURACY_GBP = 0.3;
export const P4P_CORRECT_TOTAL_GBP = P4P_PARTICIPATION_GBP + P4P_ACCURACY_GBP;

export const GAME_TIME_SLOT_COUNT =
  GAME_TIME_DURATION_MINUTES / GAME_TIME_SLOT_MINUTES;
export const P4P_WINDOWS_PER_SLOT = GAME_TIME_SLOT_MINUTES / P4P_WINDOW_MINUTES;
export const P4P_WINDOWS_PER_MATCH =
  GAME_TIME_DURATION_MINUTES / P4P_WINDOW_MINUTES;

export type GlobalSponsorProduct = "match" | "game-time";

export type P4pCategoryId =
  | "handball"
  | "foul"
  | "corner"
  | "yellow-card"
  | "red-card"
  | "penalty"
  | "var";

export type P4pCategory = {
  id: P4pCategoryId;
  label: string;
};

export const P4P_CATEGORIES: P4pCategory[] = [
  { id: "handball", label: "Handball offence" },
  { id: "foul", label: "Foul committed" },
  { id: "corner", label: "Corner awarded" },
  { id: "yellow-card", label: "Yellow card issued" },
  { id: "red-card", label: "Red card issued" },
  { id: "penalty", label: "Penalty awarded" },
  { id: "var", label: "VAR referee review" },
];

export type GameTimeSlot = {
  index: number;
  startMinute: number;
  endMinute: number;
  label: string;
};

export function gameTimeSlots(): GameTimeSlot[] {
  return Array.from({ length: GAME_TIME_SLOT_COUNT }, (_, index) => {
    const startMinute = index * GAME_TIME_SLOT_MINUTES;
    const endMinute = startMinute + GAME_TIME_SLOT_MINUTES;
    return {
      index,
      startMinute,
      endMinute,
      label: `${startMinute}–${endMinute} minutes`,
    };
  });
}

export function slotForMinute(minute: number): GameTimeSlot | null {
  const slots = gameTimeSlots();
  const clamped = Math.max(0, Math.min(GAME_TIME_DURATION_MINUTES - 0.001, Number(minute) || 0));
  return slots.find((slot) => clamped >= slot.startMinute && clamped < slot.endMinute) ?? null;
}

export type P4pWindow = {
  index: number;
  slotIndex: number;
  startMinute: number;
  endMinute: number;
  label: string;
};

export function p4pWindows(): P4pWindow[] {
  return Array.from({ length: P4P_WINDOWS_PER_MATCH }, (_, index) => {
    const startMinute = index * P4P_WINDOW_MINUTES;
    const endMinute = startMinute + P4P_WINDOW_MINUTES;
    const slotIndex = Math.floor(startMinute / GAME_TIME_SLOT_MINUTES);
    return {
      index,
      slotIndex,
      startMinute,
      endMinute,
      label: `${startMinute}–${endMinute} min`,
    };
  });
}

export function windowsForGameTimeSlot(slotIndex: number): P4pWindow[] {
  const slot = Math.max(
    0,
    Math.min(GAME_TIME_SLOT_COUNT - 1, Math.round(Number(slotIndex) || 0))
  );
  return p4pWindows().filter((row) => row.slotIndex === slot);
}

export function isWindowInGameTimeSlot(
  windowIndex: number,
  slotIndex: number
): boolean {
  const window = p4pWindows()[Math.round(Number(windowIndex) || 0)];
  if (!window) return false;
  return window.slotIndex === Math.round(Number(slotIndex) || 0);
}

export function gameTimeSlotShortLabel(slot: GameTimeSlot): string {
  return `${slot.startMinute}'–${slot.endMinute}'`;
}

export function formatP4pClock(totalSeconds: number): string {
  const value = Math.max(0, Math.round(Number(totalSeconds) || 0));
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export type P4pWindowCountdown = {
  state: "upcoming" | "live" | "ended";
  remainingSeconds: number;
  label: string;
};

export type P4pLiveSlotBoard = {
  windowIndex: number;
  picked: P4pCategoryId[];
  walletGbp: number;
  bankedWindowIndex: number | null;
  fullTime: boolean;
};

export function p4pEmptySlotBoard(
  windowIndex = -1
): P4pLiveSlotBoard {
  return {
    windowIndex,
    picked: [],
    walletGbp: 0,
    bankedWindowIndex: null,
    fullTime: false,
  };
}

/** Bank participation once per 5-minute slot when 3 events are chosen. */
export function p4pBankSlotIfComplete(
  board: P4pLiveSlotBoard
): P4pLiveSlotBoard {
  if (board.picked.length !== P4P_PREDICTIONS_PER_WINDOW) return board;
  if (board.bankedWindowIndex === board.windowIndex) return board;
  return {
    ...board,
    walletGbp: roundP4pGbp(board.walletGbp + P4P_PARTICIPATION_GBP),
    bankedWindowIndex: board.windowIndex,
  };
}

/** At 0:00, wipe the previous slot's picks and keep the running wallet total. */
export function p4pAdvanceSlotBoard(
  board: P4pLiveSlotBoard,
  nextWindowIndex: number
): P4pLiveSlotBoard {
  if (board.fullTime) return board;
  if (board.windowIndex === nextWindowIndex) return board;
  if (board.windowIndex < 0) {
    return { ...board, windowIndex: nextWindowIndex, fullTime: false };
  }
  const banked = p4pBankSlotIfComplete(board);
  const lastWindow = p4pWindows().length - 1;
  if (board.windowIndex === lastWindow && nextWindowIndex === 0) {
    return {
      windowIndex: board.windowIndex,
      picked: banked.picked,
      walletGbp: banked.walletGbp,
      bankedWindowIndex: banked.bankedWindowIndex,
      fullTime: true,
    };
  }
  return {
    windowIndex: nextWindowIndex,
    picked: [],
    walletGbp: banked.walletGbp,
    bankedWindowIndex: banked.bankedWindowIndex,
    fullTime: false,
  };
}

export function p4pMatchIsFullTime(
  kickoffAt: Date | string,
  now: Date | string = new Date()
): boolean {
  return elapsedGameMinutes(kickoffAt, now) >= GAME_TIME_DURATION_MINUTES;
}

export function p4pDonateProjectsPath(walletGbp = 0): string {
  const params = new URLSearchParams({ p4pDonate: "1" });
  const amount = roundP4pGbp(walletGbp);
  if (amount > 0) params.set("wallet", String(amount));
  return `${SUPPORTER_PROJECTS_PATH}?${params.toString()}`;
}

export function p4pCyclingWindowClock(
  now: Date | string = new Date()
): {
  window: P4pWindow;
  remainingSeconds: number;
  label: string;
} {
  const windows = p4pWindows();
  const windowMs = P4P_WINDOW_MINUTES * 60 * 1000;
  const matchMs = GAME_TIME_DURATION_MINUTES * 60 * 1000;
  const elapsed = ((toDate(now).getTime() % matchMs) + matchMs) % matchMs;
  const index = Math.min(windows.length - 1, Math.floor(elapsed / windowMs));
  const into = elapsed % windowMs;
  const remainingMs = into === 0 ? windowMs : windowMs - into;
  const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const window = windows[index]!;
  return {
    window,
    remainingSeconds,
    label: formatP4pClock(remainingSeconds),
  };
}

export function p4pWindowCountdown(
  kickoffAt: Date | string,
  window: P4pWindow,
  now: Date | string = new Date()
): P4pWindowCountdown {
  const start = toDate(kickoffAt).getTime() + window.startMinute * 60 * 1000;
  const end = toDate(kickoffAt).getTime() + window.endMinute * 60 * 1000;
  const at = toDate(now).getTime();
  if (at < start) {
    const remainingSeconds = Math.max(0, Math.round((start - at) / 1000));
    return {
      state: "upcoming",
      remainingSeconds,
      label: `Starts in ${formatP4pClock(remainingSeconds)}`,
    };
  }
  if (at >= end) {
    return {
      state: "ended",
      remainingSeconds: 0,
      label: "This 5-minute slot has ended",
    };
  }
  const remainingSeconds = Math.max(0, Math.round((end - at) / 1000));
  return {
    state: "live",
    remainingSeconds,
    label: `${formatP4pClock(remainingSeconds)} left`,
  };
}

export function windowForMinute(minute: number): P4pWindow | null {
  const windows = p4pWindows();
  const clamped = Math.max(0, Math.min(GAME_TIME_DURATION_MINUTES - 0.001, Number(minute) || 0));
  return (
    windows.find(
      (row) => clamped >= row.startMinute && clamped < row.endMinute
    ) ?? null
  );
}

export function elapsedGameMinutes(
  kickoffAt: Date | string,
  now: Date | string = new Date()
): number {
  return (toDate(now).getTime() - toDate(kickoffAt).getTime()) / 60000;
}

export function liveGameTimeSlotIndex(
  kickoffAt: Date | string,
  now: Date | string = new Date()
): number {
  const elapsed = elapsedGameMinutes(kickoffAt, now);
  if (elapsed < 0) return 0;
  if (elapsed >= GAME_TIME_DURATION_MINUTES) return GAME_TIME_SLOT_COUNT - 1;
  return Math.min(
    GAME_TIME_SLOT_COUNT - 1,
    Math.floor(elapsed / GAME_TIME_SLOT_MINUTES)
  );
}

export function liveWindowIndexForSlot(
  kickoffAt: Date | string,
  slotIndex: number,
  now: Date | string = new Date()
): number {
  const playable = windowsForGameTimeSlot(slotIndex);
  const live = windowForMinute(Math.max(0, elapsedGameMinutes(kickoffAt, now)));
  if (live && live.slotIndex === slotIndex) return live.index;
  return playable[0]?.index ?? slotIndex * P4P_WINDOWS_PER_SLOT;
}

export function p4pCategoryById(id: string | null | undefined): P4pCategory | null {
  return P4P_CATEGORIES.find((row) => row.id === id) ?? null;
}

export function roundP4pGbp(value: number): number {
  return Math.round((Number(value) || 0) * 100) / 100;
}

export function formatP4pGbp(amount: number): string {
  const value = roundP4pGbp(amount);
  return `£${value.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export type GameTimeWallet = {
  id: string;
  clubName: string;
  brandName: string;
  fixtureName: string;
  slotIndex: number;
  sponsorshipGbp: number;
  allocatedGbp: number;
  kickoffAt: string;
  updatedAt: string;
  /** Set only after Stripe takes the Game-Time amount plus the 5% Platform Fee. */
  paidAt?: string | null;
};

export type GameTimeCheckout = {
  clubName: string;
  brandName: string;
  fixtureName: string;
  slotIndex: number;
  sponsorshipGbp: number;
  kickoffAt?: string;
};

export function gameTimeSponsorshipTopUp(sponsorshipGbp: number): {
  sponsorshipGbp: number;
  platformFeeGbp: number;
  paidGbp: number;
} {
  const topUp = matchSponsorshipTopUp(sponsorshipGbp);
  return {
    sponsorshipGbp: topUp.matchSponsorshipGbp,
    platformFeeGbp: topUp.platformFeeGbp,
    paidGbp: topUp.paidGbp,
  };
}

export function gameTimeWalletId(input: {
  clubName: string;
  brandName: string;
  fixtureName: string;
  slotIndex: number;
}): string {
  return [
    normalizeP4pKey(input.clubName),
    normalizeP4pKey(input.brandName),
    normalizeP4pKey(input.fixtureName),
    String(Math.max(0, Math.round(Number(input.slotIndex) || 0))),
  ].join(":");
}

export function remainingGameTimeGbp(wallet: GameTimeWallet): number {
  return roundP4pGbp(
    Math.max(
      0,
      roundP4pGbp(wallet.sponsorshipGbp) - roundP4pGbp(wallet.allocatedGbp)
    )
  );
}

export function gameTimeClubMatches(left: string, right: string): boolean {
  return namesMatch(left, right);
}

export function gameTimeFixtureMatches(left: string, right: string): boolean {
  return sameNamedFixture(left, right);
}

export function gameTimeWalletMatchesMatch(
  wallet: GameTimeWallet,
  clubName: string,
  fixtureName: string
): boolean {
  return (
    gameTimeClubMatches(wallet.clubName, clubName) &&
    gameTimeFixtureMatches(wallet.fixtureName, fixtureName)
  );
}

export function fixtureInvolvesClub(fixtureName: string, clubName: string): boolean {
  const sides = fixtureSides(fixtureName);
  if (!sides) return gameTimeClubMatches(fixtureName, clubName);
  return gameTimeClubMatches(sides[0], clubName) || gameTimeClubMatches(sides[1], clubName);
}

export function isPaidGameTimeWallet(wallet: GameTimeWallet | null | undefined): boolean {
  if (!wallet) return false;
  return Boolean(wallet.paidAt) && roundP4pGbp(wallet.sponsorshipGbp) > 0;
}

export function depositedGameTimeWallets(wallets: GameTimeWallet[]): GameTimeWallet[] {
  return wallets.filter((row) => isPaidGameTimeWallet(row));
}

export type SponsoredGameTimeMatch = {
  clubName: string;
  fixtureName: string;
  brandName: string;
  remainingGbp: number;
  slotIndex: number;
};

function isPreferredSponsoredMatch(
  wallet: GameTimeWallet,
  preferredClubNames: string[]
): boolean {
  if (preferredClubNames.length === 0) return false;
  return preferredClubNames.some(
    (name) =>
      gameTimeClubMatches(wallet.clubName, name) ||
      fixtureInvolvesClub(wallet.fixtureName, name)
  );
}

function toSponsoredGameTimeMatch(wallet: GameTimeWallet): SponsoredGameTimeMatch {
  return {
    clubName: wallet.clubName,
    fixtureName: wallet.fixtureName,
    brandName: wallet.brandName,
    remainingGbp: remainingGameTimeGbp(wallet),
    slotIndex: wallet.slotIndex,
  };
}

function rankSponsoredWallets(
  left: GameTimeWallet,
  right: GameTimeWallet,
  preferredClubNames: string[],
  now: Date | string = new Date()
): number {
  const leftPref = isPreferredSponsoredMatch(left, preferredClubNames) ? 0 : 1;
  const rightPref = isPreferredSponsoredMatch(right, preferredClubNames) ? 0 : 1;
  if (leftPref !== rightPref) return leftPref - rightPref;
  const leftLive =
    left.slotIndex === liveGameTimeSlotIndex(left.kickoffAt, now) ? 0 : 1;
  const rightLive =
    right.slotIndex === liveGameTimeSlotIndex(right.kickoffAt, now) ? 0 : 1;
  if (leftLive !== rightLive) return leftLive - rightLive;
  const remaining = remainingGameTimeGbp(right) - remainingGameTimeGbp(left);
  if (remaining !== 0) return remaining;
  return toDate(right.updatedAt).getTime() - toDate(left.updatedAt).getTime();
}

/** The Match P4P is played on: a Game-Time Sponsor deposited into its Carbon Wallet. */
export function pickSponsoredGameTimeMatch(
  wallets: GameTimeWallet[],
  preferredClubNames: string[] = []
): SponsoredGameTimeMatch | null {
  const deposited = depositedGameTimeWallets(wallets);
  if (deposited.length === 0) return null;
  const withCash = deposited.filter((row) => remainingGameTimeGbp(row) > 0);
  const pool = withCash.length > 0 ? withCash : deposited;
  const preferred = pool.filter((row) =>
    isPreferredSponsoredMatch(row, preferredClubNames)
  );
  const ranked = [...(preferred.length > 0 ? preferred : pool)].sort((left, right) =>
    rankSponsoredWallets(left, right, preferredClubNames)
  );
  return ranked[0] ? toSponsoredGameTimeMatch(ranked[0]) : null;
}

export function firstFundedWindowIndex(
  wallets: GameTimeWallet[],
  clubName: string,
  fixtureName: string,
  now: Date | string = new Date()
): number {
  const funded = wallets.filter(
    (row) =>
      isPaidGameTimeWallet(row) &&
      gameTimeWalletMatchesMatch(row, clubName, fixtureName) &&
      remainingGameTimeGbp(row) > 0
  );
  if (funded.length === 0) return 0;
  const liveSlot = liveGameTimeSlotIndex(funded[0].kickoffAt, now);
  const liveWallet =
    funded.find((row) => row.slotIndex === liveSlot) ?? funded[0];
  return liveWindowIndexForSlot(liveWallet.kickoffAt, liveWallet.slotIndex, now);
}

export function createGameTimeWallet(input: {
  clubName: string;
  brandName: string;
  fixtureName: string;
  slotIndex: number;
  sponsorshipGbp: number;
  kickoffAt?: string;
  now?: Date | string;
  paidAt?: string | null;
}): GameTimeWallet {
  const now = asIso(input.now ?? new Date());
  const slotIndex = Math.max(
    0,
    Math.min(GAME_TIME_SLOT_COUNT - 1, Math.round(Number(input.slotIndex) || 0))
  );
  return {
    id: gameTimeWalletId({ ...input, slotIndex }),
    clubName: String(input.clubName ?? "").trim(),
    brandName: String(input.brandName ?? "").trim(),
    fixtureName: String(input.fixtureName ?? "").trim(),
    slotIndex,
    sponsorshipGbp: roundP4pGbp(Math.max(0, Number(input.sponsorshipGbp) || 0)),
    allocatedGbp: 0,
    kickoffAt: input.kickoffAt || now,
    updatedAt: now,
    paidAt: input.paidAt === undefined ? now : input.paidAt,
  };
}

export type P4pPrediction = {
  id: string;
  fanId: string;
  clubName: string;
  fixtureName: string;
  windowIndex: number;
  categoryId: P4pCategoryId;
  categoryIds?: P4pCategoryId[];
  projectName: string;
  engagementGbp: number;
  participationGbp?: number;
  accuracyGbp?: number;
  correct?: boolean | null;
  walletId: string | null;
  at: string;
};

export function parseP4pPicks(input: {
  categoryId?: string;
  categoryIds?: string[];
}): P4pCategory[] | null {
  const ids =
    Array.isArray(input.categoryIds) && input.categoryIds.length > 0
      ? input.categoryIds
      : input.categoryId
        ? [input.categoryId]
        : [];
  const unique: P4pCategory[] = [];
  for (const id of ids) {
    const category = p4pCategoryById(id);
    if (!category) return null;
    if (!unique.some((row) => row.id === category.id)) unique.push(category);
  }
  if (unique.length !== P4P_PREDICTIONS_PER_WINDOW) return null;
  return unique;
}

export function predictionCategoryIds(
  row: Pick<P4pPrediction, "categoryId" | "categoryIds">
): P4pCategoryId[] {
  const fromList = (row.categoryIds ?? [])
    .map((id) => p4pCategoryById(id)?.id)
    .filter((id): id is P4pCategoryId => Boolean(id));
  const unique: P4pCategoryId[] = [];
  for (const id of fromList) {
    if (!unique.includes(id)) unique.push(id);
  }
  if (unique.length > 0) return unique;
  const single = p4pCategoryById(row.categoryId)?.id;
  return single ? [single] : [];
}

export function predictionIncludesCategory(
  row: Pick<P4pPrediction, "categoryId" | "categoryIds">,
  categoryId: string
): boolean {
  const category = p4pCategoryById(categoryId);
  if (!category) return false;
  return predictionCategoryIds(row).includes(category.id);
}

export type P4pSlotEvent = {
  fixtureName: string;
  windowIndex: number;
  categoryId: P4pCategoryId;
  at: string;
};

export type P4pEngagementSuccess = {
  ok: true;
  prediction: P4pPrediction;
  wallet: GameTimeWallet | null;
  takenGbp: number;
};

export type P4pEngagementFailure = {
  ok: false;
  error: string;
};

export type P4pEngagementResult = P4pEngagementSuccess | P4pEngagementFailure;

export function alreadyPredictedWindow(
  predictions: P4pPrediction[],
  fanId: string,
  fixtureName: string,
  windowIndex: number
): boolean {
  const fan = normalizeP4pKey(fanId);
  return predictions.some(
    (row) =>
      normalizeP4pKey(row.fanId) === fan &&
      gameTimeFixtureMatches(row.fixtureName, fixtureName) &&
      row.windowIndex === windowIndex
  );
}

export function recordP4pEngagement({
  fanId,
  clubName,
  fixtureName,
  windowIndex,
  categoryId,
  categoryIds,
  projectName,
  wallet,
  predictions,
  now = new Date(),
}: {
  fanId: string;
  clubName: string;
  fixtureName: string;
  windowIndex: number;
  categoryId?: string;
  categoryIds?: string[];
  projectName?: string;
  wallet: GameTimeWallet | null;
  predictions: P4pPrediction[];
  now?: Date | string;
}): P4pEngagementResult {
  const picks = parseP4pPicks({ categoryId, categoryIds });
  if (!picks) {
    return {
      ok: false,
      error: "Choose 3 of the seven Predict-For Planet events.",
    };
  }
  const category = picks[0];
  const chosenProject = String(projectName ?? "").trim();
  if (!chosenProject) {
    return { ok: false, error: "Choose a Climate Project for this Engagement." };
  }
  const window = p4pWindows()[Math.round(Number(windowIndex) || 0)];
  if (!window) {
    return { ok: false, error: "That 5-minute slot is not in this Game." };
  }
  if (
    alreadyPredictedWindow(predictions, fanId, fixtureName, window.index)
  ) {
    return {
      ok: false,
      error: "You have already chosen 3 events in this 5-minute slot.",
    };
  }
  if (!wallet || !isPaidGameTimeWallet(wallet)) {
    return {
      ok: false,
      error: "No Game-Time Sponsor has put money on this Match yet.",
    };
  }
  if (wallet.slotIndex !== window.slotIndex) {
    const slot = gameTimeSlots()[wallet.slotIndex];
    return {
      ok: false,
      error: `That 5-minute slot is not in this Game-Time Sponsorship. The Game-Time Sponsor bought ${slot?.label ?? "a different 30-minute slot"}.`,
    };
  }
  const remaining = remainingGameTimeGbp(wallet);
  if (remaining <= 0) {
    return {
      ok: false,
      error: `The ${GAME_TIME_CARBON_WALLET_LABEL} is ${formatP4pGbp(0)}. A Game-Time Sponsor must put money in before fans can Predict.`,
    };
  }
  const at = asIso(now);
  const takenGbp = roundP4pGbp(Math.min(P4P_PARTICIPATION_GBP, remaining));
  const nextWallet: GameTimeWallet = {
    ...wallet,
    allocatedGbp: roundP4pGbp(wallet.allocatedGbp + takenGbp),
    updatedAt: at,
  };
  const prediction: P4pPrediction = {
    id: `${normalizeP4pKey(fanId)}:${normalizeP4pKey(fixtureName)}:${window.index}`,
    fanId,
    clubName,
    fixtureName,
    windowIndex: window.index,
    categoryId: category.id,
    categoryIds: picks.map((row) => row.id),
    projectName: chosenProject,
    participationGbp: takenGbp,
    accuracyGbp: 0,
    engagementGbp: takenGbp,
    correct: null,
    walletId: nextWallet.id,
    at,
  };
  return { ok: true, prediction, wallet: nextWallet, takenGbp };
}

export function p4pPredictionAmounts(row: P4pPrediction): {
  participationGbp: number;
  accuracyGbp: number;
  totalGbp: number;
  correct: boolean | null;
} {
  const participationGbp = roundP4pGbp(
    row.participationGbp ?? (row.accuracyGbp ? roundP4pGbp((row.engagementGbp || 0) - (row.accuracyGbp || 0)) : row.engagementGbp) ?? 0
  );
  const accuracyGbp = roundP4pGbp(row.accuracyGbp ?? 0);
  const correct =
    row.correct === undefined ? (accuracyGbp > 0 ? true : null) : row.correct;
  return {
    participationGbp,
    accuracyGbp,
    totalGbp: roundP4pGbp(participationGbp + accuracyGbp),
    correct,
  };
}

export type P4pAccuracySuccess = {
  ok: true;
  prediction: P4pPrediction;
  wallet: GameTimeWallet | null;
  takenGbp: number;
};

export function awardP4pAccuracy({
  prediction,
  wallet,
  categoryId,
  now = new Date(),
}: {
  prediction: P4pPrediction;
  wallet: GameTimeWallet | null;
  categoryId: string;
  now?: Date | string;
}): P4pAccuracySuccess {
  const amounts = p4pPredictionAmounts(prediction);
  const category = p4pCategoryById(categoryId);
  if (!category || !predictionIncludesCategory(prediction, category.id)) {
    return { ok: true, prediction, wallet, takenGbp: 0 };
  }
  if (amounts.accuracyGbp > 0 || amounts.correct === true) {
    return { ok: true, prediction, wallet, takenGbp: 0 };
  }
  if (!wallet || !isPaidGameTimeWallet(wallet)) {
    return { ok: true, prediction, wallet, takenGbp: 0 };
  }
  const remaining = remainingGameTimeGbp(wallet);
  if (remaining <= 0) {
    return { ok: true, prediction, wallet, takenGbp: 0 };
  }
  const takenGbp = roundP4pGbp(Math.min(P4P_ACCURACY_GBP, remaining));
  const at = asIso(now);
  const nextWallet: GameTimeWallet = {
    ...wallet,
    allocatedGbp: roundP4pGbp(wallet.allocatedGbp + takenGbp),
    updatedAt: at,
  };
  const nextPrediction: P4pPrediction = {
    ...prediction,
    participationGbp: amounts.participationGbp,
    accuracyGbp: takenGbp,
    engagementGbp: roundP4pGbp(amounts.participationGbp + takenGbp),
    correct: true,
  };
  return { ok: true, prediction: nextPrediction, wallet: nextWallet, takenGbp };
}

export function fanCarbonWalletFromPredictions(
  predictions: P4pPrediction[],
  fanId: string
): { totalGbp: number; byProject: { projectName: string; amountGbp: number }[] } {
  const mine = predictions.filter(
    (row) => normalizeP4pKey(row.fanId) === normalizeP4pKey(fanId)
  );
  return {
    totalGbp: roundP4pGbp(
      mine.reduce((sum, row) => sum + p4pPredictionAmounts(row).totalGbp, 0)
    ),
    byProject: p4pCreditsByProject(mine),
  };
}

export function p4pPlayIntroCopy(): string {
  return `Choose 3 likely events that could happen (out of 7) in the next ${P4P_WINDOW_MINUTES}-minute slot of this Game-Time Sponsorship. Participating earns you ${formatP4pGbp(P4P_PARTICIPATION_GBP)} from the Carbon Wallet of the Game-Time Sponsor for your chosen Climate Project. If one of those events is awarded, you earn another ${formatP4pGbp(P4P_ACCURACY_GBP)}.`;
}

export function slotEventKey(
  fixtureName: string,
  windowIndex: number,
  categoryId: string
): string {
  return `${normalizeP4pKey(fixtureName)}:${windowIndex}:${categoryId}`;
}

export type P4pLiveChallenge = {
  uniqueFans: number;
  eligiblePredictions: number;
  engagementTarget: number;
  progressRatio: number;
  progressPercent: number;
  fundingUnlockedGbp: number;
  sponsorCommitmentGbp: number;
};

export function p4pLiveChallenge(
  wallet: GameTimeWallet,
  predictions: P4pPrediction[]
): P4pLiveChallenge {
  const eligible = predictions.filter((row) => {
    const window = p4pWindows()[row.windowIndex];
    return (
      gameTimeFixtureMatches(row.fixtureName, wallet.fixtureName) &&
      window?.slotIndex === wallet.slotIndex
    );
  });
  const uniqueFans = new Set(
    eligible.map((row) => normalizeP4pKey(row.fanId)).filter(Boolean)
  ).size;
  const eligiblePredictions = eligible.length;
  const sponsorCommitmentGbp = roundP4pGbp(wallet.sponsorshipGbp);
  const fundingUnlockedGbp = roundP4pGbp(wallet.allocatedGbp);
  const engagementTarget = Math.max(
    1,
    Math.round(sponsorCommitmentGbp / P4P_ENGAGEMENT_GBP)
  );
  const progressRatio =
    sponsorCommitmentGbp > 0
      ? Math.min(1, fundingUnlockedGbp / sponsorCommitmentGbp)
      : 0;
  return {
    uniqueFans,
    eligiblePredictions,
    engagementTarget,
    progressRatio,
    progressPercent: Math.round(progressRatio * 100),
    fundingUnlockedGbp,
    sponsorCommitmentGbp,
  };
}

export function p4pCreditsByProject(
  predictions: P4pPrediction[]
): { projectName: string; amountGbp: number }[] {
  const totals = new Map<string, number>();
  for (const row of predictions) {
    const name = String(row.projectName ?? "").trim();
    if (!name) continue;
    totals.set(
      name,
      roundP4pGbp((totals.get(name) ?? 0) + p4pPredictionAmounts(row).totalGbp)
    );
  }
  return [...totals.entries()]
    .map(([projectName, amountGbp]) => ({ projectName, amountGbp }))
    .sort((left, right) => right.amountGbp - left.amountGbp);
}

export function gameTimePersistsUntil(kickoffAt: Date | string): Date {
  const start = toDate(kickoffAt);
  return new Date(start.getTime() + GAME_TIME_DURATION_MINUTES * 60 * 1000);
}

export function matchSponsorshipPersistsUntil(lockedAt: Date | string): Date {
  const start = toDate(lockedAt);
  return new Date(start.getTime() + MATCH_SPONSORSHIP_DAYS * 24 * 60 * 60 * 1000);
}

export function gameTimeIsLive(wallet: GameTimeWallet, now: Date | string = new Date()): boolean {
  const at = toDate(now).getTime();
  const start = toDate(wallet.kickoffAt).getTime();
  const end = gameTimePersistsUntil(wallet.kickoffAt).getTime();
  return at >= start && at <= end;
}

export function p4pHowItWorksCaption(): string {
  return "Predict-For Planet is played on the Match a Game-Time Sponsor has put money into their Wallet for.";
}

export function p4pHowItWorksPoints(): string[] {
  return [
    `Choose 3 of 7 events in each ${P4P_WINDOW_MINUTES}-minute slot`,
    `Participating earns ${formatP4pGbp(P4P_PARTICIPATION_GBP)}; if one of those events is awarded you earn another ${formatP4pGbp(P4P_ACCURACY_GBP)} into your ${FAN_CARBON_WALLET_LABEL}`,
    `A Game-Time Sponsor buys a ${GAME_TIME_SLOT_MINUTES}-minute slot; the Game lasts ${GAME_TIME_DURATION_MINUTES} minutes`,
    "Goal scored is exclusive to Score-For-Planet, not Predict-For Planet",
  ];
}

function normalizeP4pKey(value: string): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function asIso(value: Date | string): string {
  const date = toDate(value);
  return date.toISOString();
}

function toDate(value: Date | string): Date {
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}
