import { climateProjectGroupFor } from "./climate-project-groups";
import { FAN_REGISTER_PATH } from "./routes";
import { catalogCategoryForName } from "./sccan-catalog";
import {
  normalizeKey,
  roundGbp,
  type NumberedClimateProject,
} from "./sponsor-wallet";
import { addDays, VOTING_PERIOD_DAYS } from "./voting-window";

const FUNDING_PREFIX = "s4p.climate.funding.";
const ARCHIVE_PREFIX = "s4p.climate.archive.";
const SPONSOR_VOTE_PREFIX = "s4p.fan.sponsorVote.";
const INVITED_CLUBS_KEY = "s4p.fan.invitedClubs";

export type InvitedClub = {
  clubId: string;
  clubName: string;
};

export type ClimateFundingWindow = {
  postedAt?: string | null;
  matchDate?: string | null;
  windowId?: string | null;
};

export type ArchivedClimateProject = {
  id: string;
  name: string;
  category: string;
  groupId: string;
  number: number;
  fundedGbp: number;
  votesReceived: number;
  postedAt: string;
  matchDate: string | null;
  windowId: string;
  votingClosesAt: string;
};

type FundingStore = {
  projects: NumberedClimateProject[];
  updatedAt: string;
  postedAt: string;
  matchDate: string | null;
  windowId: string;
};

export function mergeNumberedFunding(
  projects: NumberedClimateProject[],
  stored: NumberedClimateProject[]
): NumberedClimateProject[] {
  if (projects.length === 0) return stored.map((row) => ({ ...row }));
  return projects.map((project) => {
    const hit =
      stored.find((row) => row.id && row.id === project.id) ??
      stored.find(
        (row) =>
          row.name &&
          normalizeKey(row.name) === normalizeKey(project.name)
      );
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

function sameProjectIds(
  left: NumberedClimateProject[],
  right: NumberedClimateProject[]
): boolean {
  if (left.length !== right.length) return false;
  const ids = new Set(left.map((row) => row.id));
  return right.every((row) => ids.has(row.id));
}

function windowIdFor(postedAt: string, matchDate?: string | null): string {
  if (matchDate && matchDate.trim()) return matchDate.trim();
  return postedAt.slice(0, 10) || postedAt;
}

function readFundingStore(clubId: string): FundingStore | null {
  if (!clubId || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(FUNDING_PREFIX + clubId);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<FundingStore>;
    if (!Array.isArray(parsed?.projects)) return null;
    return {
      projects: parsed.projects,
      updatedAt: parsed.updatedAt || "",
      postedAt: parsed.postedAt || parsed.updatedAt || "",
      matchDate: parsed.matchDate ?? null,
      windowId: parsed.windowId || "",
    };
  } catch {
    return null;
  }
}

export function readProjectFunding(clubId: string): NumberedClimateProject[] {
  return readFundingStore(clubId)?.projects ?? [];
}

export function writeProjectFunding(
  clubId: string,
  projects: NumberedClimateProject[],
  fundingWindow: ClimateFundingWindow = {}
): NumberedClimateProject[] {
  const next = projects.map((project) => ({ ...project }));
  if (!clubId || typeof window === "undefined") return next;
  const prev = readFundingStore(clubId);
  const sameWindow =
    Boolean(prev) &&
    ((fundingWindow.windowId && prev!.windowId === fundingWindow.windowId) ||
      (!fundingWindow.windowId && sameProjectIds(prev!.projects, next)));
  const postedAt =
    fundingWindow.postedAt ||
    (sameWindow ? prev!.postedAt : "") ||
    new Date().toISOString();
  const matchDate =
    fundingWindow.matchDate ?? (sameWindow ? prev!.matchDate : null) ?? null;
  const resolvedWindowId =
    fundingWindow.windowId ||
    (sameWindow ? prev!.windowId : "") ||
    windowIdFor(postedAt, matchDate);
  const store: FundingStore = {
    projects: next,
    updatedAt: new Date().toISOString(),
    postedAt,
    matchDate,
    windowId: resolvedWindowId,
  };
  window.localStorage.setItem(FUNDING_PREFIX + clubId, JSON.stringify(store));
  archivePostedProjects(clubId, next, {
    postedAt,
    matchDate,
    windowId: resolvedWindowId,
  });
  return next;
}

export function loadFundedProjects(
  clubId: string,
  projects: NumberedClimateProject[],
  windowId?: string | null
): NumberedClimateProject[] {
  const stored = readFundingStore(clubId);
  if (!stored) return projects;
  if (windowId && stored.windowId && stored.windowId !== windowId) {
    return projects;
  }
  if (!windowId && !sameProjectIds(stored.projects, projects)) {
    return projects;
  }
  return mergeNumberedFunding(projects, stored.projects);
}

export function readProjectArchive(clubId: string): ArchivedClimateProject[] {
  if (!clubId || typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ARCHIVE_PREFIX + clubId);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { projects?: ArchivedClimateProject[] };
    return Array.isArray(parsed?.projects) ? parsed.projects : [];
  } catch {
    return [];
  }
}

export function writeProjectArchive(
  clubId: string,
  projects: ArchivedClimateProject[]
): ArchivedClimateProject[] {
  if (!clubId || typeof window === "undefined") return projects;
  window.localStorage.setItem(
    ARCHIVE_PREFIX + clubId,
    JSON.stringify({ projects, updatedAt: new Date().toISOString() })
  );
  return projects;
}

export function archivePostedProjects(
  clubId: string,
  projects: NumberedClimateProject[],
  fundingWindow: ClimateFundingWindow = {}
): ArchivedClimateProject[] {
  if (!clubId) return [];
  const postedAt = fundingWindow.postedAt || new Date().toISOString();
  const matchDate = fundingWindow.matchDate ?? null;
  const windowId = fundingWindow.windowId || windowIdFor(postedAt, matchDate);
  const existing = readProjectArchive(clubId);
  const next = [...existing];
  for (const project of projects) {
    const category =
      catalogCategoryForName(project.name) || "Climate Action";
    const group = climateProjectGroupFor(project.name, category);
    const closes = addDays(new Date(postedAt), VOTING_PERIOD_DAYS);
    const row: ArchivedClimateProject = {
      id: project.id,
      name: project.name,
      category,
      groupId: group.id,
      number: project.number,
      fundedGbp: roundGbp(Number(project.fundedGbp) || 0),
      votesReceived: Math.round(Number(project.votesReceived) || 0),
      postedAt,
      matchDate,
      windowId,
      votingClosesAt: Number.isNaN(closes.getTime())
        ? postedAt
        : closes.toISOString(),
    };
    const index = next.findIndex(
      (entry) =>
        entry.windowId === windowId &&
        (entry.id === project.id ||
          normalizeKey(entry.name) === normalizeKey(project.name))
    );
    if (index >= 0) {
      next[index] = {
        ...next[index],
        ...row,
        fundedGbp: roundGbp(
          Math.max(Number(next[index].fundedGbp) || 0, row.fundedGbp)
        ),
        votesReceived: Math.max(
          Math.round(Number(next[index].votesReceived) || 0),
          row.votesReceived
        ),
      };
    } else {
      next.push(row);
    }
  }
  return writeProjectArchive(clubId, next);
}

export function projectsInClimateGroup(
  archive: ArchivedClimateProject[],
  groupId: string
): ArchivedClimateProject[] {
  return [...archive]
    .filter((row) => row.groupId === groupId)
    .sort((left, right) => {
      const byDate = right.postedAt.localeCompare(left.postedAt);
      if (byDate !== 0) return byDate;
      return left.number - right.number;
    });
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
