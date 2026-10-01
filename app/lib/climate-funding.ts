import { FAN_REGISTER_PATH } from "./routes";
import {
  normalizeKey,
  roundGbp,
  type NumberedClimateProject,
} from "./sponsor-wallet";

const FUNDING_PREFIX = "s4p.climate.funding.";
const SPONSOR_VOTE_PREFIX = "s4p.fan.sponsorVote.";
const INVITED_CLUBS_KEY = "s4p.fan.invitedClubs";

export type InvitedClub = {
  clubId: string;
  clubName: string;
};

export function mergeNumberedFunding(
  projects: NumberedClimateProject[],
  stored: NumberedClimateProject[]
): NumberedClimateProject[] {
  if (projects.length === 0) return stored.map((row) => ({ ...row }));
  return projects.map((project, index) => {
    const hit =
      stored.find((row) => row.id && row.id === project.id) ??
      stored.find((row) => row.number === project.number) ??
      stored[index];
    if (!hit) return project;
    return {
      ...project,
      fundedGbp: roundGbp(
        Math.max(Number(project.fundedGbp) || 0, Number(hit.fundedGbp) || 0)
      ),
      votesReceived: Math.max(
        Math.round(Number(project.votesReceived) || 0),
        Math.round(Number(hit.votesReceived) || 0)
      ),
    };
  });
}

export function readProjectFunding(clubId: string): NumberedClimateProject[] {
  if (!clubId || typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FUNDING_PREFIX + clubId);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { projects?: NumberedClimateProject[] };
    return Array.isArray(parsed?.projects) ? parsed.projects : [];
  } catch {
    return [];
  }
}

export function writeProjectFunding(
  clubId: string,
  projects: NumberedClimateProject[]
): NumberedClimateProject[] {
  if (!clubId || typeof window === "undefined") return projects;
  const next = projects.map((project) => ({ ...project }));
  window.localStorage.setItem(
    FUNDING_PREFIX + clubId,
    JSON.stringify({ projects: next, updatedAt: new Date().toISOString() })
  );
  return next;
}

export function loadFundedProjects(
  clubId: string,
  projects: NumberedClimateProject[]
): NumberedClimateProject[] {
  return mergeNumberedFunding(projects, readProjectFunding(clubId));
}

export function hasFanVotedSponsor(
  supporterId: string | null | undefined,
  clubId: string,
  brandName: string
): boolean {
  return fanVotedSponsorNames(supporterId, clubId).includes(normalizeKey(brandName));
}

export function fanVotedSponsorNames(
  supporterId: string | null | undefined,
  clubId: string
): string[] {
  if (!supporterId || !clubId || typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(
      SPONSOR_VOTE_PREFIX + `${supporterId}:${clubId}`
    );
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { brands?: string[] };
    return Array.isArray(parsed?.brands) ? parsed.brands : [];
  } catch {
    return [];
  }
}

export function recordFanSponsorVote(
  supporterId: string | null | undefined,
  clubId: string,
  brandName: string
): string[] {
  const names = fanVotedSponsorNames(supporterId, clubId);
  const key = normalizeKey(brandName);
  if (!key || names.includes(key)) return names;
  const next = [...names, key];
  if (!supporterId || typeof window === "undefined") return next;
  window.localStorage.setItem(
    SPONSOR_VOTE_PREFIX + `${supporterId}:${clubId}`,
    JSON.stringify({ brands: next, updatedAt: new Date().toISOString() })
  );
  return next;
}

export function fanInviteRegisterPath(
  clubId?: string | null,
  clubName?: string | null
): string {
  const params = new URLSearchParams();
  if (clubId) params.set("club", clubId);
  if (clubName) params.set("clubName", clubName);
  const query = params.toString();
  return query ? `${FAN_REGISTER_PATH}?${query}` : FAN_REGISTER_PATH;
}

export function captureClimateInviteFromSearch(
  search = typeof window === "undefined" ? "" : window.location.search
): InvitedClub | null {
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  const clubId = (params.get("club") || "").trim();
  const clubName = (params.get("clubName") || "").trim();
  if (!clubId && !clubName) return null;
  return rememberInvitedClub({
    clubId: clubId || `invite:${normalizeKey(clubName)}`,
    clubName: clubName || clubId,
  });
}

export function rememberInvitedClub(club: InvitedClub): InvitedClub {
  const next: InvitedClub = {
    clubId: club.clubId.trim(),
    clubName: club.clubName.trim() || club.clubId.trim(),
  };
  if (!next.clubId || typeof window === "undefined") return next;
  const rows = readInvitedClubs().filter(
    (row) =>
      row.clubId !== next.clubId &&
      normalizeKey(row.clubName) !== normalizeKey(next.clubName)
  );
  rows.push(next);
  window.localStorage.setItem(INVITED_CLUBS_KEY, JSON.stringify(rows));
  return next;
}

export function readInvitedClubs(): InvitedClub[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(INVITED_CLUBS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as InvitedClub[];
    return Array.isArray(parsed)
      ? parsed.filter((row) => row?.clubId || row?.clubName)
      : [];
  } catch {
    return [];
  }
}
