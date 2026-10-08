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
  formatCivPipSummary,
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
  postcode: "EH16 4TE",
  address: "41 Old Dalkeith Road, Edinburgh",
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
assert(
  climateProjectListingErrors({ ...valid, postcode: "" }).length > 0,
  "A project without an implementation postcode cannot be listed"
);
assert(
  climateProjectListingErrors({ ...valid, address: "" }).length > 0,
  "A project without an implementation address cannot be listed"
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
  formatProjectedCiv(25, "Annual") === "25 tCO2e/Yr",
  "Projected Climate Impact Value uses tCO2e/Yr"
);
assert(
  formatPipDays(DEFAULT_PIP_DAYS) === "90 Days after funding",
  "Projected Implementation Period is counted in days after funding"
);
assert(
  formatCivPipSummary(9600, 90) ===
    "Projected Climate Impact Value 9,600 tCO2e/Yr. Projected Implementation Period 90 Days after funding",
  "Catalog GSS shows the partner CIV number between Value and tCO2e/Yr and PIP days between Period and Days after funding"
);
assert(
  formatCivPipSummary(25, 45) ===
    "Projected Climate Impact Value 25 tCO2e/Yr. Projected Implementation Period 45 Days after funding",
  "A Climate Partner form CIV of 25 and PIP of 45 fills those gaps exactly"
);

const civ = civRecordFromListing(valid, "2026-09-29T00:00:00.000Z");
const location = encodePartnerLocation("Solar Co", civ, {
  postcode: valid.postcode,
  address: valid.address,
});
const parsed = parseCivFromLocation(location);
assert(parsed?.projectedCiv === 25 && parsed.undertakingSigned, "CIV is stored with the partner listing");
assert(/Climate Partner/.test(location), "Partner uploads remain tagged Climate Partner");
assert(/SITE:/.test(location) && /EH16 4TE/.test(decodeURIComponent(location)), "Partner listings store the implementation postcode");
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

const partnerForm = readFileSync(
  "app/components/climate/ClimateProjectListingForm.tsx",
  "utf8"
);
assert(
  partnerForm.includes("Climate Project Form") &&
    partnerForm.includes("Projected Climate Impact Value") &&
    partnerForm.includes("Funding Amount Sought") &&
    partnerForm.includes("Projected Implementation Period") &&
    partnerForm.includes("Postcode where the project is implemented") &&
    partnerForm.includes("Address / site of implementation") &&
    partnerForm.includes("CIV_UNDERTAKING") &&
    partnerForm.includes("Sign off and list on S4P"),
  "Climate Project Form collects CIV, funding, PIP, implementation postcode and a signed undertaking"
);

const partnerPage = readFileSync("app/partner/dashboard/page.tsx", "utf8");
const partnerPageCopy = partnerPage.replace(/\s+/g, " ");
assert(
  partnerPage.includes("ClimateProjectListingForm") &&
    partnerPage.includes("List your Climate Project") &&
    partnerPageCopy.includes(
      "S4P will not list a project without Climate Impact Value (CIV), Funding Amount Sought, Project Implementation Period (PIP), the implementation postcode and an authorized sign-off"
    ) &&
    !partnerPage.includes("Select project") &&
    !partnerPage.includes("publishSccanCatalog"),
  "Partner dashboard opens the Climate Project Form, not a catalog to pick from"
);
assert(
  partnerPage.indexOf("ClimateProjectListingForm") <
    partnerPage.indexOf("Your listed Climate Projects"),
  "The Climate Project Form is the first action on the Partner dashboard"
);

const partnerRegister = readFileSync("app/partner/register/page.tsx", "utf8");
assert(
  partnerRegister.includes("ClimateProjectListingForm") &&
    partnerRegister.includes("Climate Project Form") &&
    !partnerRegister.includes("SCCAN_PARTNER_NAME"),
  "Registering as a Climate Partner presents the Climate Project Form"
);

const partnerService = readFileSync("app/services/partner.service.ts", "utf8");
assert(
  partnerService.includes("assertCanListClimateProject") &&
    partnerService.includes("encodePartnerLocation") &&
    partnerService.includes('status: "listed"'),
  "Upload refuses incomplete CIV and lists only signed-off projects"
);
const registerFn = partnerService.slice(
  partnerService.indexOf("export async function registerClimatePartner"),
  partnerService.indexOf("export async function loginClimatePartner")
);
assert(
  !registerFn.includes("publishSccanCatalog"),
  "Climate Partner registration does not load a catalog of projects to pick"
);

const card = readFileSync("app/components/fan/MatchDayProjectCard.tsx", "utf8");
assert(
  card.includes("ClimateProjectCivBlock"),
  "Project cards show funding progress and the Listed-to-Verified lifecycle"
);

const clubSelect = readFileSync("app/club/projects/select/page.tsx", "utf8");
assert(
  clubSelect.includes("ClimateProjectCivBlock") &&
    clubSelect.includes("clubClimateProjectsIntroCopy"),
  "Club project lists show CIV, funding sought and the Match Day List intro"
);
assert(
  !clubSelect.includes("only project classified as UK and International") &&
    !clubSelect.includes("Ugandan Cookstove. Post at least 3 days"),
  "Club Climate Projects intro no longer uses the old five / voting-window statement"
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
