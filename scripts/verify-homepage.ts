import { readFileSync } from "fs";
import {
  HOME_STAKEHOLDERS,
} from "../app/lib/home-stakeholders";
import {
  formatFundingGbp,
  formatStatCount,
  mergePlatformStats,
} from "../app/lib/platform-stats";
import { currentSeasonTeamCount } from "../app/lib/current-season";
import {
  FAN_VOTE_PICK_COUNT,
  LOCAL_SPONSOR_LEFTOVER_COUNT,
  LOCAL_SPONSOR_MIN_GBP,
  leftoverProjectsByVoteCount,
  leftoverProjectsForLocalSponsor,
  leftoverProjectsFromVotes,
} from "../app/lib/local-sponsor";
import {
  LOCAL_SPONSOR_REGISTER_PATH,
  SPONSOR_REGISTER_PATH,
} from "../app/lib/routes";
import { MATCH_DAY_PROJECT_COUNT } from "../app/lib/partner-projects";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(HOME_STAKEHOLDERS.length === 5, "Homepage has five stakeholder cards");
assert(
  HOME_STAKEHOLDERS.some((card) => card.title === "A Local Business Climate Sponsor"),
  "Local Business Climate Sponsor is a homepage option"
);
assert(
  HOME_STAKEHOLDERS.some((card) => card.title === "A National/Global Climate Sponsor"),
  "National/Global Climate Sponsor stays on the homepage"
);
assert(
  HOME_STAKEHOLDERS.some((card) => card.title === "A Climate Projects Provider"),
  "Climate Partner card is now Climate Projects Provider"
);
assert(
  HOME_STAKEHOLDERS.find((card) => card.title === "A Fan")
    ?.description.includes("Climate Impact Fans Table (CIFT)"),
  "Fan narrative mentions CIFT"
);
assert(
  HOME_STAKEHOLDERS.find((card) => card.title === "A Local Business Climate Sponsor")
    ?.register === LOCAL_SPONSOR_REGISTER_PATH,
  "Local sponsor card registers at /sponsor/local/register"
);
assert(
  !HOME_STAKEHOLDERS.find((card) => card.title === "A Local Business Climate Sponsor")
    ?.description.includes("From £"),
  "Local sponsor homepage card does not mention the £500 leftover line"
);
assert(
  HOME_STAKEHOLDERS.find((card) => card.title === "A National/Global Climate Sponsor")
    ?.description.includes("Climate Impact Sponsor Table (CIST)"),
  "National sponsor narrative mentions CIST"
);
assert(
  HOME_STAKEHOLDERS.find((card) => card.title === "A National/Global Climate Sponsor")
    ?.register === SPONSOR_REGISTER_PATH,
  "National sponsor keeps /sponsor/register"
);
assert(
  HOME_STAKEHOLDERS.find((card) => card.title === "A Sports Club")
    ?.description.includes("Climate-Sponsored-Projects"),
  "Club narrative uses Climate-Sponsored-Projects"
);

assert(LOCAL_SPONSOR_MIN_GBP === 500, "Local businesses can sponsor from £500");
assert(
  LOCAL_SPONSOR_LEFTOVER_COUNT === 2 &&
    MATCH_DAY_PROJECT_COUNT - FAN_VOTE_PICK_COUNT === 2,
  "Fans vote for 3 of 5, leaving 2 projects for the local sponsor"
);

const posted = [
  { id: "gss", name: "Global Schools Solar" },
  { id: "a", name: "Local One" },
  { id: "b", name: "Local Two" },
  { id: "c", name: "Cookstove" },
  { id: "d", name: "Mangrove" },
];
const leftover = leftoverProjectsFromVotes({
  posted,
  votedIds: ["gss", "a", "c"],
});
assert(
  leftover.map((row) => row.id).join(",") === "b,d",
  "The 2 projects fans did not vote for are the local-sponsor leftovers"
);
assert(
  leftoverProjectsByVoteCount({
    posted,
    voteCounts: { gss: 4, a: 3, c: 3, b: 0, d: 1 },
  })
    .map((row) => row.id)
    .join(",") === "b,d",
  "Lowest vote counts also yield the two leftovers"
);

