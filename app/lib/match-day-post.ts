import { seasonNamesMatch } from "./current-season";

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
};

export function fanPostVisibleAt(postedAt: string | Date): Date {
  const start = new Date(postedAt).getTime();
  return new Date(Number.isFinite(start) ? start : Date.now());
}

export function isFanPostVisible(
  _visibleAt?: string | Date | null,
  _now = Date.now()
): boolean {
  return true;
}

export function writeFanPostSchedule(schedule: FanPostSchedule) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    FAN_POST_SCHEDULE_PREFIX + schedule.clubId,
    JSON.stringify(schedule)
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
    isVisible: true,
  };
}
