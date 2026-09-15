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

export function isLocalUploadedCountry(
  country: string | null | undefined,
  localCountry: string
): boolean {
  const value = (country ?? "").trim().toLowerCase();
  const local = localCountry.trim().toLowerCase();
  if (!value || !local) return false;
  return value === local || value.includes(local) || local.includes(value);
}

/** Partner-form uploads store `Organisation · Climate Partner` in location. */
export function isPartnerUpload(project: {
  location?: string | null;
}): boolean {
  return /climate partner/i.test(project.location ?? "");
}

export function listsWithUploadsFirst<
  T extends { id: string; name: string; country?: string | null },
>(
  generic: T[],
  uploaded: T[],
  localCountry: string
): { local: T[]; international: T[] } {
  const genericNames = new Set(generic.map((project) => project.name.toLowerCase()));
  const extra = uploaded.filter(
    (project) => !genericNames.has(project.name.toLowerCase())
  );
  const genericLocal = generic.slice(0, PARTNER_PAGE_SIZE);
  const genericInternational = generic.slice(PARTNER_PAGE_SIZE);
  const uploadedLocal = extra.filter((project) =>
    isLocalUploadedCountry(project.country, localCountry)
  );
  const uploadedInternational = extra.filter(
    (project) => !uploadedLocal.some((row) => row.id === project.id)
  );
  return {
    local: [...uploadedLocal, ...genericLocal],
    international: [...uploadedInternational, ...genericInternational],
  };
}
