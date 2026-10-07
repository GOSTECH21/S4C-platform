import {
  brandKey,
  brandsMatch,
  isKnownLocalBusinessSponsorName,
  isLeadClimateSponsorName,
  isRemovedSponsorBrand,
  pickSoleLeadClimateSponsor,
  KNOWN_LOCAL_BUSINESS_SPONSOR_NAMES,
  type ClubClimateSponsor,
  type LeadClubSponsorRow,
} from "./climate-sponsors";
import {
  LOCAL_SPONSOR_MIN_GBP,
  LOCAL_SPONSORS_PER_MATCH,
  type LocalSponsorRecord,
  localSponsorsForClub,
  replaceLocalSponsorsForClub,
  withAgreedPledge,
} from "./local-sponsor";
import {
  assignLocalSponsorsToProjects,
  placementsFromStoredAssignments,
  type MatchDayLocalAssignment,
  type MatchDayLocalPlacement,
} from "./match-day-local-sponsors";

export const EXAMPLE_LOCAL_BRANDS = [
  "Braidview Garage",
  "Broadview Garage",
  "Thistle Energy",
  "Capital Homes Edinburgh",
  "Capital Homes",
  "McLeod & Sons Solicitors",
  "McLeod & Sons",
  "Edinburgh Roasters",
];

/** Local businesses that must never occupy Lead Climate Sponsor space. */
export const KNOWN_LOCAL_BUSINESS_BRANDS = KNOWN_LOCAL_BUSINESS_SPONSOR_NAMES;

export type MatchDayLead = {
  name: string;
  logoUrl: string | null;
};

function compactBrandKey(name: string): string {
  return brandKey(name).replace(/\s+/g, "");
}

function localJobTitle(value: string | null | undefined): boolean {
  return /local\s+business/i.test(value ?? "");
}

export function isExampleLocalBrand(brandName: string): boolean {
  if (isRemovedSponsorBrand(brandName)) return true;
  const key = compactBrandKey(brandName);
  if (!key) return false;
  return EXAMPLE_LOCAL_BRANDS.some((row) => {
    const listed = compactBrandKey(row);
    if (!listed) return false;
    if (key === listed) return true;
    return (
      listed.length >= 10 &&
      (key.startsWith(listed) || listed.startsWith(key))
    );
  });
}

export function isLeadClimateBrand(brandName: string): boolean {
  return isLeadClimateSponsorName(brandName);
}

export function isKnownLocalBusinessBrand(brandName: string): boolean {
  return isKnownLocalBusinessSponsorName(brandName);
}

export function isRegisteredLocalSponsor(row: {
  brandName: string;
  source?: LocalSponsorRecord["source"];
}): boolean {
  if (!row.brandName.trim()) return false;
  if (isLeadClimateBrand(row.brandName)) return false;
  if (isExampleLocalBrand(row.brandName)) return false;
  if (row.source === "example") return false;
  return true;
}

export function isLocalBusinessBrand(
  brandName: string,
  clubName: string,
  rosterSponsors: ClubClimateSponsor[] = []
): boolean {
  if (!brandName.trim()) return false;
  if (isLeadClimateBrand(brandName)) return false;
  if (isExampleLocalBrand(brandName)) return true;
  if (isKnownLocalBusinessBrand(brandName)) return true;
  if (
    localSponsorsForClub(clubName).some((row) =>
      brandsMatch(row.brandName, brandName)
    )
  ) {
    return true;
  }
  return rosterSponsors.some(
    (row) =>
      brandsMatch(row.brandName, brandName) && localJobTitle(row.jobTitle)
  );
}

/** Lead tab keeps Lead Climate Sponsor brands only. Everyone else goes Local. */
export function splitClubClimateSponsorsForTabs({
  clubName,
  leadSponsors,
  localSponsors,
}: {
  clubName: string;
  leadSponsors: LeadClubSponsorRow[];
  localSponsors: LocalSponsorRecord[];
}): {
  leads: LeadClubSponsorRow[];
  locals: LocalSponsorRecord[];
} {
  const occupant = pickSoleLeadClimateSponsor(
    leadSponsors.filter((row) => isLeadClimateBrand(row.brandName))
  );
  const leads = occupant ? [occupant] : [];
  const localsByKey = new Map<string, LocalSponsorRecord>();

  function rememberLocal(row: LocalSponsorRecord) {
    if (!row.brandName.trim()) return;
    if (
      isLeadClimateBrand(row.brandName) ||
      isExampleLocalBrand(row.brandName) ||
      isRemovedSponsorBrand(row.brandName)
    ) {
      return;
    }
    const key = brandKey(row.brandName);
    if (!key || localsByKey.has(key)) return;
    localsByKey.set(key, row);
  }

  for (const row of localSponsors) rememberLocal(row);
  for (const row of leadSponsors) {
    if (isLeadClimateBrand(row.brandName)) continue;
    rememberLocal({
      brandName: row.brandName,
      email: row.email ?? "",
      clubName,
      pledgeGbp: 0,
      createdAt: row.lockedAt ?? "",
      submittedAt: row.lockedAt ?? undefined,
      source: "registered",
      logoUrl: row.logoUrl,
      matchSponsorships: row.matches.map((fixtureName) => ({
        fixtureName,
        amountGbp: 0,
      })),
    });
  }

  return { leads, locals: [...localsByKey.values()] };
}

