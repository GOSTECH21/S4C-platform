import { readFileSync } from "fs";
import {
  HOME_STAKEHOLDERS,
} from "../app/lib/home-stakeholders";
import {
  formatFundingGbp,
  formatStatCount,
  mergePlatformStats,
} from "../app/lib/platform-stats";
import {
  fundingMobilisedFromTakes,
  withWalletTakes,
} from "../app/lib/climate-wallet-takes";
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
    ?.description.includes("Climate Impact Fans Table (CIFT)") &&
    HOME_STAKEHOLDERS.find((card) => card.title === "A Fan")
      ?.description.includes("FUND-IT up to 5 times"),
  "Fan narrative mentions CIFT and FUND-IT up to 5 times"
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
  LOCAL_SPONSOR_LEFTOVER_COUNT === 0 &&
    FAN_VOTE_PICK_COUNT === MATCH_DAY_PROJECT_COUNT,
  "Fans FUND-IT onto any of the 5 Climate Projects; leftover-only local branding is retired"
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
  leftoverCount: 2,
});
assert(
  leftover.map((row) => row.id).join(",") === "b,d",
  "Unused-project helper still returns the two unfunded ids when asked"
);
assert(
  leftoverProjectsByVoteCount({
    posted,
    voteCounts: { gss: 4, a: 3, c: 3, b: 0, d: 1 },
    leftoverCount: 2,
  })
    .map((row) => row.id)
    .join(",") === "b,d",
  "Lowest FUND-IT counts still yield the two unused projects when asked"
);

assert(
  leftoverProjectsForLocalSponsor({
    posted,
    votedIds: ["gss", "a", "c"],
  }).length === 0,
  "Local sponsors no longer wait for 3 fan picks before attaching leftover projects"
);
assert(
  leftoverProjectsForLocalSponsor({ posted, votedIds: ["gss"] }).length === 0,
  "Local sponsor leftover branding stays off the old 3-of-5 vote model"
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
  after.sportsTeams === currentSeasonTeamCount(),
  "Sports Teams is exactly the current-season catalog, not leftover club rows"
);
assert(
  mergePlatformStats({ sportsTeams: 221, teamsInvolved: 221 }).sportsTeams ===
    currentSeasonTeamCount(),
  "A clubs-table count of 221 must not leak onto the Sports Teams window"
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
  "Impact Moments Created uses recorded score events"
);
assert(formatStatCount(1230000) === "1,230,000", "Stat windows use grouped thousands");
assert(formatFundingGbp(0) === "£0", "Zero funding displays as £0");
assert(formatFundingGbp(12500) === "£12,500", "Funding uses a pound sign and grouped thousands");
assert(
  formatFundingGbp(1816000.5) === "£1,816,000.50",
  "Pence still display when a funding amount includes 50p"
);
assert(
  formatFundingGbp(3) === "£3" && formatFundingGbp(3.5) === "£3.50",
  "A few pounds of wallet-to-project takes display as pounds, with pence when needed"
);
assert(
  fundingMobilisedFromTakes(0, 0.5) === 0.5 &&
    withWalletTakes(mergePlatformStats({ fundingMobilisedGbp: 1816000 }), 0.5)
      .fundingMobilisedGbp === 0.5 &&
    formatFundingGbp(
      withWalletTakes(mergePlatformStats({ fundingMobilisedGbp: 1816000 }), 3)
        .fundingMobilisedGbp
    ) === "£3",
  "The funding bar is wallet-to-project takes only and ignores signed-offer totals"
);
assert(
  withWalletTakes(
    mergePlatformStats({ fundingMobilisedGbp: 1816000, walletTakesGbp: 3 }),
    3.5
  ).fundingMobilisedGbp === 3.5,
  "Local Carbon Wallet takes raise the bar from the hosted take ledger, not from £1.8m"
);

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
assert(front.includes("Are You...?"), "New Are You heading is on the front page");
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
    front.indexOf("{children}") < front.indexOf("Are You...?"),
  "How Score-For-Our-Planet Works is rendered above Are You"
);
assert(front.includes("Fans Engaged"), "Fans engaged window is on the front page");
assert(
  front.includes("loadPlatformStats") &&
    front.includes("initialStats") &&
    front.includes("/api/platform-stats"),
  "Stat windows render server stats then refresh from the live roster"
);
assert(
  readFileSync("app/page.tsx", "utf8").includes("initialStats") &&
    readFileSync("app/page.tsx", "utf8").includes("loadPlatformStats"),
  "The homepage HTML includes the live Fans Engaged and funding counts"
);
assert(
  front.includes("withWalletTakes") &&
    front.includes("WALLET_TAKE_EVENT") &&
    front.includes("SPONSORED_GOAL_EVENT"),
  "The funding bar shows Carbon Wallet takes as soon as a fan allocates them, and Impact Moments refresh when a sponsored goal is posted"
);
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
    front.includes("text-s4p-mark\">Sport") &&
    front.includes("text-s4p-mark\">Sponsors") &&
    front.includes("text-s4p-mark\">Fans") &&
    front.includes("text-s4p-mark\">Impact"),
  "Hero statement sits between the S4P mark and the stats bar, with Sport, Sponsors, Fans and Impact in the S4P mark green"
);

