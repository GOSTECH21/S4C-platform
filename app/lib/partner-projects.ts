/** Climate Project Partner catalog shown to club Sustainability Directors. */

export const PARTNER_PAGE_SIZE = 10;
/** One Featured Global Schools Solar project on every Match Day. */
export const MATCH_DAY_FEATURED_COUNT = 1;
/** Projects the Sustainability Director actually chooses; Global Schools Solar is the Featured project. */
export const MATCH_DAY_CHOICE_COUNT = 4;
/** Total Match Day portfolio: one Featured GSS plus the SD's partner choices. */
export const MATCH_DAY_PROJECT_COUNT =
  MATCH_DAY_FEATURED_COUNT + MATCH_DAY_CHOICE_COUNT;
/** Hours before kick-off the Sustainability Director should post; fan voting also opens then (3 days). */
export const MATCH_DAY_LEAD_HOURS = 72;
const MATCH_DAY_LEAD_DAYS = MATCH_DAY_LEAD_HOURS / 24;

export const MATCH_DAY_PENDING_APPROVAL_LABEL = "pending approval";
export const MATCH_DAY_APPROVED_LABEL = "Approved";
export const MATCH_DAY_RELEASED_LABEL = "Released to Fans";
export const MATCH_DAY_FULLY_FUNDED_LABEL = "Fully-Funded";
export const CLUB_ADMIN_SENT_PROJECTS_HEADING = "Sent Climate Projects";
export const CLUB_ADMIN_SENT_PROJECTS_STAMP = "club-admin-sent-projects-v1";
export const CLUB_SELECT_MATCH_SENT_STAMP = "club-select-match-sent-v1";
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

export const SELECT_CLIMATE_PROJECTS_LABEL = "Select Climate Projects";
export const SEND_INVITATION_LABEL = "Send Invitation to Sponsors";

export const CLUB_CHOOSE_PROJECTS_STEPS = [
  "Select 1 Global Schools Solar & 4 other Climate Projects from the List for each Match Day",
  "Choose Global Brands you wish to invite as Lead Climate Sponsors (from your Address Book)",
  "Choose Local Business you wish to invite as Local Business Sponsors (from your Address Book)",
  'Press "Send Invitations"',
] as const;

export const CLUB_CHOOSE_PROJECTS_NOTE =
  "Note: Invite more than 1 Lead Climate Sponsor and more than 5 Local Business Climate Sponsors.";

export function clubDashboardClimateProjectsIntroCopy(): string {
  return `Press the blue ${SELECT_CLIMATE_PROJECTS_LABEL} button to choose only one Featured Global Schools Solar project and ${MATCH_DAY_CHOICE_COUNT} Climate Partner Projects from List provided`;
}

export function clubDashboardChosenProjectsCopy(): string {
  const steps = CLUB_CHOOSE_PROJECTS_STEPS.map(
    (step, index) => `${index + 1}. ${step}`
  ).join("; ");
  return `${steps}\n${CLUB_CHOOSE_PROJECTS_NOTE}`;
}

export function matchDayProjectApprovalLabel(isApproved: boolean): string {
  return isApproved
    ? MATCH_DAY_APPROVED_LABEL
    : MATCH_DAY_PENDING_APPROVAL_LABEL;
}

export function matchDayInvitationSent(projectCount: number): boolean {
  return projectCount >= MATCH_DAY_PROJECT_COUNT;
}

export function matchDayProjectsReleasedToFans({
  approved,
  paid,
}: {
  approved: boolean;
  paid: boolean;
}): boolean {
  return approved && paid;
}

export function matchDayAdminStatusLabel({
  approved,
  paid,
}: {
  approved: boolean;
  paid: boolean;
}): string {
  return matchDayProjectsReleasedToFans({ approved, paid })
    ? MATCH_DAY_RELEASED_LABEL
    : MATCH_DAY_PENDING_APPROVAL_LABEL;
}

export function clubDashboardProjectsSentCopy(): string {
  return "Climate Projects have left Select Match and been sent to Selected Sponsors. A copy is saved in My Admin, tagged pending approval until sponsors approve and pay. Then they are released to fans.";
}

export function clubAdminSentProjectsCopy(): string {
  return "A copy of the Climate Projects you sent to sponsors. They stay pending approval until a sponsor accepts, approves and pays. After payment they are released to fans, who can take cash from Carbon Wallets onto these projects.";
}

export function clubClimateProjectsIntroCopy(): string {
  return `Choose Global Schools Solar as the Featured Climate Project — one programme that applies in every country. Then choose ${MATCH_DAY_CHOICE_COUNT} more from the Local and National Climate Project lists (List 1 is Climate Partner Projects executable in Your Country; List 2 are International Projects executable in other parts of the World; Climate Projects near my Stadium shows 20 projects within 20 miles of the club stadium). In the future, ONLY submitted Projects from signed-up Climate Project Partners will be listed. Projects MUST be uploaded at least ${MATCH_DAY_LEAD_DAYS} Days before Match Kick-Off`;
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