function asLocalRecord(
  clubName: string,
  row: {
    brandName: string;
    email?: string | null;
    pledgeGbp?: number | null;
    logoUrl?: string | null;
    tagline?: string | null;
    source?: LocalSponsorRecord["source"];
    matchSponsorships?: LocalSponsorRecord["matchSponsorships"];
  }
): LocalSponsorRecord {
  return withAgreedPledge({
    brandName: row.brandName,
    email: row.email ?? "",
    clubName,
    pledgeGbp: Number(row.pledgeGbp) || LOCAL_SPONSOR_MIN_GBP,
    createdAt: "",
    logoUrl: row.logoUrl || null,
    tagline: row.tagline ?? null,
    source: row.source ?? "uploaded",
    matchSponsorships: row.matchSponsorships,
  });
}

function rosterLocalRecords(
  clubName: string,
  sponsors: ClubClimateSponsor[]
): LocalSponsorRecord[] {
  return sponsors
    .filter(
      (row) =>
        !isLeadClimateBrand(row.brandName) &&
        !isExampleLocalBrand(row.brandName) &&
        (localJobTitle(row.jobTitle) || isKnownLocalBusinessBrand(row.brandName))
    )
    .map((row) =>
      asLocalRecord(clubName, {
        brandName: row.brandName,
        email: row.email,
        pledgeGbp: row.spentGbp,
        logoUrl: row.logoUrl,
        source: "uploaded",
      })
    );
}

function mergeLocalRecords(
  clubName: string,
  rows: LocalSponsorRecord[]
): LocalSponsorRecord[] {
  const byBrand = new Map<string, LocalSponsorRecord>();
  for (const row of rows) {
    if (isLeadClimateBrand(row.brandName)) continue;
    const key = compactBrandKey(row.brandName);
    if (!key) continue;
    const current = byBrand.get(key);
    if (!current) {
      byBrand.set(key, withAgreedPledge({ ...row, clubName }));
      continue;
    }
    const keepCurrentMatches =
      (current.matchSponsorships?.length ?? 0) > 0 &&
      !(row.matchSponsorships?.length);
    const next = { ...current, ...row, clubName };
    if (keepCurrentMatches) {
      next.matchSponsorships = current.matchSponsorships;
    }
    next.logoUrl = row.logoUrl || current.logoUrl;
    byBrand.set(key, withAgreedPledge(next));
  }
  const registered = [...byBrand.values()].filter(isRegisteredLocalSponsor);
  return registered
    .sort((left, right) => {
      if (right.pledgeGbp !== left.pledgeGbp) return right.pledgeGbp - left.pledgeGbp;
      return left.brandName.localeCompare(right.brandName);
    })
    .slice(0, LOCAL_SPONSORS_PER_MATCH);
}

export function purgeExampleLocalSponsorsForClub(clubName: string): LocalSponsorRecord[] {
  const existing = localSponsorsForClub(clubName);
  const kept = existing.filter(isRegisteredLocalSponsor);
  if (kept.length !== existing.length) {
    replaceLocalSponsorsForClub(clubName, kept);
  }
  return kept;
}

export function uploadedLocalSponsorsForClub(
  clubName: string,
  rosterSponsors: ClubClimateSponsor[] = []
): LocalSponsorRecord[] {
  purgeExampleLocalSponsorsForClub(clubName);
  return mergeLocalRecords(clubName, [
    ...localSponsorsForClub(clubName),
    ...rosterLocalRecords(clubName, rosterSponsors),
  ]);
}

export function resolveLeadClimateSponsor({
  clubName,
  rosterSponsors = [],
  selected = [],
  lockedBrandName = null,
  signedBrandName = null,
  storedLeadName = null,
  campaignSponsorName = null,
  extraBrandNames = [],
}: {
  clubName: string;
  rosterSponsors?: ClubClimateSponsor[];
  selected?: ClubClimateSponsor[];
  lockedBrandName?: string | null;
  signedBrandName?: string | null;
  storedLeadName?: string | null;
  campaignSponsorName?: string | null;
  extraBrandNames?: string[];
}): string | null {
  const isLocal = (name: string | null | undefined) =>
    Boolean(name && isLocalBusinessBrand(name, clubName, rosterSponsors));
  const candidates = [
    lockedBrandName,
    signedBrandName,
    ...selected.map((row) => row.brandName),
    ...rosterSponsors.map((row) => row.brandName),
    storedLeadName,
    campaignSponsorName,
    ...extraBrandNames,
  ]
    .map((name) => name?.trim() || "")
    .filter((name) => name && !isLocal(name));
  return candidates.find((name) => isLeadClimateBrand(name)) || candidates[0] || null;
}