assert(
  front.includes("Turning Match-Day Sporting Moments into") &&
    front.includes("Funded Climate Action") &&
    front.includes('block text-s4p-mark">Funded Climate Action') &&
    !front.includes("Turning Match-Day Sporting Moments into Funded Climate Action"),
  "The S4P logo tagline is two lines, with Funded Climate Action in the S4P mark green"
);
assert(
  front.includes('text-s4p-mark">a brighter planet'),
  "A brighter planet uses the S4P mark green from the numeral 4"
);

const globalCss = readFileSync("app/globals.css", "utf8");
assert(
  globalCss.includes("--color-s4p-mark: #5bc662"),
  "S4P mark green is the leaf colour sampled from the numeral 4"
);
assert(
  front.includes("WICKET") &&
    front.includes("&amp; every") &&
    front.includes("can unlock a") &&
    front.includes("Sponsor-funded") &&
    front.includes("Match-Day Carbon Footprints"),
  "Top-left hero line covers GOAL, TRY, TOUCHDOWN & WICKET unlocking an IMPACT MOMENT"
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
    impactLib.includes("Top 5 Climate Impact League Table (CILT)") &&
    impactLib.includes("View Full Climate Impact League Table →") &&
    impactLib.includes("View Full Climate Impact Sponsorship Table →") &&
    impactLib.includes("View Full Climate Impact Fans Table →") &&
    impactWidget.includes("h-fit") &&
    impactWidget.includes("text-s4p-mark") &&
    impactWidget.includes("text-amber-300") &&
    !impactWidget.includes("h-full") &&
    !impactWidget.includes("flex-1"),
  "Impact Tables widget has CILT, CIST and CIFT tabs, gold metrics and a compact View Full link"
);

const howItWorks = readFileSync("app/components/home/HowItWorks.tsx", "utf8");
assert(
  howItWorks.includes("CLUBS CHOOSE PROJECTS") &&
    howItWorks.includes("five eligible Climate Projects") &&
    howItWorks.includes(
      "The selected Projects help to mitigate the Club's Match-Day Carbon emissions"
    ),
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
    howItWorks.includes("FUND-IT up to 5 times") &&
    howItWorks.includes(
      "(creating a DIRECT FAN ENGAGEMENT FOR LOCAL BUSINESSES)"
    ),
  "Step 03 is FANS DIRECT THE FUNDING with FUND-IT up to 5 times"
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
const takeSql = readFileSync(
  "supabase/migrations/0013_climate_wallet_takes.sql",
  "utf8"
);
assert(
  takeSql.includes("climate_wallet_takes") && takeSql.includes("amount_gbp"),
  "Hosted SQL stores each fan take from a Carbon Wallet"
);
const liveSql = readFileSync(
  "supabase/migrations/0014_platform_stats_wallet_takes.sql",
  "utf8"
);
assert(
  liveSql.includes("s4p_fans_engaged") &&
    liveSql.includes("fansCountedAsRoster") &&
    liveSql.includes("climate_wallet_takes") &&
    !liveSql.includes("sponsor_match_offers"),
  "Hosted SQL counts unique fans like Admin and funds the bar from wallet takes only"
);
const momentsSql = readFileSync(
  "supabase/migrations/0015_platform_stats_score_events.sql",
  "utf8"
);
assert(
  momentsSql.includes("score_events") &&
    momentsSql.includes("sportsTeams") &&
    !momentsSql.includes("sponsor_climate_credits") &&
    !momentsSql.includes("from public.clubs"),
  "Hosted SQL counts Impact Moments from score events and does not count leftover club rows"
);
const statsService = readFileSync("app/services/platform-stats.service.ts", "utf8");
assert(
  statsService.includes("s4p_fans_engaged") &&
    statsService.includes("fansCountedAsRoster") &&
    statsService.includes("engagedFanCount") &&
    statsService.includes("club_accounts") &&
    statsService.includes("score_events") &&
    statsService.includes("currentSeasonTeamCount") &&
    !statsService.includes("signedOfferFundingGbp") &&
    !statsService.includes("sponsor_match_offers"),
  "Platform stats count unique fans like Admin, teams from the season catalog, and Impact Moments from score events"
);
const folderService = readFileSync("app/services/match-day-folder.service.ts", "utf8");
assert(
  folderService.includes("persistClimateWalletTake"),
  "Fan Carbon Wallet votes are recorded as Climate Funding Mobilised"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Homepage: five stakeholders including Local Business Climate Sponsor; live stats; leftover projects."
);

if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  import("../app/services/platform-stats.service")
    .then(({ loadPlatformStats }) => loadPlatformStats())
    .then((stats) => {
      if (stats.fansEngaged === 18) {
        throw new Error("Live Fans Engaged is still the raw supporter-row count of 18");
      }
      if (stats.fundingMobilisedGbp >= 1_000_000) {
        throw new Error(
          `Live Climate Funding Mobilised is still £${stats.fundingMobilisedGbp} (signed credits, not wallet takes)`
        );
      }
      if (stats.sportsTeams !== currentSeasonTeamCount()) {
        throw new Error(
          `Live Sports Teams is ${stats.sportsTeams}, expected exactly ${currentSeasonTeamCount()} current-season clubs`
        );
      }
      if (stats.impactMomentsCreated >= 500) {
        throw new Error(
          `Live Impact Moments Created is still ${stats.impactMomentsCreated} (climate credits, not score events)`
        );
      }
      console.log(
        `Live homepage stats: ${stats.fansEngaged} fans engaged, £${stats.fundingMobilisedGbp} mobilised, ${stats.sportsTeams} teams, ${stats.impactMomentsCreated} impact moments.`
      );
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    });
}
