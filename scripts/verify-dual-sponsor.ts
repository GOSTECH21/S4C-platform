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
  isLeadClimateBrand,
  isLocalBusinessBrand,
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
  localHeaderFlex(1500, [500, 750, 1000, 1250, 1500]) === 1 &&
    localHeaderFlex(500, [500, 750, 1000, 1250, 1500]) === 1,
  "Today's Climate Sponsors header splits the 35% local band equally"
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
  hibs.placements.every(
    (row) => !row.local || !isExampleLocalBrand(row.local.brandName)
  ) &&
    !hibs.placements.some((row) => row.local?.brandName === "Braidview Garage"),
  "Demo locals such as Braidview Garage never appear on posted Hibs cards"
);
assert(
  isExampleLocalBrand("Braidview Garage") &&
    isExampleLocalBrand("Capital Homes") &&
    isExampleLocalBrand("McLeod & Sons") &&
    !isExampleLocalBrand("Kokobean Cafe"),
  "Demo local logos are distinct from uploaded Hibs locals"
);

const topCellar = emptySponsor({
  brandName: "Top Cellar",
  jobTitle: "Sponsorship Manager",
  spentGbp: 800,
});
const mashTun = emptySponsor({
  brandName: "Mash Tun",
  jobTitle: "Local Business Climate Sponsor",
  spentGbp: 500,
});
const interval = emptySponsor({
  brandName: "Interval",
  jobTitle: "Local Business Climate Sponsor",
  spentGbp: 500,
});
const taxAssist = emptySponsor({
  brandName: "Tax Assist",
  jobTitle: "Local Business Climate Sponsor",
  spentGbp: 500,
});
assert(
  isLeadClimateBrand("American Express") &&
    isLeadClimateBrand("Amex") &&
    !isLocalBusinessBrand("American Express", "Hibernian", [topCellar, amex]),
  "American Express is always the Lead Climate Sponsor, never a local"
);
assert(
  isLocalBusinessBrand("Top Cellar", "Hibernian", [topCellar, amex]) &&
    !isLeadClimateBrand("Top Cellar"),
  "Top Cellar stays a Local Business Climate Sponsor even with a national job title"
);
assert(
  resolveLeadClimateSponsor({
    clubName: "Hibernian",
    rosterSponsors: [topCellar, amex, mashTun, kokobean, interval, taxAssist],
    selected: [topCellar, amex],
    lockedBrandName: "Top Cellar",
    storedLeadName: "Top Cellar",
    campaignSponsorName: "Top Cellar",
    extraBrandNames: [
      "American Express",
      "Mash Tun",
      "Kokobean Cafe",
      "Interval",
      "Tax Assist",
    ],
  }) === "American Express",
  "A misplaced Top Cellar lock cannot replace American Express as Lead Climate Sponsor"
);

const hibsCards = resolveMatchDayBranding({
  clubName: "Hibernian",
  projects,
  rosterSponsors: [topCellar, amex, mashTun, kokobean, interval, taxAssist],
  selected: [topCellar, amex],
  lockedBrandName: "Top Cellar",
  storedLeadName: "Top Cellar",
  storedLeadLogoUrl: "top-cellar.png",
  campaignSponsorName: "Top Cellar",
  storedLocals: [
    { projectId: "gss", cardIndex: 1, brandName: "American Express", pledgeGbp: 50000 },
    { projectId: "wood", cardIndex: 2, brandName: "Mash Tun", pledgeGbp: 500 },
    { projectId: "coast", cardIndex: 3, brandName: "Kokobean Cafe", pledgeGbp: 500 },
    { projectId: "peat", cardIndex: 4, brandName: "Interval", pledgeGbp: 500 },
    { projectId: "trees", cardIndex: 5, brandName: "Tax Assist", pledgeGbp: 500 },
  ],
});
assert(
  hibsCards.lead.name === "American Express",
  "Only American Express occupies the Lead Climate Sponsor slot on Hibs cards"
);
assert(
  hibsCards.placements.every((row) => row.local?.brandName !== "American Express"),
  "American Express never appears in the 35% local slot"
);
const localNames = hibsCards.placements
  .map((row) => row.local?.brandName)
  .filter((name): name is string => Boolean(name))
  .sort();
