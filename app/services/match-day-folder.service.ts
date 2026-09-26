import { MATCH_DAY_PROJECT_COUNT } from "../lib/partner-projects";
import {
  applyFundingToProjectsFile,
  applyRemainingToSponsorsFile,
  buildProjectsFile,
  buildSponsorsFile,
  canSubmitMatchDayFolder,
  emptyMatchDayFolder,
  isMatchDayFolderVisible,
  saveProjectsIntoFolder,
  saveSponsorsIntoFolder,
  sponsorRowsFromWallets,
  submitMatchDayFolder as stampSubmitted,
  type MatchDayFolder,
} from "../lib/match-day-folder";
import {
  allocateWalletVote,
  numberClimateProjects,
  parseProjectNumber,
  remainingGbp,
  type ClimateWallet,
  type NumberedClimateProject,
  type WalletVoteResult,
} from "../lib/sponsor-wallet";
import { clubsMatch } from "../lib/sponsor-dashboard";
import { liveLeadAndLocals } from "./match-day-branding.service";
import {
  ensureLeadWallet,
  ensureLocalWallet,
  listClimateWalletsForClub,
  writeClimateWallet,
} from "./sponsor-wallet.service";

const FOLDER_STORAGE_PREFIX = "s4p.sd.matchDayFolder.";

