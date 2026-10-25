import {
  ENGLAND_CLIMATE_PROJECTS,
  FEATURED_GLOBAL_SCHOOLS_SOLAR,
  FEATURED_GSS_LOCAL_NAME,
  FEATURED_GSS_WORLD_NAME,
  INTERNATIONAL_CLIMATE_PROJECTS,
  ITALY_CLIMATE_PROJECTS,
  LOCAL_CLIMATE_PROJECTS_BY_COUNTRY,
  PARTNER_MATCH_DAY_CATALOG,
  SCOTLAND_CLIMATE_PROJECTS,
  SELECTABLE_MATCH_DAY_CATALOG,
  climateProjectListsForClub,
  selectableCatalogForCountry,
} from "../app/lib/sccan-catalog";
import {
  STADIUM_NEARBY_PROJECT_COUNT,
  STADIUM_NEARBY_PROJECT_MILES,
  isWithinStadiumRadius,
} from "../app/lib/project-site";
import { nearbyClimateProjectsForClub } from "../app/lib/stadium-nearby-projects";
import { CLIMATE_PROJECTS_NEAR_STADIUM_LABEL } from "../app/lib/s4p-climate-projects";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

for (const [country, catalog] of Object.entries(LOCAL_CLIMATE_PROJECTS_BY_COUNTRY)) {
  const expected = country === "England" ? 20 : 10;
  assert(
    catalog.length === expected,
    `${country} has ${expected} local Climate Partner projects`
  );
  assert(
    catalog.every((project) => project.country === country),
    `${country} local projects are tagged ${country}`
  );
}

assert(
  INTERNATIONAL_CLIMATE_PROJECTS.length === 10,
  "Page 2 has 10 international Climate Partner projects"
);
assert(
  INTERNATIONAL_CLIMATE_PROJECTS[0].name === "Ugandan Cookstove",
  "Ugandan Cookstove is the first international project"
);

const hearts = selectableCatalogForCountry("Scotland");
const arsenal = selectableCatalogForCountry("England");
const milan = selectableCatalogForCountry("Italy");

assert(hearts.length === 20, "Hearts SD chooses from 20 partner projects");
assert(
  hearts.slice(0, 10).every((project) => project.country === "Scotland"),
  "Hearts page 1 is Scotland"
);
assert(
  hearts.slice(0, 10).some((project) => project.name === "Unbound Scotland"),
  "Hearts local list includes Unbound Scotland"
);
assert(arsenal.length === 30, "Arsenal SD chooses from 20 England + 10 international");
assert(
  arsenal.slice(0, 20).every((project) => project.country === "England"),
  "Arsenal page 1 is 20 England projects"
);
assert(
  arsenal.slice(0, 20).some((project) => project.name === "London Community Retrofit") &&
    arsenal.slice(0, 20).some((project) => project.name === "Stoke Canal Rewilding"),
  "Arsenal local list includes London Community Retrofit and the extra England projects"
);
assert(
  milan.slice(0, 10).every((project) => project.country === "Italy"),
  "AC Milan page 1 is Italy"
);
assert(
  milan.slice(0, 10).some((project) => project.name === "Milan Rooftop Solar Cooperative"),
  "AC Milan local list includes Milan Rooftop Solar Cooperative"
);
assert(
  hearts.slice(10).every((project, index) => project.name === arsenal.slice(20)[index].name),
  "International page is shared"
);
assert(
  milan.slice(10)[0].name === "Ugandan Cookstove",
  "AC Milan page 2 still starts with Ugandan Cookstove"
);

assert(
  SELECTABLE_MATCH_DAY_CATALOG.length === 20,
  "Default selectable catalog is 10 local + 10 international"
);
assert(
  PARTNER_MATCH_DAY_CATALOG[0].name === FEATURED_GSS_LOCAL_NAME &&
    PARTNER_MATCH_DAY_CATALOG[1].name === FEATURED_GSS_WORLD_NAME,
  "Two Global Schools Solar versions lead the published catalog"
);
assert(
  FEATURED_GLOBAL_SCHOOLS_SOLAR.featured === true,
  "Global Schools Solar is the featured project"
);
assert(
  FEATURED_GLOBAL_SCHOOLS_SOLAR.country === "International",
  "Global Schools Solar is generic and not Kenyan"
);
assert(
  !/kenya/i.test(FEATURED_GLOBAL_SCHOOLS_SOLAR.description),
  "Featured project copy does not mention Kenya"
);
assert(
  SCOTLAND_CLIMATE_PROJECTS.every((project) => project.country === "Scotland"),
  "Scotland catalog projects stay in Scotland"
);
assert(
  ENGLAND_CLIMATE_PROJECTS.length === 20 && ITALY_CLIMATE_PROJECTS.length === 10,
  "England has 20 nationwide projects and Italy has 10 local projects"
);

const swanseaLists = climateProjectListsForClub("Swansea City", "Wales");
assert(
  swanseaLists.local.length === 20 &&
    swanseaLists.local.every((project) => project.country === "England"),
  "Swansea List 1 is 20 Climate Projects from across England"
);
assert(
  swanseaLists.international.length === 10,
  "Swansea List 2 stays 10 international projects"
);
assert(
  swanseaLists.nearby.length === STADIUM_NEARBY_PROJECT_COUNT,
  "Swansea nearby list has 20 Climate Projects"
);
assert(
  swanseaLists.nearby.every((project) =>
    isWithinStadiumRadius(
      project.postcode,
      "Swansea City",
      STADIUM_NEARBY_PROJECT_MILES
    )
  ),
  "Every Swansea nearby project is within 20 miles of the stadium"
);
assert(
  nearbyClimateProjectsForClub("Unknown Athletic").length === 0,
  "A club without a mapped stadium does not get a nearby list"
);
assert(
  CLIMATE_PROJECTS_NEAR_STADIUM_LABEL === "Climate Projects near my Stadium",
  "The third list uses the Climate Projects near my Stadium title"
);
assert(
  new Set(PARTNER_MATCH_DAY_CATALOG.map((project) => project.name)).size ===
    PARTNER_MATCH_DAY_CATALOG.length,
  "Catalog names are unique"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Match Day catalog: featured Global Schools Solar + 20 England / local country lists + nearby stadium list + 10 international."
);
