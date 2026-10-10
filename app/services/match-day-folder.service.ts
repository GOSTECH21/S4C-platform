import { withFeaturedGssVersions } from "../lib/featured-gss";
import { MATCH_DAY_PROJECT_COUNT } from "../lib/partner-projects";
import {
  hasFanVotedSponsor,
  loadFundedProjects,
  recordFanSponsorVote,
  writeProjectFunding,
} from "../lib/climate-funding";
import {
  applyFundingListToProjectsFile,
  applyRemainingToSponsorsFile,
  buildProjectsFile,
  buildSponsorsFile,
  canSubmitMatchDayFolder,
  emptyMatchDayFolder,
  isMatchDayFolderVisible,
  saveProjectsIntoFolder,
  saveSponsorsIntoFolder,
  sponsorRowsFromWallets,
  uniqueWalletsByBrand,
  uniqueSponsorRows,
  withLiveWalletRemaining,
  submitMatchDayFolder as stampSubmitted,
  type MatchDayFolder,
} from "../lib/match-day-folder";
import {
  allocateSplitWalletVote,
  allocateWalletVote,
  numberClimateProjects,
  walletVoteAmount,
  type ClimateWallet,
  type NumberedClimateProject,
  type WalletVoteResult,
} from "../lib/sponsor-wallet";
import { clubsMatch } from "../lib/sponsor-dashboard";
import { totalLocalPledge } from "../lib/local-sponsor";
import { liveLeadAndLocals } from "./match-day-branding.service";
import {
  ensureLeadWallet,
  ensureLocalWallet,
  healLocalWalletsForClub,
  listClimateWalletsForClub,
  writeClimateWallet,
} from "./sponsor-wallet.service";
import { persistClimateWalletTake } from "./climate-wallet-takes.service";

const FOLDER_STORAGE_PREFIX = "s4p.sd.matchDayFolder.";

export function readMatchDayFolder(clubId: string): MatchDayFolder | null {
  if (!clubId || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(FOLDER_STORAGE_PREFIX + clubId);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MatchDayFolder;
    if (!parsed?.clubId) return null;
    if (parsed.sponsorsFile?.sponsors) {
      const unique = uniqueSponsorRows(
        parsed.sponsorsFile.sponsors,
        null,
        parsed.clubName
      );
      if (
        unique.length !== parsed.sponsorsFile.sponsors.length ||
        unique.some(
          (row, index) =>
            row.brandName !== parsed.sponsorsFile?.sponsors[index]?.brandName
        )
      ) {
        parsed.sponsorsFile = { ...parsed.sponsorsFile, sponsors: unique };
        writeMatchDayFolder(parsed);
      }
    }
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

function listStoredMatchDayFolders(): MatchDayFolder[] {
  if (typeof window === "undefined") return [];
  const rows: MatchDayFolder[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith(FOLDER_STORAGE_PREFIX)) continue;
    try {
      const parsed = JSON.parse(
        window.localStorage.getItem(key) ?? ""
      ) as MatchDayFolder;
      if (!parsed?.clubId) continue;
      if (parsed.sponsorsFile?.sponsors) {
        parsed.sponsorsFile = {
          ...parsed.sponsorsFile,
          sponsors: uniqueSponsorRows(
            parsed.sponsorsFile.sponsors,
            null,
            parsed.clubName
          ),
        };
      }
      rows.push(parsed);
    } catch {
      // Skip a malformed folder and keep reading.
    }
  }
  return rows;
}

export function listAllMatchDayFolders(): MatchDayFolder[] {
  return listStoredMatchDayFolders();
}

export function listVisibleMatchDayFolders(): MatchDayFolder[] {
  return listStoredMatchDayFolders().filter((folder) =>
    isMatchDayFolderVisible(folder)
  );
}

export function uploadedMatchDayFolderForClub(
  clubName: string
): MatchDayFolder | null {
  if (!clubName.trim()) return null;
  return (
    listStoredMatchDayFolders().find((folder) =>
      clubsMatch(folder.clubName, clubName)
    ) ?? null
  );
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
  healLocalWalletsForClub(clubName);
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
        sponsorshipGbp: totalLocalPledge(local),
      })
    );
  }
  const seen = new Set(wallets.map((wallet) => wallet.id));
  for (const extra of listClimateWalletsForClub(clubName)) {
    if (seen.has(extra.id)) continue;
    wallets.push(extra);
    seen.add(extra.id);
  }
  return uniqueWalletsByBrand(wallets, clubName, branding.leadName);
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
        sponsors: sponsorRowsFromWallets(wallets, clubName),
        clubName,
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

