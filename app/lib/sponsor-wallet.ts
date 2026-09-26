/** Climate Sponsorship Wallets: fans take cash from a sponsor and put it on a project. */

/** Local Business Climate Sponsor: one Vote moves this amount to one project. */
export const DEFAULT_WALLET_VOTE_GBP = 0.1;
/** Lead Climate Project Sponsor: Checkbox 1 or Checkbox 2 moves this amount. */
export const LEAD_WALLET_VOTE_GBP = 0.5;
export const LOCAL_MANAGEMENT_FEE_RATE = 0.1;

export type SponsorWalletKind = "lead" | "local";

export type ClimateWallet = {
  id: string;
  clubName: string;
  brandName: string;
  kind: SponsorWalletKind;
  /** Lead: deposited on Day 1, well before kick-off. */
  commitmentFeeGbp: number;
  /** Lead: agreed amount payable for each goal the sponsored team scores. */
  gbpPerGoal: number;
  goalsScored: number;
  /** Local: spendable top-up (e.g. £750). */
  sponsorshipGbp: number;
  /** Local: 10% management fee paid on top of the spendable amount. */
  managementFeeGbp: number;
  /** Local: sponsorship + fee actually paid (e.g. £825). */
  paidGbp: number;
  allocatedGbp: number;
  updatedAt: string;
};

export type NumberedClimateProject = {
  id: string;
  name: string;
  number: number;
  fundedGbp: number;
  votesReceived: number;
};

export type WalletVoteSuccess = {
  ok: true;
  amount: number;
  wallet: ClimateWallet;
  project: NumberedClimateProject;
  projects: NumberedClimateProject[];
};

export type WalletVoteFailure = {
  ok: false;
  error: string;
};

export type WalletVoteResult = WalletVoteSuccess | WalletVoteFailure;

export function roundGbp(value: number): number {
  return Math.round((Number(value) || 0) * 100) / 100;
}

export function walletIdFor(clubName: string, brandName: string): string {
  return `${normalizeKey(clubName)}:${normalizeKey(brandName)}`;
}

export function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function localWalletTopUp(sponsorshipGbp: number): {
  sponsorshipGbp: number;
  managementFeeGbp: number;
  paidGbp: number;
} {
  const sponsorship = roundGbp(Math.max(0, Number(sponsorshipGbp) || 0));
  const managementFeeGbp = roundGbp(sponsorship * LOCAL_MANAGEMENT_FEE_RATE);
  return {
    sponsorshipGbp: sponsorship,
    managementFeeGbp,
    paidGbp: roundGbp(sponsorship + managementFeeGbp),
  };
}

export function leadSpendableGbp(wallet: Pick<
  ClimateWallet,
  "commitmentFeeGbp" | "gbpPerGoal" | "goalsScored"
>): number {
  return roundGbp(
    Math.max(0, Number(wallet.commitmentFeeGbp) || 0) +
      Math.max(0, Number(wallet.gbpPerGoal) || 0) *
        Math.max(0, Math.round(Number(wallet.goalsScored) || 0))
  );
}

export function localSpendableGbp(
  wallet: Pick<ClimateWallet, "sponsorshipGbp">
): number {
  return roundGbp(Math.max(0, Number(wallet.sponsorshipGbp) || 0));
}

export function spendableGbp(wallet: ClimateWallet): number {
  return wallet.kind === "lead"
    ? leadSpendableGbp(wallet)
    : localSpendableGbp(wallet);
}

export function remainingGbp(wallet: ClimateWallet): number {
  return roundGbp(
    Math.max(0, spendableGbp(wallet) - Math.max(0, Number(wallet.allocatedGbp) || 0))
  );
}

export function committedGbp(wallet: ClimateWallet): number {
  return spendableGbp(wallet);
}

