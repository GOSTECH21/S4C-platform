import { formatFundingGbp } from "./platform-stats";

/** S4P Climate Impact Value: a Climate Project cannot be listed without this. */
export const CIV_UNDERTAKING =
  "The Climate Partner confirms that the information, assumptions, calculations and evidence submitted in support of the stated Climate Impact Value are true and accurate to the best of its knowledge and that it will notify S4P of any material change. Any falsification of details and information provided to S4P will result in S4P seeking to recover any amounts provided to their Project. Failure to implement the project within the Project Implementation Period provided to S4P could result in S4P seeking to recover the amounts provided.";

export const CIV_LISTING_BLOCKED =
  "This Project will not be listed on S4P until a Climate Impact Value, Funding Amount Sought, Project Implementation Period and signed undertaking are provided.";

export const PROJECT_LIFECYCLE = [
  "listed",
  "funding",
  "fully_funded",
  "implementation",
  "live",
  "impact_reporting",
  "verified",
] as const;

export type ProjectLifecycleStage = (typeof PROJECT_LIFECYCLE)[number];

export const LIFECYCLE_LABELS: Record<ProjectLifecycleStage, string> = {
  listed: "Listed",
  funding: "Funding",
  fully_funded: "Fully Funded",
  implementation: "Implementation",
  live: "Live",
  impact_reporting: "Impact Reporting",
  verified: "Verified",
};

export const CIV_PERIODS = ["Annual", "Lifetime", "Per season"] as const;
export type CivPeriod = (typeof CIV_PERIODS)[number];

export const CIV_VERIFICATION = [
  "Provider-declared",
  "Independently verified",
] as const;
export type CivVerificationStatus = (typeof CIV_VERIFICATION)[number];

export const DEFAULT_PIP_DAYS = 90;
export const DEFAULT_PROJECT_LIFE_YEARS = 20;
export const DEFAULT_CIV_PERIOD: CivPeriod = "Annual";

const CIV_LOCATION_MARK = "|CIV:";

export type ClimateImpactValueRecord = {
  projectedCiv: number;
  civPeriod: CivPeriod | string;
  projectLifeYears: number;
  pipDays: number;
  methodology: string;
  evidence: string;
  verificationStatus: CivVerificationStatus | string;
  undertakingSigned: boolean;
  signerName: string;
  signedAt: string | null;
  fullyFundedAt: string | null;
};

export type ClimateProjectCivInput = {
  name: string;
  fundingAmountSought: number;
  projectedCiv: number;
  civPeriod: string;
  projectLifeYears: number;
  pipDays: number;
  methodology: string;
  evidence: string;
  verificationStatus: string;
  undertakingSigned: boolean;
  signerName: string;
};

export type FundingProgress = {
  receivedGbp: number;
  soughtGbp: number;
  remainingGbp: number;
  percent: number;
  receivedLabel: string;
  soughtLabel: string;
  remainingLabel: string;
  headline: string;
  throughS4p: string;
  remainingCopy: string;
};

export function asPositiveAmount(value: unknown): number {
  return Math.max(0, Number(value) || 0);
}

export function climateProjectListingErrors(
  input: ClimateProjectCivInput
): string[] {
  const errors: string[] = [];
  if (!input.name.trim()) errors.push("Project name is required.");
  if (asPositiveAmount(input.fundingAmountSought) <= 0) {
    errors.push("Funding Amount Sought is required.");
  }
  if (asPositiveAmount(input.projectedCiv) <= 0) {
    errors.push("Projected Climate Impact Value (CIV) is required.");
  }
  if (!input.civPeriod.trim()) errors.push("CIV period is required.");
  if (asPositiveAmount(input.projectLifeYears) <= 0) {
    errors.push("Expected project life is required.");
  }
  if (asPositiveAmount(input.pipDays) <= 0) {
    errors.push("Project Implementation Period (PIP) is required.");
  }
  if (!input.methodology.trim()) errors.push("CIV methodology is required.");
  if (!input.evidence.trim()) {
    errors.push("Evidence (technical specification / baseline / calculations) is required.");
  }
  if (!input.verificationStatus.trim()) {
    errors.push("Verification status is required.");
  }
  if (!input.undertakingSigned) {
    errors.push("The Climate Partner must sign off the CIV undertaking.");
  }
  if (!input.signerName.trim()) {
    errors.push("Signature (full name) is required.");
  }
  return errors;
}

