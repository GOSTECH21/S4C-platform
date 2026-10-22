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
      ?.description.includes(
        "Fund up to 5 Climate Projects with monies from Sponsors on every Match Day"
      ) &&
    !HOME_STAKEHOLDERS.find((card) => card.title === "A Fan")
      ?.description.includes("FUND-IT up to 5 times"),
  "Fan narrative says fund up to 5 Climate Projects from Sponsors on every Match Day"
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
    ?.description.includes("Climate Impact Sponsor Table (CIST)") &&
    HOME_STAKEHOLDERS.find((card) => card.title === "A National/Global Climate Sponsor")
      ?.description.includes("e.g a Goal-scored") &&
    HOME_STAKEHOLDERS.find((card) => card.title === "A National/Global Climate Sponsor")
      ?.description.includes(
        "direct engagement with Fans & Supporters who care about your environmental credentials"
      ) &&
    !HOME_STAKEHOLDERS.find((card) => card.title === "A National/Global Climate Sponsor")
      ?.description.includes("measure your environmental impact"),
  "National sponsor narrative covers Goal-scored, Fan engagement and CIST"
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
  localPage.includes("ClubNetworkPicker") &&
    localPage.includes("business postcode") &&
    localPage.includes("Score-4-Planet") &&
    localPage.includes("Sign & SUBMIT") &&
    localPage.includes("<ol") &&
    !localPage.includes("Terms and Conditions apply. Sign off this Local Business Climate"),
  "Local registration asks for postcode, logo if available, club, T&Cs, then Sign & SUBMIT"
);
assert(
  localPage.includes("Match / Matches"),
  "Local registration still lets a business choose Match amounts"
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
  !homePage.includes("<HowItWorks"),
  "How S4P Works is composed inside the front page, not as a page.tsx child"
);
assert(
  homePage.includes("<HomeFrontPage") &&
    homePage.indexOf("<HomeFrontPage") < homePage.indexOf("<Footer"),
  "The new banner, Access & Join phone and Are You cards sit above the footer"
);
assert(
  !homePage.includes("WHO ARE YOU?"),
  "Old WHO ARE YOU heading is replaced"
);
assert(
  !homePage.includes("impactTables") &&
    !homePage.includes("initialStats") &&
    !homePage.includes("loadPlatformStats") &&
    !homePage.includes("loadS4pImpactTables"),
  "The new front page no longer loads Impact Tables or the live stats bar"
);

const front = readFileSync("app/components/home/HomeFrontPage.tsx", "utf8");
const banner = readFileSync("app/components/home/HomeTopBanner.tsx", "utf8");
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
  front.includes('bg-s4p-mark text-slate-950') &&
    !front.includes("bg-emerald-500 text-slate-950"),
  "Login and Register tabs use the S4P mark green from the numeral 4"
);
assert(
  front.includes("rounded-xl bg-s4p-mark px-2 py-3") &&
    !front.includes("rounded-xl bg-emerald-500 px-2 py-3"),
  "Are You Register and Login buttons use the S4P mark green from the numeral 4"
);
assert(
  !front.includes("history.replaceState") &&
    !front.includes("`#${intent}`"),
  "Login and Register tabs must not write #login/#register into history (that 404s the role pages)"
);
assert(
  front.includes("HomeTopBanner") &&
    front.indexOf("HomeTopBanner") < front.indexOf("Are You...?"),
  "The Every Score Counts banner sits at the top, above Are You"
);
assert(
  front.includes("<HowItWorks") &&
    front.indexOf("<HowItWorks") < front.indexOf("Are You...?"),
  "How S4P Works sits above Are You"
);
assert(
  front.includes("onCreateAccount") &&
    front.includes("onLogin") &&
    front.includes('showJoin("register")') &&
    front.includes('showJoin("login")'),
  "Create Account and Log in on the How S4P Works phone take visitors to the role cards"
);
assert(
  !front.includes("Turn Goals") &&
    !front.includes("S4pImpactTables") &&
    !front.includes("loadPlatformStats") &&
    !front.includes("Fans Engaged") &&
    !front.includes("{children}"),
  "Turn Goals, Impact Tables and the stats bar are removed from the front page"
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
  banner.includes("SCORE-FOR-PLANET") &&
    banner.includes("Every score counts") &&
    banner.includes("Every fan counts") &&
    banner.includes("Fans at the stadium") &&
    banner.includes("A cleaner planet") &&
    banner.includes('src="/images/home/s4p-lockup.png"') &&
    banner.includes("#5bc662") &&
    banner.includes("unoptimized") &&
    banner.includes("border-b border-emerald-400/20") &&
    !banner.includes("every-score-counts-banner.png") &&
    !banner.includes("bg-black") &&
    !banner.includes("#041018") &&
    !banner.includes("rgba(4, 16, 24") &&
    !banner.includes("Score-4-our-Planet") &&
    !banner.includes("Turning Match-Day Sporting Moments into"),
  "The homepage uses the S4P lockup with a highlighted 4 and Every score counts on ivory paper"
);

assert(
  !front.includes("Turning Match-Day Sporting Moments into") &&
    !front.includes("Funded Climate Action") &&
    !front.includes("Sport creates the moment."),
  "Old Score-4-our-Planet taglines under the mark are gone"
);
assert(
  !front.includes("drop-shadow-2xl") &&
    !front.includes('src="/images/home/s4p-mark.png"'),
  "The old centred S4P mark is gone from the front page"
);