assert(
  leftoverProjectsForLocalSponsor({
    posted,
    votedIds: ["gss", "a", "c"],
  })
    .map((row) => row.id)
    .join(",") === "b,d",
  "Local sponsor leftover helper attaches the 2 unvoted projects after fans pick 3"
);
assert(
  leftoverProjectsForLocalSponsor({ posted, votedIds: ["gss"] }).length === 0,
  "Local sponsor name is not attached until voting has 3 picks"
);

const localPage = readFileSync("app/sponsor/local/register/page.tsx", "utf8");
assert(
  localPage.includes("Local Business Climate Sponsor"),
  "Local sponsor registration exists"
);
assert(
  localPage.includes(String(LOCAL_SPONSOR_MIN_GBP)),
  "Local registration states the £500 minimum"
);
assert(
  localPage.includes("one of the five"),
  "Local registration says the logo sits on one of the five Match Day cards"
);
assert(
  localPage.includes("three times"),
  "Local registration states that a £1,500 pledge is three times a £500 pledge"
);
assert(
  !localPage.includes("2 Climate"),
  "Local registration no longer promises leftover-only branding"
);

const before = mergePlatformStats({ fansEngaged: 3 });
const after = mergePlatformStats({ fansEngaged: 4 });
assert(after.fansEngaged === before.fansEngaged + 1, "Fans engaged rises when a fan registers");
assert(
  after.sportsTeams >= currentSeasonTeamCount(),
  "Sports Teams is the real current-season roster"
);
assert(
  mergePlatformStats({ climateProjectsFunded: 0 }).climateProjectsFunded === 0,
  "Climate Projects Funded stays at zero until a project actually receives a vote"
);
assert(
  mergePlatformStats({ climateProjects: 115 }).climateProjectsFunded === 115,
  "Legacy climateProjects counts still map onto Climate Projects Funded"
);
assert(
  mergePlatformStats({ fundingMobilisedGbp: 1250.4 }).fundingMobilisedGbp === 1250.4,
  "£ Climate Funding Mobilised keeps the recorded pounds"
);
assert(
  mergePlatformStats({ impactMomentsCreated: 7 }).impactMomentsCreated === 7,
  "Impact Moments Created uses recorded scores and credits"
);
assert(formatStatCount(1230000) === "1,230,000", "Stat windows use grouped thousands");
assert(formatFundingGbp(0) === "£0", "Zero funding displays as £0");
assert(formatFundingGbp(12500) === "£12,500", "Funding uses a pound sign and grouped thousands");

const homePage = readFileSync("app/page.tsx", "utf8");
assert(homePage.includes("HomeFrontPage"), "Front page uses the new hero and stakeholder layout");
assert(
  homePage.indexOf("<HowItWorks") < homePage.indexOf("<Footer"),
  "How Score-For-Our-Planet Works is composed on the front page"
);
assert(
  homePage.includes("<HowItWorks") &&
    homePage.indexOf("<HomeFrontPage") < homePage.indexOf("<HowItWorks"),
  "How Score-For-Our-Planet Works sits inside the front page, above Are You"
);
assert(
  !homePage.includes("WHO ARE YOU?"),
  "Old WHO ARE YOU heading is replaced"
);

const front = readFileSync("app/components/home/HomeFrontPage.tsx", "utf8");
assert(
  front.includes('id={JOIN_SECTION_ID}') || front.includes('id="are-you"'),
  "Are You has an anchor the Login and Register tabs can scroll to"
);
assert(front.includes("Are You……?"), "New Are You heading is on the front page");
assert(
  front.includes('showJoin("login")') &&
    front.includes('showJoin("register")') &&
    front.includes("scrollIntoView") &&
    front.includes("role=\"tablist\""),
  "Top-right Login and Register tabs take visitors to the role cards"
);
assert(
  !front.includes("history.replaceState") &&
    !front.includes("`#${intent}`"),
  "Login and Register tabs must not write #login/#register into history (that 404s the role pages)"
);
assert(
  front.includes("{children}") &&
    front.indexOf("{children}") < front.indexOf("Are You……?"),
  "How Score-For-Our-Planet Works is rendered above Are You"
);
assert(front.includes("Fans Engaged"), "Fans engaged window is on the front page");
assert(front.includes("/api/platform-stats"), "Stat windows refresh from live platform stats");
assert(
  !front.includes("Sport today"),
  "Top-right Sport today slogan is removed from the hero"
);
assert(
  !front.includes("Every score protects our planet"),
  "Top-left S4P wordmark is removed from the hero"
);
assert(
  front.includes("creates the moment") &&
    front.includes("text-emerald-400\">Sport") &&
    front.includes("text-emerald-400\">Sponsors") &&
    front.includes("text-emerald-400\">Fans") &&
    front.includes("text-emerald-400\">Impact"),
  "Hero statement sits between the S4P mark and the stats bar, with Sport, Sponsors, Fans and Impact in green"
);