export function assertCanListClimateProject(input: ClimateProjectCivInput) {
  const errors = climateProjectListingErrors(input);
  if (errors.length) {
    throw new Error(`${CIV_LISTING_BLOCKED} ${errors[0]}`);
  }
}

export function civRecordFromListing(
  input: ClimateProjectCivInput,
  signedAt = new Date().toISOString()
): ClimateImpactValueRecord {
  return {
    projectedCiv: asPositiveAmount(input.projectedCiv),
    civPeriod: input.civPeriod.trim() || DEFAULT_CIV_PERIOD,
    projectLifeYears: asPositiveAmount(input.projectLifeYears),
    pipDays: asPositiveAmount(input.pipDays),
    methodology: input.methodology.trim(),
    evidence: input.evidence.trim(),
    verificationStatus: input.verificationStatus.trim() || CIV_VERIFICATION[0],
    undertakingSigned: true,
    signerName: input.signerName.trim(),
    signedAt,
    fullyFundedAt: null,
  };
}

export function encodeLocationCiv(
  baseLocation: string,
  civ: ClimateImpactValueRecord
): string {
  const base = (baseLocation ?? "").split(CIV_LOCATION_MARK)[0].trim();
  return `${base}${CIV_LOCATION_MARK}${encodeURIComponent(JSON.stringify(civ))}`;
}

export function encodePartnerLocation(
  organisationName: string,
  civ: ClimateImpactValueRecord
): string {
  return encodeLocationCiv(
    `${organisationName.trim()} · Climate Partner`,
    civ
  );
}

export function parseCivFromLocation(
  location: string | null | undefined
): ClimateImpactValueRecord | null {
  const raw = location ?? "";
  const index = raw.indexOf(CIV_LOCATION_MARK);
  if (index < 0) return null;
  try {
    const parsed = JSON.parse(
      decodeURIComponent(raw.slice(index + CIV_LOCATION_MARK.length))
    ) as Partial<ClimateImpactValueRecord>;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      projectedCiv: asPositiveAmount(parsed.projectedCiv),
      civPeriod: String(parsed.civPeriod || DEFAULT_CIV_PERIOD),
      projectLifeYears:
        asPositiveAmount(parsed.projectLifeYears) || DEFAULT_PROJECT_LIFE_YEARS,
      pipDays: asPositiveAmount(parsed.pipDays) || DEFAULT_PIP_DAYS,
      methodology: String(parsed.methodology || "").trim(),
      evidence: String(parsed.evidence || "").trim(),
      verificationStatus: String(parsed.verificationStatus || CIV_VERIFICATION[0]),
      undertakingSigned: Boolean(parsed.undertakingSigned),
      signerName: String(parsed.signerName || "").trim(),
      signedAt: parsed.signedAt ? String(parsed.signedAt) : null,
      fullyFundedAt: parsed.fullyFundedAt ? String(parsed.fullyFundedAt) : null,
    };
  } catch {
    return null;
  }
}

export function catalogClimateImpactValue(project: {
  name?: string | null;
  category?: string | null;
  estimated_co2?: number | null;
}): ClimateImpactValueRecord {
  const category = (project.category ?? "climate action").toLowerCase();
  const methodology = /solar|renewable/.test(category)
    ? "Solar generation × applicable emissions factor"
    : "Provider baseline × applicable emissions factor";
  return {
    projectedCiv: asPositiveAmount(project.estimated_co2),
    civPeriod: DEFAULT_CIV_PERIOD,
    projectLifeYears: DEFAULT_PROJECT_LIFE_YEARS,
    pipDays: DEFAULT_PIP_DAYS,
    methodology,
    evidence: "Technical specification / baseline / calculations",
    verificationStatus: "Provider-declared",
    undertakingSigned: true,
    signerName: "S4P Climate Project catalog",
    signedAt: null,
    fullyFundedAt: null,
  };
}

