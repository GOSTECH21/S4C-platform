/* s4p-predict-for-planet-v4 */
import {
  P4P_WINDOWS_PER_SLOT,
  awardP4pAccuracy,
  createGameTimeWallet,
  gameTimeFixtureMatches,
  gameTimeWalletId,
  gameTimeWalletMatchesMatch,
  isPaidGameTimeWallet,
  p4pCategoryById,
  pickSponsoredGameTimeMatch,
  recordP4pEngagement,
  remainingGameTimeGbp,
  type GameTimeCheckout,
  type GameTimeWallet,
  type P4pCategoryId,
  type P4pEngagementResult,
  type P4pPrediction,
  type P4pSlotEvent,
  type SponsoredGameTimeMatch,
} from "@/app/lib/predict-for-planet";

export const GAME_TIME_WALLETS_STORAGE = "s4p.game-time.wallets";
export const P4P_PREDICTIONS_STORAGE = "s4p.p4p.predictions";
export const P4P_SLOT_EVENTS_STORAGE = "s4p.p4p.slot-events";
export const GAME_TIME_CHECKOUT_STORAGE = "s4p.game-time.checkout";
export const GAME_TIME_PAYMENTS_STORAGE = "s4p.game-time.payments";
export const SPONSOR_PROFILE_STORAGE = "s4p.sponsor.profile";
const SPONSOR_SESSION_TIMEOUT_MS = 2500;

export function readLocalSponsorBrandName(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = window.localStorage.getItem(SPONSOR_PROFILE_STORAGE);
    const parsed = raw
      ? (JSON.parse(raw) as { companyName?: string })
      : null;
    return String(parsed?.companyName ?? "").trim();
  } catch {
    return "";
  }
}

export async function resolveGameTimeSponsorBrand(
  fetchSponsor: () => Promise<{ name?: string | null }>
): Promise<string> {
  try {
    const sponsor = await Promise.race([
      fetchSponsor(),
      new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error("Sponsor session timed out.")),
          SPONSOR_SESSION_TIMEOUT_MS
        );
      }),
    ]);
    return String(sponsor.name ?? "").trim() || readLocalSponsorBrandName();
  } catch {
    return readLocalSponsorBrandName();
  }
}