assert(
  localNames.join(",") ===
    ["Interval", "Kokobean Cafe", "Mash Tun", "Tax Assist", "Top Cellar"].join(","),
  "Hibs SD attaches Tax Assist, Top Cellar, Kokobean Cafe, Mash Tun and Interval 1-each"
);
assert(
  hibsCards.placements.every((row) => row.local) &&
    new Set(localNames).size === 5,
  "Each of the five project cards has a different Local Business Climate Sponsor"
);
assert(
  hibsCards.lead.logoUrl !== "top-cellar.png",
  "The Lead Climate Sponsor strip does not reuse a local business logo"
);

const mashOnly = resolveMatchDayBranding({
  clubName: "Hibernian",
  projects,
  rosterSponsors: [amex, mashTun],
  selected: [mashTun],
  lockedBrandName: "American Express",
  storedLocals: [
    { projectId: "gss", cardIndex: 1, brandName: "Braidview Garage", pledgeGbp: 1500 },
    { projectId: "wood", cardIndex: 2, brandName: "Mash Tun", pledgeGbp: 500 },
    { projectId: "coast", cardIndex: 3, brandName: "Thistle Energy", pledgeGbp: 1250 },
    { projectId: "peat", cardIndex: 4, brandName: "Capital Homes Edinburgh", pledgeGbp: 1000 },
    { projectId: "trees", cardIndex: 5, brandName: "McLeod & Sons Solicitors", pledgeGbp: 750 },
  ],
});
assert(
  mashOnly.placements.filter((row) => row.local).length === 1 &&
    mashOnly.placements[0].local?.brandName === "Mash Tun",
  "Only Mash Tun appears when it is the registered local among demo brands"
);
assert(
  mashOnly.placements.every(
    (row) =>
      !row.local ||
      !["Braidview Garage", "Thistle Energy", "Capital Homes Edinburgh", "McLeod & Sons Solicitors"].includes(
        row.local.brandName
      )
  ),
  "Braidview, Thistle Energy, Capital Homes and McLeod & Sons stay off Hibs project cards"
);

const header = readFileSync("app/components/fan/TodaysClimateSponsors.tsx", "utf8");
assert(
  header.includes("LOCAL_BUSINESS_SPONSOR_SHARE") &&
    header.includes("maxWidth") &&
    header.includes("bg-amber-50"),
  "Today's Climate Sponsors keeps local logos inside a distinct 35% band"
);
assert(
  readFileSync("app/components/fan/DualSponsorStrip.tsx", "utf8").includes(
    "isLeadClimateBrand"
  ),
  "Project cards refuse to draw the Lead Climate Sponsor in the 35% local slot"
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
  "My S4P still resolves the Match Day five for the club"
);
assert(
  vote.includes("showSponsors={false}"),
  "My S4P Climate Projects List does not attach a sponsor logo or name"
);
assert(
  vote.includes("ClimateProjectSponsors"),
  "Lead and local Carbon Wallets sit under Climate Project Sponsor"
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
assert(
  !readFileSync("app/components/club/MatchDayLocalSponsorBoard.tsx", "utf8").includes(
    "Load £500"
  ),
  "The club board does not load demo locals onto live project cards"
);

assert(
  readFileSync("app/preview/match-day/page.tsx", "utf8").includes(
    'leadName={branding.lead.name}'
  ) &&
    readFileSync("app/preview/match-day/page.tsx", "utf8").includes("Hibernian"),
  "The Match Day preview renders the live lead/local split for Hibs"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Fan vote cards: Lead American Express 65% on all five; five locals 1-each in the 35% band."
);
