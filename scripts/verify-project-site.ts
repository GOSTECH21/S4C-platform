import { readFileSync } from "fs";
import { selectableCatalogForClub } from "../app/lib/featured-climate-country";
import {
  CIV_LISTING_BLOCKED,
  climateProjectListingErrors,
  encodePartnerLocation,
} from "../app/lib/climate-impact-value";
import {
  LISTED_PROJECT_SITES,
  NEARBY_STADIUM_MILES,
  assertLocalBusinessNearStadium,
  encodeLocationSite,
  listedSiteForProjectName,
  milesBetweenPostcodes,
  nearbyProjectsForClub,
  normalizePostcode,
  parseProjectSite,
  stadiumSiteForClub,
} from "../app/lib/project-site";
import { sitedCatalogProjects } from "../app/lib/sccan-catalog";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const hibsStadium = stadiumSiteForClub("Hibernian");
const heartsStadium = stadiumSiteForClub("Hearts of Midlothian FC");
const arsenalStadium = stadiumSiteForClub("Arsenal");

assert(hibsStadium?.postcode === "EH7 5QG", "Hibernian stadium is Easter Road EH7 5QG");
assert(
  heartsStadium?.postcode === "EH11 2NL",
  "Hearts stadium is Tynecastle EH11 2NL"
);
assert(arsenalStadium?.postcode === "N7 7AJ", "Arsenal stadium is Emirates N7 7AJ");

assert(
  listedSiteForProjectName("Bridgend Farmhouse")?.postcode === "EH16 4TE",
  "Bridgend Farmhouse uses its public listing postcode EH16 4TE"
);
assert(
  listedSiteForProjectName("Porty Community Energy")?.postcode === "EH15 1JT",
  "Porty Community Energy uses 16 Park Avenue EH15 1JT"
);
assert(
  listedSiteForProjectName("Edinburgh Remakery")?.postcode === "EH6 6AD",
  "Edinburgh Remakery uses Newkirkgate EH6 6AD"
);
assert(
  listedSiteForProjectName("Islington Clean Air Schools")?.postcode === "N1 1XR",
  "Islington Clean Air Schools uses 222 Upper Street N1 1XR"
);

assert(
  sitedCatalogProjects().some(
    (project) =>
      project.name === "Bridgend Farmhouse" && project.postcode === "EH16 4TE"
  ),
  "Existing catalog projects carry their public listing postcodes"
);

const listed = LISTED_PROJECT_SITES;
const hibsNearby = nearbyProjectsForClub(listed, "Hibernian");
const heartsNearby = nearbyProjectsForClub(listed, "Hearts of Midlothian");
const arsenalNearby = nearbyProjectsForClub(listed, "Arsenal");
const hibsNames = hibsNearby.map((row) => row.project.name);
const heartsNames = heartsNearby.map((row) => row.project.name);
const arsenalNames = arsenalNearby.map((row) => row.project.name);

for (const name of [
  "Bridgend Farmhouse",
  "Porty Community Energy",
  "Edinburgh Remakery",
  "Wee Spoke Hub",
  "Cargo Bike Movement",
  "Clean Heat Edinburgh",
]) {
  assert(hibsNames.includes(name), `${name} is within ${NEARBY_STADIUM_MILES} miles of Easter Road`);
}

for (const name of [
  "Bridgend Farmhouse",
  "Wee Spoke Hub",
  "Cargo Bike Movement",
  "Lauriston Agroecology Farm",
]) {
  assert(
    heartsNames.includes(name),
    `${name} is within ${NEARBY_STADIUM_MILES} miles of Tynecastle`
  );
}

for (const name of [
  "Islington Clean Air Schools",
  "London Community Retrofit",
  "Southwark Community Solar",
]) {
  assert(
    arsenalNames.includes(name),
    `${name} is within ${NEARBY_STADIUM_MILES} miles of Emirates Stadium`
  );
}

for (const name of [
  "360 Centre Cockenzie",
  "South Seeds",
  "Fittie Community Hall and Garden",
]) {
  assert(
    !hibsNames.includes(name) && !heartsNames.includes(name),
    `${name} is outside 5 miles of the Edinburgh stadiums`
  );
  assert(
    !arsenalNames.includes(name),
    `${name} is not associated with Arsenal`
  );
}

assert(
  !arsenalNames.includes("Bridgend Farmhouse"),
  "Edinburgh projects are not listed as near Arsenal"
);
assert(
  !hibsNames.includes("Islington Clean Air Schools"),
  "London projects are not listed as near Hibernian"
);

const cockenzieMiles = milesBetweenPostcodes("EH32 0DQ", "EH7 5QG");
assert(
  cockenzieMiles != null && cockenzieMiles > NEARBY_STADIUM_MILES,
  "360 Centre Cockenzie is more than 5 miles from Easter Road"
);

const encoded = encodeLocationSite("Climate Partner", {
  postcode: "eh16 4te",
  address: "41 Old Dalkeith Road, Edinburgh",
});
const parsed = parseProjectSite(encoded);
assert(
  parsed?.postcode === "EH16 4TE" && parsed.address.includes("Old Dalkeith"),
  "Implementation site round-trips through the location encoding"
);