function readJson<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as T[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeJson<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function listGameTimeWallets(): GameTimeWallet[] {
  return readJson<GameTimeWallet>(GAME_TIME_WALLETS_STORAGE);
}

export function saveGameTimeWallet(wallet: GameTimeWallet): GameTimeWallet {
  const rows = listGameTimeWallets().filter((row) => row.id !== wallet.id);
  writeJson(GAME_TIME_WALLETS_STORAGE, [...rows, wallet]);
  return wallet;
}

export function depositGameTimeSponsorship(input: {
  clubName: string;
  brandName: string;
  fixtureName: string;
  slotIndex: number;
  sponsorshipGbp: number;
  kickoffAt?: string;
  paidAt?: string | null;
}): GameTimeWallet {
  const id = gameTimeWalletId(input);
  const existing = listGameTimeWallets().find((row) => row.id === id);
  const paidAt =
    input.paidAt !== undefined
      ? input.paidAt
      : existing?.paidAt ?? new Date().toISOString();
  const alreadyPaid = Boolean(existing?.paidAt);
  const incoming = Math.max(0, Number(input.sponsorshipGbp) || 0);
  const sponsorshipGbp =
    existing && !alreadyPaid && paidAt
      ? incoming || Number(existing.sponsorshipGbp) || 0
      : (existing ? Number(existing.sponsorshipGbp) || 0 : 0) + incoming;
  const next = createGameTimeWallet({
    ...input,
    sponsorshipGbp,
    kickoffAt: input.kickoffAt || existing?.kickoffAt,
    paidAt,
  });
  if (existing) {
    next.allocatedGbp = existing.allocatedGbp;
  }
  return saveGameTimeWallet(next);
}

export function saveGameTimeCheckout(checkout: GameTimeCheckout): GameTimeCheckout {
  if (typeof window === "undefined") return checkout;
  window.localStorage.setItem(GAME_TIME_CHECKOUT_STORAGE, JSON.stringify(checkout));
  return checkout;
}

export function readGameTimeCheckout(): GameTimeCheckout | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(GAME_TIME_CHECKOUT_STORAGE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameTimeCheckout;
    if (!parsed?.clubName || !parsed?.fixtureName || !parsed?.brandName) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearGameTimeCheckout() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(GAME_TIME_CHECKOUT_STORAGE);
}

export function confirmGameTimeCardPayment(
  checkout: GameTimeCheckout
): GameTimeWallet {
  const paidAt = new Date().toISOString();
  const wallet = depositGameTimeSponsorship({
    ...checkout,
    paidAt,
  });
  const payments = readJson<{
    walletId: string;
    paidAt: string;
    sponsorshipGbp: number;
  }>(GAME_TIME_PAYMENTS_STORAGE);
  writeJson(GAME_TIME_PAYMENTS_STORAGE, [
    ...payments,
    {
      walletId: wallet.id,
      paidAt,
      sponsorshipGbp: wallet.sponsorshipGbp,
    },
  ]);
  clearGameTimeCheckout();
  return wallet;
}

export function gameTimeWalletForSlot(input: {
  clubName: string;
  fixtureName: string;
  slotIndex: number;
}): GameTimeWallet | null {
  const slot = Math.round(Number(input.slotIndex) || 0);
  const matches = listGameTimeWallets().filter(
    (row) =>
      isPaidGameTimeWallet(row) &&
      gameTimeWalletMatchesMatch(row, input.clubName, input.fixtureName) &&
      row.slotIndex === slot
  );
  if (matches.length === 0) return null;
  return [...matches].sort(
    (left, right) => remainingGameTimeGbp(right) - remainingGameTimeGbp(left)
  )[0];
}

export function sponsoredP4pMatchForFan(
  preferredClubNames: string[] = []
): SponsoredGameTimeMatch | null {
  return pickSponsoredGameTimeMatch(listGameTimeWallets(), preferredClubNames);
}

export function listP4pPredictions(): P4pPrediction[] {
  return readJson<P4pPrediction>(P4P_PREDICTIONS_STORAGE);
}

export function submitP4pPrediction(input: {
  fanId: string;
  clubName: string;
  fixtureName: string;
  windowIndex: number;
  categoryId: string;
  projectName: string;
}): P4pEngagementResult {
  const predictions = listP4pPredictions();
  const windowIndex = Math.round(Number(input.windowIndex) || 0);
  const slotIndex = Math.floor(windowIndex / P4P_WINDOWS_PER_SLOT);
  const slotWallet = gameTimeWalletForSlot({
    clubName: input.clubName,
    fixtureName: input.fixtureName,
    slotIndex,
  });
  const result = recordP4pEngagement({
    ...input,
    windowIndex,
    wallet: slotWallet,
    predictions,
  });
  if (!result.ok) return result;
  let prediction = result.prediction;
  let wallet = result.wallet;
  let takenGbp = result.takenGbp;
  if (
    slotEventAwarded(
      listP4pSlotEvents(),
      input.fixtureName,
      windowIndex,
      prediction.categoryId
    )
  ) {
    const settled = awardP4pAccuracy({
      prediction,
      wallet,
      categoryId: prediction.categoryId,
    });
    prediction = settled.prediction;
    wallet = settled.wallet;
    takenGbp += settled.takenGbp;
  }
  writeJson(P4P_PREDICTIONS_STORAGE, [...predictions, prediction]);
  if (wallet) saveGameTimeWallet(wallet);
  return { ok: true, prediction, wallet, takenGbp };
}

export function listP4pSlotEvents(): P4pSlotEvent[] {
  return readJson<P4pSlotEvent>(P4P_SLOT_EVENTS_STORAGE);
}

export function awardP4pSlotEvent(input: {
  clubName: string;
  fixtureName: string;
  windowIndex: number;
  categoryId: string;
}): {
  ok: true;
  wallet: GameTimeWallet | null;
  predictions: P4pPrediction[];
  takenGbp: number;
  awardedCount: number;
} | { ok: false; error: string } {
  const category = p4pCategoryById(input.categoryId);
  if (!category) {
    return { ok: false, error: "Choose one of the seven Predict-For Planet events." };
  }
  const windowIndex = Math.round(Number(input.windowIndex) || 0);
  const events = listP4pSlotEvents();
  const already = events.some(
    (row) =>
      gameTimeFixtureMatches(row.fixtureName, input.fixtureName) &&
      row.windowIndex === windowIndex &&
      row.categoryId === category.id
  );
  if (!already) {
    writeJson(P4P_SLOT_EVENTS_STORAGE, [
      ...events,
      {
        fixtureName: input.fixtureName,
        windowIndex,
        categoryId: category.id,
        at: new Date().toISOString(),
      },
    ]);
  }
  const slotIndex = Math.floor(windowIndex / P4P_WINDOWS_PER_SLOT);
  let wallet = gameTimeWalletForSlot({
    clubName: input.clubName,
    fixtureName: input.fixtureName,
    slotIndex,
  });
  const predictions = listP4pPredictions();
  let takenGbp = 0;
  let awardedCount = 0;
  const nextPredictions = predictions.map((row) => {
    if (
      !gameTimeFixtureMatches(row.fixtureName, input.fixtureName) ||
      row.windowIndex !== windowIndex
    ) {
      return row;
    }
    const settled = awardP4pAccuracy({
      prediction: row,
      wallet,
      categoryId: category.id,
    });
    if (settled.takenGbp > 0) {
      takenGbp += settled.takenGbp;
      awardedCount += 1;
      wallet = settled.wallet;
    } else if (settled.prediction.correct === true && row.correct !== true) {
      awardedCount += 1;
    }
    return settled.prediction;
  });
  writeJson(P4P_PREDICTIONS_STORAGE, nextPredictions);
  if (wallet) saveGameTimeWallet(wallet);
  return {
    ok: true,
    wallet,
    predictions: nextPredictions,
    takenGbp,
    awardedCount,
  };
}

export function slotEventAwarded(
  events: P4pSlotEvent[],
  fixtureName: string,
  windowIndex: number,
  categoryId: P4pCategoryId
): boolean {
  return events.some(
    (row) =>
      gameTimeFixtureMatches(row.fixtureName, fixtureName) &&
      row.windowIndex === windowIndex &&
      row.categoryId === categoryId
  );
}