const globalCss = readFileSync("app/globals.css", "utf8");
assert(
  globalCss.includes("--color-s4p-mark: #5bc662") &&
    globalCss.includes(".bg-s4p-mark"),
  "S4P mark green is the leaf colour sampled from the numeral 4"
);
assert(
  globalCss.includes(".s4p-navy-panel") &&
    globalCss.includes("--s4p-ink: #000000") &&
    globalCss.includes("--s4p-mint: #0c5c2c") &&
    globalCss.includes("#f7f4e8"),
  "Copy is black and green on ivory"
);
assert(
  !front.includes("WICKET") &&
    !front.includes("Sponsor-funded") &&
    !front.includes("Match-Day Carbon Footprints"),
  "The Turn Goals GOAL / TRY / TOUCHDOWN / WICKET hero line is gone"
);
assert(
  !front.includes("£ Climate Funding Mobilised") &&
    !front.includes("Impact Moments Created") &&
    !front.includes("Sports Teams") &&
    !front.includes("Climate Projects Funded"),
  "Stats bar is off the new front page"
);
assert(
  !front.includes("Trees Planted") &&
    !front.includes("tCO₂e Avoided") &&
    !front.includes("A Brighter"),
  "Catalog Trees Planted / tCO2e / Brighter Tomorrow windows are removed"
);
assert(
  !front.includes("hero-athletes-v2"),
  "Old athlete hero image stays off the front page"
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
    impactWidget.includes("text-s4p-mint") &&
    !impactWidget.includes("text-amber-300") &&
    impactWidget.includes("Impact Moments") &&
    impactWidget.includes("Climate Funding") &&
    impactWidget.includes("Climate Impact") &&
    impactWidget.includes("board.entityColumn") &&
    impactWidget.includes("row.impactMoments") &&
    impactWidget.includes("row.funding") &&
    impactWidget.includes("row.climateImpact") &&
    !impactWidget.includes("h-full") &&
    !impactWidget.includes("flex-1"),
  "Impact Tables widget has CILT, CIST and CIFT tabs plus Pos, Club, Impact Moments, Climate Funding and Climate Impact"
);

const howItWorks = readFileSync("app/components/home/HowItWorks.tsx", "utf8");
assert(
  howItWorks.includes("How S") &&
    howItWorks.includes("P Works") &&
    howItWorks.includes("How Score-For-Planet Works") === false &&
    howItWorks.includes("A quick guide to") &&
    howItWorks.includes("making a real difference") &&
    howItWorks.includes("Same passion. Cleaner planet.") &&
    howItWorks.includes("Every score counts. Every fan counts.") &&
    howItWorks.includes('src="/images/home/s4p-lockup.png"') &&
    !howItWorks.includes("How Score-For-Our-Planet Works"),
  "How It Works starts with the HOW S4P WORKS lockup strip"
);
assert(
  howItWorks.includes("bg-s4p-mark") && !howItWorks.includes("bg-green-500"),
  "How It Works step numbers 01-05 use the S4P mark green from the numeral 4"
);
assert(
  howItWorks.includes('src="/images/home/access-join-phone.png"') &&
    howItWorks.includes("Join in seconds") &&
    howItWorks.includes("matches, predictions and climate impact features") &&
    howItWorks.includes('id={ACCESS_JOIN_ID}') &&
    howItWorks.includes('aria-label="Create Account"') &&
    howItWorks.includes('aria-label="Log in"') &&
    howItWorks.includes("unoptimized") &&
    !howItWorks.includes("CLUBS CHOOSE PROJECTS"),
  "Step 01 is Access & Join plus the Join in seconds line"
);
assert(
  howItWorks.includes('src="/images/home/select-match-phone.png"') &&
    howItWorks.includes("Pick the upcoming match") &&
    howItWorks.includes("kick-off time") &&
    howItWorks.includes("climate mission") &&
    !howItWorks.includes("SPONSORS FUND THE IMPACT MOMENTS"),
  "Step 02 is Select Match plus the pick-the-match line"
);
assert(
  howItWorks.includes('src="/images/home/how-youre-supporting-phone.png"') &&
    howItWorks.includes("Both stadium and remote fans") &&
    howItWorks.includes("same match-day climate mission") &&
    !howItWorks.includes("FANS DIRECT THE FUNDING"),
  "Step 03 is How You're Supporting plus the stadium and remote fans line"
);
assert(
  howItWorks.includes('src="/images/home/plan-your-travel-phone.png"') &&
    howItWorks.includes("Estimate your return distance") &&
    howItWorks.includes("No tracking. No postcode.") &&
    !howItWorks.includes("PROJECTS DELIVER THE IMPACT"),
  "Step 04 is Plan Your Travel plus the return-distance line"
);
assert(
  howItWorks.includes('src="/images/home/match-day-climate-mission-phone.png"') &&
    howItWorks.includes("live carbon target") &&
    howItWorks.includes("sponsor channel") &&
    !howItWorks.includes("EVERYONE CREATES IMPACT"),
  "Step 05 is Match Day Climate Mission plus the live target line"
);
assert(
  howItWorks.includes('src="/images/home/choose-direct-impact-phone.png"') &&
    howItWorks.includes("five club-approved climate projects") &&
    howItWorks.includes("sponsor-funded money"),
  "Step 06 is Choose & Direct Your Impact plus the club-approved projects line"
);

const footer = readFileSync("app/components/home/Footer.tsx", "utf8");
assert(
  footer.includes("Score-For-Planet") &&
    !footer.includes("Score-For-Our-Planet"),
  "Footer branding matches Score-For-Planet"
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
  "Homepage: Every Score Counts banner, Access & Join phone, then five Are You stakeholders."
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
