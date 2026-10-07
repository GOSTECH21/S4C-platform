import { formatLongMatchDate } from "./s4p-climate-projects";
import {
  committedGbp,
  remainingGbp,
  normalizeKey,
  type ClimateWallet,
  type NumberedClimateProject,
  type SponsorWalletKind,
} from "./sponsor-wallet";
import { VOTING_PERIOD_DAYS, addDays, votingPhase, type VotingWindow } from "./voting-window";

export const MATCH_DAY_FOLDER_NAME = "Match-Day";

export type MatchDaySponsorRow = {
  brandName: string;
  kind: SponsorWalletKind;
  committedGbp: number;
  remainingGbp: number;
  commitmentFeeGbp?: number;
  gbpPerGoal?: number;
  managementFeeGbp?: number;
  paidGbp?: number;
};

export type MatchDaySponsorsFile = {
  fileName: string;
  matchDate: string;
  savedAt: string;
  sponsors: MatchDaySponsorRow[];
};

export type MatchDayProjectsFile = {
  fileName: string;
  matchDate: string;
  savedAt: string;
  projects: NumberedClimateProject[];
};

export type MatchDayFolder = {
  clubId: string;
  clubName: string;
  matchDate: string;
  sponsorsFile: MatchDaySponsorsFile | null;
  projectsFile: MatchDayProjectsFile | null;
  submittedAt: string | null;
};

export function matchDayFileDateLabel(value: Date | string): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    const [year, month, day] = value.trim().split("-").map(Number);
    return (
      formatLongMatchDate(new Date(Date.UTC(year, month - 1, day))) ?? value
    );
  }
  return formatLongMatchDate(value) ?? "";
}

export function sponsorsFileName(matchDate: Date | string): string {
  return `Sponsors File ${matchDayFileDateLabel(matchDate)}`;
}

export function climateProjectsFileName(matchDate: Date | string): string {
  return `Climate Projects File ${matchDayFileDateLabel(matchDate)}`;
}

export function emptyMatchDayFolder({
  clubId,
  clubName,
  matchDate,
}: {
  clubId: string;
  clubName: string;
  matchDate: string;
}): MatchDayFolder {
  return {
    clubId,
    clubName,
    matchDate,
    sponsorsFile: null,
    projectsFile: null,
    submittedAt: null,
  };
}

export function uniqueWalletsByBrand(
  wallets: ClimateWallet[],
  preferredClubName?: string,
  preferredLeadName?: string | null
): ClimateWallet[] {
  const byBrand = new Map<string, ClimateWallet>();
  for (const wallet of wallets) {
    const key = normalizeKey(wallet.brandName);
    if (!key) continue;
    const existing = byBrand.get(key);
    if (!existing || preferWallet(wallet, existing, preferredClubName)) {
      byBrand.set(key, wallet);
    }
  }
  return exclusiveLeadItems([...byBrand.values()], preferredLeadName);
}

export function uniqueSponsorRows(
  sponsors: MatchDaySponsorRow[],
  preferredLeadName?: string | null
): MatchDaySponsorRow[] {
  const byBrand = new Map<string, MatchDaySponsorRow>();
  for (const row of sponsors) {
    const key = normalizeKey(row.brandName);
    if (!key) continue;
    const existing = byBrand.get(key);
    if (!existing) {
      byBrand.set(key, { ...row });
      continue;
    }
    const takeCandidate =
      row.kind === "lead" && existing.kind !== "lead"
        ? true
        : row.kind === existing.kind &&
          (Number(row.committedGbp) || 0) > (Number(existing.committedGbp) || 0);
    if (takeCandidate) byBrand.set(key, { ...row });
  }
  return exclusiveLeadItems([...byBrand.values()], preferredLeadName);
}

/** Keep locals, but never more than one Lead Climate Sponsor. */
function exclusiveLeadItems<T extends { brandName: string; kind: string }>(
  items: T[],
  preferredLeadName?: string | null
): T[] {
  const leads = items.filter((row) => row.kind === "lead");
  if (leads.length <= 1) return items;
  const preferredKey = normalizeKey(preferredLeadName ?? "");
  const keeper =
    (preferredKey
      ? leads.find((row) => normalizeKey(row.brandName) === preferredKey)
      : null) ?? leads[0];
  const keeperKey = normalizeKey(keeper.brandName);
  return items.filter(
    (row) => row.kind !== "lead" || normalizeKey(row.brandName) === keeperKey
  );
}

function preferWallet(
  candidate: ClimateWallet,
  current: ClimateWallet,
  preferredClubName?: string
): boolean {
  if (preferredClubName) {
    const wanted = normalizeKey(preferredClubName);
    const candidateClub = normalizeKey(candidate.clubName) === wanted;
    const currentClub = normalizeKey(current.clubName) === wanted;
    if (candidateClub !== currentClub) return candidateClub;
  }
  if (candidate.kind !== current.kind) return candidate.kind === "lead";
  const candidateCash = committedGbp(candidate);
  const currentCash = committedGbp(current);
  if (candidateCash !== currentCash) return candidateCash > currentCash;
  return String(candidate.updatedAt) > String(current.updatedAt);
}

