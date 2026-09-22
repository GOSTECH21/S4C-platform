import { MATCH_DAY_PROJECT_COUNT } from "./partner-projects";

export const LOCAL_SPONSOR_MIN_GBP = 500;
export const FAN_VOTE_PICK_COUNT = 3;
export const LOCAL_SPONSOR_LEFTOVER_COUNT =
  MATCH_DAY_PROJECT_COUNT - FAN_VOTE_PICK_COUNT;
export const LOCAL_SPONSOR_STORAGE = "s4p.sponsor.local";

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

export function writeLocalSponsorRecord(record: LocalSponsorRecord) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_SPONSOR_STORAGE, JSON.stringify(record));
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
