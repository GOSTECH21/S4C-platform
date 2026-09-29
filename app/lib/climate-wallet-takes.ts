import {
  mergePlatformStats,
  type PlatformStats,
} from "./platform-stats";
import { roundGbp, totalAllocatedGbp, type ClimateWallet } from "./sponsor-wallet";

export const WALLET_TAKES_STORAGE = "s4p.platform.walletTakes";
export const WALLET_TAKE_EVENT = "s4p-climate-funding-take";

export type ClimateWalletTake = {
  amountGbp: number;
  projectName: string;
  brandName: string;
  clubName: string;
  at: string;
};

export function listLocalWalletTakes(): ClimateWalletTake[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(WALLET_TAKES_STORAGE);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ClimateWalletTake[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordLocalWalletTake(
  take: Omit<ClimateWalletTake, "at"> & { at?: string }
): ClimateWalletTake {
  const row: ClimateWalletTake = {
    amountGbp: roundGbp(take.amountGbp),
    projectName: take.projectName,
    brandName: take.brandName,
    clubName: take.clubName,
    at: take.at || new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    const next = [...listLocalWalletTakes(), row];
    window.localStorage.setItem(WALLET_TAKES_STORAGE, JSON.stringify(next));
    window.dispatchEvent(
      new CustomEvent(WALLET_TAKE_EVENT, { detail: { amountGbp: row.amountGbp } })
    );
  }
  return row;
}

export function sumWalletTakesGbp(
  takes: Array<{ amountGbp?: number | null }>
): number {
  return roundGbp(
    takes.reduce((sum, take) => sum + Math.max(0, Number(take.amountGbp) || 0), 0)
  );
}

export function localWalletTakesGbp(
  wallets: Array<Pick<ClimateWallet, "allocatedGbp">> = []
): number {
  return roundGbp(
    Math.max(totalAllocatedGbp(wallets), sumWalletTakesGbp(listLocalWalletTakes()))
  );
}

/** Cash actually taken from Carbon Wallets into Climate Projects. */
export function fundingMobilisedFromTakes(
  serverTakesGbp: number,
  localTakesGbp: number
) {
  return roundGbp(
    Math.max(Number(serverTakesGbp) || 0, roundGbp(localTakesGbp))
  );
}

/** Homepage bar is wallet-to-project takes only — never signed-offer totals. */
export function withWalletTakes(
  stats: PlatformStats,
  localTakesGbp: number
): PlatformStats {
  const takes = fundingMobilisedFromTakes(
    Number(stats.walletTakesGbp) || 0,
    localTakesGbp
  );
  return mergePlatformStats({
    ...stats,
    fundingMobilisedGbp: takes,
    walletTakesGbp: takes,
  });
}
