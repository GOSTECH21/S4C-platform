import {
  ENGLAND_CLIMATE_PROJECTS,
  FEATURED_GLOBAL_SCHOOLS_SOLAR,
  FEATURED_PROJECT_NAME,
  INTERNATIONAL_CLIMATE_PROJECTS,
  ITALY_CLIMATE_PROJECTS,
  LOCAL_CLIMATE_PROJECTS_BY_COUNTRY,
  PARTNER_MATCH_DAY_CATALOG,
  SCOTLAND_CLIMATE_PROJECTS,
  SELECTABLE_MATCH_DAY_CATALOG,
  selectableCatalogForCountry,
} from "../app/lib/sccan-catalog";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

for (const [country, catalog] of Object.entries(LOCAL_CLIMATE_PROJECTS_BY_COUNTRY)) {
  assert(catalog.length === 10, `${country} has 10 local Climate Partner projects`);
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
assert(
  arsenal.slice(0, 10).every((project) => project.country === "England"),
  "Arsenal page 1 is England"
);
assert(
  arsenal.slice(0, 10).some((project) => project.name === "London Community Retrofit"),
  "Arsenal local list includes London Community Retrofit"
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
  hearts.slice(10).every((project, index) => project.name === arsenal.slice(10)[index].name),
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
  PARTNER_MATCH_DAY_CATALOG[0].name === FEATURED_PROJECT_NAME,
  "Global Schools Solar is first in the published catalog"
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
  ENGLAND_CLIMATE_PROJECTS.length === 10 && ITALY_CLIMATE_PROJECTS.length === 10,
  "England and Italy each have 10 local projects"
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
  "Match Day catalog: featured Global Schools Solar + local country lists + 10 international."
);