export function createLocalWallet({
  clubName,
  brandName,
  sponsorshipGbp,
  now = new Date(),
}: {
  clubName: string;
  brandName: string;
  sponsorshipGbp: number;
  now?: Date | string;
}): ClimateWallet {
  const topUp = localWalletTopUp(sponsorshipGbp);
  return {
    id: walletIdFor(clubName, brandName),
    clubName,
    brandName,
    kind: "local",
    commitmentFeeGbp: 0,
    gbpPerGoal: 0,
    goalsScored: 0,
    sponsorshipGbp: topUp.sponsorshipGbp,
    managementFeeGbp: topUp.managementFeeGbp,
    paidGbp: topUp.paidGbp,
    allocatedGbp: 0,
    updatedAt: asIso(now),
  };
}

export function createLeadWallet({
  clubName,
  brandName,
  commitmentFeeGbp,
  gbpPerGoal = 0,
  goalsScored = 0,
  now = new Date(),
}: {
  clubName: string;
  brandName: string;
  commitmentFeeGbp: number;
  gbpPerGoal?: number;
  goalsScored?: number;
  now?: Date | string;
}): ClimateWallet {
  return {
    id: walletIdFor(clubName, brandName),
    clubName,
    brandName,
    kind: "lead",
    commitmentFeeGbp: roundGbp(Math.max(0, Number(commitmentFeeGbp) || 0)),
    gbpPerGoal: roundGbp(Math.max(0, Number(gbpPerGoal) || 0)),
    goalsScored: Math.max(0, Math.round(Number(goalsScored) || 0)),
    sponsorshipGbp: 0,
    managementFeeGbp: 0,
    paidGbp: 0,
    allocatedGbp: 0,
    updatedAt: asIso(now),
  };
}

export function applyLocalTopUp(
  wallet: ClimateWallet,
  extraSponsorshipGbp: number,
  now: Date | string = new Date()
): ClimateWallet {
  const extra = localWalletTopUp(extraSponsorshipGbp);
  return {
    ...wallet,
    kind: "local",
    sponsorshipGbp: roundGbp(localSpendableGbp(wallet) + extra.sponsorshipGbp),
    managementFeeGbp: roundGbp(
      Math.max(0, Number(wallet.managementFeeGbp) || 0) + extra.managementFeeGbp
    ),
    paidGbp: roundGbp(Math.max(0, Number(wallet.paidGbp) || 0) + extra.paidGbp),
    updatedAt: asIso(now),
  };
}

export function applyLeadCommitment(
  wallet: ClimateWallet,
  {
    commitmentFeeGbp,
    gbpPerGoal,
    goalsScored,
    now = new Date(),
  }: {
    commitmentFeeGbp?: number;
    gbpPerGoal?: number;
    goalsScored?: number;
    now?: Date | string;
  }
): ClimateWallet {
  return {
    ...wallet,
    kind: "lead",
    commitmentFeeGbp:
      commitmentFeeGbp == null
        ? wallet.commitmentFeeGbp
        : roundGbp(Math.max(0, Number(commitmentFeeGbp) || 0)),
    gbpPerGoal:
      gbpPerGoal == null
        ? wallet.gbpPerGoal
        : roundGbp(Math.max(0, Number(gbpPerGoal) || 0)),
    goalsScored:
      goalsScored == null
        ? wallet.goalsScored
        : Math.max(0, Math.round(Number(goalsScored) || 0)),
    updatedAt: asIso(now),
  };
}

export function parseProjectNumber(
  value: string | number | null | undefined,
  projectCount: number
): number | null {
  const number = typeof value === "number" ? value : Number(String(value ?? "").trim());
  if (!Number.isInteger(number)) return null;
  if (number < 1 || number > projectCount) return null;
  return number;
}

export function walletVoteAmount(wallet: Pick<ClimateWallet, "kind">): number {
  return wallet.kind === "lead" ? LEAD_WALLET_VOTE_GBP : DEFAULT_WALLET_VOTE_GBP;
}

