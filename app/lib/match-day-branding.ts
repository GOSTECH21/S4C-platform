import {
  brandKey,
  brandsMatch,
  SUGGESTED_CLIMATE_BRANDS,
  type ClubClimateSponsor,
} from "./climate-sponsors";
import {
  LOCAL_SPONSOR_MIN_GBP,
  LOCAL_SPONSORS_PER_MATCH,
  type LocalSponsorRecord,
  localSponsorsForClub,
} from "./local-sponsor";
import {
  assignLocalSponsorsToProjects,
  placementsFromStoredAssignments,
  type MatchDayLocalAssignment,
  type MatchDayLocalPlacement,
} from "./match-day-local-sponsors";

export const EXAMPLE_LOCAL_BRANDS = [
  "Braidview Garage",
  "Thistle Energy",
  "Capital Homes Edinburgh",
  "McLeod & Sons Solicitors",
  "Edinburgh Roasters",
];

/** Local businesses that must never occupy Lead Climate Sponsor space. */
export const KNOWN_LOCAL_BUSINESS_BRANDS = [
  "Tax Assist",
  "Top Cellar",
  "Kokobean Cafe",
  "Kokobean",
  "Mash Tun",
  "Interval",
];

const LEAD_CLIMATE_BRAND_NAMES = [
  "American Express",
  "Amex",
  ...SUGGESTED_CLIMATE_BRANDS,
];

export type MatchDayLead = {
  name: string;
  logoUrl: string | null;
};

function compactBrandKey(name: string): string {
  return brandKey(name).replace(/\s+/g, "");
}

function listedBrandMatch(name: string, listed: string[]): boolean {
  const key = compactBrandKey(name);
  if (!key) return false;
  return listed.some((row) => compactBrandKey(row) === key);
}

function localJobTitle(value: string | null | undefined): boolean {
  return /local\s+business/i.test(value ?? "");
}

export function isExampleLocalBrand(brandName: string): boolean {
  return listedBrandMatch(brandName, EXAMPLE_LOCAL_BRANDS);
}

export function isLeadClimateBrand(brandName: string): boolean {
  const key = compactBrandKey(brandName);
  if (!key) return false;
  if (listedBrandMatch(brandName, LEAD_CLIMATE_BRAND_NAMES)) return true;
  return LEAD_CLIMATE_BRAND_NAMES.map(compactBrandKey).some(
    (lead) => lead.length >= 4 && key.startsWith(lead)
  );
}

export function isKnownLocalBusinessBrand(brandName: string): boolean {
  return (
    listedBrandMatch(brandName, KNOWN_LOCAL_BUSINESS_BRANDS) ||
    isExampleLocalBrand(brandName)
  );
}

export function isLocalBusinessBrand(
  brandName: string,
  clubName: string,
  rosterSponsors: ClubClimateSponsor[] = []
): boolean {
  if (!brandName.trim()) return false;
  if (isLeadClimateBrand(brandName)) return false;
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

function asLocalRecord(
  clubName: string,
  row: {
    brandName: string;
    email?: string | null;
    pledgeGbp?: number | null;
    logoUrl?: string | null;
    tagline?: string | null;
    source?: LocalSponsorRecord["source"];
  }
): LocalSponsorRecord {
  return {
    brandName: row.brandName,
    email: row.email ?? "",
    clubName,
    pledgeGbp: Number(row.pledgeGbp) || LOCAL_SPONSOR_MIN_GBP,
    createdAt: "",
    logoUrl: row.logoUrl || null,
    tagline: row.tagline ?? null,
    source: row.source ?? "uploaded",
  };
}

function rosterLocalRecords(
  clubName: string,
  sponsors: ClubClimateSponsor[]
): LocalSponsorRecord[] {
  return sponsors
    .filter(
      (row) =>
        !isLeadClimateBrand(row.brandName) &&
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
      byBrand.set(key, { ...row, clubName });
      continue;
    }
    const preferUploaded =
      (current.source === "example" || isExampleLocalBrand(current.brandName)) &&
      row.source !== "example" &&
      !isExampleLocalBrand(row.brandName);
    if (
      preferUploaded ||
      (!current.logoUrl && row.logoUrl) ||
      row.pledgeGbp > current.pledgeGbp
    ) {
      byBrand.set(key, { ...current, ...row, clubName });
    }
  }
  const all = [...byBrand.values()].filter(
    (row) => !isLeadClimateBrand(row.brandName)
  );
  const real = all.filter(
    (row) => row.source !== "example" && !isExampleLocalBrand(row.brandName)
  );
  const examples = all.filter(
    (row) => row.source === "example" || isExampleLocalBrand(row.brandName)
  );
  const preferred = real.length > 0 ? [...real, ...examples] : all;
  return preferred
    .sort((left, right) => {
      const leftExample = isExampleLocalBrand(left.brandName) ? 1 : 0;
      const rightExample = isExampleLocalBrand(right.brandName) ? 1 : 0;
      if (leftExample !== rightExample) return leftExample - rightExample;
      if (right.pledgeGbp !== left.pledgeGbp) return right.pledgeGbp - left.pledgeGbp;
      return left.brandName.localeCompare(right.brandName);
    })
    .slice(0, LOCAL_SPONSORS_PER_MATCH);
}

export function uploadedLocalSponsorsForClub(
  clubName: string,
  rosterSponsors: ClubClimateSponsor[] = []
): LocalSponsorRecord[] {
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

  const liveLocals = uploadedLocalSponsorsForClub(clubName, rosterSponsors)
    .concat(
      selected
        .filter((row) =>
          notLead(row.brandName) &&
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
      storedLeadName && notLead(storedLeadName)
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
        .filter((row) => notLead(row.brandName))
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
    .filter((row) => notLead(row.brandName));
  const uniqueLive = mergeLocalRecords(clubName, liveLocals);
  const storedAreExamples =
    Boolean(storedLocals?.length) &&
    storedLocals!.every((row) => isExampleLocalBrand(row.brandName));
  const realLive = uniqueLive.filter((row) => !isExampleLocalBrand(row.brandName));
  const storedHasLead =
    Boolean(storedLocals?.length) &&
    storedLocals!.some(
      (row) => isLeadClimateBrand(row.brandName) || brandsMatch(row.brandName, leadName)
    );
  const useStored =
    Boolean(storedLocals?.length) &&
    !storedHasLead &&
    !(storedAreExamples && realLive.length > 0);

  const locals = useStored
    ? storedLocals!
        .filter((row) => notLead(row.brandName))
        .map((row) =>
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
        ? placementsFromStoredAssignments(
            projects,
            storedLocals!.filter((row) => notLead(row.brandName)),
            clubName
          )
        : null) ?? assignLocalSponsorsToProjects(projects, locals),
  };
}
