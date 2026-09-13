/** Climate Project Partner catalog shown to club Sustainability Directors. */

export const PARTNER_PAGE_SIZE = 10;
/** Total Match Day portfolio, including featured Global Schools Solar. */
export const MATCH_DAY_PROJECT_COUNT = 5;
/** Projects the Sustainability Director actually chooses; GSS is included as a must. */
export const MATCH_DAY_CHOICE_COUNT = 4;
export const MATCH_DAY_LEAD_HOURS = 72;

export function partnerProjectPage<T>(projects: T[], page: number): T[] {
  const start = Math.max(0, page) * PARTNER_PAGE_SIZE;
  return projects.slice(start, start + PARTNER_PAGE_SIZE);
}

export function partnerPageCount(total: number): number {
  return Math.max(1, Math.ceil(total / PARTNER_PAGE_SIZE));
}