export function civForProject(project: {
  estimated_co2?: number | null;
  location?: string | null;
  category?: string | null;
  name?: string | null;
}): ClimateImpactValueRecord {
  return parseCivFromLocation(project.location) ?? catalogClimateImpactValue(project);
}

export function fundingProgress(
  receivedGbp: unknown,
  soughtGbp: unknown
): FundingProgress {
  const received = asPositiveAmount(receivedGbp);
  const sought = asPositiveAmount(soughtGbp);
  const remaining = Math.max(0, sought - received);
  const percent =
    sought > 0 ? Math.min(100, Math.round((received / sought) * 100)) : 0;
  return {
    receivedGbp: received,
    soughtGbp: sought,
    remainingGbp: remaining,
    percent,
    receivedLabel: formatFundingGbp(received),
    soughtLabel: formatFundingGbp(sought),
    remainingLabel: formatFundingGbp(remaining),
    headline: `${formatFundingGbp(received)} / ${formatFundingGbp(sought)}`,
    throughS4p: `${percent}% funded through S4P`,
    remainingCopy: `${formatFundingGbp(remaining)} remaining`,
  };
}

export function parseLifecycleStatus(
  value: string | null | undefined
): ProjectLifecycleStage | null {
  const key = (value ?? "").trim().toLowerCase().replace(/\s+/g, "_");
  if (key === "active") return "live";
  if (PROJECT_LIFECYCLE.includes(key as ProjectLifecycleStage)) {
    return key as ProjectLifecycleStage;
  }
  return null;
}

export function deriveProjectLifecycle(project: {
  status?: string | null;
  funding_goal?: number | null;
  fundedGbp?: number | null;
  location?: string | null;
  estimated_co2?: number | null;
  now?: number;
}): ProjectLifecycleStage {
  const explicit = parseLifecycleStatus(project.status);
  if (explicit && explicit !== "listed" && explicit !== "funding") {
    return explicit;
  }
  const civ = civForProject(project);
  const sought = asPositiveAmount(project.funding_goal);
  const received = asPositiveAmount(project.fundedGbp);
  if (received <= 0) {
    if (explicit === "listed" || explicit === "funding") return "listed";
    if (!explicit && asPositiveAmount(project.estimated_co2) > 0) {
      return "live";
    }
    return "listed";
  }
  if (sought > 0 && received < sought) return "funding";
  const fundedAt = civ.fullyFundedAt
    ? Date.parse(civ.fullyFundedAt)
    : Number.NaN;
  const now = project.now ?? Date.now();
  if (!Number.isFinite(fundedAt)) return "fully_funded";
  const pipEnds = fundedAt + Math.max(0, civ.pipDays) * 24 * 60 * 60 * 1000;
  if (now < pipEnds) return "implementation";
  if (/independently verified/i.test(civ.verificationStatus)) return "verified";
  return "live";
}

export function lifecycleContributesImpact(stage: ProjectLifecycleStage): boolean {
  return (
    stage === "live" || stage === "impact_reporting" || stage === "verified"
  );
}

export function qualifyingCivTonnes(project: {
  status?: string | null;
  funding_goal?: number | null;
  fundedGbp?: number | null;
  location?: string | null;
  estimated_co2?: number | null;
}): number {
  const stage = deriveProjectLifecycle(project);
  if (!lifecycleContributesImpact(stage)) return 0;
  const civ = civForProject(project);
  return asPositiveAmount(civ.projectedCiv || project.estimated_co2);
}

export function formatProjectedCiv(
  tonnes: number,
  period: string = DEFAULT_CIV_PERIOD
): string {
  return `${asPositiveAmount(tonnes).toLocaleString("en-GB")} tCO₂e/${
    /year|annual/i.test(period) ? "year" : period.toLowerCase()
  }`;
}

export function formatPipDays(days: number): string {
  const value = Math.max(0, Math.round(asPositiveAmount(days)));
  return `${value} day${value === 1 ? "" : "s"} after full funding`;
}

export function lifecycleIndex(stage: ProjectLifecycleStage): number {
  return Math.max(0, PROJECT_LIFECYCLE.indexOf(stage));
}
