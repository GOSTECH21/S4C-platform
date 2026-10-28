import {
  P4P_WINDOWS_PER_SLOT,
  createGameTimeWallet,
  gameTimeWalletId,
  recordP4pEngagement,
  type GameTimeWallet,
  type P4pEngagementResult,
  type P4pPrediction,
} from "@/app/lib/predict-for-planet";

export const GAME_TIME_WALLETS_STORAGE = "s4p.game-time.wallets";
export const P4P_PREDICTIONS_STORAGE = "s4p.p4p.predictions";

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
}): GameTimeWallet {
  const id = gameTimeWalletId(input);
  const existing = listGameTimeWallets().find((row) => row.id === id);
  const next = createGameTimeWallet({
    ...input,
    sponsorshipGbp:
      (existing ? Number(existing.sponsorshipGbp) || 0 : 0) +
      Math.max(0, Number(input.sponsorshipGbp) || 0),
    kickoffAt: input.kickoffAt || existing?.kickoffAt,
  });
  if (existing) {
    next.allocatedGbp = existing.allocatedGbp;
  }
  return saveGameTimeWallet(next);
}

export function gameTimeWalletForSlot(input: {
  clubName: string;
  fixtureName: string;
  slotIndex: number;
}): GameTimeWallet | null {
  const slot = Math.round(Number(input.slotIndex) || 0);
  return (
    listGameTimeWallets().find(
      (row) =>
        row.clubName.toLowerCase() === input.clubName.toLowerCase() &&
        row.fixtureName.toLowerCase() === input.fixtureName.toLowerCase() &&
        row.slotIndex === slot
    ) ?? null
  );
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
