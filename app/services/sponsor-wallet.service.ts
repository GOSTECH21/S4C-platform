import { clubsMatch } from "../lib/sponsor-dashboard";
import {
  applyLeadCommitment,
  applyLocalTopUp,
  createLeadWallet,
  createLocalWallet,
  remainingGbp,
  walletIdFor,
  type ClimateWallet,
} from "../lib/sponsor-wallet";

const WALLET_STORAGE = "s4p.sponsor.wallets";

function readStore(): Record<string, ClimateWallet> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(WALLET_STORAGE);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, ClimateWallet>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, ClimateWallet>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WALLET_STORAGE, JSON.stringify(store));
}

export function listClimateWallets(): ClimateWallet[] {
  return Object.values(readStore());
}

export function listClimateWalletsForClub(clubName: string): ClimateWallet[] {
  return listClimateWallets().filter((wallet) =>
    clubsMatch(wallet.clubName, clubName)
  );
}

export function readClimateWallet(
  clubName: string,
  brandName: string
): ClimateWallet | null {
  const store = readStore();
  return store[walletIdFor(clubName, brandName)] ?? null;
}

export function writeClimateWallet(wallet: ClimateWallet): ClimateWallet {
  const store = readStore();
  store[wallet.id] = wallet;
  writeStore(store);
  return wallet;
}

export function ensureLocalWallet({
  clubName,
  brandName,
  sponsorshipGbp,
}: {
  clubName: string;
  brandName: string;
  sponsorshipGbp: number;
}): ClimateWallet {
  const existing = readClimateWallet(clubName, brandName);
  if (existing) {
    if (existing.kind === "local" && remainingGbp(existing) === 0 && existing.allocatedGbp === 0) {
      return writeClimateWallet(
        createLocalWallet({ clubName, brandName, sponsorshipGbp })
      );
    }
    return existing;
  }
  return writeClimateWallet(
    createLocalWallet({ clubName, brandName, sponsorshipGbp })
  );
}

export function ensureLeadWallet({
  clubName,
  brandName,
  commitmentFeeGbp,
  gbpPerGoal = 0,
  goalsScored = 0,
}: {
  clubName: string;
  brandName: string;
  commitmentFeeGbp: number;
  gbpPerGoal?: number;
  goalsScored?: number;
}): ClimateWallet {
  const existing = readClimateWallet(clubName, brandName);
  if (existing) {
    if (existing.kind !== "lead") return existing;
    if (existing.commitmentFeeGbp > 0) return existing;
    return writeClimateWallet(
      applyLeadCommitment(existing, { commitmentFeeGbp, gbpPerGoal, goalsScored })
    );
  }
  return writeClimateWallet(
    createLeadWallet({
      clubName,
      brandName,
      commitmentFeeGbp,
      gbpPerGoal,
      goalsScored,
    })
  );
}

export function topUpLocalClimateWallet({
  clubName,
  brandName,
  sponsorshipGbp,
}: {
  clubName: string;
  brandName: string;
  sponsorshipGbp: number;
}): ClimateWallet {
  const existing = readClimateWallet(clubName, brandName);
  if (!existing) {
    return writeClimateWallet(
      createLocalWallet({ clubName, brandName, sponsorshipGbp })
    );
  }
  return writeClimateWallet(applyLocalTopUp(existing, sponsorshipGbp));
}

export function depositLeadClimateWallet({
  clubName,
  brandName,
  commitmentFeeGbp,
  gbpPerGoal,
  goalsScored,
}: {
  clubName: string;
  brandName: string;
  commitmentFeeGbp: number;
  gbpPerGoal?: number;
  goalsScored?: number;
}): ClimateWallet {
  const existing = readClimateWallet(clubName, brandName);
  if (!existing) {
    return writeClimateWallet(
      createLeadWallet({
        clubName,
        brandName,
        commitmentFeeGbp,
        gbpPerGoal,
        goalsScored,
      })
    );
  }
  return writeClimateWallet(
    applyLeadCommitment(existing, { commitmentFeeGbp, gbpPerGoal, goalsScored })
  );
}
