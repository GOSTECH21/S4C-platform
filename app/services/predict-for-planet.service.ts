import {
  P4P_WINDOWS_PER_SLOT,
  createGameTimeWallet,
  gameTimeWalletId,
  gameTimeWalletMatchesMatch,
  isPaidGameTimeWallet,
  pickSponsoredGameTimeMatch,
  recordP4pEngagement,
  remainingGameTimeGbp,
  type GameTimeCheckout,
  type GameTimeWallet,
  type P4pEngagementResult,
  type P4pPrediction,
  type SponsoredGameTimeMatch,
} from "@/app/lib/predict-for-planet";

export const GAME_TIME_WALLETS_STORAGE = "s4p.game-time.wallets";
export const P4P_PREDICTIONS_STORAGE = "s4p.p4p.predictions";
export const GAME_TIME_CHECKOUT_STORAGE = "s4p.game-time.checkout";
export const GAME_TIME_PAYMENTS_STORAGE = "s4p.game-time.payments";

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
  const wallet = gameTimeWalletForSlot({
    clubName: input.clubName,
    fixtureName: input.fixtureName,
    slotIndex,
  });
  const result = recordP4pEngagement({
    ...input,
    windowIndex,
    wallet,
    predictions,
  });
  if (!result.ok) return result;
  writeJson(P4P_PREDICTIONS_STORAGE, [...predictions, result.prediction]);
  if (result.wallet) saveGameTimeWallet(result.wallet);
  return result;
}