assert(
  front.includes("Turning Match-Day Sporting Moments into Funded Climate Action"),
  "The S4P logo carries the Funded Climate Action line underneath"
);
assert(
  front.includes("£ Climate Funding Mobilised") &&
    front.includes("Impact Moments Created") &&
    front.includes("Fans Engaged") &&
    front.includes("Sports Teams") &&
    front.includes("Climate Projects Funded"),
  "Stats bar shows funding, impact moments, fans, sports teams and funded projects"
);
assert(
  !front.includes("Trees Planted") &&
    !front.includes("tCO₂e Avoided") &&
    !front.includes("A Brighter"),
  "Catalog Trees Planted / tCO2e / Brighter Tomorrow windows are removed"
);
assert(
  front.includes("S4pImpactTables") &&
    !front.includes("hero-athletes-v2"),
  "Right-hand hero image is replaced by S4P Impact Tables"
);

const impactWidget = readFileSync("app/components/home/S4pImpactTables.tsx", "utf8");
const impactLib = readFileSync("app/lib/s4p-impact-tables.ts", "utf8");
assert(
  impactWidget.includes("S4P IMPACT TABLES") &&
    impactLib.includes('shortName: "CILT"') &&
    impactLib.includes('shortName: "CIST"') &&
    impactLib.includes('shortName: "CIFT"') &&
    impactLib.includes("View Full Climate Impact League Table →") &&
    impactLib.includes("View Full Climate Impact Sponsorship Table →") &&
    impactLib.includes("View Full Climate Impact Fans Table →"),
  "Impact Tables widget has CILT, CIST and CIFT tabs and a View Full link"
);

const howItWorks = readFileSync("app/components/home/HowItWorks.tsx", "utf8");
assert(
  howItWorks.includes("CLUBS CHOOSE PROJECTS") &&
    howItWorks.includes("five eligible Climate Projects"),
  "Step 01 is CLUBS CHOOSE PROJECTS"
);
assert(
  howItWorks.includes("SPONSORS FUND THE IMPACT MOMENTS") &&
    howItWorks.includes("Local Businesses fund fan participation") &&
    howItWorks.includes("Goals-Scored"),
  "Step 02 is SPONSORS FUND THE IMPACT MOMENTS"
);
assert(
  howItWorks.includes("FANS DIRECT THE FUNDING") &&
    howItWorks.includes("Fans allocate real Sponsor-funded money"),
  "Step 03 is FANS DIRECT THE FUNDING"
);
assert(
  howItWorks.includes("PROJECTS DELIVER THE IMPACT") &&
    howItWorks.includes("Climate Project Providers receive funding"),
  "Step 04 is PROJECTS DELIVER THE IMPACT"
);
assert(
  howItWorks.includes("EVERYONE CREATES IMPACT") &&
    howItWorks.includes("Clubs address Match-Day carbon footprints"),
  "Step 05 is EVERYONE CREATES IMPACT"
);

const sql = readFileSync(
  "supabase/migrations/0012_platform_stats_funding.sql",
  "utf8"
);
assert(
  sql.includes("fundingMobilisedGbp") &&
    sql.includes("impactMomentsCreated") &&
    sql.includes("climateProjectsFunded"),
  "Hosted SQL returns real funding, impact moments and funded-project counts"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Homepage: five stakeholders including Local Business Climate Sponsor; live stats; leftover projects."
);
