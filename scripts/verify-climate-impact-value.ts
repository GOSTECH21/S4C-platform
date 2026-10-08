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
import { CLIMATE_PROJECT_COUNTRIES } from "../app/lib/climate-project-countries";
import {
  MAX_PROJECT_IMAGES,
  showcaseImagesForProject,
} from "../app/lib/project-images";
import {
  RETIRED_PARTNER_LISTING_NAMES,
  isOwnPartnerListing,
  isRetiredPartnerListing,
  partnerOrganisationFromLocation,
  selectOwnListedProjects,
} from "../app/lib/partner-projects";

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
assert(
  deriveProjectLifecycle({
    status: "active",
    estimated_co2: 25,
    funding_goal: 8000,
    fundedGbp: 0,
    location: encodePartnerLocation("New Climate Co", civ),
  }) === "listed",
  "A newly signed-off Climate Partner upload stays Listed, not Live"
);

const ghana = {
  id: "ghana",
  name: "Ghana Community Solar Upload",
  location: "Other Provider · Climate Partner",
};
const tynecastle = {
  id: "tynecastle",
  name: "Tynecastle High School Solar Installation",
  location: "Other Provider · Climate Partner",
};
const sccanExchange = {
  id: "sccan-exchange",
  name: "SCCAN Community Learning Exchange",
  location: "Scottish Communities Climate Action Network · Climate Partner",
};
const ownListing = {
  id: "own-1",
  name: "Partner Rooftop Solar",
  location: encodePartnerLocation("New Climate Co", civ),
};
const otherListing = {
  id: "other-1",
  name: "Someone Else Solar",
  location: encodePartnerLocation("Other Provider", civ),
};
assert(
  RETIRED_PARTNER_LISTING_NAMES.includes("Ghana Community Solar Upload") &&
    isRetiredPartnerListing(ghana.name) &&
    isRetiredPartnerListing(tynecastle.name) &&
    isRetiredPartnerListing(sccanExchange.name),
  "Leftover Ghana, Tynecastle and SCCAN listings are retired"
);
assert(
  isOwnPartnerListing(ownListing, "New Climate Co") &&
    !isOwnPartnerListing(otherListing, "New Climate Co") &&
    !isOwnPartnerListing(ownListing, "") &&
    partnerOrganisationFromLocation(ownListing.location) === "New Climate Co",
  "A Climate Partner only owns the listing tagged with their organisation"
);
assert(
  selectOwnListedProjects(
    [ghana, tynecastle, sccanExchange, ownListing, otherListing],
    "New Climate Co"
  ).map((row) => row.id).join() === "own-1",
  "Partner home shows only that partner's signed-off project"
);
assert(
  selectOwnListedProjects(
    [ghana, tynecastle, sccanExchange, ownListing, otherListing],
    ""
  ).length === 0,
  "Partner home stays empty until that partner lists their own project"
);
assert(
  selectOwnListedProjects([ownListing], "", ["own-1"]).map((row) => row.id).join() ===
    "own-1",
  "A just-listed project is remembered for that Climate Partner"
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
  !partnerPage.includes("ClimateProjectListingForm") &&
    partnerPage.includes("Your listed Climate Projects") &&
    partnerPage.includes("canUploadImages") &&
    !partnerPageCopy.includes("S4P will not list a project without") &&
    !partnerPage.includes("Select project") &&
    !partnerPage.includes("publishSccanCatalog"),
  "After login, Climate Partner home shows listed projects and image upload, not the registration form"
);
assert(
  partnerForm.includes(
    "Every Climate Project listed on S4P must have a Climate Impact Value (CIV), Funding Amount Sought, Project Implementation Period (PIP), the postcode or address where it is implemented, and a signed Climate Partner undertaking. Incomplete projects are not listed."
  ),
  "Climate Project Form intro names CIV, PIP and the implementation postcode"
);
assert(
  partnerForm.includes("<select") &&
    partnerForm.includes("CLIMATE_PROJECT_COUNTRIES") &&
    partnerForm.includes("Select country"),
  "Country is a dropdown of all countries"
);
assert(
  partnerForm.includes("put FUNDS onto Climate Projects within 5 miles") &&
    partnerForm.includes(
      "might target Climate Projects within 5 miles of the stadium for"
    ) &&
    !partnerForm.includes("put FUND-IT onto Climate Projects within 5 miles"),
  "Form nearby copy uses FUNDS and local-sponsor targeting"
);
assert(
  CLIMATE_PROJECT_COUNTRIES[0] === "Scotland" &&
    CLIMATE_PROJECT_COUNTRIES[1] === "England",
  "Country dropdown lists Scotland and England first"
);
assert(
  CLIMATE_PROJECT_COUNTRIES.slice(2).every(
    (name, index, rest) =>
      index === 0 || rest[index - 1].localeCompare(name, "en") <= 0
  ),
  "Countries after Scotland and England are alphabetical"
);
assert(
  CLIMATE_PROJECT_COUNTRIES.includes("Italy") &&
    CLIMATE_PROJECT_COUNTRIES.includes("United Kingdom") &&
    CLIMATE_PROJECT_COUNTRIES.includes("Wales") &&
    !CLIMATE_PROJECT_COUNTRIES.includes("Pseudo-Accents") &&
    !CLIMATE_PROJECT_COUNTRIES.includes("United Nations"),
  "Country dropdown includes the remaining countries"
);
assert(
  partnerPage.includes("Attach images that explain and showcase") &&
    !partnerPage.includes("List your Climate Project"),
  "Partner home copy is the listed-project workspace, not the listing form"
);
const listedCard = readFileSync(
  "app/components/climate/ListedClimateProjectCard.tsx",
  "utf8"
);
assert(
  partnerPage.includes("No Climate Project is listed on this account yet") &&
    partnerPage.includes("ListedClimateProjectCard"),
  "Partner home is empty until own sign-off and shows only that partner's listing"
);
assert(
  MAX_PROJECT_IMAGES === 6 &&
    showcaseImagesForProject({
      id: "own-1",
      image_url: "https://cdn.example/project.jpg",
    })[0] === "https://cdn.example/project.jpg",
  "A listed Climate Project can show attached showcase images"
);
assert(
  listedCard.includes("LIFECYCLE_LABELS") &&
    listedCard.includes("deriveProjectLifecycle") &&
    listedCard.includes("Provider:") &&
    listedCard.includes('stage === "implementation"') &&
    listedCard.includes('stage === "listed"') &&
    listedCard.includes("PartnerProjectImages") &&
    listedCard.includes("canUploadImages"),
  "A listed project highlights Listed, then Implementation, and can attach showcase images"
);
const partnerListedPreview = readFileSync(
  "app/preview/partner-listed/page.tsx",
  "utf8"
);
assert(
  partnerListedPreview.includes("selectOwnListedProjects") &&
    partnerListedPreview.includes("ListedClimateProjectCard") &&
    partnerListedPreview.includes("No Climate Project is listed on this account yet") &&
    partnerListedPreview.includes("When it is being implemented") &&
    partnerListedPreview.includes("canUploadImages"),
  "Partner-listed preview shows empty home, own Listed project, and Implementation"
);
assert(
  !partnerPage.includes("Ghana Community Solar Upload") &&
    !partnerPage.includes("Tynecastle High School Solar Installation") &&
    !partnerPage.includes("SCCAN Community Learning Exchange"),
  "Partner home does not hard-code leftover provider listings"
);

