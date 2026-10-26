import { notifySignedSponsorship } from "../lib/sponsor-completion-flow";
import { MATCH_DAY_PROJECT_COUNT } from "../lib/partner-projects";
import {
  GLOBAL_BRAND_INVITE_COUNT,
  LOCAL_BUSINESS_INVITE_COUNT,
  SPONSOR_DIRECTORY_STORAGE,
  SPONSOR_INVITE_ROUNDS_STORAGE,
  approvedProjectIdsFromInvite,
  commitGlobalSponsorship,
  createInviteRound,
  currentRoundForClub,
  inviteRoundApprovesProjects,
  listingsOfKind,
  mergeInviteRound,
  mergeSeededSponsorListings,
  pendingInvitesForBrand,
  requireExactInviteCount,
  resolveInviteRound,
  seededSponsorListings,
  upsertInviteRound,
  upsertSponsorListing,
  type SponsorInviteRound,
  type SponsorListing,
  type SponsorListingKind,
} from "../lib/sponsor-listings";
import { brandsMatch } from "../lib/climate-sponsors";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadSponsorDirectory(): SponsorListing[] {
  const stored = readJson<SponsorListing[]>(SPONSOR_DIRECTORY_STORAGE, []);
  const listings = Array.isArray(stored) ? stored : [];
  const merged = mergeSeededSponsorListings(listings, seededSponsorListings());
  if (merged.length !== listings.length) writeJson(SPONSOR_DIRECTORY_STORAGE, merged);
  return merged;
}

export function saveSponsorDirectory(listings: SponsorListing[]) {
  writeJson(SPONSOR_DIRECTORY_STORAGE, listings);
}

export function registerSponsorListing(listing: SponsorListing): SponsorListing[] {
  const next = upsertSponsorListing(loadSponsorDirectory(), listing);
  saveSponsorDirectory(next);
  return next;
}

export function loadInviteRounds(): SponsorInviteRound[] {
  const stored = readJson<SponsorInviteRound[]>(SPONSOR_INVITE_ROUNDS_STORAGE, []);
  return Array.isArray(stored) ? stored : [];
}

export function saveInviteRounds(rounds: SponsorInviteRound[]) {
  writeJson(SPONSOR_INVITE_ROUNDS_STORAGE, rounds);
}

export function loadClubInviteRound(clubId: string): SponsorInviteRound | null {
  return currentRoundForClub(loadInviteRounds(), clubId);
}

export function saveClubInviteRound(round: SponsorInviteRound): SponsorInviteRound {
  const rounds = upsertInviteRound(loadInviteRounds(), round);
  saveInviteRounds(rounds);
  return round;
}

export function listingsForKind(kind: SponsorListingKind): SponsorListing[] {
  return listingsOfKind(loadSponsorDirectory(), kind);
}

export function listingForBrand(
  brandName: string,
  email?: string | null
): SponsorListing | null {
  const listings = loadSponsorDirectory();
  const mail = String(email ?? "").trim().toLowerCase();
  return (
    listings.find(
      (row) =>
        brandsMatch(row.brandName, brandName) &&
        (!mail || row.email.trim().toLowerCase() === mail)
    ) ??
    listings.find((row) => brandsMatch(row.brandName, brandName)) ??
    null
  );
}

