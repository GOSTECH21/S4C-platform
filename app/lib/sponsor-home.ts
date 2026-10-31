import {
  isKnownLocalBusinessBrand,
  isLeadClimateBrand,
} from "./match-day-branding";
import {
  allLocalSponsors,
  localRecordFromProfile,
  readLocalSponsorRecord,
  readSponsorTier,
} from "./local-sponsor";
import {
  LOCAL_SPONSOR_HOME_PATH,
  SPONSOR_DASHBOARD_PATH,
} from "./routes";

export type SponsorHomeHints = {
  jobTitle?: string | null;
};

function isLocalBusinessJobTitle(value: string | null | undefined): boolean {
  return /local\s+business/i.test(value ?? "");
}

/** Local Business Climate Sponsors never use the Lead goal-sponsorship wallet. */
export function isLocalClimateSponsor(
  brandName?: string | null,
  hints: SponsorHomeHints = {}
): boolean {
  const name = (brandName ?? "").trim();
  if (name && isLeadClimateBrand(name)) return false;
  if (name && isKnownLocalBusinessBrand(name)) return true;
  if (readSponsorTier() === "local") return true;
  if (isLocalBusinessJobTitle(hints.jobTitle)) return true;
  const record = readLocalSponsorRecord() ?? localRecordFromProfile();
  if (
    record &&
    (!name ||
      record.brandName.trim().toLowerCase() === name.toLowerCase())
  ) {
    return true;
  }
  if (!name) return false;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem("s4p.sponsor.profile");
      if (raw) {
        const parsed = JSON.parse(raw) as {
          jobTitle?: string;
          companyName?: string;
        };
        if (
          parsed.companyName?.trim().toLowerCase() === name.toLowerCase() &&
          isLocalBusinessJobTitle(parsed.jobTitle)
        ) {
          return true;
        }
      }
    } catch {
      // Profile storage can be blocked; fall through to club-local records.
    }
  }
  return allLocalSponsors().some(
    (row) => row.brandName.trim().toLowerCase() === name.toLowerCase()
  );
}

/** Lead Climate Sponsors use the S4P Sponsorship Dashboard. Locals use the LOBI home. */
export function sponsorHomePath(
  brandName?: string | null,
  hints: SponsorHomeHints = {}
): string {
  if (isLocalClimateSponsor(brandName, hints)) return LOCAL_SPONSOR_HOME_PATH;
  if (brandName && isLeadClimateBrand(brandName)) return SPONSOR_DASHBOARD_PATH;
  if (readSponsorTier() === "local") return LOCAL_SPONSOR_HOME_PATH;
  return SPONSOR_DASHBOARD_PATH;
}

export function isLeadSponsorHome(
  brandName?: string | null,
  hints: SponsorHomeHints = {}
): boolean {
  return sponsorHomePath(brandName, hints) === SPONSOR_DASHBOARD_PATH;
}

export function rememberLocalSponsorSession(sponsor: {
  name?: string | null;
  industry?: string | null;
}) {
  if (typeof window === "undefined") return;
  const companyName = String(sponsor.name ?? "").trim();
  const jobTitle = String(sponsor.industry ?? "").trim();
  if (!companyName) return;
  if (
    !isLocalClimateSponsor(companyName, { jobTitle }) &&
    !isLocalBusinessJobTitle(jobTitle)
  ) {
    return;
  }
  try {
    const raw = window.localStorage.getItem("s4p.sponsor.profile");
    const previous = raw
      ? (JSON.parse(raw) as Record<string, unknown>)
      : {};
    const record = readLocalSponsorRecord() ?? localRecordFromProfile();
    const fromClubs = allLocalSponsors().find(
      (row) => row.brandName.trim().toLowerCase() === companyName.toLowerCase()
    );
    window.localStorage.setItem(
      "s4p.sponsor.profile",
      JSON.stringify({
        ...previous,
        companyName,
        jobTitle: jobTitle || previous.jobTitle || "Local Business Climate Sponsor",
        tier: "local",
        clubName:
          previous.clubName ??
          record?.clubName ??
          fromClubs?.clubName ??
          null,
        pledgeGbp: previous.pledgeGbp ?? record?.pledgeGbp ?? fromClubs?.pledgeGbp ?? null,
        postcode: previous.postcode ?? record?.postcode ?? fromClubs?.postcode ?? null,
        matchSponsorships:
          previous.matchSponsorships ??
          record?.matchSponsorships ??
          fromClubs?.matchSponsorships ??
          [],
      })
    );
  } catch {
    // Browser storage can be blocked; kind still resolves from the brand name.
  }
}
