import { readFileSync } from "fs";
import {
  CIV_LISTING_BLOCKED,
  CIV_UNDERTAKING,
  DEFAULT_PIP_DAYS,
  assertCanListClimateProject,
  civRecordFromListing,
  climateProjectListingErrors,
  deriveProjectLifecycle,
  encodeLocationCiv,
  encodePartnerLocation,
  formatPipDays,
  formatProjectedCiv,
  fundingProgress,
  lifecycleContributesImpact,
  parseCivFromLocation,
  qualifyingCivTonnes,
} from "../app/lib/climate-impact-value";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const valid = {
  name: "School Rooftop Solar",
  fundingAmountSought: 10000,
  projectedCiv: 25,
  civPeriod: "Annual",
  projectLifeYears: 20,
  pipDays: 90,
  methodology: "Solar generation × applicable emissions factor",
  evidence: "Technical specification / baseline / calculations",
  verificationStatus: "Provider-declared",
  undertakingSigned: true,
  signerName: "Alex Partner",
};

assert(climateProjectListingErrors(valid).length === 0, "Complete CIV can be listed");
assert(
  climateProjectListingErrors({ ...valid, projectedCiv: 0 }).length > 0,
  "A project without Projected CIV cannot be listed"
);
assert(
  climateProjectListingErrors({ ...valid, fundingAmountSought: 0 }).length > 0,
  "A project without Funding Amount Sought cannot be listed"
);
assert(
  climateProjectListingErrors({ ...valid, verificationStatus: "" }).length > 0,
  "Verification status is required"
);
assert(
  climateProjectListingErrors({ ...valid, undertakingSigned: false }).length > 0,
  "Unsigned Climate Partner undertakings cannot be listed"
);
assert(
  climateProjectListingErrors({ ...valid, pipDays: 0 }).length > 0,
  "A project without PIP cannot be listed"
);

try {
  assertCanListClimateProject({ ...valid, evidence: "" });
  failures.push("Incomplete CIV must throw before listing");
} catch (error) {
  assert(
    error instanceof Error && error.message.includes(CIV_LISTING_BLOCKED),
    "Listing is blocked until CIV, funding, PIP and sign-off are complete"
  );
}

const progress = fundingProgress(750, 1000);
assert(progress.headline === "£750 / £1,000", "Funding progress shows received over sought");
assert(progress.throughS4p === "75% funded through S4P", "Funding progress shows percent funded");
assert(progress.remainingCopy === "£250 remaining", "Funding progress shows remaining");

assert(
  formatProjectedCiv(25, "Annual") === "25 tCO₂e/year",
  "Projected CIV uses tCO2e per year"
);
assert(
  formatPipDays(DEFAULT_PIP_DAYS) === "90 days after full funding",
  "PIP is counted from full funding"
);

const civ = civRecordFromListing(valid, "2026-09-29T00:00:00.000Z");
const location = encodePartnerLocation("Solar Co", civ);
const parsed = parseCivFromLocation(location);
assert(parsed?.projectedCiv === 25 && parsed.undertakingSigned, "CIV is stored with the partner listing");
assert(/Climate Partner/.test(location), "Partner uploads remain tagged Climate Partner");
assert(
  /SCCAN/.test(encodeLocationCiv("SCCAN", civ)),
  "Catalog locations keep their source tag when CIV is attached"
);

assert(
  deriveProjectLifecycle({
    funding_goal: 1000,
    fundedGbp: 0,
    estimated_co2: 25,
    status: "listed",
  }) === "listed",
  "Unfunded listed projects stay Listed"
);
assert(
  deriveProjectLifecycle({
    funding_goal: 1000,
    fundedGbp: 250,
    estimated_co2: 25,
  }) === "funding",
  "Part-funded projects are in Funding"
);
assert(
  deriveProjectLifecycle({
    funding_goal: 1000,
    fundedGbp: 1000,
    estimated_co2: 25,
  }) === "fully_funded",
  "Full funding starts Fully Funded then Implementation"
);
assert(
  deriveProjectLifecycle({
    status: "live",
    estimated_co2: 25,
    funding_goal: 1000,
    fundedGbp: 1000,
  }) === "live",
  "Live is an explicit Active Project stage"
);
assert(
  !lifecycleContributesImpact("implementation") &&
    lifecycleContributesImpact("live") &&
    lifecycleContributesImpact("verified"),
  "Clubs only add tCO2e after a project is Live"
);
assert(
  deriveProjectLifecycle({
    status: "active",
    estimated_co2: 25,
    funding_goal: 150000,
  }) === "live",
  "Catalog Active projects are Live for CILT"
);
assert(
  qualifyingCivTonnes({
    status: "listed",
    estimated_co2: 25,
    funding_goal: 1000,
    fundedGbp: 0,
  }) === 0,
  "CIV is not added to a Club while the project is still Listed"
);
assert(
  qualifyingCivTonnes({
    estimated_co2: 120,
  }) === 120,
  "Existing Active catalog rows without a lifecycle status still count"
);
assert(
  deriveProjectLifecycle({
    funding_goal: 1000,
    fundedGbp: 1000,
    estimated_co2: 25,
    location: encodePartnerLocation("Solar Co", {
      ...civ,
      fullyFundedAt: "2026-09-01T00:00:00.000Z",
    }),
    now: Date.parse("2026-09-15T00:00:00.000Z"),
  }) === "implementation",
  "PIP keeps a fully funded project in Implementation until it is Live"
);

const partnerPage = readFileSync("app/partner/dashboard/page.tsx", "utf8");
assert(
  partnerPage.includes("Projected CIV") &&
    partnerPage.includes("Funding Amount Sought") &&
    partnerPage.includes("PIP (days after full funding)") &&
    partnerPage.includes("CIV_UNDERTAKING") &&
    partnerPage.includes("Sign off and list on S4P"),
  "Partner upload collects CIV, funding, PIP and a signed undertaking"
);

const partnerService = readFileSync("app/services/partner.service.ts", "utf8");
assert(
  partnerService.includes("assertCanListClimateProject") &&
    partnerService.includes("encodePartnerLocation") &&
    partnerService.includes('status: "listed"'),
  "Upload refuses incomplete CIV and lists only signed-off projects"
);

const card = readFileSync("app/components/fan/MatchDayProjectCard.tsx", "utf8");
assert(
  card.includes("ClimateProjectCivBlock"),
  "Project cards show funding progress and the Listed-to-Verified lifecycle"
);

const clubSelect = readFileSync("app/club/projects/select/page.tsx", "utf8");
assert(
  clubSelect.includes("ClimateProjectCivBlock"),
  "Club project lists show CIV, funding sought and PIP lifecycle"
);

const clubDash = readFileSync("app/club/dashboard/page.tsx", "utf8");
assert(
  clubDash.includes("qualifyingCivTonnes") &&
    clubDash.includes("ClimateProjectCivBlock"),
  "Club CILT extra tCO2e only comes from Live CIV"
);

assert(
  CIV_UNDERTAKING.includes("true and accurate") &&
    CIV_UNDERTAKING.includes("recover any amounts"),
  "Undertaking covers accuracy and recovery"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Climate Impact Value: listing gate, funding progress, PIP lifecycle.");