export function publishMatchDayFolderFromSignedOffer({
  clubId,
  clubName,
  projects,
  minAmount,
  gbpPerGoal,
}: {
  clubId: string;
  clubName: string;
  projects: Array<{ id: string; name: string }>;
  minAmount?: number | null;
  gbpPerGoal?: number | null;
}): MatchDayFolder | null {
  if (!clubId || projects.length === 0) return null;
  const matchDate = new Date().toISOString().slice(0, 10);
  const wallets = identifyClubSponsorWallets({
    clubId,
    clubName,
    minAmount,
    gbpPerGoal,
  });
  const existing = readMatchDayFolder(clubId);
  const funding = Object.fromEntries(
    (existing?.projectsFile?.projects ?? []).map((project) => [
      project.id,
      { fundedGbp: project.fundedGbp, votesReceived: project.votesReceived },
    ])
  );
  let folder = folderOrCreate({ clubId, clubName, matchDate });
  folder = saveSponsorsIntoFolder(
    { ...folder, clubName, matchDate },
    buildSponsorsFile({
      matchDate,
      sponsors: sponsorRowsFromWallets(wallets, clubName),
      clubName,
    })
  );
  folder = saveProjectsIntoFolder(
    { ...folder, clubName, matchDate },
    buildProjectsFile({
      matchDate,
      projects: numberClimateProjects(projects, funding),
    })
  );
  if (canSubmitMatchDayFolder(folder)) {
    folder = stampSubmitted(folder);
  }
  return writeMatchDayFolder(folder);
}

export function applyFanWalletVote({
  clubId,
  clubName,
  brandName,
  projectNumber,
  split = false,
  amount,
  supporterId,
  projects: fallbackProjects = [],
}: {
  clubId: string;
  clubName: string;
  brandName: string;
  projectNumber?: string | number;
  split?: boolean;
  amount?: number;
  supporterId?: string | null;
  projects?: NumberedClimateProject[];
}): WalletVoteResult & { folder?: MatchDayFolder } {
  if (hasFanVotedSponsor(supporterId, clubId, brandName)) {
    return {
      ok: false,
      error: `You can only take money once from ${brandName} during this 5-day Vote.`,
    };
  }
  const folder = visibleMatchDayFolderForClub({ clubId, clubName });
  const projects = numberedFeaturedGss(
    loadFundedProjects(
      clubId,
      folder?.projectsFile?.projects?.length
        ? folder.projectsFile.projects
        : fallbackProjects
    )
  );
  if (projects.length === 0) {
    return {
      ok: false,
      error:
        "The Sustainability Director has not posted Climate Projects for this Match Day yet.",
    };
  }
  const wallets = identifyClubSponsorWallets({
    clubId,
    clubName: folder?.clubName || clubName,
  });
  const wallet =
    wallets.find(
      (row) => row.brandName.trim().toLowerCase() === brandName.trim().toLowerCase()
    ) ??
    listClimateWalletsForClub(folder?.clubName || clubName).find(
      (row) => row.brandName.trim().toLowerCase() === brandName.trim().toLowerCase()
    ) ??
    null;
  if (!wallet) {
    return { ok: false, error: `No Carbon Wallet found for ${brandName}.` };
  }
  const voteAmount = amount ?? walletVoteAmount(wallet);
  const result = split
    ? allocateSplitWalletVote({ wallet, projects, amount: voteAmount })
    : allocateWalletVote({
        wallet,
        projects,
        projectNumber: Number(projectNumber),
        amount: voteAmount,
      });
  if (!result.ok) return result;
  writeClimateWallet(result.wallet);
  writeProjectFunding(clubId, result.projects);
  recordFanSponsorVote(supporterId, clubId, brandName);
  void persistClimateWalletTake({
    amountGbp: result.amount,
    projectName: split
      ? result.projects.map((project) => project.name).join(", ")
      : result.shares && result.shares.length > 1
        ? result.shares
            .map((share) => `${share.project.name} (£${share.amount.toFixed(2)})`)
            .join("; ")
        : result.project.name,
    brandName: result.wallet.brandName,
    clubName: result.wallet.clubName,
  });
  if (folder?.sponsorsFile && folder.projectsFile) {
    const nextFolder = writeMatchDayFolder({
      ...folder,
      sponsorsFile: applyRemainingToSponsorsFile(folder.sponsorsFile, result.wallet),
      projectsFile: applyFundingListToProjectsFile(
        folder.projectsFile,
        result.projects
      ),
    });
    return { ...result, folder: nextFolder };
  }
  return result;
}

export function fanVisibleProjects(
  folder: MatchDayFolder | null,
  clubId?: string | null,
  fallback: NumberedClimateProject[] = []
): NumberedClimateProject[] {
  const base =
    folder?.projectsFile?.projects?.length
      ? folder.projectsFile.projects
      : fallback;
  const funded = clubId ? loadFundedProjects(clubId, base) : base;
  return numberedFeaturedGss(funded);
}

function numberedFeaturedGss(
  projects: NumberedClimateProject[]
): NumberedClimateProject[] {
  return withFeaturedGssVersions(projects).map((project, index) => ({
    ...project,
    number: index + 1,
  }));
}

export function fanVisibleSponsors(
  folder: MatchDayFolder | null,
  options?: {
    clubId?: string;
    clubName?: string;
    minAmount?: number | null;
    gbpPerGoal?: number | null;
  }
) {
  const rows = folder?.sponsorsFile?.sponsors ?? [];
  const clubName = folder?.clubName || options?.clubName || "";
  let wallets = clubName ? healLocalWalletsForClub(clubName) : [];
  if (options?.clubId && options.clubName) {
    wallets = identifyClubSponsorWallets({
      clubId: options.clubId,
      clubName: options.clubName,
      minAmount: options.minAmount,
      gbpPerGoal: options.gbpPerGoal,
    });
  }
  return withLiveWalletRemaining(rows, wallets);
}
