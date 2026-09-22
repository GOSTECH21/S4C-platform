import { MATCH_DAY_PROJECT_COUNT } from "./partner-projects";

export const LOCAL_SPONSOR_MIN_GBP = 500;
export const FAN_VOTE_PICK_COUNT = 3;
export const LOCAL_SPONSOR_LEFTOVER_COUNT =
  MATCH_DAY_PROJECT_COUNT - FAN_VOTE_PICK_COUNT;
export const LOCAL_SPONSOR_STORAGE = "s4p.sponsor.local";
export const LOCAL_SPONSORS_BY_CLUB_STORAGE = "s4p.local-sponsors-by-club";

export type SponsorTier = "local" | "national";

export type LocalSponsorRecord = {
  brandName: string;
  email: string;
  clubName: string;
  pledgeGbp: number;
  createdAt: string;
};

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

export function writeLocalSponsorForClub(record: LocalSponsorRecord) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(LOCAL_SPONSORS_BY_CLUB_STORAGE);
    const all = raw
      ? (JSON.parse(raw) as Record<string, LocalSponsorRecord>)
      : {};
    all[record.clubName.trim().toLowerCase()] = record;
    window.localStorage.setItem(
      LOCAL_SPONSORS_BY_CLUB_STORAGE,
      JSON.stringify(all)
    );
  } catch {
    // Browser storage can be blocked; leftover branding then stays on this device only.
  }
}

export function writeLocalSponsorRecord(record: LocalSponsorRecord) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_SPONSOR_STORAGE, JSON.stringify(record));
  writeLocalSponsorForClub(record);
}

export function localSponsorForClub(clubName: string): LocalSponsorRecord | null {
  if (typeof window === "undefined" || !clubName.trim()) return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_SPONSORS_BY_CLUB_STORAGE);
    if (!raw) return null;
    const all = JSON.parse(raw) as Record<string, LocalSponsorRecord>;
    return all[clubName.trim().toLowerCase()] ?? null;
  } catch {
    return null;
  }
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
