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
