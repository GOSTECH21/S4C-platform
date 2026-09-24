import {
  brandsMatch,
  selectedSponsors,
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

export type MatchDayLead = {
  name: string;
  logoUrl: string | null;
};

function localJobTitle(value: string | null | undefined): boolean {
  return /local\s+business/i.test(value ?? "");
}

export function isExampleLocalBrand(brandName: string): boolean {
  return EXAMPLE_LOCAL_BRANDS.some((name) => brandsMatch(name, brandName));
}

export function isLocalBusinessBrand(
  brandName: string,
  clubName: string,
  rosterSponsors: ClubClimateSponsor[] = []
): boolean {
  if (!brandName.trim()) return false;
  if (localSponsorsForClub(clubName).some((row) => brandsMatch(row.brandName, brandName))) {
    return true;
  }
  return rosterSponsors.some(
    (row) =>
      brandsMatch(row.brandName, brandName) && localJobTitle(row.jobTitle)
  );
}

function rosterLocalRecords(
  clubName: string,
  sponsors: ClubClimateSponsor[]
): LocalSponsorRecord[] {
  return sponsors
    .filter((row) => localJobTitle(row.jobTitle))
    .map((row) => ({
      brandName: row.brandName,
      email: row.email,
      clubName,
      pledgeGbp: Number(row.spentGbp) || LOCAL_SPONSOR_MIN_GBP,
      createdAt: "",
      logoUrl: row.logoUrl || null,
      source: "uploaded" as const,
    }));
}

function mergeLocalRecords(
  clubName: string,
  rows: LocalSponsorRecord[]
): LocalSponsorRecord[] {
  const byBrand = new Map<string, LocalSponsorRecord>();
  for (const row of rows) {
    const key = row.brandName.trim().toLowerCase();
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
  const all = [...byBrand.values()];
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
}: {
  clubName: string;
  rosterSponsors?: ClubClimateSponsor[];
  selected?: ClubClimateSponsor[];
  lockedBrandName?: string | null;
  signedBrandName?: string | null;
  storedLeadName?: string | null;
  campaignSponsorName?: string | null;
}): string | null {
  const local = (name: string | null | undefined) =>
    Boolean(name && isLocalBusinessBrand(name, clubName, rosterSponsors));
  const candidates = [
    lockedBrandName,
    signedBrandName,
    ...selected.map((row) => row.brandName),
    ...rosterSponsors.map((row) => row.brandName),
    storedLeadName,
    campaignSponsorName,
  ];
  return (
    candidates
      .map((name) => name?.trim() || "")
      .find((name) => name && !local(name)) || null
  );
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
  const leadName =
    resolveLeadClimateSponsor({
      clubName,
      rosterSponsors,
      selected,
      lockedBrandName,
      signedBrandName,
      storedLeadName,
      campaignSponsorName,
    }) || "Lead Climate Sponsor";
  const fromRoster = rosterSponsors.find((row) =>
    brandsMatch(row.brandName, leadName)
  );
  const leadLogo =
    storedLeadLogoUrl ||
    fromRoster?.logoUrl ||
    campaignSponsorLogoUrl ||
    (loadLogo ? loadLogo(leadName) : null) ||
    null;

  const liveLocals = uploadedLocalSponsorsForClub(clubName, rosterSponsors)
    .concat(
      selected
        .filter((row) => !brandsMatch(row.brandName, leadName))
        .map((row) => ({
          brandName: row.brandName,
          email: row.email,
          clubName,
          pledgeGbp: Number(row.spentGbp) || LOCAL_SPONSOR_MIN_GBP,
          createdAt: "",
          logoUrl: row.logoUrl || null,
          source: "uploaded" as const,
        }))
    )
    .concat(
      storedLeadName && !brandsMatch(storedLeadName, leadName)
        ? [
            {
              brandName: storedLeadName,
              email: "",
              clubName,
              pledgeGbp: LOCAL_SPONSOR_MIN_GBP,
              createdAt: "",
              logoUrl: storedLeadLogoUrl,
              source: "uploaded" as const,
            },
          ]
        : []
    )
    .filter((row) => !brandsMatch(row.brandName, leadName));
  const uniqueLive = mergeLocalRecords(clubName, liveLocals);
  const storedAreExamples =
    Boolean(storedLocals?.length) &&
    storedLocals!.every((row) => isExampleLocalBrand(row.brandName));
  const realLive = uniqueLive.filter((row) => !isExampleLocalBrand(row.brandName));
  const useStored =
    Boolean(storedLocals?.length) &&
    !storedLocals!.some((row) => brandsMatch(row.brandName, leadName)) &&
    !(storedAreExamples && realLive.length > 0);

  const locals = useStored
    ? storedLocals!.map((row) => ({
        brandName: row.brandName,
        email: row.email ?? "",
        clubName,
        pledgeGbp: row.pledgeGbp,
        createdAt: "",
        logoUrl: row.logoUrl ?? null,
        tagline: row.tagline ?? null,
      }))
    : uniqueLive;

  return {
    lead: { name: leadName, logoUrl: leadLogo },
    placements:
      (useStored
        ? placementsFromStoredAssignments(projects, storedLocals, clubName)
        : null) ?? assignLocalSponsorsToProjects(projects, locals),
  };
}
