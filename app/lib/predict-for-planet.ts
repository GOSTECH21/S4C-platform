/** Predict-For Planet (P4P): in-game fan engagement funded by Game-Time Sponsorship. */

export const P4P_LABEL = "Predict-For Planet";
export const P4P_SHORT = "P4P";
export const GAME_TIME_SPONSORSHIP_LABEL = "Game-Time Sponsorship";
export const GAME_TIME_SPONSOR_LABEL = "Game-Time Sponsor";
export const GAME_TIME_CARBON_WALLET_LABEL = "Game-Time Carbon Wallet";
export const MATCH_SPONSOR_PRODUCT_LABEL = "Match-Sponsor";
export const GAME_TIME_PRODUCT_LABEL = "Game-Time Sponsor";
export const P4P_FALLBACK_PROJECTS = [
  "Local Global Schools Solar",
  "International Global Schools Solar",
  "Wee Spoke Hub",
  "Edinburgh Building Retrofit Collective",
  "Porty Community Energy",
];

/** Each Game-Time Sponsor buys one 30-minute slot of fan engagement. */
export const GAME_TIME_SLOT_MINUTES = 30;
/** A football Game-Time Sponsorship lasts the 90 minutes of play. */
export const GAME_TIME_DURATION_MINUTES = 90;
/** Match-Sponsorship stays live for five days after lock-in. */
export const MATCH_SPONSORSHIP_DAYS = 5;
/** Fans predict what will happen in this window. */
export const P4P_WINDOW_MINUTES = 5;
/** One prediction per fan per 5-minute window. */
export const P4P_PREDICTIONS_PER_WINDOW = 1;
/** Every prediction — right or wrong — is an Engagement. */
export const P4P_ENGAGEMENT_GBP = 0.1;

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
  | "goal"
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
  { id: "goal", label: "Goal scored" },
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

export function windowForMinute(minute: number): P4pWindow | null {
  const windows = p4pWindows();
  const clamped = Math.max(0, Math.min(GAME_TIME_DURATION_MINUTES - 0.001, Number(minute) || 0));
  return (
    windows.find(
      (row) => clamped >= row.startMinute && clamped < row.endMinute
    ) ?? null
  );
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
};

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

export function createGameTimeWallet(input: {
  clubName: string;
  brandName: string;
  fixtureName: string;
  slotIndex: number;
  sponsorshipGbp: number;
  kickoffAt?: string;
  now?: Date | string;
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
  };
}

export type P4pPrediction = {
  id: string;
  fanId: string;
  clubName: string;
  fixtureName: string;
  windowIndex: number;
  categoryId: P4pCategoryId;
  projectName: string;
  engagementGbp: number;
  walletId: string | null;
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
  const fixture = normalizeP4pKey(fixtureName);
  return predictions.some(
    (row) =>
      normalizeP4pKey(row.fanId) === fan &&
      normalizeP4pKey(row.fixtureName) === fixture &&
      row.windowIndex === windowIndex
  );
}

export function recordP4pEngagement({
  fanId,
  clubName,
  fixtureName,
  windowIndex,
  categoryId,
  projectName,
  wallet,
  predictions,
  now = new Date(),
}: {
  fanId: string;
  clubName: string;
  fixtureName: string;
  windowIndex: number;
  categoryId: string;
  projectName?: string;
  wallet: GameTimeWallet | null;
  predictions: P4pPrediction[];
  now?: Date | string;
}): P4pEngagementResult {
  const category = p4pCategoryById(categoryId);
  if (!category) {
    return { ok: false, error: "Choose one of the eight Predict-For Planet events." };
  }
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
      error: "You can make only 1 Prediction in each 5-minute slot.",
    };
  }
  const at = asIso(now);
  let takenGbp = 0;
  let nextWallet = wallet;
  if (wallet) {
    if (wallet.slotIndex !== window.slotIndex) {
      return {
        ok: false,
        error: "This Game-Time Sponsor bought a different 30-minute slot.",
      };
    }
    const remaining = remainingGameTimeGbp(wallet);
    takenGbp = roundP4pGbp(Math.min(P4P_ENGAGEMENT_GBP, remaining));
    nextWallet = {
      ...wallet,
      allocatedGbp: roundP4pGbp(wallet.allocatedGbp + takenGbp),
      updatedAt: at,
    };
  }
  const prediction: P4pPrediction = {
    id: `${normalizeP4pKey(fanId)}:${normalizeP4pKey(fixtureName)}:${window.index}`,
    fanId,
    clubName,
    fixtureName,
    windowIndex: window.index,
    categoryId: category.id,
    projectName: chosenProject,
    engagementGbp: takenGbp,
    walletId: nextWallet?.id ?? null,
    at,
  };
  return { ok: true, prediction, wallet: nextWallet, takenGbp };
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
      roundP4pGbp((totals.get(name) ?? 0) + (Number(row.engagementGbp) || 0))
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
  return `Predict what is likely to happen in the next ${P4P_WINDOW_MINUTES}-minute slot. One prediction per slot. Every prediction is an Engagement and takes ${formatP4pGbp(P4P_ENGAGEMENT_GBP)} from the Game-Time Carbon Wallet into your chosen Climate Projects, until that wallet reads ${formatP4pGbp(0)}.`;
}

export function p4pHowItWorksPoints(): string[] {
  return [
    `One prediction per ${P4P_WINDOW_MINUTES}-minute slot — right or wrong, it is an Engagement`,
    `Each Engagement takes ${formatP4pGbp(P4P_ENGAGEMENT_GBP)} from the Game-Time Carbon Wallet`,
    `A Game-Time Sponsor buys a ${GAME_TIME_SLOT_MINUTES}-minute slot; the Game lasts ${GAME_TIME_DURATION_MINUTES} minutes`,
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