const partnerLocation = encodePartnerLocation(
  "Solar Co",
  {
    projectedCiv: 25,
    civPeriod: "Annual",
    projectLifeYears: 20,
    pipDays: 90,
    methodology: "Solar generation",
    evidence: "Spec",
    verificationStatus: "Provider-declared",
    undertakingSigned: true,
    signerName: "Alex Partner",
    signedAt: "2026-10-08T00:00:00.000Z",
    fullyFundedAt: null,
  },
  { postcode: "EH16 4TE", address: "41 Old Dalkeith Road, Edinburgh" }
);
assert(
  parseProjectSite(partnerLocation)?.postcode === "EH16 4TE",
  "Partner listings keep SITE encoding beside CIV"
);

const missingSite = climateProjectListingErrors({
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
});
assert(
  missingSite.some((error) => /postcode/i.test(error)),
  "Listing is blocked until the implementation postcode is provided"
);
assert(
  CIV_LISTING_BLOCKED.toLowerCase().includes("postcode"),
  "The listing-blocked copy names the implementation postcode"
);

const hibsList1 = selectableCatalogForClub({ clubName: "Hibernian" }).slice(0, 10);
const heartsList1 = selectableCatalogForClub({
  clubName: "Hearts of Midlothian FC",
}).slice(0, 10);
const arsenalList1 = selectableCatalogForClub({ clubName: "Arsenal" }).slice(0, 10);

assert(
  hibsList1.every((project) => project.country === "Scotland"),
  "Hibernian List 1 stays 10 Scotland projects"
);
assert(
  heartsList1.every((project) => project.country === "Scotland"),
  "Hearts List 1 stays 10 Scotland projects"
);
assert(
  arsenalList1.every((project) => project.country === "England"),
  "Arsenal List 1 stays 10 England projects"
);
assert(
  hibsList1[0] && hibsNames.includes(hibsList1[0].name),
  "Hibernian List 1 starts with a project within 5 miles of Easter Road"
);
assert(
  arsenalList1[0] && arsenalNames.includes(arsenalList1[0].name),
  "Arsenal List 1 starts with a project within 5 miles of Emirates Stadium"
);
assert(
  selectableCatalogForClub({ clubName: "Hibernian" })[10]?.name ===
    "Ugandan Cookstove",
  "International page still starts at Ugandan Cookstove"
);

const leithMiles = assertLocalBusinessNearStadium({
  postcode: "EH6 6AD",
  clubName: "Hibernian",
});
assert(leithMiles <= NEARBY_STADIUM_MILES, "A Leith business can sponsor Hibernian");

const hollowayMiles = assertLocalBusinessNearStadium({
  postcode: "N7 6PA",
  clubName: "Arsenal",
});
assert(
  hollowayMiles <= NEARBY_STADIUM_MILES,
  "A Holloway business can sponsor Arsenal"
);

try {
  assertLocalBusinessNearStadium({
    postcode: "G41 2LG",
    clubName: "Hibernian",
  });
  failures.push("A Glasgow Southside business must not sponsor Hibernian");
} catch (error) {
  assert(
    error instanceof Error && /5 miles/i.test(error.message),
    "Local businesses farther than 5 miles are rejected"
  );
}

try {
  assertLocalBusinessNearStadium({
    postcode: "EH16 4TE",
    clubName: "Arsenal",
  });
  failures.push("An Edinburgh business must not sponsor Arsenal");
} catch (error) {
  assert(
    error instanceof Error && /5 miles/i.test(error.message),
    "Local businesses must match the chosen club stadium"
  );
}

assert(
  normalizePostcode("eh164te") === "EH16 4TE",
  "UK postcodes are normalised with the inward code split"
);

const form = readFileSync(
  "app/components/climate/ClimateProjectListingForm.tsx",
  "utf8"
);
assert(
  form.includes("Postcode where the project is implemented") &&
    form.includes("Address / site of implementation") &&
    form.includes("postcode: form.postcode") &&
    form.includes("address: form.address") &&
    form.includes("CLIMATE_PROJECT_COUNTRIES") &&
    form.includes("put FUNDS onto Climate Projects within 5 miles"),
  "Climate Project Form collects and submits implementation postcode and address"
);

const localRegister = readFileSync("app/sponsor/local/register/page.tsx", "utf8");
assert(
  localRegister.includes("Business postcode") &&
    localRegister.includes("assertLocalBusinessNearStadium"),
  "Local Business Climate Sponsor registration requires a stadium-nearby postcode"
);

const selectPage = readFileSync("app/club/projects/select/page.tsx", "utf8");
assert(
  selectPage.includes("ProjectSiteLine") && selectPage.includes("nearbyProjectsCopy"),
  "Club Climate Projects list shows implementation sites and the 5-mile copy"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  `Project sites: Bridgend/Porty/Remakery near Easter Road and Tynecastle; Islington/Holloway/Southwark near Emirates; Cockenzie/South Seeds/Fittie excluded; local businesses gated at ${NEARBY_STADIUM_MILES} miles.`
);
