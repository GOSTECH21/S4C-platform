import { readFileSync } from "fs";
import {
  FEATURED_GLOBAL_SCHOOLS_SOLAR,
  FEATURED_PROJECT_NAME,
  PARTNER_MATCH_DAY_CATALOG,
} from "../app/lib/sccan-catalog";
import {
  expandFeaturedGssVersions,
  withFanGssChoices,
} from "../app/lib/featured-gss";
import { featuredClimateProjectCountryLabel } from "../app/lib/featured-climate-country";
import { clubClimateProjectsIntroCopy } from "../app/lib/partner-projects";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const gssCount = PARTNER_MATCH_DAY_CATALOG.filter((project) =>
  /global\s+schools\s+solar/i.test(project.name)
).length;
assert(
  gssCount === 1 &&
    PARTNER_MATCH_DAY_CATALOG[0].name === FEATURED_PROJECT_NAME &&
    FEATURED_GLOBAL_SCHOOLS_SOLAR.country === "Global",
  "The published catalog has one Global Schools Solar project"
);

assert(
  expandFeaturedGssVersions([
    { id: "gss-local", name: "Local Global Schools Solar" },
    { id: "gss-world", name: "International Global Schools Solar" },
  ]).map((row) => `${row.id}:${row.name}`).join(",") === `gss-local:${FEATURED_PROJECT_NAME}`,
  "Legacy local/international GSS cards collapse to one Global Schools Solar"
);

assert(
  withFanGssChoices([
    { id: "gss", name: "Global Schools Solar" },
    { id: "wee", name: "Wee Spoke Hub" },
  ]).map((row) => row.name).join(",") === `${FEATURED_PROJECT_NAME},Wee Spoke Hub`,
  "Fans FUND-IT onto one Featured GSS plus partner projects"
);

assert(
  featuredClimateProjectCountryLabel({ clubName: "Rangers" }) === "Global" &&
    clubClimateProjectsIntroCopy().includes("Local and National Climate Project lists"),
  "GSS is Global, not UK and International, and SDs still pick four partner projects"
);

const picker = readFileSync("app/components/club/FeaturedGssPicker.tsx", "utf8");
const apply = readFileSync("apply-gss-one-global.mjs", "utf8");
assert(
  picker.includes('data-gss-one-global="gss-one-global-v1"') &&
    !picker.includes("There can never be two Featured projects") &&
    apply.includes("cursor/gss-one-global-18f9") &&
    apply.includes("app/lib/featured-gss.ts"),
  "The Featured picker and PC overlay keep a single Global Schools Solar"
);

if (failures.length > 0) {
  console.error("verify-gss-one-global failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("verify-gss-one-global: ok");
