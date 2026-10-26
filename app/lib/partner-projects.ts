/** Climate Project Partner catalog shown to club Sustainability Directors. */

export const PARTNER_PAGE_SIZE = 10;
/** One Featured Global Schools Solar version — local or international, never both. */
export const MATCH_DAY_FEATURED_COUNT = 1;
/** Projects the Sustainability Director actually chooses; one GSS version is the Featured project. */
export const MATCH_DAY_CHOICE_COUNT = 4;
/** Total Match Day portfolio: one Featured GSS plus the SD's partner choices. */
export const MATCH_DAY_PROJECT_COUNT =
  MATCH_DAY_FEATURED_COUNT + MATCH_DAY_CHOICE_COUNT;
/** Hours before kick-off the Sustainability Director should post; fan voting also opens then (3 days). */
export const MATCH_DAY_LEAD_HOURS = 72;
const MATCH_DAY_LEAD_DAYS = MATCH_DAY_LEAD_HOURS / 24;

export const MATCH_DAY_PENDING_APPROVAL_LABEL = "pending approval";
export const MATCH_DAY_APPROVED_LABEL = "Approved";
export const MATCH_DAY_FULLY_FUNDED_LABEL = "Fully-Funded";
/** One Lead Climate Sponsor slot per Club per Match Day. */
export const LEAD_CLIMATE_SPONSOR_SLOTS_PER_MATCH = 1;

/** (1) on Our Lead Climate Sponsor once the SD's chosen list is visible. */
export function clubDashboardLeadTabCount(hasChosenProjects: boolean): number {
  return hasChosenProjects ? LEAD_CLIMATE_SPONSOR_SLOTS_PER_MATCH : 0;
}

export function clubDashboardLookbackCopy(): string {
  return "Confirmed and Approved Projects by Sponsors will appear here.";
}

export function isMatchDayProjectFullyFunded(
  receivedGbp: number,
  soughtGbp: number
): boolean {
  const received = Math.max(0, Number(receivedGbp) || 0);
  const sought = Math.max(0, Number(soughtGbp) || 0);
  return sought > 0 && received >= sought;
}

export function clubDashboardClimateProjectsIntroCopy(): string {
  return `Press the blue S4P Climate Projects button to choose only one Featured Global Schools Solar project and ${MATCH_DAY_CHOICE_COUNT} Climate Partner Projects from List provided`;
}

export function clubDashboardChosenProjectsCopy(): string {
  return `These ${MATCH_DAY_PROJECT_COUNT} chosen Projects are tagged ${MATCH_DAY_PENDING_APPROVAL_LABEL}. Open Sponsors, tick 5 Global Brands, and send an Invitation to Sponsor. Only one Global Brand is accepted — the highest sponsorship received within 8 hours. Once that Sponsorship is locked in, the Projects change to ${MATCH_DAY_APPROVED_LABEL} and are published to your fans. Also tick 10 Local Business Climate Sponsors for a simple Invitation to Sponsor.`;
}

export function matchDayProjectApprovalLabel(isApproved: boolean): string {
  return isApproved
    ? MATCH_DAY_APPROVED_LABEL
    : MATCH_DAY_PENDING_APPROVAL_LABEL;
}

export function clubClimateProjectsIntroCopy(): string {
  return `Choose one Featured Climate Project: Global Schools Solar for a local school near the stadium, or Global Schools Solar for a school anywhere in the world. There can never be two Featured projects. Then choose ${MATCH_DAY_CHOICE_COUNT} more from three lists: List 1 is Climate Partner Projects executable in Your Country; List 2 are International Projects executable in other parts of the World; Climate Projects near my Stadium shows 20 projects within 20 miles of the club stadium. In the future, ONLY submitted Projects from signed-up Climate Project Partners will be listed. Projects MUST be uploaded at least ${MATCH_DAY_LEAD_DAYS} Days before Match Kick-Off`;
}

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

/** Leftover demo rows that must not appear on a Climate Partner's home. */
export const RETIRED_PARTNER_LISTING_NAMES = [
  "Ghana Community Solar Upload",
  "Tynecastle High School Solar Installation",
  "SCCAN Community Learning Exchange",
];

/** Partner-form uploads store `Organisation · Climate Partner` in location. */
export function isPartnerUpload(project: {
  location?: string | null;
}): boolean {
  return /climate partner/i.test(project.location ?? "");
}

export function isRetiredPartnerListing(
  name: string | null | undefined
): boolean {
  const key = (name ?? "").trim().toLowerCase();
  return RETIRED_PARTNER_LISTING_NAMES.some(
    (row) => row.toLowerCase() === key
  );
}

export function partnerOrganisationFromLocation(
  location: string | null | undefined
): string {
  const base = String(location ?? "").split("|")[0].trim();
  return base.replace(/\s*·\s*climate partner$/i, "").trim();
}

/** True when this listing was signed off by this Climate Partner organisation. */
export function isOwnPartnerListing(
  project: { name?: string | null; location?: string | null },
  organisationName: string | null | undefined
): boolean {
  const org = (organisationName ?? "").trim().toLowerCase();
  if (!org || isRetiredPartnerListing(project.name)) return false;
  const provider = partnerOrganisationFromLocation(project.location).toLowerCase();
  return Boolean(provider) && provider === org;
}

/** Partner home: only this organisation's signed-off uploads, never other providers. */
export function selectOwnListedProjects<
  T extends { id: string; name?: string | null; location?: string | null },
>(
  projects: T[],
  organisationName: string | null | undefined,
  ownIds: readonly string[] = []
): T[] {
  const ids = new Set(ownIds);
  return projects.filter((project) => {
    if (isRetiredPartnerListing(project.name)) return false;
    if (ids.has(project.id)) return true;
    return isOwnPartnerListing(project, organisationName);
  });
}

export type PartnerClimateProjectLists<T> = {
  local: T[];
  international: T[];
  nearby: T[];
};

export function listsWithUploadsFirst<
  T extends { id: string; name: string; country?: string | null },
>(
  generic: PartnerClimateProjectLists<T> | T[],
  uploaded: T[],
  localCountry: string
): PartnerClimateProjectLists<T> {
  const lists: PartnerClimateProjectLists<T> = Array.isArray(generic)
    ? {
        local: generic.filter((project) =>
          isLocalUploadedCountry(project.country, localCountry)
        ),
        international: generic.filter(
          (project) => !isLocalUploadedCountry(project.country, localCountry)
        ),
        nearby: [],
      }
    : {
        local: generic.local,
        international: generic.international,
        nearby: generic.nearby ?? [],
      };
  const genericNames = new Set(
    [...lists.local, ...lists.international, ...lists.nearby].map((project) =>
      project.name.toLowerCase()
    )
  );
  const extra: T[] = [];
  const seenUploads = new Set<string>();
  for (const project of uploaded) {
    const key = project.name.toLowerCase();
    if (
      genericNames.has(key) ||
      seenUploads.has(key) ||
      isRetiredPartnerListing(project.name)
    ) {
      continue;
    }
    seenUploads.add(key);
    extra.push(project);
  }
  const uploadedLocal = extra.filter((project) =>
    isLocalUploadedCountry(project.country, localCountry)
  );
  const uploadedInternational = extra.filter(
    (project) => !uploadedLocal.some((row) => row.id === project.id)
  );
  return {
    local: [...uploadedLocal, ...lists.local],
    international: [...uploadedInternational, ...lists.international],
    nearby: lists.nearby,
  };
}
