import { seasonNamesMatch } from "./current-season";
import { isVoteUuid } from "./fan-votes";
import { VOTING_PERIOD_DAYS, MS_PER_DAY, addDays } from "./voting-window";

export const MATCH_DAY_PORTFOLIO_SELECTED = "selected";
export const MATCH_DAY_PORTFOLIO_POSTED = "posted";
/** Posted Match Day project that at least one fan has voted for. */
export const MATCH_DAY_PORTFOLIO_VOTED = "posted-voted";

export function matchDayCampaignTitle(clubName: string): string {
  return `${clubName} Climate Campaign`;
}

export function campaignLabelParts(value: string): string[] {
  const cleaned = value.replace(/climate campaign/gi, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  const sides = cleaned
    .split(/\s+(?:vs\.?|v|versus)\s+/i)
    .map((part) => part.trim())
    .filter(Boolean);
  return [cleaned, ...sides];
}

export function fanTeamMatchesPostedClub(
  team: { id: string; name: string; displayName: string },
  posted: {
    clubId?: string | null;
    title?: string | null;
    clubName?: string | null;
  }
): boolean {
  if (posted.clubId && posted.clubId === team.id) return true;
  const labels = [posted.clubName, posted.title]
    .filter((value): value is string => Boolean(value && value.trim()))
    .flatMap(campaignLabelParts);
  return labels.some(
    (label) =>
      seasonNamesMatch(team.name, label) ||
      seasonNamesMatch(team.displayName, label)
  );
}

export function portfolioProjectId(row: Record<string, unknown>): string {
  return String(row.project_id ?? row.climate_project_id ?? "").trim();
}

export function isPostedPortfolioStatus(status: unknown): boolean {
  const value = String(status ?? "").toLowerCase();
  return value === MATCH_DAY_PORTFOLIO_POSTED || value === MATCH_DAY_PORTFOLIO_VOTED;
}

export function isVotedPortfolioStatus(status: unknown): boolean {
  const value = String(status ?? "").toLowerCase();
  return value === MATCH_DAY_PORTFOLIO_VOTED || value.includes("voted");
}

/** Posted Match Day fives appear on fan dashboards immediately. */
export const FAN_POST_APPEAR_DELAY_MINUTES = 0;
export const FAN_POST_APPEAR_DELAY_MS = 0;

const FAN_POST_SCHEDULE_PREFIX = "s4p.fan.postSchedule.";

export type FanPostSchedule = {
  clubId: string;
  clubName: string;
  postedAt: string;
  visibleAt: string;
  projectIds?: string[];
  campaignId?: string | null;
  sponsorNames?: string[];
  leadSponsorName?: string | null;
  leadSponsorLogoUrl?: string | null;
  localAssignments?: Array<{
    projectId: string;
    cardIndex: number;
    brandName: string;
    pledgeGbp: number;
    logoUrl?: string | null;
    tagline?: string | null;
    email?: string;
  }>;
};

const MATCH_DAY_STORAGE_PREFIX = "s4p.sd.matchDay.";

export type StoredMatchDay = {
  clubId: string;
  projectIds: string[];
  campaignId?: string | null;
  postedAt?: string | null;
};

export type PostedMatchDayForFan = {
  clubId: string;
  clubName: string;
  projectIds: string[];
  campaignId: string | null;
  sponsorNames: string[];
};

export function fanPostVisibleAt(postedAt: string | Date): Date {
  const start = new Date(postedAt).getTime();
  return new Date(Number.isFinite(start) ? start : Date.now());
}

export function fanPostExpiresAt(postedAt: string | Date): Date {
  return addDays(fanPostVisibleAt(postedAt), VOTING_PERIOD_DAYS);
}

export function isFanPostVisible(
  visibleAt?: string | Date | null,
  now = Date.now()
): boolean {
  if (!visibleAt) return true;
  const start = new Date(visibleAt).getTime();
  if (!Number.isFinite(start)) return true;
  return now <= start + VOTING_PERIOD_DAYS * MS_PER_DAY;
}

export function writeFanPostSchedule(schedule: FanPostSchedule) {
  if (typeof window === "undefined") return;
  const previous = readFanPostSchedule(schedule.clubId);
  const next: FanPostSchedule = { ...previous, ...schedule };
  if (!schedule.leadSponsorName && previous?.leadSponsorName) {
    next.leadSponsorName = previous.leadSponsorName;
    next.leadSponsorLogoUrl =
      schedule.leadSponsorLogoUrl ?? previous.leadSponsorLogoUrl ?? null;
  }
  if (
    (!schedule.localAssignments || schedule.localAssignments.length === 0) &&
    previous?.localAssignments?.length
  ) {
    next.localAssignments = previous.localAssignments;
  }
  window.localStorage.setItem(
    FAN_POST_SCHEDULE_PREFIX + schedule.clubId,
    JSON.stringify(next)
  );
}

export function readFanPostSchedule(
  clubId: string | null | undefined
): FanPostSchedule | null {
  if (!clubId || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(FAN_POST_SCHEDULE_PREFIX + clubId);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FanPostSchedule;
    if (!parsed?.postedAt || !parsed?.visibleAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function readAllFanPostSchedules(): FanPostSchedule[] {
  if (typeof window === "undefined") return [];
  const rows: FanPostSchedule[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith(FAN_POST_SCHEDULE_PREFIX)) continue;
    try {
      const parsed = JSON.parse(
        window.localStorage.getItem(key) ?? ""
      ) as FanPostSchedule;
      if (parsed?.clubId && parsed?.clubName) rows.push(parsed);
    } catch {
      // Skip a malformed row and keep reading the rest.
    }
  }
  return rows;
}

export function readAllMatchDayStores(): StoredMatchDay[] {
  if (typeof window === "undefined") return [];
  const rows: StoredMatchDay[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith(MATCH_DAY_STORAGE_PREFIX)) continue;
    try {
      const parsed = JSON.parse(window.localStorage.getItem(key) ?? "") as {
        projectIds?: unknown;
        campaignId?: string | null;
        postedAt?: string | null;
      };
      const projectIds = Array.isArray(parsed?.projectIds)
        ? parsed.projectIds.map((id) => String(id)).filter(Boolean)
        : [];
      if (projectIds.length === 0) continue;
      rows.push({
        clubId: key.slice(MATCH_DAY_STORAGE_PREFIX.length),
        projectIds,
        campaignId: parsed.campaignId ?? null,
        postedAt: parsed.postedAt ?? null,
      });
    } catch {
      // Skip a malformed row and keep reading the rest.
    }
  }
  return rows;
}

export function storedCampaignIdForClub(
  clubId: string | null | undefined
): string | null {
  if (!clubId) return null;
  const schedule = readFanPostSchedule(clubId);
  if (isVoteUuid(schedule?.campaignId)) return schedule.campaignId;
  const fromStore = readAllMatchDayStores().find((row) => row.clubId === clubId);
  if (isVoteUuid(fromStore?.campaignId)) return fromStore.campaignId;
  for (const row of readAllFanPostSchedules()) {
    if (row.clubId === clubId && isVoteUuid(row.campaignId)) return row.campaignId;
  }
  return null;
}

/** Resolve a fan catalog club (often "Liverpool") to a posted Match Day five. */
export function postedMatchDayForFanTeam(
  team: { id: string; name: string; displayName: string },
  schedules: FanPostSchedule[] = readAllFanPostSchedules(),
  stores: StoredMatchDay[] = readAllMatchDayStores()
): PostedMatchDayForFan | null {
  const matchedSchedules = schedules.filter((schedule) =>
    fanTeamMatchesPostedClub(team, {
      clubId: schedule.clubId,
      clubName: schedule.clubName,
    })
  );
  const schedule = matchedSchedules[0];
  const store =
    (schedule && stores.find((row) => row.clubId === schedule.clubId)) ??
    stores.find((row) => row.clubId === team.id) ??
    null;
  const projectIds =
    (schedule?.projectIds?.length ? schedule.projectIds : null) ??
    store?.projectIds ??
    [];
  const clubId = schedule?.clubId || store?.clubId;
  if (!clubId) return null;
  return {
    clubId,
    clubName: schedule?.clubName || team.displayName || team.name,
    projectIds,
    campaignId: schedule?.campaignId ?? store?.campaignId ?? null,
    sponsorNames: schedule?.sponsorNames?.filter(Boolean) ?? [],
  };
}

export function fanPostVisibility(options: {
  clubId?: string | null;
  votingOpens?: string | null;
  postedAt?: string | null;
  now?: number;
}): { postedAt: string | null; visibleAt: string | null; isVisible: boolean } {
  const scheduled = readFanPostSchedule(options.clubId);
  const postedAt = options.postedAt || scheduled?.postedAt || null;
  const visibleAt =
    options.votingOpens ||
    scheduled?.visibleAt ||
    (postedAt ? fanPostVisibleAt(postedAt).toISOString() : null);
  return {
    postedAt,
    visibleAt,
    isVisible: isFanPostVisible(postedAt || visibleAt, options.now ?? Date.now()),
  };
}
