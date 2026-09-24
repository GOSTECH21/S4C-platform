import { readFileSync } from "fs";
import {
  LEAD_CLIMATE_SPONSOR_LABEL,
  LEAD_CLIMATE_SPONSOR_SHARE,
  LOCAL_BUSINESS_SPONSOR_LABEL,
  LOCAL_BUSINESS_SPONSOR_SHARE,
  localHeaderFlex,
  localSlotScale,
} from "../app/lib/dual-sponsor";
import { LOCAL_SPONSOR_MIN_GBP } from "../app/lib/local-sponsor";
import {
  assignLocalSponsorsToProjects,
  exampleLocalSponsorsForClub,
  localBrandExposuresFromPosts,
  localExposureMultiplier,
} from "../app/lib/match-day-local-sponsors";
import {
  isExampleLocalBrand,
  resolveLeadClimateSponsor,
  resolveMatchDayBranding,
} from "../app/lib/match-day-branding";
import { emptySponsor } from "../app/lib/climate-sponsors";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(LEAD_CLIMATE_SPONSOR_SHARE === 65, "Lead Climate Sponsor occupies 65%");
assert(
  LOCAL_BUSINESS_SPONSOR_SHARE === 35,
  "Local Business Climate Sponsor occupies 35%"
);
assert(
  LEAD_CLIMATE_SPONSOR_SHARE + LOCAL_BUSINESS_SPONSOR_SHARE === 100,
  "Sponsor shares fill the climate project card strip"
);

const projects = [
  { id: "gss", name: "Global Schools Solar" },
  { id: "wood", name: "Scottish Woodland Restoration" },
  { id: "coast", name: "Cleaner Coasts Campaign" },
  { id: "peat", name: "Peatland Recovery" },
  { id: "trees", name: "Urban Tree Planting in Edinburgh" },
];
const locals = exampleLocalSponsorsForClub("Heart of Midlothian");
const placed = assignLocalSponsorsToProjects(projects, locals);

assert(placed.length === 5, "Five local logos are assigned 1-each");
assert(
  placed[0].local?.brandName === "Braidview Garage" &&
    placed[0].local?.pledgeGbp === 1500 &&
    placed[0].project.id === "gss",
  "Highest pledge (£1,500) is on card 1 / Global Schools Solar"
);
assert(
  placed[4].local?.brandName === "Edinburgh Roasters" &&
    placed[4].local?.pledgeGbp === 500,
  "Lowest pledge (£500) is on card 5"
);
assert(
  localExposureMultiplier(1500) === 3 &&
    localExposureMultiplier(LOCAL_SPONSOR_MIN_GBP) === 1,
  "A £1,500 local sponsor gets 3× the exposures of a £500 local sponsor"
);
assert(
  localBrandExposuresFromPosts(10, 1500) ===
    3 * localBrandExposuresFromPosts(10, 500),
  "Posted-fan exposures stay commensurate with pledge"
);
assert(
  localSlotScale(500, 1500) === 1 / 3 && localSlotScale(1500, 1500) === 1,
  "The £500 logo is one-third the size of the £1,500 logo in the 35% slot"
);
assert(
  Math.abs(
    localHeaderFlex(1500, [500, 750, 1000, 1250, 1500]) /
      localHeaderFlex(500, [500, 750, 1000, 1250, 1500]) -
      3
  ) < 1e-9,
  "Today's Climate Sponsors header sizes local logos by pledge"
);

const kokobean = emptySponsor({
  brandName: "Kokobean Cafe",
  jobTitle: "Local Business Climate Sponsor",
  spentGbp: 500,
});
const amex = emptySponsor({
  brandName: "American Express",
  jobTitle: "Sponsorship Manager",
  spentGbp: 50000,
});
assert(
  resolveLeadClimateSponsor({
    clubName: "Hibernian",
    rosterSponsors: [kokobean, amex],
    selected: [kokobean, amex],
    lockedBrandName: "American Express",
    storedLeadName: "Kokobean Cafe",
    campaignSponsorName: "Kokobean Cafe",
  }) === "American Express",
  "A local cafe is never the Lead Climate Sponsor when American Express is locked in"
);

const hibs = resolveMatchDayBranding({
  clubName: "Hibernian",
  projects,
  rosterSponsors: [kokobean, amex],
  selected: [kokobean],
  lockedBrandName: "American Express",
  storedLeadName: "Kokobean Cafe",
  campaignSponsorName: "Kokobean Cafe",
  storedLocals: exampleLocalSponsorsForClub("Hibernian").map((row, index) => ({
    projectId: projects[index].id,
    cardIndex: index + 1,
    brandName: row.brandName,
    pledgeGbp: row.pledgeGbp,
  })),
});
assert(
  hibs.lead.name === "American Express",
  "Hibs fans see American Express as the Lead Climate Sponsor"
);
assert(
  hibs.placements.some((row) => row.local?.brandName === "Kokobean Cafe"),
  "Kokobean Cafe stays a Local Business Climate Sponsor on one card"
);
assert(
  isExampleLocalBrand("Braidview Garage") && !isExampleLocalBrand("Kokobean Cafe"),
  "Demo local logos are distinct from uploaded Hibs locals"
);

const post = readFileSync("app/services/club-match-day.service.ts", "utf8");
assert(
  post.includes("leadSponsorName") &&
    post.includes("localAssignments") &&
    post.split("writeFanPostSchedule").length >= 3,
  "Posting keeps the lead brand and local assignments on the fan schedule"
);
assert(
  readFileSync("app/lib/match-day-post.ts", "utf8").includes(
    "previous.localAssignments"
  ),
  "A later Match Day save does not wipe the five local assignments"
);

const strip = readFileSync("app/components/fan/DualSponsorStrip.tsx", "utf8");
assert(
  strip.includes("LEAD_CLIMATE_SPONSOR_SHARE"),
  "Fan vote cards use the 65% lead sponsor share"
);
assert(
  strip.includes("LOCAL_BUSINESS_SPONSOR_SHARE"),
  "Fan vote cards use the 35% local sponsor share"
);
assert(
  strip.includes("localScale"),
  "Local logos on cards scale with the pledge"
);
assert(
  strip.includes("LEAD_CLIMATE_SPONSOR_LABEL") &&
    LEAD_CLIMATE_SPONSOR_LABEL === "Lead Climate Sponsor",
  "Lead Climate Sponsor is labelled on the card"
);
assert(
  strip.includes("LOCAL_BUSINESS_SPONSOR_LABEL") &&
    LOCAL_BUSINESS_SPONSOR_LABEL === "Local Business Climate Sponsor",
  "Local Business Climate Sponsor is labelled on the card"
);

const vote = readFileSync("app/supporter/dashboard/page.tsx", "utf8");
assert(
  vote.includes("liveMatchDayBranding"),
  "My S4P shows the Match Day five with both sponsors"
);
assert(
  !vote.includes("leftoverSponsor"),
  "Local sponsor is on every vote card, not only leftover projects"
);

const club = readFileSync("app/club/dashboard/page.tsx", "utf8");
assert(
  club.includes("MatchDayLocalSponsorBoard"),
  "The Sustainability Director attaches five local logos before posting"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Fan vote cards: Lead 65% on all five; five locals 1-each, ranked and sized by pledge (£1,500 is 3× £500)."
);