export function sponsorRowsFromWallets(
  wallets: ClimateWallet[],
  preferredClubName?: string,
  preferredLeadName?: string | null
): MatchDaySponsorRow[] {
  return uniqueWalletsByBrand(
    wallets,
    preferredClubName,
    preferredLeadName
  ).map((wallet) => ({
    brandName: wallet.brandName,
    kind: wallet.kind,
    committedGbp: committedGbp(wallet),
    remainingGbp: remainingGbp(wallet),
    commitmentFeeGbp: wallet.kind === "lead" ? wallet.commitmentFeeGbp : undefined,
    gbpPerGoal: wallet.kind === "lead" ? wallet.gbpPerGoal : undefined,
    managementFeeGbp:
      wallet.kind === "local" ? wallet.managementFeeGbp : undefined,
    paidGbp: wallet.kind === "local" ? wallet.paidGbp : undefined,
  }));
}

export function buildSponsorsFile({
  matchDate,
  sponsors,
  now = new Date(),
  preferredLeadName = null,
}: {
  matchDate: Date | string;
  sponsors: MatchDaySponsorRow[];
  now?: Date | string;
  preferredLeadName?: string | null;
}): MatchDaySponsorsFile {
  const iso = asIso(now);
  return {
    fileName: sponsorsFileName(matchDate),
    matchDate: dateKey(matchDate),
    savedAt: iso,
    sponsors: uniqueSponsorRows(sponsors, preferredLeadName),
  };
}

export function buildProjectsFile({
  matchDate,
  projects,
  now = new Date(),
}: {
  matchDate: Date | string;
  projects: NumberedClimateProject[];
  now?: Date | string;
}): MatchDayProjectsFile {
  return {
    fileName: climateProjectsFileName(matchDate),
    matchDate: dateKey(matchDate),
    savedAt: asIso(now),
    projects: projects.map((project, index) => ({
      ...project,
      number: project.number || index + 1,
    })),
  };
}

export function saveSponsorsIntoFolder(
  folder: MatchDayFolder,
  file: MatchDaySponsorsFile
): MatchDayFolder {
  return {
    ...folder,
    matchDate: file.matchDate,
    sponsorsFile: file,
    submittedAt: null,
  };
}

export function saveProjectsIntoFolder(
  folder: MatchDayFolder,
  file: MatchDayProjectsFile
): MatchDayFolder {
  return {
    ...folder,
    matchDate: file.matchDate,
    projectsFile: file,
    submittedAt: null,
  };
}

export function canSubmitMatchDayFolder(folder: MatchDayFolder): boolean {
  return Boolean(
    folder.sponsorsFile &&
      folder.sponsorsFile.sponsors.length > 0 &&
      folder.projectsFile &&
      folder.projectsFile.projects.length > 0
  );
}

export function submitMatchDayFolder(
  folder: MatchDayFolder,
  now: Date | string = new Date()
): MatchDayFolder {
  if (!canSubmitMatchDayFolder(folder)) {
    throw new Error(
      "Save the Sponsors File and the Climate Projects File in the Match-Day folder before pressing SUBMIT."
    );
  }
  return { ...folder, submittedAt: asIso(now) };
}

export function isMatchDayFolderVisible(
  folder: MatchDayFolder | null | undefined,
  now: Date | string = new Date()
) {
  if (!folder?.submittedAt || !folder.sponsorsFile || !folder.projectsFile) {
    return false;
  }
  const posted = new Date(folder.submittedAt);
  if (Number.isNaN(posted.getTime())) return false;
  const expires = addDays(posted, VOTING_PERIOD_DAYS);
  const current = now instanceof Date ? now : new Date(now);
  return current.getTime() <= expires.getTime();
}

export function fanFundingIsOpen({
  folder,
  votingWindow,
  now = new Date(),
}: {
  folder?: MatchDayFolder | null;
  votingWindow: VotingWindow;
  now?: Date | string;
}): boolean {
  if (isMatchDayFolderVisible(folder, now)) return true;
  // Once wallets are on My S4P, FUND-IT should not stay grey until
  // kick-off − 3 days. Only a closed vote keeps it off.
  return votingPhase(votingWindow, now) !== "closed";
}

export function applyFundingToProjectsFile(
  file: MatchDayProjectsFile,
  project: NumberedClimateProject
): MatchDayProjectsFile {
  return applyFundingListToProjectsFile(file, [project]);
}

export function applyFundingListToProjectsFile(
  file: MatchDayProjectsFile,
  projects: NumberedClimateProject[]
): MatchDayProjectsFile {
  const byId = new Map(projects.map((row) => [row.id, row]));
  const byNumber = new Map(projects.map((row) => [row.number, row]));
  return {
    ...file,
    projects: file.projects.map(
      (row) => byId.get(row.id) ?? byNumber.get(row.number) ?? row
    ),
  };
}

export function applyRemainingToSponsorsFile(
  file: MatchDaySponsorsFile,
  wallet: ClimateWallet
): MatchDaySponsorsFile {
  return {
    ...file,
    sponsors: file.sponsors.map((row) =>
      row.brandName.trim().toLowerCase() === wallet.brandName.trim().toLowerCase()
        ? {
            ...row,
            committedGbp: committedGbp(wallet),
            remainingGbp: remainingGbp(wallet),
            commitmentFeeGbp:
              wallet.kind === "lead" ? wallet.commitmentFeeGbp : row.commitmentFeeGbp,
            gbpPerGoal: wallet.kind === "lead" ? wallet.gbpPerGoal : row.gbpPerGoal,
            managementFeeGbp:
              wallet.kind === "local" ? wallet.managementFeeGbp : row.managementFeeGbp,
            paidGbp: wallet.kind === "local" ? wallet.paidGbp : row.paidGbp,
          }
        : row
    ),
  };
}

function dateKey(value: Date | string): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return value.trim();
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function asIso(value: Date | string): string {
  if (typeof value === "string" && value.includes("T")) return value;
  if (value instanceof Date) return value.toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}
