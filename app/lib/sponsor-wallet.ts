/** Climate Sponsorship Wallets: fans take cash from a sponsor and put it on a project. */

/** Standard amount taken from any Carbon Wallet when a fan presses FUND-IT. */
export const DEFAULT_WALLET_VOTE_GBP = 0.2;
/** Lead and Local Business Climate Sponsors use the same FUND-IT amount. */
export const LEAD_WALLET_VOTE_GBP = DEFAULT_WALLET_VOTE_GBP;
export const FUND_IT_LABEL = "FUND-IT";
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
  /** Lead: agreed cap on Goals-scored Sponsorship Cash. */
  maximumSponsorshipGbp: number;
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

/** Match goals never reach this; leftover Maximum amounts were stored here. */
export const UNREALISTIC_GOALS_SCORED = 30;

export function liveGoalsScored(wallet: Pick<ClimateWallet, "goalsScored">): number {
  return Math.max(0, Math.round(Number(wallet.goalsScored) || 0));
}

export function leadSponsorshipFromGoalsGbp(wallet: Pick<
  ClimateWallet,
  "gbpPerGoal" | "goalsScored" | "maximumSponsorshipGbp"
>): number {
  const product = roundGbp(
    Math.max(0, Number(wallet.gbpPerGoal) || 0) * liveGoalsScored(wallet)
  );
  const maximum = roundGbp(
    Math.max(0, Number(wallet.maximumSponsorshipGbp) || 0)
  );
  if (maximum > 0) return roundGbp(Math.min(product, maximum));
  return product;
}

export function leadCarbonWalletGbp(wallet: Pick<
  ClimateWallet,
  "commitmentFeeGbp" | "gbpPerGoal" | "goalsScored" | "maximumSponsorshipGbp"
>): number {
  return roundGbp(
    Math.max(0, Number(wallet.commitmentFeeGbp) || 0) +
      leadSponsorshipFromGoalsGbp(wallet)
  );
}

export function leadSpendableGbp(wallet: Pick<
  ClimateWallet,
  "commitmentFeeGbp" | "gbpPerGoal" | "goalsScored" | "maximumSponsorshipGbp"
>): number {
  return leadCarbonWalletGbp(wallet);
}

export function formatLeadSponsorshipGbp(amount: number): string {
  const value = roundGbp(amount);
  if (value === 0) return "£0.0";
  return formatWalletGbp(value);
}

export function normalizeClimateWallet(wallet: ClimateWallet): ClimateWallet {
  let goalsScored = liveGoalsScored(wallet);
  let maximumSponsorshipGbp = roundGbp(
    Math.max(0, Number(wallet.maximumSponsorshipGbp) || 0)
  );
  if (
    wallet.kind === "lead" &&
    goalsScored > UNREALISTIC_GOALS_SCORED &&
    maximumSponsorshipGbp === 0
  ) {
    maximumSponsorshipGbp = roundGbp(goalsScored);
    goalsScored = 0;
  }
  return {
    ...wallet,
    goalsScored,
    maximumSponsorshipGbp,
  };
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

export function totalAllocatedGbp(
  wallets: Array<Pick<ClimateWallet, "allocatedGbp">>
): number {
  return roundGbp(
    wallets.reduce(
      (sum, wallet) => sum + Math.max(0, Number(wallet.allocatedGbp) || 0),
      0
    )
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
    maximumSponsorshipGbp: 0,
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
  maximumSponsorshipGbp = 0,
  now = new Date(),
}: {
  clubName: string;
  brandName: string;
  commitmentFeeGbp: number;
  gbpPerGoal?: number;
  goalsScored?: number;
  maximumSponsorshipGbp?: number;
  now?: Date | string;
}): ClimateWallet {
  return normalizeClimateWallet({
    id: walletIdFor(clubName, brandName),
    clubName,
    brandName,
    kind: "lead",
    commitmentFeeGbp: roundGbp(Math.max(0, Number(commitmentFeeGbp) || 0)),
    gbpPerGoal: roundGbp(Math.max(0, Number(gbpPerGoal) || 0)),
    goalsScored: Math.max(0, Math.round(Number(goalsScored) || 0)),
    maximumSponsorshipGbp: roundGbp(
      Math.max(0, Number(maximumSponsorshipGbp) || 0)
    ),
    sponsorshipGbp: 0,
    managementFeeGbp: 0,
    paidGbp: 0,
    allocatedGbp: 0,
    updatedAt: asIso(now),
  });
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
    maximumSponsorshipGbp,
    now = new Date(),
  }: {
    commitmentFeeGbp?: number;
    gbpPerGoal?: number;
    goalsScored?: number;
    maximumSponsorshipGbp?: number;
    now?: Date | string;
  }
): ClimateWallet {
  const current = normalizeClimateWallet(wallet);
  return normalizeClimateWallet({
    ...current,
    kind: "lead",
    commitmentFeeGbp:
      commitmentFeeGbp == null
        ? current.commitmentFeeGbp
        : roundGbp(Math.max(0, Number(commitmentFeeGbp) || 0)),
    gbpPerGoal:
      gbpPerGoal == null
        ? current.gbpPerGoal
        : roundGbp(Math.max(0, Number(gbpPerGoal) || 0)),
    goalsScored:
      goalsScored == null
        ? current.goalsScored
        : Math.max(0, Math.round(Number(goalsScored) || 0)),
    maximumSponsorshipGbp:
      maximumSponsorshipGbp == null
        ? current.maximumSponsorshipGbp
        : roundGbp(Math.max(0, Number(maximumSponsorshipGbp) || 0)),
    updatedAt: asIso(now),
  });
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

export function canPressFundIt({
  busy = false,
  fundingOpen = true,
  used = false,
  remainingGbp,
  projectNumber,
  projectCount,
}: {
  busy?: boolean;
  fundingOpen?: boolean;
  used?: boolean;
  remainingGbp: number;
  projectNumber: string | number | null | undefined;
  projectCount: number;
}): boolean {
  if (busy || !fundingOpen || used) return false;
  if (!(Number(remainingGbp) >= DEFAULT_WALLET_VOTE_GBP)) return false;
  return parseProjectNumber(projectNumber, projectCount) != null;
}

export function walletVoteAmount(
  _wallet?: Pick<ClimateWallet, "kind">
): number {
  return DEFAULT_WALLET_VOTE_GBP;
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
    return { ok: false, error: "Each FUND-IT must move cash from a sponsor wallet." };
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

/** Legacy split take: no longer shown in the fan UI. */
export function allocateSplitWalletVote({
  wallet,
  projects,
  amount,
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
  const voteGbp = roundGbp(
    Math.max(0, Number(amount ?? walletVoteAmount(wallet)) || 0)
  );
  const share = roundGbp(voteGbp / projects.length);
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

export function fundItCopy(): string {
  return `Choose a Climate Project Number; Insert it into the Checkbox next to any Climate Wallet; Press ${FUND_IT_LABEL}; ${formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)} goes from Wallet to Project`;
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
