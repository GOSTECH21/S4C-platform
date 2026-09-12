import {
  FEATURED_GLOBAL_SCHOOLS_SOLAR,
  FEATURED_PROJECT_NAME,
  INTERNATIONAL_CLIMATE_PROJECTS,
  PARTNER_MATCH_DAY_CATALOG,
  SELECTABLE_MATCH_DAY_CATALOG,
  UK_CLIMATE_PROJECTS,
} from "../app/lib/sccan-catalog";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(UK_CLIMATE_PROJECTS.length === 10, "Page 1 has 10 UK Climate Partner projects");
assert(
  INTERNATIONAL_CLIMATE_PROJECTS.length === 10,
  "Page 2 has 10 international Climate Partner projects"
);
assert(
  INTERNATIONAL_CLIMATE_PROJECTS[0].name === "Ugandan Cookstove",
  "Ugandan Cookstove is the first international project"
);
assert(
  SELECTABLE_MATCH_DAY_CATALOG.length === 20,
  "SDs choose from 20 partner projects"
);
assert(
  PARTNER_MATCH_DAY_CATALOG.length === 21,
  "Published catalog is featured Global Schools Solar plus 20 choosable projects"
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
  UK_CLIMATE_PROJECTS.every(
    (project) =>
      project.country === "United Kingdom" || project.country === "Scotland"
  ),
  "UK catalog projects are United Kingdom / Scotland"
);
assert(
  new Set(PARTNER_MATCH_DAY_CATALOG.map((project) => project.name)).size === 21,
  "Catalog names are unique"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Match Day catalog: featured Global Schools Solar + 10 UK + 10 international."
);
