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

assert(HOME_STAKEHOLDERS.length === 6, "Homepage has six role cards");
assert(
  HOME_STAKEHOLDERS.some((card) => card.title === "Local Businesses"),
  "Local businesses are a homepage option"
);
assert(
  HOME_STAKEHOLDERS.some((card) => card.title === "Global Brands"),
  "Global brands stay on the homepage"
);
assert(
  HOME_STAKEHOLDERS.some((card) => card.title === "Climate Project Providers"),
  "Climate Partner card is now Climate Project Providers"
);
assert(
  HOME_STAKEHOLDERS.some((card) => card.title === "Philanthropists") &&
    HOME_STAKEHOLDERS.find((card) => card.title === "Philanthropists")
      ?.description.includes("any amount per match") &&
    HOME_STAKEHOLDERS.find((card) => card.title === "Philanthropists")
      ?.description.includes("Climate Impact League Table (CILT)") &&
    !HOME_STAKEHOLDERS.find((card) => card.title === "Philanthropists")
      ?.description.includes("£10,000 per match"),
  "Philanthropists can make any-amount climate donations that fans direct toward CILT"
);
assert(
  HOME_STAKEHOLDERS.find((card) => card.title === "Fans")
    ?.description.includes("direct sponsor-funded money to climate projects") &&
    HOME_STAKEHOLDERS.find((card) => card.title === "Fans")
      ?.kicker.includes("Support your team") &&
    !HOME_STAKEHOLDERS.find((card) => card.title === "Fans")
      ?.description.includes("FUND-IT up to 5 times"),
  "Fan narrative follows the team, Predict-For Planet and sponsor-funded projects"
);
assert(
  HOME_STAKEHOLDERS.find((card) => card.title === "Local Businesses")
    ?.register === LOCAL_SPONSOR_REGISTER_PATH,
  "Local sponsor card registers at /sponsor/local/register"
);
assert(
  !HOME_STAKEHOLDERS.find((card) => card.title === "Local Businesses")
    ?.description.includes("From £"),
  "Local sponsor homepage card does not mention the £500 leftover line"
);
assert(
  HOME_STAKEHOLDERS.find((card) => card.title === "Global Brands")
    ?.description.includes("fund measurable climate action") &&
    HOME_STAKEHOLDERS.find((card) => card.title === "Global Brands")
      ?.kicker.includes("brand purpose") &&
    HOME_STAKEHOLDERS.find((card) => card.title === "Global Brands")
      ?.register === SPONSOR_REGISTER_PATH,
  "Global brands keep /sponsor/register and purpose-to-impact copy"
);
assert(
  HOME_STAKEHOLDERS.find((card) => card.title === "Sports Clubs")
    ?.description.includes(
      "Mobilize your fans to unlock sponsored funding to deliver approved climate projects & offset your Match Day carbon footprint"
    ) &&
    !HOME_STAKEHOLDERS.find((card) => card.title === "Sports Clubs")
      ?.description.includes("Measure match-day emissions"),
  "Club narrative mobilizes fans to unlock sponsored funding and offset Match Day carbon"
);
assert(
  HOME_STAKEHOLDERS.every((card) => card.image.startsWith("/images/home/role-")) &&
    HOME_STAKEHOLDERS.some((card) => card.image.includes("philanthropist")),
  "Role cards use the Image 1 crops, including philanthropists"
);
assert(
  HOME_STAKEHOLDERS.every(
    (card) =>
      Boolean(card.shortDescription) &&
      card.shortDescription.length < card.description.length
  ),
  "Each role card has a shorter mobile description"
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
  localPage.includes("formReady") &&
    localPage.includes("SafeInput") &&
    localPage.includes('roleRegisterAccount("local")') &&
    localPage.includes("account.organisationName") &&
    localPage.includes("account.emailName") &&
    localPage.includes('autoComplete="off"') &&
    !localPage.includes("<input") &&
    !localPage.includes('name="email"') &&
    !localPage.includes('name="password"') &&
    readFileSync("app/components/forms/SafeFormField.tsx", "utf8").includes(
      "suppressHydrationWarning"
    ),
  "Local sponsor registration waits for the client and uses unique field names so Chrome/LastPass cannot mismatch SSR HTML"
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
const roles = readFileSync("app/components/home/HomeRoleSection.tsx", "utf8");
assert(
  front.includes("JOIN_SECTION_ID") &&
    roles.includes('id="are-you"') &&
    front.includes("<HomeRoleSection"),
  "Role cards keep an are-you anchor the Login and Register tabs can scroll to"
);
assert(
  roles.includes("Different roles. One mission. A cleaner, greener sport.") &&
    roles.includes("Join the S4P community") &&
    roles.includes(
      "Find your role below and discover how you can make a difference."
    ) &&
    !roles.includes("Whether you are a Fan/supporter") &&
    !roles.includes("S4P helps you") &&
    !roles.includes("reach your goals") &&
    roles.includes("Major Sports") &&
    !roles.includes("/images/home/roles-heading-strip.png") &&
    roles.includes("/images/home/roles-forest.png") &&
    roles.includes("mx-auto max-w-[1400px]") &&
    roles.includes("data-role-cards-panel") &&
    roles.includes("data-role-cards-grid") &&
    roles.indexOf("data-role-cards-panel") < roles.indexOf("data-role-cards-grid") &&
    roles.includes("lg:grid-cols-3") &&
    roles.includes("sm:grid-cols-2") &&
    roles.includes("grid-cols-1") &&
    roles.includes("shortDescription") &&
    roles.indexOf("{card.title}") < roles.indexOf("card.image") &&
    !roles.includes("data-role-cards-scroller") &&
    !roles.includes('aria-roledescription="carousel"') &&
    !roles.includes("Swipe left or right to see each role.") &&
    !roles.includes("xl:grid-cols-6") &&
    !roles.includes("Are You...?") &&
    !roles.includes("Already registered? Login") &&
    !roles.includes("card.loginText") &&
    !roles.includes("bg-black") &&
    !roles.includes("hero.png"),
  "The Different Roles heading and six photographs sit in one paper box"
);
assert(
  front.includes('showJoin("login")') &&
    front.includes('showJoin("register")') &&
    front.includes("scrollIntoView") &&
    !front.includes("sticky top-0") &&
    banner.includes('role="tablist"') &&
    banner.includes("Join Free") &&
    banner.includes("Login") &&
    banner.indexOf("News") < banner.indexOf("Join Free"),
  "Login and Join Free sit to the right of the homepage nav in the top banner"
);
assert(
  banner.includes("bg-s4p-mark") &&
    banner.includes("text-slate-950") &&
    banner.includes("rounded-full") &&
    !front.includes("bg-emerald-500 text-slate-950"),
  "Login is an outline pill and Join Free uses the S4P mark green from the numeral 4"
);
assert(
  roles.includes("backgroundColor: MINT") &&
    roles.includes("bg-s4p-mark") &&
    roles.includes("Join the S4P community →") &&
    !front.includes("rounded-xl bg-emerald-500 px-2 py-3"),
  "Role-card CTAs use mint pills and the forest bar uses the S4P mark green"
);
assert(
  !front.includes("history.replaceState") &&
    !front.includes("`#${intent}`"),
  "Login and Register tabs must not write #login/#register into history (that 404s the role pages)"
);
assert(
  roles.includes("hardNavigateOnClick") &&
    roles.includes("primaryHref") &&
    !roles.includes('from "next/link"'),
  "Different Roles join buttons do a normal page load so they do not 404 after Create your free account"
);
const fanRegisterRoute = readFileSync("app/fan/register/page.tsx", "utf8");
assert(
  fanRegisterRoute.includes('"use client"') &&
    fanRegisterRoute.includes("@/app/register/page"),
  "Join as a Fan opens a real /fan/register page, not a 404"
);
const joinRoute = readFileSync("app/join/page.tsx", "utf8");
assert(
  joinRoute.includes('redirect("/?join=register")'),
  "/join sends visitors to the Different Roles cards instead of a 404"
);
assert(
  front.includes("<HomeTopBanner") &&
    front.indexOf("<HomeTopBanner") < front.indexOf("<HomeRoleSection"),
  "The global sports banner sits at the top, above the role cards"
);
assert(
  front.includes("<HowItWorks") &&
    front.indexOf("<HowItWorks") < front.indexOf("<HomeRoleSection"),
  "How S4P Works sits above the role cards"
);
assert(
  front.includes("HomeJoinMission") &&
    front.indexOf("HomeJoinMission") < front.indexOf("<HowItWorks") &&
    front.indexOf("HomeTopBanner") < front.indexOf("HomeJoinMission"),
  "Club and fan join panels sit above How S4P Works"
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
    banner.includes("Sport unites people") &&
    banner.includes("Together we drive change") &&
    banner.includes("passion into progress") &&
    banner.includes(
      "We help your team to offset its Match Day carbon emissions"
    ) &&
    banner.includes("Global Brands & Businesses") &&
    !banner.includes("We help elite sports clubs, their fans, sponsors and partners") &&
    banner.includes("Five Major Sports") &&
    banner.includes("Measure emissions") &&
    banner.includes("A cleaner, greener planet") &&
    banner.includes("EVERY SCORE COUNTS") &&
    banner.includes("EVERY FAN COUNTS") &&
    banner.includes("Join as a Fan") &&
    banner.includes("For Sports Clubs") &&
    banner.includes("data-home-mobile-intro") &&
    banner.includes("md:hidden") &&
    banner.includes('src="/images/home/s4p-lockup.png"') &&
    banner.includes('src="/images/home/global-sports-cluster.png"') &&
    banner.includes("width={912}") &&
    banner.includes("#5bc662") &&
    banner.includes("unoptimized") &&
    banner.includes("border-b-2 border-emerald-400/20") &&
    !banner.includes("Fans at the stadium") &&
    !banner.includes("every-score-counts-banner.png") &&
    !banner.includes("hero.png") &&
    !banner.includes("hero-athletes") &&
    !banner.includes("bg-black") &&
    !banner.includes("#041018") &&
    !banner.includes("rgba(4, 16, 24") &&
    !banner.includes("Score-4-our-Planet") &&
    !banner.includes("Turning Match-Day Sporting Moments into") &&
    !banner.includes("sporting-calendar") &&
    !banner.includes("published-fixtures"),
  "The homepage uses the S4P lockup and Image 1 global-sports copy on ivory paper"
);

const joinMission = readFileSync(
  "app/components/home/HomeJoinMission.tsx",
  "utf8"
);
assert(
  joinMission.includes("For club sustainability") &&
    joinMission.includes("Turn every score in a match into a sponsored climate action") &&
    joinMission.includes("Emissions measurement") &&
    joinMission.includes("Global fan engagement") &&
    joinMission.includes("Four funding channels") &&
    joinMission.includes("Transparent project reporting") &&
    joinMission.includes("Explore club partnership") &&
    joinMission.includes("CLUB_REGISTER_PATH") &&
    joinMission.includes("Every fan counts") &&
    joinMission.includes("Support your team. Help fund climate action") &&
    joinMission.includes("Join free") &&
    joinMission.includes("FAN_REGISTER_PATH") &&
    joinMission.includes("s4p-navy-panel") &&
    joinMission.includes("bg-s4p-mark") &&
    joinMission.includes("#5bc662") &&
    !joinMission.includes("See how it works") &&
    !joinMission.includes("climate mission today") &&
    !joinMission.includes("Register free") &&
    !joinMission.includes("bg-black") &&
    !joinMission.includes("#041018") &&
    !joinMission.includes("bg-emerald-500") &&
    joinMission.includes("hardNavigateOnClick") &&
    !joinMission.includes('from "next/link"'),
  "Home join is a paper club-director panel plus a fan panel without See How It Works"
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
  !front.includes("hero-athletes-v2") &&
    !front.includes("hero.png") &&
    !front.includes("hero-athletes"),
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
    !howItWorks.includes("A quick guide to") &&
    !howItWorks.includes("making a real difference") &&
    !howItWorks.includes("-rotate-3") &&
    howItWorks.includes("Same passion. Cleaner planet.") &&
    howItWorks.includes("Every score counts. Every fan counts.") &&
    howItWorks.includes("mx-auto max-w-3xl text-center") &&
    howItWorks.includes('#0c5c2c') &&
    !howItWorks.includes('src="/images/home/s4p-lockup.png"') &&
    !howItWorks.includes("How Score-For-Our-Planet Works"),
  "How S4P Works is centred with a darker Every score counts line"
);
assert(
  howItWorks.includes("bg-s4p-mark") && !howItWorks.includes("bg-green-500"),
  "How It Works uses the S4P mark green from the numeral 4"
);
assert(
    !howItWorks.includes("snap-x") &&
    !howItWorks.includes("data-how-s4p-scroller") &&
    !howItWorks.includes("Explore the six steps below.") &&
    !howItWorks.includes("Swipe left or right") &&
    howItWorks.includes("lg:items-center") &&
    !howItWorks.includes("Step ${stepIndex + 1} of ${steps.length}") &&
    !howItWorks.includes("Step 1 of 6") &&
    !howItWorks.includes("{index + 1} of 6") &&
    !howItWorks.includes("Final step") &&
    !howItWorks.includes("how-s4p-step-index") &&
    !howItWorks.includes('aria-roledescription="carousel"') &&
    readFileSync("app/lib/how-s4p-works.ts", "utf8").includes("Join in seconds") &&
    !howItWorks.includes("Choose from five club-approved climate projects") &&
    !howItWorks.includes("Direct Your Impact") &&
    !howItWorks.includes("data-how-s4p-arrow") &&
    howItWorks.includes("bg-s4p-mark") &&
    howItWorks.includes("text-black") &&
    !howItWorks.includes("s4p-ticker") &&
    !howItWorks.includes("lg:grid-cols-3") &&
    !howItWorks.includes("xl:grid-cols-6") &&
    !howItWorks.includes("»") &&
    !howItWorks.includes("‹"),
  "How S4P Works is Access & Join only — no six-step carousel, Explore line, or Step 1 of 6"
);
assert(
  readFileSync("app/lib/how-s4p-works.ts", "utf8").includes(
    "/images/home/access-join-phone.png"
  ) &&
    howItWorks.includes("HOW_S4P_ACCESS_JOIN") &&
    readFileSync("app/lib/how-s4p-works.ts", "utf8").includes("Join in seconds") &&
    howItWorks.includes('id={ACCESS_JOIN_ID}') &&
    howItWorks.includes('"Create Account"') &&
    howItWorks.includes('"Log in"') &&
    howItWorks.includes('"Join via website"') &&
    howItWorks.includes('"Scan QR to join"') &&
    howItWorks.includes("unoptimized") &&
    howItWorks.includes("{HOW_S4P_ACCESS_JOIN.title}") &&
    howItWorks.includes("hidden md:block") &&
    howItWorks.includes("data-phone-frame") &&
    howItWorks.includes("PHONE_COLUMN_CLASS") &&
    !howItWorks.includes("1. {") &&
    !howItWorks.includes("CLUBS CHOOSE PROJECTS"),
  "How S4P Works keeps Access & Join with the Join in seconds line and no 1. prefix"
);
assert(
  readFileSync("app/components/home/PhoneFrame.tsx", "utf8").includes(
    "data-phone-frame"
  ) &&
    readFileSync("app/components/home/HowS4pSelectMatch.tsx", "utf8").includes(
      "PHONE_COLUMN_CLASS"
    ) &&
    readFileSync(
      "app/components/home/HowS4pPredictForPlanet.tsx",
      "utf8"
    ).includes("PHONE_COLUMN_CLASS") &&
    readFileSync(
      "app/components/home/SelectMatchFixtures.tsx",
      "utf8"
    ).includes("PhoneFrame") &&
    readFileSync("app/components/home/PredictForPlanet.tsx", "utf8").includes(
      "PhoneFrame"
    ) &&
    readFileSync("app/components/home/HowYoureSupporting.tsx", "utf8").includes(
      "PhoneFrame"
    ),
  "PhoneFrame hides the decorative handset on mobile"
);
assert(
  !howItWorks.includes("/images/home/select-match-phone.png") &&
    !howItWorks.includes("SelectMatchFixtures") &&
    !howItWorks.includes("SelectMatchPhone") &&
    !howItWorks.includes("SelectMatchProvider") &&
    !howItWorks.includes("PredictForPlanetPhone") &&
    !howItWorks.includes("HowYoureSupportingPhone"),
  "Select Match and later How S4P Works phones are off the homepage"
);
const upcomingMatchesApi = readFileSync(
  "app/api/home/upcoming-matches/route.ts",
  "utf8"
);
const selectMatchFixtures = readFileSync(
  "app/components/home/SelectMatchFixtures.tsx",
  "utf8"
);
assert(
  upcomingMatchesApi.includes("nextClubMatches") &&
    upcomingMatchesApi.includes("CLUB_MATCH_CALENDAR_COUNT") &&
    selectMatchFixtures.includes("See upcoming matches") &&
    selectMatchFixtures.includes("Choose your club") &&
    selectMatchFixtures.includes("league and cup matches") &&
    selectMatchFixtures.includes("/api/home/upcoming-matches") &&
    selectMatchFixtures.includes('useState(initialClub?.trim() || "Arsenal")') &&
    selectMatchFixtures.includes("if (!active) return") &&
    selectMatchFixtures.includes("SelectMatchPhone") &&
    selectMatchFixtures.includes("SelectMatchMode") &&
    selectMatchFixtures.includes('mode = "sponsor"') &&
    selectMatchFixtures.includes('mode === "view"') &&
    selectMatchFixtures.includes('mode === "club"') &&
    selectMatchFixtures.includes("sponsorFromMatchPath") &&
    selectMatchFixtures.includes("savePendingSponsorMatch") &&
    selectMatchFixtures.includes("hardNavigateOnClick") &&
    selectMatchFixtures.includes("data-phone-match-sponsor") &&
    selectMatchFixtures.includes("data-phone-match-select") &&
    selectMatchFixtures.includes("setSelectedMatch") &&
    selectMatchFixtures.includes("complete this sponsorship and sign it off") &&
    selectMatchFixtures.includes("Tap a match to lock it in") &&
    selectMatchFixtures.includes("Sponsor · Sign off") &&
    selectMatchFixtures.includes("Select this Match") &&
    !selectMatchFixtures.includes("Tap a match to choose it for Match Day"),
  "Select Match auto-loads the next 10 matches; sponsor rows lock in, fan/club rows select on the phone"
);
const howS4pSelectMatch = readFileSync(
  "app/components/home/HowS4pSelectMatch.tsx",
  "utf8"
);
const howS4pWorksLib = readFileSync("app/lib/how-s4p-works.ts", "utf8");
assert(
  howS4pSelectMatch.includes("/images/home/select-match-phone.png") === false &&
    howS4pSelectMatch.includes("HOW_S4P_SELECT_MATCH") &&
    howS4pSelectMatch.includes('audience="fan"') === false &&
    howS4pSelectMatch.includes('data-how-s4p-select-match={audience}') &&
    howS4pSelectMatch.includes('fan: "view"') &&
    howS4pSelectMatch.includes('sponsor: "sponsor"') &&
    howS4pSelectMatch.includes('club: "club"') &&
    howS4pWorksLib.includes("/images/home/select-match-phone.png") &&
    howS4pWorksLib.includes("next 10 upcoming league and cup matches") &&
    howS4pWorksLib.includes("HOW_S4P_SELECT_MATCH_FAN") &&
    howS4pWorksLib.includes("HOW_S4P_SELECT_MATCH_SPONSOR") &&
    howS4pWorksLib.includes("HOW_S4P_SELECT_MATCH_CLUB") &&
    readFileSync("app/components/fan/FanMyTeamsPanel.tsx", "utf8").includes(
      'audience="fan"'
    ) &&
    readFileSync("app/components/sponsor/MatchDayLockIn.tsx", "utf8").includes(
      'audience="sponsor"'
    ) &&
    readFileSync("app/sponsor/local/register/page.tsx", "utf8").includes(
      'audience="sponsor"'
    ) &&
    readFileSync("app/sponsor/wallet/page.tsx", "utf8").includes(
      'audience="sponsor"'
    ) &&
    readFileSync("app/club/dashboard/page.tsx", "utf8").includes(
      'audience="club"'
    ),
  "Select Match phone is assigned to fans, lead/local sponsors, and the Club Sustainability Director"
);
const fromMatchPage = readFileSync("app/sponsor/from-match/page.tsx", "utf8");
const pendingMatch = readFileSync("app/lib/pending-sponsor-match.ts", "utf8");
assert(
  fromMatchPage.includes("lockMatchDayClub") &&
    fromMatchPage.includes("sponsorWalletPath") &&
    fromMatchPage.includes("sponsorLoginPath") &&
    pendingMatch.includes("sponsorFromMatchPath") &&
    pendingMatch.includes("PENDING_SPONSOR_MATCH_KEY"),
  "Tapping a Select Match phone fixture takes a Sponsor through login if needed, then lock-in and the wallet"
);
const howYoureSupporting = readFileSync(
  "app/components/home/HowYoureSupporting.tsx",
  "utf8"
);
assert(
  howYoureSupporting.includes("HowYoureSupportingPhone") &&
    howYoureSupporting.includes("HowYoureSupportingPanel") &&
    howYoureSupporting.includes("HowYoureSupportingProvider") &&
    !howItWorks.includes("HowYoureSupportingPhone") &&
    !howItWorks.includes("FANS DIRECT THE FUNDING"),
  "How You're Supporting stays as a phone panel for a later assignment, not on the homepage"
);
assert(
  howYoureSupporting.includes('aria-label="Continue — I\'m attending the match"') &&
    howYoureSupporting.includes(
      'aria-label="Continue — I\'m watching remotely"'
    ) &&
    howYoureSupporting.includes('id="continue-attending-match"') &&
    howYoureSupporting.includes('id="continue-watching-remotely"') &&
    howYoureSupporting.includes(
      "inline-flex items-center rounded-full bg-s4p-mark px-3 py-1 text-sm font-black text-black"
    ) &&
    howYoureSupporting.includes("bg-s4p-mark") &&
    howYoureSupporting.includes("Plan Your Match-Day Travel") &&
    howYoureSupporting.includes("No postcode. No GPS tracking.") &&
    howYoureSupporting.includes("YOUR ESTIMATED TRAVEL FOOTPRINT") === false &&
    howYoureSupporting.includes("Your estimated travel footprint") &&
    howYoureSupporting.includes("kg CO2e") &&
    howYoureSupporting.includes("estimateTravelKgCo2e") &&
    howYoureSupporting.includes("saveStadiumTravelRecord") &&
    howYoureSupporting.includes("loadClubChosenClimateProjects") &&
    howYoureSupporting.includes("FUND_IT_LABEL") &&
    howYoureSupporting.includes("fanLoginPath") &&
    howYoureSupporting.includes("hardNavigateOnClick") &&
    howYoureSupporting.includes("SUPPORTER_CAMPAIGN_PATH") &&
    howYoureSupporting.includes('id="match-day-banner"') &&
    howYoureSupporting.includes("selectedMatch") &&
    howYoureSupporting.includes("clubLogoSrc") &&
    howYoureSupporting.includes("data-match-day-home-logo") &&
    howYoureSupporting.includes("data-match-day-away-logo") &&
    howYoureSupporting.includes("match-day-home-logo") &&
    howYoureSupporting.includes("match-day-away-logo") &&
    howYoureSupporting.includes("homeName") &&
    howYoureSupporting.includes("awayName") &&
    howYoureSupporting.includes('color: "#f7f4e8"') &&
    howYoureSupporting.includes('height: "16%"') &&
    howYoureSupporting.includes('top: "13.4%"') &&
    howYoureSupporting.includes("role=\"radio\"") &&
    howYoureSupporting.includes("pinHowS4pSlide"),
  "Attending Continue opens a live travel sheet; the phone banner shows the chosen Match Day with both club logos"
);
const clubLogos = readFileSync("app/lib/club-logos.ts", "utf8");
assert(
  clubLogos.includes("export function clubLogoSrc") &&
    clubLogos.includes("/api/home/club-logo") &&
    !clubLogos.includes("sporting-calendar"),
  "Club logos resolve through a dedicated helper, not the Sporting Calendar"
);
const clubLogoApi = readFileSync("app/api/home/club-logo/route.ts", "utf8");
assert(
  clubLogoApi.includes("thesportsdb.com") &&
    clubLogoApi.includes("json/123") &&
    clubLogoApi.includes("wikipedia.org") &&
    clubLogoApi.includes("clubLogoSearchQuery") &&
    !clubLogoApi.includes("sporting-calendar"),
  "Club logo API looks up crests without importing the Sporting Calendar"
);
const travelLib = readFileSync("app/lib/match-day-travel.ts", "utf8");
assert(
  travelLib.includes("STADIUM_TRAVEL_STORAGE") &&
    travelLib.includes("s4p.stadium-travel-records") &&
    travelLib.includes("estimateTravelKgCo2e") &&
    travelLib.includes("saveStadiumTravelRecord") &&
    travelLib.includes("stadiumTravelRecordsForClub"),
  "Stadium-fan travel records keep club, miles, occupants and kgCO2e"
);
const fanLogin = readFileSync("app/fan/login/page.tsx", "utf8");
assert(
  fanLogin.includes("safeFanReturnPath") &&
    readFileSync("app/lib/routes.ts", "utf8").includes("fanLoginPath"),
  "Fan login can return to My S4P after a homepage FUND-IT"
);
assert(
  !howItWorks.includes("/images/home/plan-your-travel-phone.png") &&
    !howItWorks.includes("PredictForPlanetPhone") &&
    !howItWorks.includes("PredictForPlanetPanel") &&
    readFileSync("app/components/home/PredictForPlanet.tsx", "utf8").includes(
      "P4P_CATEGORIES"
    ) &&
    readFileSync("app/lib/predict-for-planet.ts", "utf8").includes(
      "Handball offence"
    ) &&
    !howItWorks.includes("Estimate your return distance") &&
    !howItWorks.includes("PROJECTS DELIVER THE IMPACT"),
  "Predict-For Planet stays as a phone panel, not on the homepage How S4P Works"
);
assert(
  !howItWorks.includes("/images/home/match-day-climate-mission-phone.png") &&
    !howItWorks.includes("live carbon target") &&
    !howItWorks.includes("EVERYONE CREATES IMPACT"),
  "Match Day Climate Mission is off the homepage How S4P Works"
);
assert(
  !howItWorks.includes("/images/home/choose-direct-impact-phone.png") &&
    !howItWorks.includes("five club-approved climate projects") &&
    !howItWorks.includes("sponsor-funded money"),
  "Direct Your Impact is off the homepage How S4P Works"
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
  "Homepage: global sports banner, Access & Join phone, then six role cards."
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
