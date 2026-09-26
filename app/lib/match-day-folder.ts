import { formatLongMatchDate } from "./s4p-climate-projects";
import {
  committedGbp,
  remainingGbp,
  type ClimateWallet,
  type NumberedClimateProject,
  type SponsorWalletKind,
} from "./sponsor-wallet";

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

export function sponsorRowsFromWallets(
  wallets: ClimateWallet[]
): MatchDaySponsorRow[] {
  return wallets.map((wallet) => ({
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
}: {
  matchDate: Date | string;
  sponsors: MatchDaySponsorRow[];
  now?: Date | string;
}): MatchDaySponsorsFile {
  const iso = asIso(now);
  return {
    fileName: sponsorsFileName(matchDate),
    matchDate: dateKey(matchDate),
    savedAt: iso,
    sponsors: sponsors.map((row) => ({ ...row })),
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

export function isMatchDayFolderVisible(folder: MatchDayFolder | null | undefined) {
  return Boolean(folder?.submittedAt && folder.sponsorsFile && folder.projectsFile);
}

export function applyFundingToProjectsFile(
  file: MatchDayProjectsFile,
  project: NumberedClimateProject
): MatchDayProjectsFile {
  return {
    ...file,
    projects: file.projects.map((row) =>
      row.id === project.id || row.number === project.number ? project : row
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
