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