export function readMatchDayFolder(clubId: string): MatchDayFolder | null {
  if (!clubId || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(FOLDER_STORAGE_PREFIX + clubId);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MatchDayFolder;
    if (!parsed?.clubId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeMatchDayFolder(folder: MatchDayFolder): MatchDayFolder {
  if (typeof window === "undefined") return folder;
  window.localStorage.setItem(
    FOLDER_STORAGE_PREFIX + folder.clubId,
    JSON.stringify(folder)
  );
  return folder;
}

export function listVisibleMatchDayFolders(): MatchDayFolder[] {
  if (typeof window === "undefined") return [];
  const rows: MatchDayFolder[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith(FOLDER_STORAGE_PREFIX)) continue;
    try {
      const parsed = JSON.parse(
        window.localStorage.getItem(key) ?? ""
      ) as MatchDayFolder;
      if (isMatchDayFolderVisible(parsed)) rows.push(parsed);
    } catch {
      // Skip a malformed folder and keep reading.
    }
  }
  return rows;
}

export function visibleMatchDayFolderForClub({
  clubId,
  clubName,
}: {
  clubId?: string | null;
  clubName?: string | null;
}): MatchDayFolder | null {
  const byId = clubId ? readMatchDayFolder(clubId) : null;
  if (isMatchDayFolderVisible(byId)) return byId;
  return (
    listVisibleMatchDayFolders().find(
      (folder) =>
        (clubId && folder.clubId === clubId) ||
        (clubName && clubsMatch(folder.clubName, clubName))
    ) ?? null
  );
}

export function identifyClubSponsorWallets({
  clubId,
  clubName,
  minAmount = 0,
  gbpPerGoal = 0,
}: {
  clubId: string;
  clubName: string;
  minAmount?: number | null;
  gbpPerGoal?: number | null;
}): ClimateWallet[] {
  const branding = liveLeadAndLocals(clubId, clubName);
  const wallets: ClimateWallet[] = [];
  if (branding.leadName) {
    wallets.push(
      ensureLeadWallet({
        clubName,
        brandName: branding.leadName,
        commitmentFeeGbp: Number(minAmount) > 0 ? Number(minAmount) : 1000,
        gbpPerGoal: Number(gbpPerGoal) || 0,
      })
    );
  }
  for (const local of branding.locals) {
    wallets.push(
      ensureLocalWallet({
        clubName,
        brandName: local.brandName,
        sponsorshipGbp: local.pledgeGbp,
      })
    );
  }
  const seen = new Set(wallets.map((wallet) => wallet.id));
  for (const extra of listClimateWalletsForClub(clubName)) {
    if (seen.has(extra.id)) continue;
    wallets.push(extra);
    seen.add(extra.id);
  }
  return wallets;
}

export function folderOrCreate({
  clubId,
  clubName,
  matchDate,
}: {
  clubId: string;
  clubName: string;
  matchDate: string;
}): MatchDayFolder {
  return (
    readMatchDayFolder(clubId) ??
    emptyMatchDayFolder({ clubId, clubName, matchDate })
  );
}

export function saveClubSponsorsFile({
  clubId,
  clubName,
  matchDate,
  minAmount,
  gbpPerGoal,
}: {
  clubId: string;
  clubName: string;
  matchDate: string;
  minAmount?: number | null;
  gbpPerGoal?: number | null;
}): MatchDayFolder {
  const wallets = identifyClubSponsorWallets({
    clubId,
    clubName,
    minAmount,
    gbpPerGoal,
  });
  const folder = folderOrCreate({ clubId, clubName, matchDate });
  return writeMatchDayFolder(
    saveSponsorsIntoFolder(
      { ...folder, clubName, matchDate },
      buildSponsorsFile({
        matchDate,
        sponsors: sponsorRowsFromWallets(wallets),
      })
    )
  );
}

export function saveClubProjectsFile({
  clubId,
  clubName,
  matchDate,
  projects,
}: {
  clubId: string;
  clubName: string;
  matchDate: string;
  projects: Array<{ id: string; name: string }>;
}): MatchDayFolder {
  if (projects.length < MATCH_DAY_PROJECT_COUNT) {
    throw new Error(
      `Select ${MATCH_DAY_PROJECT_COUNT} Climate Projects before saving the Climate Projects File.`
    );
  }
  const existing = readMatchDayFolder(clubId);
  const funding = Object.fromEntries(
    (existing?.projectsFile?.projects ?? []).map((project) => [
      project.id,
      { fundedGbp: project.fundedGbp, votesReceived: project.votesReceived },
    ])
  );
  const folder = folderOrCreate({ clubId, clubName, matchDate });
  return writeMatchDayFolder(
    saveProjectsIntoFolder(
      { ...folder, clubName, matchDate },
      buildProjectsFile({
        matchDate,
        projects: numberClimateProjects(projects, funding),
      })
    )
  );
}

export function submitClubMatchDayFolder(clubId: string): MatchDayFolder {
  const folder = readMatchDayFolder(clubId);
  if (!folder || !canSubmitMatchDayFolder(folder)) {
    throw new Error(
      "Save the Sponsors File and the Climate Projects File in the Match-Day folder before pressing SUBMIT."
    );
  }
  return writeMatchDayFolder(stampSubmitted(folder));
}

export function applyFanWalletVote({
  clubId,
  clubName,
  brandName,
  projectNumber,
}: {
  clubId: string;
  clubName: string;
  brandName: string;
  projectNumber: string | number;
}): WalletVoteResult & { folder?: MatchDayFolder } {
  const folder = visibleMatchDayFolderForClub({ clubId, clubName });
  if (!folder?.projectsFile || !folder.sponsorsFile) {
    return {
      ok: false,
      error:
        "The Sustainability Director has not submitted the Match-Day Sponsors File and Climate Projects File yet.",
    };
  }
  const number = parseProjectNumber(
    projectNumber,
    folder.projectsFile.projects.length
  );
  if (number == null) {
    return {
      ok: false,
      error: `Insert a project number from 1 to ${folder.projectsFile.projects.length} next to the wallet.`,
    };
  }
  const wallets = listClimateWalletsForClub(folder.clubName);
  const wallet =
    wallets.find(
      (row) => row.brandName.trim().toLowerCase() === brandName.trim().toLowerCase()
    ) ?? null;
  if (!wallet) {
    return { ok: false, error: `No Climate Sponsorship Wallet found for ${brandName}.` };
  }
  const result = allocateWalletVote({
    wallet,
    projects: folder.projectsFile.projects,
    projectNumber: number,
  });
  if (!result.ok) return result;
  writeClimateWallet(result.wallet);
  const nextFolder = writeMatchDayFolder({
    ...folder,
    sponsorsFile: applyRemainingToSponsorsFile(folder.sponsorsFile, result.wallet),
    projectsFile: applyFundingToProjectsFile(folder.projectsFile, result.project),
  });
  return { ...result, folder: nextFolder, wallet: result.wallet };
}

export function fanVisibleProjects(folder: MatchDayFolder | null): NumberedClimateProject[] {
  return folder?.projectsFile?.projects ?? [];
}

export function fanVisibleSponsors(folder: MatchDayFolder | null) {
  const rows = folder?.sponsorsFile?.sponsors ?? [];
  const wallets = folder ? listClimateWalletsForClub(folder.clubName) : [];
  return rows.map((row) => {
    const wallet = wallets.find(
      (item) => item.brandName.trim().toLowerCase() === row.brandName.trim().toLowerCase()
    );
    return {
      ...row,
      remainingGbp: wallet ? remainingGbp(wallet) : row.remainingGbp,
    };
  });
}