export function resolveMatchDayBranding<T extends { id: string }>({
  clubName,
  projects,
  rosterSponsors = [],
  selected = [],
  lockedBrandName = null,
  signedBrandName = null,
  storedLeadName = null,
  storedLeadLogoUrl = null,
  campaignSponsorName = null,
  campaignSponsorLogoUrl = null,
  storedLocals = null,
  loadLogo,
}: {
  clubName: string;
  projects: T[];
  rosterSponsors?: ClubClimateSponsor[];
  selected?: ClubClimateSponsor[];
  lockedBrandName?: string | null;
  signedBrandName?: string | null;
  storedLeadName?: string | null;
  storedLeadLogoUrl?: string | null;
  campaignSponsorName?: string | null;
  campaignSponsorLogoUrl?: string | null;
  storedLocals?: MatchDayLocalAssignment[] | null;
  loadLogo?: (brandName: string) => string | null;
}): {
  lead: MatchDayLead;
  placements: MatchDayLocalPlacement<T>[];
} {
  const extraBrandNames = [
    ...(storedLocals ?? []).map((row) => row.brandName),
    ...localSponsorsForClub(clubName).map((row) => row.brandName),
  ];
  const leadName =
    resolveLeadClimateSponsor({
      clubName,
      rosterSponsors,
      selected,
      lockedBrandName,
      signedBrandName,
      storedLeadName,
      campaignSponsorName,
      extraBrandNames,
    }) || "Lead Climate Sponsor";
  const fromRoster = rosterSponsors.find((row) =>
    brandsMatch(row.brandName, leadName)
  );
  const leadLogo =
    storedLeadLogoUrl && !isLocalBusinessBrand(storedLeadName ?? "", clubName, rosterSponsors)
      ? storedLeadLogoUrl
      : fromRoster?.logoUrl ||
        campaignSponsorLogoUrl ||
        (loadLogo ? loadLogo(leadName) : null) ||
        (isLeadClimateBrand(storedLeadName ?? "") ? storedLeadLogoUrl : null) ||
        null;

  const notLead = (name: string) =>
    Boolean(name.trim()) &&
    !isLeadClimateBrand(name) &&
    !brandsMatch(name, leadName);
  const registeredName = (name: string) =>
    notLead(name) && !isExampleLocalBrand(name);

  const liveLocals = uploadedLocalSponsorsForClub(clubName, rosterSponsors)
    .concat(
      selected
        .filter((row) =>
          registeredName(row.brandName) &&
          isLocalBusinessBrand(row.brandName, clubName, rosterSponsors)
        )
        .map((row) =>
          asLocalRecord(clubName, {
            brandName: row.brandName,
            email: row.email,
            pledgeGbp: row.spentGbp,
            logoUrl: row.logoUrl,
            source: "uploaded",
          })
        )
    )
    .concat(
      storedLeadName && registeredName(storedLeadName)
        ? [
            asLocalRecord(clubName, {
              brandName: storedLeadName,
              pledgeGbp: LOCAL_SPONSOR_MIN_GBP,
              logoUrl: storedLeadLogoUrl,
              source: "uploaded",
            }),
          ]
        : []
    )
    .concat(
      (storedLocals ?? [])
        .filter((row) => registeredName(row.brandName))
        .map((row) =>
          asLocalRecord(clubName, {
            brandName: row.brandName,
            email: row.email,
            pledgeGbp: row.pledgeGbp,
            logoUrl: row.logoUrl,
            tagline: row.tagline,
            source: "uploaded",
          })
        )
    )
    .filter((row) => registeredName(row.brandName));
  const uniqueLive = mergeLocalRecords(clubName, liveLocals);
  const storedHasLead =
    Boolean(storedLocals?.length) &&
    storedLocals!.some(
      (row) => isLeadClimateBrand(row.brandName) || brandsMatch(row.brandName, leadName)
    );
  const storedHasExamples =
    Boolean(storedLocals?.length) &&
    storedLocals!.some((row) => isExampleLocalBrand(row.brandName));
  const registeredStored = (storedLocals ?? []).filter((row) =>
    registeredName(row.brandName)
  );
  const useStored =
    registeredStored.length > 0 && !storedHasLead && !storedHasExamples;

  const locals = useStored
    ? registeredStored.map((row) =>
        asLocalRecord(clubName, {
          brandName: row.brandName,
          email: row.email,
          pledgeGbp: row.pledgeGbp,
          logoUrl: row.logoUrl,
          tagline: row.tagline,
        })
      )
    : uniqueLive;

  return {
    lead: { name: leadName, logoUrl: leadLogo },
    placements:
      (useStored
        ? placementsFromStoredAssignments(projects, registeredStored, clubName)
        : null) ?? assignLocalSponsorsToProjects(projects, locals),
  };
}
