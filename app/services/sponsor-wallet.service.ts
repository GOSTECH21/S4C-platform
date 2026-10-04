import {
  applyLeadCommitment,
  applyLocalTopUp,
  capLocalWalletSponsorship,
  createLeadWallet,
  createLocalWallet,
  normalizeClimateWallet,
  remainingGbp,
  walletIdFor,
  type ClimateWallet,
} from "../lib/sponsor-wallet";
import { clubsMatch } from "../lib/sponsor-dashboard";
import {
  localSponsorsForClub,
  totalLocalPledge,
} from "../lib/local-sponsor";

const WALLET_STORAGE = "s4p.sponsor.wallets";

function readStore(): Record<string, ClimateWallet> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(WALLET_STORAGE);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, ClimateWallet>;
    if (!parsed || typeof parsed !== "object") return {};
    const next: Record<string, ClimateWallet> = {};
    let changed = false;
    for (const [id, wallet] of Object.entries(parsed)) {
      const normalized = normalizeClimateWallet(wallet);
      next[id] = normalized;
      if (
        normalized.goalsScored !== wallet.goalsScored ||
        normalized.maximumSponsorshipGbp !==
          (Number(wallet.maximumSponsorshipGbp) || 0)
      ) {
        changed = true;
      }
    }
    if (changed) writeStore(next);
    return next;
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
  const next = normalizeClimateWallet(wallet);
  store[next.id] = next;
  writeStore(store);
  return next;
}

function agreedLocalSponsorshipGbp(
  clubName: string,
  brandName: string
): number {
  const record = localSponsorsForClub(clubName).find(
    (row) =>
      row.brandName.trim().toLowerCase() === brandName.trim().toLowerCase()
  );
  return record ? totalLocalPledge(record) : 0;
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
  const agreed = agreedLocalSponsorshipGbp(clubName, brandName);
  const amount = agreed > 0 ? agreed : sponsorshipGbp;
  const existing = readClimateWallet(clubName, brandName);
  if (existing) {
    const capped = capLocalWalletSponsorship(existing, amount);
    if (capped.sponsorshipGbp !== existing.sponsorshipGbp) {
      return writeClimateWallet(capped);
    }
    if (existing.kind === "local" && remainingGbp(existing) === 0 && existing.allocatedGbp === 0) {
      return writeClimateWallet(
        createLocalWallet({ clubName, brandName, sponsorshipGbp: amount })
      );
    }
    return existing;
  }
  return writeClimateWallet(
    createLocalWallet({ clubName, brandName, sponsorshipGbp: amount })
  );
}

export function ensureLeadWallet({
  clubName,
  brandName,
  commitmentFeeGbp,
  gbpPerGoal = 0,
  goalsScored = 0,
  maximumSponsorshipGbp = 0,
}: {
  clubName: string;
  brandName: string;
  commitmentFeeGbp: number;
  gbpPerGoal?: number;
  goalsScored?: number;
  maximumSponsorshipGbp?: number;
}): ClimateWallet {
  const existing = readClimateWallet(clubName, brandName);
  if (existing) {
    if (existing.kind !== "lead") return existing;
    if (existing.commitmentFeeGbp > 0) return existing;
    return writeClimateWallet(
      applyLeadCommitment(existing, {
        commitmentFeeGbp,
        gbpPerGoal,
        goalsScored,
        maximumSponsorshipGbp,
      })
    );
  }
  return writeClimateWallet(
    createLeadWallet({
      clubName,
      brandName,
      commitmentFeeGbp,
      gbpPerGoal,
      goalsScored,
      maximumSponsorshipGbp,
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
  const next = !existing
    ? createLocalWallet({ clubName, brandName, sponsorshipGbp })
    : applyLocalTopUp(existing, sponsorshipGbp);
  const agreed = agreedLocalSponsorshipGbp(clubName, brandName);
  return writeClimateWallet(
    agreed > 0 ? capLocalWalletSponsorship(next, agreed) : next
  );
}

export function healLocalWalletsForClub(clubName: string): ClimateWallet[] {
  return listClimateWalletsForClub(clubName).map((wallet) => {
    if (wallet.kind !== "local") return wallet;
    const agreed = agreedLocalSponsorshipGbp(clubName, wallet.brandName);
    if (!(agreed > 0)) return wallet;
    const capped = capLocalWalletSponsorship(wallet, agreed);
    if (capped.sponsorshipGbp === wallet.sponsorshipGbp) return wallet;
    return writeClimateWallet(capped);
  });
}

export function creditLeadWalletsForSponsoredGoal({
  clubName,
  brandName,
  gbpPerGoal = 3000,
  commitmentFeeGbp = 3000,
}: {
  clubName: string;
  brandName: string;
  gbpPerGoal?: number;
  commitmentFeeGbp?: number;
}): ClimateWallet[] {
  const brand = String(brandName ?? "").trim();
  if (!brand) return [];
  const leads = listClimateWalletsForClub(clubName).filter(
    (wallet) =>
      wallet.kind === "lead" &&
      wallet.brandName.trim().toLowerCase() === brand.toLowerCase()
  );
  if (leads.length === 0) {
    return [
      writeClimateWallet(
        createLeadWallet({
          clubName,
          brandName: brand,
          commitmentFeeGbp,
          gbpPerGoal,
          goalsScored: 1,
        })
      ),
    ];
  }
  return leads.map((wallet) => {
    const current = normalizeClimateWallet(wallet);
    return writeClimateWallet(
      applyLeadCommitment(current, {
        gbpPerGoal: current.gbpPerGoal || gbpPerGoal,
        goalsScored: current.goalsScored + 1,
      })
    );
  });
}

export function depositLeadClimateWallet({
  clubName,
  brandName,
  commitmentFeeGbp,
  gbpPerGoal,
  maximumSponsorshipGbp,
}: {
  clubName: string;
  brandName: string;
  commitmentFeeGbp: number;
  gbpPerGoal?: number;
  maximumSponsorshipGbp?: number;
}): ClimateWallet {
  const existing = readClimateWallet(clubName, brandName);
  if (!existing) {
    return writeClimateWallet(
      createLeadWallet({
        clubName,
        brandName,
        commitmentFeeGbp,
        gbpPerGoal,
        maximumSponsorshipGbp,
      })
    );
  }
  return writeClimateWallet(
    applyLeadCommitment(existing, {
      commitmentFeeGbp,
      gbpPerGoal,
      maximumSponsorshipGbp,
    })
  );
}