const civUi = readFileSync("app/components/climate/ClimateProjectCiv.tsx", "utf8");
assert(
  civUi.includes('aria-current={current ? "step" : undefined}') &&
    civUi.includes("ring-2 ring-emerald-200"),
  "The lifecycle strip highlights the current stage, including Implementation"
);

const partnerService = readFileSync("app/services/partner.service.ts", "utf8");
assert(
  partnerService.includes("selectOwnListedProjects") &&
    partnerService.includes("archiveRetiredPartnerListings") &&
    partnerService.includes("rememberOwnListedProject") &&
    partnerService.includes("if (!session) return []"),
  "Listed Climate Projects load only the signed-in partner's own uploads"
);

const partnerRegister = readFileSync("app/partner/register/page.tsx", "utf8");
assert(
  partnerRegister.includes("ClimateProjectListingForm") &&
    partnerRegister.includes("Climate Project Form") &&
    !partnerRegister.includes("SCCAN_PARTNER_NAME") &&
    partnerRegister.includes('roleRegisterAccount("partner")') &&
    partnerRegister.includes('useState("")') &&
    !partnerRegister.includes('type="email"') &&
    !partnerRegister.includes("godwinokey") &&
    !partnerRegister.includes("@gmail.com"),
  "Registering as a Climate Partner presents a blank Climate Project Form with no defaulted email"
);
const countriesSource = readFileSync("app/lib/climate-project-countries.ts", "utf8");
assert(
  !countriesSource.includes("Intl.DisplayNames") &&
    CLIMATE_PROJECT_COUNTRIES.includes("Falkland Islands") &&
    !CLIMATE_PROJECT_COUNTRIES.includes("Falkland Islands (Islas Malvinas)"),
  "Country names are frozen so server and browser show the same list"
);

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