export function recordSponsorInvites({
  clubId,
  clubName,
  directorName,
  matchLabel,
  projectIds,
  projectNames,
  globalInviteeIds = [],
  localInviteeIds = [],
  kind,
  sentAt = new Date(),
}: {
  clubId: string;
  clubName: string;
  directorName: string;
  matchLabel: string;
  projectIds: string[];
  projectNames: string[];
  globalInviteeIds?: string[];
  localInviteeIds?: string[];
  kind: SponsorListingKind;
  sentAt?: Date | string;
}): { round: SponsorInviteRound; error: string | null } {
  const selected =
    kind === "global" ? globalInviteeIds : localInviteeIds;
  const expected = kind === "global" ? GLOBAL_BRAND_INVITE_COUNT : LOCAL_BUSINESS_INVITE_COUNT;
  const expectedError = requireExactInviteCount(selected, expected, kind);
  if (expectedError) {
    return {
      round: createInviteRound({
        clubId,
        clubName,
        directorName,
        matchLabel,
        projectIds,
        projectNames,
        globalInviteeIds,
        localInviteeIds,
        sentAt,
      }),
      error: expectedError,
    };
  }

  if (projectIds.length < MATCH_DAY_PROJECT_COUNT) {
    return {
      round: createInviteRound({
        clubId,
        clubName,
        directorName,
        matchLabel,
        projectIds,
        projectNames,
        globalInviteeIds,
        localInviteeIds,
        sentAt,
      }),
      error: `Choose ${MATCH_DAY_PROJECT_COUNT} Climate Projects for this Match Day before sending invitations.`,
    };
  }

  const drafted = createInviteRound({
    clubId,
    clubName,
    directorName,
    matchLabel,
    projectIds,
    projectNames,
    globalInviteeIds: kind === "global" ? globalInviteeIds : [],
    localInviteeIds: kind === "local" ? localInviteeIds : [],
    sentAt,
  });
  const existing = loadClubInviteRound(clubId);
  let round = drafted;
  if (existing) {
    if (kind === "global" && !existing.lockedListingId) {
      round = {
        ...existing,
        matchLabel: drafted.matchLabel,
        projectIds: drafted.projectIds,
        projectNames: drafted.projectNames,
        directorName: drafted.directorName,
        globalInviteeIds: drafted.globalInviteeIds,
        sentAt: drafted.sentAt,
        expiresAt: drafted.expiresAt,
        commitments: [],
        lockedListingId: null,
        lockedBrandName: null,
        lockedAmountGbp: null,
        lockedAt: null,
        approvedProjectIds: [],
      };
    } else if (kind === "global") {
      round = mergeInviteRound(existing, {
        ...drafted,
        id: existing.id,
        sentAt: existing.sentAt,
        expiresAt: existing.expiresAt,
      });
    } else {
      round = {
        ...existing,
        localInviteeIds: drafted.localInviteeIds,
        matchLabel: drafted.matchLabel || existing.matchLabel,
        projectIds: existing.projectIds.length
          ? existing.projectIds
          : drafted.projectIds,
        projectNames: existing.projectNames.length
          ? existing.projectNames
          : drafted.projectNames,
      };
    }
  }
  saveClubInviteRound(round);
  return { round, error: null };
}

export async function submitGlobalSponsorshipCommitment({
  clubId,
  listing,
  amountGbp,
  now = new Date(),
}: {
  clubId: string;
  listing: SponsorListing;
  amountGbp: number;
  now?: Date | string;
}): Promise<{ round: SponsorInviteRound | null; error: string | null }> {
  const current = loadClubInviteRound(clubId);
  if (!current) {
    return { round: null, error: "No Invitation to Sponsor is open for this club." };
  }
  const result = commitGlobalSponsorship(current, listing, amountGbp, now);
  saveClubInviteRound(result.round);
  if (result.error) return { round: result.round, error: result.error };
  if (result.locked && result.winnerChanged) {
    await publishLockedInviteToFans(result.round);
  }
  return { round: result.round, error: null };
}

export async function closeInviteWindowIfExpired(
  clubId: string,
  now = new Date()
): Promise<SponsorInviteRound | null> {
  const current = loadClubInviteRound(clubId);
  if (!current) return null;
  const next = resolveInviteRound(current, now);
  saveClubInviteRound(next);
  if (
    inviteRoundApprovesProjects(next) &&
    next.lockedListingId &&
    next.lockedListingId !== current.lockedListingId
  ) {
    await publishLockedInviteToFans(next);
  }
  return next;
}

export function invitesWaitingForBrand(brandName: string): SponsorInviteRound[] {
  return pendingInvitesForBrand(
    loadInviteRounds(),
    brandName,
    loadSponsorDirectory()
  );
}

export function approvedIdsForClubMatch(clubId: string): string[] {
  return approvedProjectIdsFromInvite(loadClubInviteRound(clubId));
}

async function publishLockedInviteToFans(round: SponsorInviteRound) {
  const projectIds = approvedProjectIdsFromInvite(round);
  if (projectIds.length === 0 || !round.lockedBrandName) return;
  try {
    const { publishSignedSponsorshipToFans } = await import(
      "./club-match-day.service"
    );
    await publishSignedSponsorshipToFans({
      clubId: round.clubId,
      clubName: round.clubName,
      brandName: round.lockedBrandName,
      projects: projectIds.map((id, index) => ({
        id,
        name: round.projectNames[index] || id,
      })),
    });
  } catch {
    // Invitation lock-in still stands if the fan post cannot be written yet.
  }
  notifySignedSponsorship({
    clubId: round.clubId,
    clubName: round.clubName,
    brandName: round.lockedBrandName,
    projectIds,
  });
}