export function allocateWalletVote({
  wallet,
  projects,
  projectNumber,
  amount,
  now = new Date(),
}: {
  wallet: ClimateWallet;
  projects: NumberedClimateProject[];
  projectNumber: number;
  amount?: number;
  now?: Date | string;
}): WalletVoteResult {
  const voteGbp = roundGbp(
    Math.max(0, Number(amount ?? walletVoteAmount(wallet)) || 0)
  );
  if (!(voteGbp > 0)) {
    return { ok: false, error: "Each vote must move cash from a sponsor wallet." };
  }
  const number = parseProjectNumber(projectNumber, projects.length);
  if (number == null) {
    return {
      ok: false,
      error: `Insert a project number from 1 to ${projects.length || 5} next to the wallet.`,
    };
  }
  const left = remainingGbp(wallet);
  if (left < voteGbp) {
    return {
      ok: false,
      error: `${wallet.brandName}'s wallet does not have ${formatWalletGbp(voteGbp)} remaining.`,
    };
  }
  const project = projects[number - 1];
  if (!project) {
    return {
      ok: false,
      error: `Project ${number} is not on this Match Day list.`,
    };
  }
  const nextProject = {
    ...project,
    fundedGbp: roundGbp(Math.max(0, Number(project.fundedGbp) || 0) + voteGbp),
    votesReceived: Math.max(0, Math.round(Number(project.votesReceived) || 0)) + 1,
  };
  return {
    ok: true,
    amount: voteGbp,
    wallet: {
      ...wallet,
      allocatedGbp: roundGbp(Math.max(0, Number(wallet.allocatedGbp) || 0) + voteGbp),
      updatedAt: asIso(now),
    },
    project: nextProject,
    projects: projects.map((row) =>
      row.number === nextProject.number ? nextProject : row
    ),
  };
}

/** Checkbox 2: take the lead Vote amount and share it equally across every project. */
export function allocateSplitWalletVote({
  wallet,
  projects,
  amount = LEAD_WALLET_VOTE_GBP,
  now = new Date(),
}: {
  wallet: ClimateWallet;
  projects: NumberedClimateProject[];
  amount?: number;
  now?: Date | string;
}): WalletVoteResult {
  if (projects.length === 0) {
    return { ok: false, error: "No Climate Projects are posted for this Match Day." };
  }
  const share = roundGbp(Math.max(0, Number(amount) || 0) / projects.length);
  const total = roundGbp(share * projects.length);
  if (!(total > 0)) {
    return { ok: false, error: "Each vote must move cash from a Carbon Wallet." };
  }
  const left = remainingGbp(wallet);
  if (left < total) {
    return {
      ok: false,
      error: `${wallet.brandName}'s Carbon Wallet does not have ${formatWalletGbp(total)} remaining.`,
    };
  }
  const nextProjects = projects.map((project) => ({
    ...project,
    fundedGbp: roundGbp(Math.max(0, Number(project.fundedGbp) || 0) + share),
    votesReceived: Math.max(0, Math.round(Number(project.votesReceived) || 0)) + 1,
  }));
  return {
    ok: true,
    amount: total,
    wallet: {
      ...wallet,
      allocatedGbp: roundGbp(Math.max(0, Number(wallet.allocatedGbp) || 0) + total),
      updatedAt: asIso(now),
    },
    project: nextProjects[0],
    projects: nextProjects,
  };
}

export function formatWalletGbp(amount: number): string {
  const value = roundGbp(amount);
  const hasPence = Math.round(value * 100) % 100 !== 0;
  return `£${value.toLocaleString("en-GB", {
    minimumFractionDigits: hasPence ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

export function numberClimateProjects<T extends { id: string; name: string }>(
  projects: T[],
  funding: Record<string, { fundedGbp?: number; votesReceived?: number }> = {}
): NumberedClimateProject[] {
  return projects.map((project, index) => ({
    id: project.id,
    name: project.name,
    number: index + 1,
    fundedGbp: roundGbp(funding[project.id]?.fundedGbp ?? 0),
    votesReceived: Math.max(0, Math.round(funding[project.id]?.votesReceived ?? 0)),
  }));
}

function asIso(value: Date | string): string {
  if (typeof value === "string") return value;
  return value.toISOString();
}
