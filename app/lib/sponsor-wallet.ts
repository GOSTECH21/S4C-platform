/** Climate Sponsorship Wallets: fans take cash from a sponsor and put it on a project. */

import {
  LEAD_FEATURED_SHARE,
  isFeaturedGssName,
  localFromList,
} from "./featured-gss";

/** Standard amount taken from any Carbon Wallet when a fan presses FUND-IT. */
export const DEFAULT_WALLET_VOTE_GBP = 0.2;
/** Lead and Local Business Climate Sponsors use the same FUND-IT amount. */
export const LEAD_WALLET_VOTE_GBP = DEFAULT_WALLET_VOTE_GBP;
export const FUND_IT_LABEL = "FUND-IT";
/** Once per Carbon Wallet; typically five wallets on a Match Day. */
export const FUND_IT_MAX_TIMES = 5;
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

export type WalletVoteShare = {
  project: NumberedClimateProject;
  amount: number;
};

export type WalletVoteSuccess = {
  ok: true;
  amount: number;
  wallet: ClimateWallet;
  project: NumberedClimateProject;
  projects: NumberedClimateProject[];
  shares?: WalletVoteShare[];
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

/** Local Carbon Wallets cannot exceed the submitted Match sponsorship. */
export function capLocalWalletSponsorship(
  wallet: ClimateWallet,
  agreedGbp: number,
  now: Date | string = new Date()
): ClimateWallet {
  if (wallet.kind !== "local") return wallet;
  const agreed = roundGbp(Math.max(0, Number(agreedGbp) || 0));
  if (!(agreed > 0)) return wallet;
  if (roundGbp(localSpendableGbp(wallet)) <= agreed) return wallet;
  const fees = localWalletTopUp(agreed);
  return {
    ...wallet,
    kind: "local",
    sponsorshipGbp: fees.sponsorshipGbp,
    managementFeeGbp: fees.managementFeeGbp,
    paidGbp: fees.paidGbp,
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
      error: "Select a Climate Project from the drop-down next to the wallet.",
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
  if (wallet.kind === "local" && isFeaturedGssName(project.name)) {
    return {
      ok: false,
      error:
        "Local Business Climate Sponsors fund local Climate Projects only. Select a local Climate Project from the drop-down.",
    };
  }
  if (wallet.kind === "lead") {
    return allocateLeadWalletVote({
      wallet,
      projects,
      chosen: project,
      voteGbp,
      now,
    });
  }
  const nextProject = creditProject(project, voteGbp);
  return {
    ok: true,
    amount: voteGbp,
    wallet: debitWallet(wallet, voteGbp, now),
    project: nextProject,
    projects: replaceProject(projects, nextProject),
    shares: [{ project: nextProject, amount: voteGbp }],
  };
}

function allocateLeadWalletVote({
  wallet,
  projects,
  chosen,
  voteGbp,
  now,
}: {
  wallet: ClimateWallet;
  projects: NumberedClimateProject[];
  chosen: NumberedClimateProject;
  voteGbp: number;
  now: Date | string;
}): WalletVoteResult {
  if (!isFeaturedGssName(chosen.name)) {
    return {
      ok: false,
      error:
        "Lead Climate Sponsors fund Global Schools Solar. Select a local school near the stadium or a school anywhere in the world.",
    };
  }
  const featuredGbp = roundGbp(voteGbp * LEAD_FEATURED_SHARE);
  const localGbp = roundGbp(voteGbp - featuredGbp);
  const locals = localFromList(projects);
  const featuredNext = creditProject(chosen, featuredGbp);
  const localShares = splitAcrossProjects(locals, localGbp);
  const credited = new Map<string, NumberedClimateProject>([
    [featuredNext.id, featuredNext],
    ...localShares.map((share) => [share.project.id, share.project] as const),
  ]);
  const nextProjects = projects.map((row) => credited.get(row.id) ?? row);
  return {
    ok: true,
    amount: voteGbp,
    wallet: debitWallet(wallet, voteGbp, now),
    project: featuredNext,
    projects: nextProjects,
    shares: [
      { project: featuredNext, amount: featuredGbp },
      ...localShares,
    ],
  };
}

function splitAcrossProjects(
  projects: NumberedClimateProject[],
  amountGbp: number
): WalletVoteShare[] {
  const total = roundGbp(amountGbp);
  if (!(total > 0) || projects.length === 0) return [];
  const each = roundGbp(total / projects.length);
  let spent = 0;
  return projects.map((project, index) => {
    const amount =
      index === projects.length - 1 ? roundGbp(total - spent) : each;
    spent = roundGbp(spent + amount);
    return { project: creditProject(project, amount), amount };
  });
}

function creditProject(
  project: NumberedClimateProject,
  amountGbp: number
): NumberedClimateProject {
  const amount = roundGbp(amountGbp);
  return {
    ...project,
    fundedGbp: roundGbp(Math.max(0, Number(project.fundedGbp) || 0) + amount),
    votesReceived:
      Math.max(0, Math.round(Number(project.votesReceived) || 0)) +
      (amount > 0 ? 1 : 0),
  };
}

function debitWallet(
  wallet: ClimateWallet,
  amountGbp: number,
  now: Date | string
): ClimateWallet {
  return {
    ...wallet,
    allocatedGbp: roundGbp(
      Math.max(0, Number(wallet.allocatedGbp) || 0) + roundGbp(amountGbp)
    ),
    updatedAt: asIso(now),
  };
}

function replaceProject(
  projects: NumberedClimateProject[],
  nextProject: NumberedClimateProject
): NumberedClimateProject[] {
  return projects.map((row) =>
    row.number === nextProject.number || row.id === nextProject.id
      ? nextProject
      : row
  );
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

export function fundItTimesCopy(): string {
  return `You can ${FUND_IT_LABEL} up to ${FUND_IT_MAX_TIMES} times. Take ${formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)} once from each Carbon Wallet. Lead wallets fund Global Schools Solar; Local Business wallets fund local Climate Projects.`;
}

export function leadFundItCopy(): string {
  return `Select a Global Schools Solar version. ${formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)} comes from this Lead wallet: 75% to the school you pick, 25% split across local Climate Projects.`;
}

export function localFundItCopy(): string {
  return `Select a Climate Project from the drop-down next to that wallet. Press ${FUND_IT_LABEL}; ${formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)} goes from Wallet to Project. Local Business wallets fund local Climate Projects only.`;
}

export function fundItCopy(): string {
  return `Take ${formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)} once from each Carbon Wallet. Lead Climate Sponsor: ${leadFundItCopy()} Local Business Climate Sponsors: select a Climate Project from the drop-down next to that wallet; Press ${FUND_IT_LABEL}; ${formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)} goes from Wallet to Project.`;
}

export function walletVoteNotice(result: WalletVoteSuccess): string {
  const remaining = formatWalletGbp(remainingGbp(result.wallet));
  const shares = (result.shares ?? []).filter((share) => share.amount > 0);
  if (shares.length > 1) {
    const parts = shares
      .map(
        (share) =>
          `${formatWalletGbp(share.amount)} to ${share.project.name}`
      )
      .join("; ");
    return `${FUND_IT_LABEL} moved ${formatWalletGbp(result.amount)} from ${result.wallet.brandName}'s Carbon Wallet (${parts}). Carbon Wallet now ${remaining}.`;
  }
  return `${FUND_IT_LABEL} moved ${formatWalletGbp(result.amount)} from ${result.wallet.brandName}'s Carbon Wallet into ${result.project.name}. Carbon Wallet now ${remaining}.`;
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
