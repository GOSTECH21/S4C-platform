import {
  FEATURED_GLOBAL_SCHOOLS_SOLAR,
  FEATURED_PROJECT_NAME,
  PARTNER_MATCH_DAY_CATALOG,
  SCCAN_CLIMATE_PROJECTS,
} from "../app/lib/sccan-catalog";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(SCCAN_CLIMATE_PROJECTS.length === 19, "MVP catalog has 19 SCCAN projects");
assert(
  PARTNER_MATCH_DAY_CATALOG.length === 20,
  "SD list is 19 SCCAN projects plus featured Global Schools Solar"
);
assert(
  PARTNER_MATCH_DAY_CATALOG[0].name === FEATURED_PROJECT_NAME,
  "Global Schools Solar is first in the partner catalog"
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
  SCCAN_CLIMATE_PROJECTS.every((project) => project.country === "Scotland"),
  "SCCAN projects are Scottish community climate action"
);
assert(
  new Set(PARTNER_MATCH_DAY_CATALOG.map((project) => project.name)).size === 20,
  "Catalog names are unique"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("SCCAN Climate Partner catalog: 19 + featured Global Schools Solar.");
