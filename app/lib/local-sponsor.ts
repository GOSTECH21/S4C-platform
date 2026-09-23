import { MATCH_DAY_PROJECT_COUNT } from "./partner-projects";

export const LOCAL_SPONSOR_MIN_GBP = 500;
export const FAN_VOTE_PICK_COUNT = 3;
export const LOCAL_SPONSOR_LEFTOVER_COUNT =
  MATCH_DAY_PROJECT_COUNT - FAN_VOTE_PICK_COUNT;
export const LOCAL_SPONSORS_PER_MATCH = MATCH_DAY_PROJECT_COUNT;
export const LOCAL_SPONSOR_STORAGE = "s4p.sponsor.local";
export const LOCAL_SPONSORS_BY_CLUB_STORAGE = "s4p.local-sponsors-by-club";

export type SponsorTier = "local" | "national";

export type LocalSponsorRecord = {
  brandName: string;
  email: string;
  clubName: string;
  pledgeGbp: number;
  createdAt: string;
  logoUrl?: string | null;
  tagline?: string | null;
};

function isLocalRecord(value: unknown): value is LocalSponsorRecord {
  if (!value || typeof value !== "object") return false;
  const row = value as LocalSponsorRecord;
  return Boolean(row.brandName && row.clubName);
}

function parseClubLocals(value: unknown): LocalSponsorRecord[] {
  if (Array.isArray(value)) return value.filter(isLocalRecord);
  if (isLocalRecord(value)) return [value];
  return [];
}

function clubKey(clubName: string): string {
  return clubName.trim().toLowerCase();
}

function brandKey(name: string): string {
  return name.trim().toLowerCase();
}

export function leftoverProjectsFromVotes<T extends { id: string }>({
  posted,
  votedIds,
  leftoverCount = LOCAL_SPONSOR_LEFTOVER_COUNT,
}: {
  posted: T[];
  votedIds: Iterable<string>;
  leftoverCount?: number;
}): T[] {
  const voted = new Set(
    [...votedIds].map((id) => String(id)).filter(Boolean)
  );
  const unused = posted.filter((project) => !voted.has(project.id));
  if (unused.length >= leftoverCount) return unused.slice(0, leftoverCount);
  return unused;
}

export function leftoverProjectsByVoteCount<T extends { id: string }>({
  posted,
  voteCounts,
  leftoverCount = LOCAL_SPONSOR_LEFTOVER_COUNT,
}: {
  posted: T[];
  voteCounts: Record<string, number>;
  leftoverCount?: number;
}): T[] {
  return [...posted]
    .sort((left, right) => {
      const leftVotes = Number(voteCounts[left.id]) || 0;
      const rightVotes = Number(voteCounts[right.id]) || 0;
      if (leftVotes !== rightVotes) return leftVotes - rightVotes;
      return posted.indexOf(left) - posted.indexOf(right);
    })
    .slice(0, leftoverCount);
}

export function leftoverProjectsForLocalSponsor<T extends { id: string }>({
  posted,
  votedIds,
  voteCounts,
  leftoverCount = LOCAL_SPONSOR_LEFTOVER_COUNT,
}: {
  posted: T[];
  votedIds: Iterable<string>;
  voteCounts?: Record<string, number>;
  leftoverCount?: number;
}): T[] {
  const voted = [...votedIds].map(String).filter(Boolean);
  if (voted.length < FAN_VOTE_PICK_COUNT) return [];
  const unused = leftoverProjectsFromVotes({
    posted,
    votedIds: voted,
    leftoverCount: posted.length,
  });
  if (unused.length >= leftoverCount) return unused.slice(0, leftoverCount);
  const counts =
    voteCounts ??
    Object.fromEntries(
      posted.map((project) => [project.id, voted.includes(project.id) ? 1 : 0])
    );
  return leftoverProjectsByVoteCount({
    posted,
    voteCounts: counts,
    leftoverCount,
  });
}

export function readLocalSponsorRecord(): LocalSponsorRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_SPONSOR_STORAGE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LocalSponsorRecord;
    if (!parsed?.brandName || !parsed?.clubName) return null;
    return parsed;
  } catch {
    return null;
  }
}

function readLocalsStore(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LOCAL_SPONSORS_BY_CLUB_STORAGE);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeLocalsStore(store: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    LOCAL_SPONSORS_BY_CLUB_STORAGE,
    JSON.stringify(store)
  );
}

export function localSponsorsForClub(clubName: string): LocalSponsorRecord[] {
  if (!clubName.trim()) return [];
  return parseClubLocals(readLocalsStore()[clubKey(clubName)]);
}

export function replaceLocalSponsorsForClub(
  clubName: string,
  records: LocalSponsorRecord[]
) {
  if (typeof window === "undefined" || !clubName.trim()) return;
  try {
    const store = readLocalsStore();
    store[clubKey(clubName)] = records.filter(isLocalRecord).map((row) => ({
      ...row,
      clubName,
    }));
    writeLocalsStore(store);
  } catch {
    // Browser storage can be blocked; local branding then stays on this device only.
  }
}

export function writeLocalSponsorForClub(record: LocalSponsorRecord) {
  if (typeof window === "undefined") return;
  try {
    const existing = localSponsorsForClub(record.clubName);
    const index = existing.findIndex(
      (row) => brandKey(row.brandName) === brandKey(record.brandName)
    );
    const next =
      index >= 0
        ? existing.map((row, i) => (i === index ? { ...row, ...record } : row))
        : [...existing, record];
    replaceLocalSponsorsForClub(record.clubName, next);
  } catch {
    // Browser storage can be blocked; leftover branding then stays on this device only.
  }
}

export function removeLocalSponsorForClub(clubName: string, brandName: string) {
  replaceLocalSponsorsForClub(
    clubName,
    localSponsorsForClub(clubName).filter(
      (row) => brandKey(row.brandName) !== brandKey(brandName)
    )
  );
}

export function writeLocalSponsorRecord(record: LocalSponsorRecord) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_SPONSOR_STORAGE, JSON.stringify(record));
  writeLocalSponsorForClub(record);
}

export function localSponsorForClub(clubName: string): LocalSponsorRecord | null {
  const ranked = [...localSponsorsForClub(clubName)].sort((left, right) => {
    if (right.pledgeGbp !== left.pledgeGbp) return right.pledgeGbp - left.pledgeGbp;
    return left.createdAt.localeCompare(right.createdAt);
  });
  return ranked[0] ?? null;
}

export function localRecordFromProfile(): LocalSponsorRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("s4p.sponsor.profile");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      tier?: string;
      companyName?: string;
      email?: string;
      clubName?: string;
      pledgeGbp?: number;
    };
    if (parsed.tier !== "local" || !parsed.companyName || !parsed.clubName) {
      return null;
    }
    return {
      brandName: parsed.companyName,
      email: parsed.email ?? "",
      clubName: parsed.clubName,
      pledgeGbp: Number(parsed.pledgeGbp) || LOCAL_SPONSOR_MIN_GBP,
      createdAt: new Date().toISOString(),
      logoUrl: (parsed as { logoUrl?: string | null }).logoUrl ?? null,
    };
  } catch {
    return null;
  }
}

export function readSponsorTier(): SponsorTier {
  if (typeof window === "undefined") return "national";
  try {
    const raw = window.localStorage.getItem("s4p.sponsor.profile");
    if (!raw) {
      return readLocalSponsorRecord() ? "local" : "national";
    }
    const parsed = JSON.parse(raw) as { tier?: string };
    return parsed.tier === "local" ? "local" : "national";
  } catch {
    return readLocalSponsorRecord() ? "local" : "national";
  }
}
