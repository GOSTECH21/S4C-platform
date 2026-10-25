import { readFileSync } from "fs";
import {
  MATCH_DAY_CHOICE_COUNT,
  MATCH_DAY_FEATURED_COUNT,
  MATCH_DAY_PROJECT_COUNT,
  PARTNER_PAGE_SIZE,
  clubClimateProjectsIntroCopy,
  clubDashboardChosenProjectsCopy,
  clubDashboardClimateProjectsIntroCopy,
  MATCH_DAY_APPROVED_LABEL,
  MATCH_DAY_FULLY_FUNDED_LABEL,
  MATCH_DAY_PENDING_APPROVAL_LABEL,
  clubDashboardLeadTabCount,
  clubDashboardLookbackCopy,
  isMatchDayProjectFullyFunded,
  LEAD_CLIMATE_SPONSOR_SLOTS_PER_MATCH,
  matchDayProjectApprovalLabel,
  isPartnerUpload,
  listsWithUploadsFirst,
  partnerPageCount,
  partnerProjectPage,
} from "../app/lib/partner-projects";
import {
  lookbackProjectFunding,
  matchDayProjectFundingLine,
} from "../app/lib/climate-funding";
import { ciltPositionLabel, premierLeagueCilt, scottishPremiershipCilt, climateImpactLeagueTable } from "../app/lib/cilt";
import { leagueForClubName } from "../app/lib/current-season";
import { SELECTABLE_MATCH_DAY_CATALOG, selectableCatalogForCountry } from "../app/lib/sccan-catalog";
import {
  climateProjectCountryLabel,
  featuredClimateProjectCountryLabel,
  featuredClimateProjectCountryLabelForClubs,
  localCatalogCountryForClub,
  selectableCatalogForClub,
} from "../app/lib/featured-climate-country";
import {
  MATCH_DAY_PORTFOLIO_POSTED,
  MATCH_DAY_PORTFOLIO_VOTED,
  fanTeamMatchesPostedClub,
  isPostedPortfolioStatus,
  isVotedPortfolioStatus,
  matchDayCampaignTitle,
  postedMatchDayForFanTeam,
  FAN_POST_APPEAR_DELAY_MINUTES,
  fanPostExpiresAt,
  fanPostVisibleAt,
  fanPostVisibility,
  isFanPostVisible,
} from "../app/lib/match-day-post";
import { MS_PER_DAY } from "../app/lib/voting-window";
import {
  chosenFeaturedProject,
  expandFeaturedGssVersions,
  withChosenFeaturedProject,
  withFanGssChoices,
} from "../app/lib/featured-gss";
import {
  FEATURED_GSS_LOCAL_NAME,
  FEATURED_GSS_WORLD_NAME,
} from "../app/lib/sccan-catalog";
import { sponsorOfferHeadline } from "../app/lib/s4p-climate-projects";
import {
  isCampaignIdNotNullError,
  ownedCampaignId,
  retainVoteCampaignId,
  voteRowsForInsert,
} from "../app/lib/fan-votes";
import {
  clubGateCopy,
  clubLoginWrongRoleMessage,
  kindFromProfileRole,
} from "../app/lib/signed-in-role";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const ids = Array.from({ length: 20 }, (_, index) => index + 1);
assert(partnerProjectPage(ids, 0).length === PARTNER_PAGE_SIZE, "Page 1 has 10 projects");
assert(partnerProjectPage(ids, 1).join(",") === "11,12,13,14,15,16,17,18,19,20", "Page 2 has the next 10");
assert(partnerPageCount(20) === 2, "20 partner projects paginate into 2 pages");
assert(MATCH_DAY_FEATURED_COUNT === 1, "Only one Featured Climate Project is allowed");
assert(MATCH_DAY_PROJECT_COUNT === 5, "Match Day portfolio is 5 projects: one Featured GSS plus four partner projects");
assert(MATCH_DAY_CHOICE_COUNT === 4, "SD chooses 4 partner projects after choosing one Featured GSS");
const gssPair = expandFeaturedGssVersions([
  { id: "gss", name: "Global Schools Solar" },
]);
assert(
  gssPair.length === 2 &&
    chosenFeaturedProject(gssPair) === null &&
    chosenFeaturedProject(gssPair, gssPair[0].id)?.id === gssPair[0].id &&
    withChosenFeaturedProject(
      [...gssPair, { id: "southwark", name: "Southwark Community Solar" }],
      gssPair[1].id
    ).map((row) => row.id).join(",") === `${gssPair[1].id},southwark`,
  "A Match Day list keeps one chosen Featured GSS and never both"
);
assert(
  gssPair[0].name === FEATURED_GSS_LOCAL_NAME &&
    gssPair[1].name === FEATURED_GSS_WORLD_NAME &&
    withFanGssChoices([
      { id: "gss", name: "Global Schools Solar" },
      { id: "wee", name: "Wee Spoke Hub" },
    ]).map((row) => row.name).join(",") ===
      `${FEATURED_GSS_LOCAL_NAME},${FEATURED_GSS_WORLD_NAME},Wee Spoke Hub`,
  "Fans are offered Local and International Global Schools Solar even when the club posted one GSS"
);
assert(
  partnerProjectPage(SELECTABLE_MATCH_DAY_CATALOG, 0).every((project) =>
    /scotland/i.test(project.country)
  ),
  "Default page 1 is Scotland-based Climate Partner projects"
);
assert(
  partnerProjectPage(SELECTABLE_MATCH_DAY_CATALOG, 1).some(
    (project) => project.name === "Ugandan Cookstove"
  ),
  "Page 2 includes Ugandan Cookstove"
);
assert(
  localCatalogCountryForClub({ clubName: "Hearts of Midlothian FC" }) === "Scotland",
  "Hearts local catalog is Scotland"
);
assert(
  localCatalogCountryForClub({ clubName: "Arsenal", country: "England" }) ===
    "England",
  "Arsenal local catalog is England"
);
assert(
  localCatalogCountryForClub({ clubName: "Swansea City", country: "Wales" }) ===
    "England",
  "Swansea List 1 uses the England catalog"
);
assert(
  localCatalogCountryForClub({ country: "Italy" }) === "Italy",
  "Italy remains a Climate Partner catalog country"
);
assert(
  selectableCatalogForClub({ clubName: "Arsenal" })
    .slice(0, 20)
    .every((project) => project.country === "England") &&
    selectableCatalogForClub({ clubName: "Arsenal" }).slice(0, 20).length === 20,
  "Arsenal chooses from 20 England projects on List 1"
);
assert(
  selectableCatalogForCountry("Italy")
    .slice(0, 10)
    .every((project) => project.country === "Italy"),
  "Italy Climate Partner page 1 is 10 Italy projects"
);
assert(
  selectableCatalogForClub({ clubName: "Hearts of Midlothian FC" })
    .slice(10)
    .some((project) => project.name === "Ugandan Cookstove"),
  "Every club still sees international projects including Ugandan Cookstove"
);

const table = premierLeagueCilt("Arsenal FC");
assert(table.length === 1, "CILT ranks Arsenal as the only Premier League demo club");
assert(table[0].position === 1, "First row is position 1");
const arsenal = table.find((row) => row.isClub);
assert(Boolean(arsenal), "Arsenal FC is highlighted on the CILT");
assert(
  (arsenal?.position ?? 0) >= 1 && (arsenal?.tonnes ?? 0) > 0,
  "Arsenal has a CILT position and carbon tonnage"
);
assert(ciltPositionLabel(table[0]).endsWith("st"), "1st uses the st suffix");

assert(
  leagueForClubName("Hearts of Midlothian FC") === "Scottish Premiership",
  "Hearts of Midlothian FC is a Scottish Premiership club"
);
assert(
  leagueForClubName("Arsenal") === "Premier League",
  "Arsenal remains a Premier League club"
);

const spl = scottishPremiershipCilt("Hearts of Midlothian FC");
assert(spl.length === 2, "CILT ranks Hearts and Hibernian only");
const hearts = spl.find((row) => row.isClub);
assert(Boolean(hearts), "Hearts is highlighted on the Scottish Premiership CILT");
assert(hearts?.position === 1, "Hearts starts first in the two-club Scottish CILT");
assert(
  spl.some((row) => /hibernian/i.test(row.club)),
  "Hibernian remains on the Scottish Premiership CILT"
);
assert(
  !spl.some((row) => /celtic|rangers/i.test(row.club)),
  "Celtic and Rangers are not on the Scottish Premiership CILT"
);

const climbedHibs = scottishPremiershipCilt("Hibernian", 2000);
const climbedHibsRow = climbedHibs.find((row) => row.isClub);
assert(
  climbedHibsRow?.position === 1,
  "Hibernian can overtake Hearts on the CILT when extra carbon impact is added"
);

assert(
  leagueForClubName("Real Madrid") === null,
  "Real Madrid is outside the three-club demo catalog"
);
const laLiga = climateImpactLeagueTable("La Liga", "Real Madrid");
assert(laLiga.length === 0, "La Liga is not ranked in the three-club demo");
assert(
  leagueForClubName("Arsenal") === "Premier League",
  "Arsenal remains a Premier League club"
);

assert(
  featuredClimateProjectCountryLabel({ clubName: "Hearts of Midlothian FC" }) ===
    "UK and International",
  "Hearts sees Global Schools Solar as UK and International"
);
assert(
  featuredClimateProjectCountryLabel({
    clubName: "Arsenal",
    country: "England",
  }) === "UK and International",
  "Arsenal sees Global Schools Solar as UK and International"
);
assert(
  featuredClimateProjectCountryLabel({ clubName: "AC Milan" }) ===
    "UK and International",
  "Only Global Schools Solar is classified as UK and International"
);
assert(
  featuredClimateProjectCountryLabel({ clubName: "Real Madrid" }) ===
    "UK and International",
  "A La Liga club still sees Global Schools Solar as UK and International"
);
assert(
  featuredClimateProjectCountryLabel() === "UK and International",
  "Global Schools Solar stays UK and International without a club"
);
assert(
  climateProjectCountryLabel(
    { name: "Ugandan Cookstove", country: "Uganda" },
    { clubName: "Arsenal" }
  ) === "Uganda",
  "Partner project countries stay as stored"
);
assert(
  featuredClimateProjectCountryLabelForClubs([
    { clubName: "Arsenal" },
    { clubName: "AC Milan" },
  ]) === "UK and International",
  "Fans see Global Schools Solar as UK and International"
);

const unitedFan = {
  id: "fan-united",
  name: "Manchester United",
  displayName: "Manchester United",
};
assert(
  matchDayCampaignTitle("Manchester United") ===
    "Manchester United Climate Campaign",
  "Posted campaign title includes the club name"
);
assert(
  fanTeamMatchesPostedClub(unitedFan, {
    clubId: "sd-united",
    title: "Manchester United Climate Campaign",
  }),
  "A Manchester United fan matches a posted Man United campaign by title"
);
assert(
  fanTeamMatchesPostedClub(unitedFan, {
    title: "Man United vs Liverpool Climate Campaign",
  }),
  "A Manchester United fan matches a Man United vs opponent campaign title"
);
assert(
  !fanTeamMatchesPostedClub(unitedFan, {
    clubId: "other",
    title: "Arsenal vs Chelsea Climate Campaign",
  }),
  "A Manchester United fan does not match an Arsenal vs Chelsea campaign"
);
assert(
  fanTeamMatchesPostedClub(unitedFan, { clubId: "fan-united", title: "Other" }),
  "A fan matches a posted campaign when the club id is the same"
);
const liverpoolFan = {
  id: "season:Premier League:Liverpool",
  name: "Liverpool",
  displayName: "Liverpool",
};
assert(
  fanTeamMatchesPostedClub(liverpoolFan, {
    clubId: "sd-liverpool",
    clubName: "Liverpool Football Club",
  }),
  "A Liverpool fan matches a posted Liverpool Football Club by club name"
);
assert(
  fanTeamMatchesPostedClub(liverpoolFan, {
    title: "Liverpool Football Club Climate Campaign",
  }),
  "A Liverpool fan matches a Liverpool Football Club Climate Campaign title"
);
assert(
  !fanTeamMatchesPostedClub(liverpoolFan, {
    clubId: "other",
    title: "Arsenal vs Chelsea Climate Campaign",
  }),
  "A Liverpool fan does not match an Arsenal vs Chelsea campaign"
);
assert(
  !fanTeamMatchesPostedClub(liverpoolFan, {
    clubId: "sd-united",
    clubName: "Manchester United",
    title: "Man United vs Liverpool Climate Campaign",
  }),
  "A Liverpool fan does not match a United campaign when they are only the opponent"
);
const liverpoolPosted = postedMatchDayForFanTeam(
  liverpoolFan,
  [
    {
      clubId: "sd-liverpool",
      clubName: "Liverpool Football Club",
      postedAt: "2026-09-20T13:00:00.000Z",
      visibleAt: "2026-09-20T13:00:00.000Z",
    },
  ],
  [
    {
      clubId: "sd-liverpool",
      projectIds: ["gss", "southwark", "yorkshire", "edinburgh", "paws"],
      campaignId: "liv-campaign",
    },
  ]
);
assert(
  liverpoolPosted?.clubId === "sd-liverpool" &&
    liverpoolPosted.projectIds.length === 5 &&
    liverpoolPosted.projectIds.includes("southwark"),
  "Posted Liverpool Match Day five is resolved for a catalog Liverpool fan"
);
assert(
  postedMatchDayForFanTeam(
    { id: "roster-liverpool", name: "Liverpool", displayName: "Liverpool" },
    [
      {
        clubId: "sd-liverpool",
        clubName: "Liverpool Football Club",
        postedAt: "2026-09-20T13:00:00.000Z",
        visibleAt: "2026-09-20T13:00:00.000Z",
      },
    ],
    [
      { clubId: "roster-liverpool", projectIds: ["old-one"] },
      {
        clubId: "sd-liverpool",
        projectIds: ["gss", "southwark", "yorkshire", "edinburgh", "paws"],
      },
    ]
  )?.projectIds.includes("southwark"),
  "The Sustainability Director's posted five wins over a roster Liverpool store"
);
assert(
  postedMatchDayForFanTeam(
    { id: "sd-liverpool", name: "Liverpool", displayName: "Liverpool" },
    [],
    [
      {
        clubId: "sd-liverpool",
        projectIds: ["gss", "southwark", "yorkshire", "edinburgh", "paws"],
        campaignId: "liv-campaign",
      },
    ]
  ) == null,
  "Fans do not see the SD's chosen five until a Sponsor signs them off"
);
assert(
  isPostedPortfolioStatus(MATCH_DAY_PORTFOLIO_POSTED) &&
    isPostedPortfolioStatus(MATCH_DAY_PORTFOLIO_VOTED) &&
    !isPostedPortfolioStatus("selected"),
  "Voted Match Day projects stay posted for fans"
);
assert(
  isVotedPortfolioStatus(MATCH_DAY_PORTFOLIO_VOTED) &&
    !isVotedPortfolioStatus(MATCH_DAY_PORTFOLIO_POSTED),
  "Club Voted-For Projects reads posted-voted portfolio rows"
);
assert(
  FAN_POST_APPEAR_DELAY_MINUTES === 0,
  "Posted Climate Projects appear on fan dashboards immediately"
);
assert(
  readFileSync("app/services/club-match-day.service.ts", "utf8").includes(
    "export async function publishSignedSponsorshipToFans"
  ) &&
    readFileSync("app/services/match-day-folder.service.ts", "utf8").includes(
      "publishMatchDayFolderFromSignedOffer"
    ),
  "Sponsor sign-off publishes the signed five to fans and the Match-Day folder immediately"
);
assert(
  isFanPostVisible(new Date(Date.now() + 60_000).toISOString()),
  "There is no hold-back after the Sustainability Director posts"
);
assert(
  fanPostVisibleAt("2026-09-20T12:00:00.000Z").toISOString() ===
    "2026-09-20T12:00:00.000Z",
  "Visible-at is the moment the SD posts"
);
assert(
  fanPostVisibility({ postedAt: new Date().toISOString() }).isVisible,
  "Fan visibility is instant"
);
assert(
  fanPostExpiresAt("2026-09-20T12:00:00.000Z").toISOString() ===
    "2026-09-25T12:00:00.000Z",
  "Climate Projects expire 5 days after the Sustainability Director posts them"
);
assert(
  !isFanPostVisible(
    "2026-09-20T12:00:00.000Z",
    new Date("2026-09-25T12:00:01.000Z").getTime()
  ),
  "Posted Climate Projects disappear after 5 days"
);
assert(
  isFanPostVisible(
    "2026-09-20T12:00:00.000Z",
    new Date("2026-09-20T12:00:00.000Z").getTime() + 4 * MS_PER_DAY
  ),
  "Posted Climate Projects stay visible before the 5th day ends"
);
assert(
  sponsorOfferHeadline({
    clubName: "Arsenal",
    matchTitle: "Arsenal vs Chelsea",
    matchDate: "2026-10-18T15:00:00.000Z",
    scoreLabel: "Goal",
  }).includes("Arsenal vs Chelsea") &&
    sponsorOfferHeadline({
      clubName: "Arsenal",
      matchTitle: "Arsenal vs Chelsea",
      matchDate: "2026-10-18T15:00:00.000Z",
      scoreLabel: "Goal",
    }).includes("18th October 2026"),
  "Sponsor offer names the club, fixture and match date"
);

const villaId = "45192725-c291-4f9f-9d65-3ed7c333f2a1";
const arsenalCampaign = {
  id: "a05b2f53-b57f-4364-8eb4-ec33909e70d7",
  club_id: "f1e2b11b-b00b-487f-8411-bf222d8e00be",
};
assert(
  ownedCampaignId(arsenalCampaign, villaId) === null,
  "Villa fan votes must not attach to the Arsenal vs Chelsea campaign"
);
assert(
  retainVoteCampaignId(
    "b7e1a2c3-d4e5-4f60-8a9b-0c1d2e3f4051",
    null,
    villaId
  ) === "b7e1a2c3-d4e5-4f60-8a9b-0c1d2e3f4051",
  "A vote keeps its campaign id when the fan cannot read match_campaigns"
);
assert(
  retainVoteCampaignId(
    "b7e1a2c3-d4e5-4f60-8a9b-0c1d2e3f4051",
    arsenalCampaign,
    villaId
  ) === null,
  "A Villa vote still must not attach to the Arsenal campaign when that row is visible"
);
assert(
  readFileSync(
    "supabase/migrations/0010_open_match_day_campaign_for_votes.sql",
    "utf8"
  ).includes("open_match_day_campaign_for_club"),
  "Hosted SQL can open a Match Day campaign so fan votes have a campaign_id"
);
assert(
  ownedCampaignId(
    { id: "b7e1a2c3-d4e5-4f60-8a9b-0c1d2e3f4051", club_id: villaId },
    villaId
  ) === "b7e1a2c3-d4e5-4f60-8a9b-0c1d2e3f4051",
  "A campaign owned by Villa can receive Villa fan votes"
);
const rowsWithoutCampaign = voteRowsForInsert("sup-1", ["p1", "p2"], null);
assert(
  rowsWithoutCampaign.every((row) => !("campaign_id" in row)),
  "Votes omit campaign_id when the club has not opened a campaign"
);
const rowsWithCampaign = voteRowsForInsert(
  "sup-1",
  ["p1"],
  "b7e1a2c3-d4e5-4f60-8a9b-0c1d2e3f4051"
);
assert(
  rowsWithCampaign[0].campaign_id === "b7e1a2c3-d4e5-4f60-8a9b-0c1d2e3f4051",
  "Votes include the club's own campaign id when it exists"
);
assert(
  isCampaignIdNotNullError({
    code: "23502",
    message:
      'null value in column "campaign_id" of relation "supporter_votes" violates not-null constraint',
  }),
  "Detects the hosted campaign_id NOT NULL vote failure"
);

assert(kindFromProfileRole("supporter") === "fan", "Supporter profile is a fan");
assert(kindFromProfileRole("admin") === "admin", "Admin profile is S4P staff");
assert(
  clubGateCopy("fan").primaryHref.includes("supporter/dashboard"),
  "A signed-in fan is sent to My S4P instead of club registration"
);
assert(
  /fan account/i.test(clubLoginWrongRoleMessage("fan")),
  "Club login tells a fan they do not need a club sign-in to vote"
);

const merged = listsWithUploadsFirst(
  {
    local: [
      { id: "g1", name: "Generic Local", country: "England" },
      { id: "g2", name: "Generic Two", country: "England" },
      { id: "g3", name: "Generic Three", country: "England" },
      { id: "g4", name: "Generic Four", country: "England" },
      { id: "g5", name: "Generic Five", country: "England" },
      { id: "g6", name: "Generic Six", country: "England" },
      { id: "g7", name: "Generic Seven", country: "England" },
      { id: "g8", name: "Generic Eight", country: "England" },
      { id: "g9", name: "Generic Nine", country: "England" },
      { id: "g10", name: "Generic Ten", country: "England" },
    ],
    international: [{ id: "i1", name: "Ugandan Cookstove", country: "Uganda" }],
    nearby: [],
  },
  [
    { id: "u1", name: "Partner Upload England", country: "England" },
    { id: "u2", name: "Partner Upload Ghana", country: "Ghana" },
  ],
  "England"
);
assert(
  merged.local[0].name === "Partner Upload England",
  "Uploaded local climate projects sit above generic List 1 projects"
);
assert(
  merged.international[0].name === "Partner Upload Ghana",
  "Uploaded international climate projects sit above generic List 2 projects"
);
const withoutRetiredDemo = listsWithUploadsFirst(
  {
    local: merged.local.slice(1, 11),
    international: merged.international.slice(1),
    nearby: [],
  },
  [
    { id: "r1", name: "Ghana Community Solar Upload", country: "Ghana" },
    { id: "r2", name: "Tynecastle High School Solar Installation", country: "Scotland" },
    { id: "r3", name: "SCCAN Community Learning Exchange", country: "Scotland" },
  ],
  "Scotland"
);
assert(
  !withoutRetiredDemo.local.some((project) =>
    /Ghana Community Solar Upload|Tynecastle High School Solar Installation|SCCAN Community Learning Exchange/.test(
      project.name
    )
  ) &&
    !withoutRetiredDemo.international.some((project) =>
      /Ghana Community Solar Upload|Tynecastle High School Solar Installation|SCCAN Community Learning Exchange/.test(
        project.name
      )
    ),
  "Retired leftover partner listings are not mixed into club Climate Project lists"
);
assert(
  isPartnerUpload({ location: "Green Projects · Climate Partner" }),
  "Form uploads are tagged as Climate Partner projects"
);
assert(
  !isPartnerUpload({ location: "SCCAN" }),
  "Generic catalog projects are not treated as form uploads"
);

const clubDashboard = readFileSync("app/club/dashboard/page.tsx", "utf8");
assert(
  !clubDashboard.includes("From the Sponsorship Manager"),
  "Club dashboard no longer shows From the Sponsorship Manager"
);
assert(
  !clubDashboard.includes("Sponsorship Funded Projects"),
  "Club dashboard no longer shows the Sponsorship Funded Projects block"
);
assert(
  !clubDashboard.includes("Sponsorship Selected Projects"),
  "Club dashboard no longer shows the Sponsorship Selected Projects block"
);
assert(
  clubClimateProjectsIntroCopy().includes(
    "There can never be two Featured projects"
  ) &&
    clubClimateProjectsIntroCopy().includes(
      "Climate Partner Projects executable in Your Country"
    ) &&
    clubClimateProjectsIntroCopy().includes(
      "International Projects executable in other parts of the World"
    ) &&
    clubClimateProjectsIntroCopy().includes(
      "MUST be uploaded at least 3 Days before Match Kick-Off"
    ) &&
    clubClimateProjectsIntroCopy().includes(
      "Climate Projects near my Stadium"
    ) &&
    clubClimateProjectsIntroCopy().includes(
      "ONLY submitted Projects from signed-up Climate Project Partners will be listed"
    ),
  "S4P Climate Projects intro uses three lists and future partner-only copy"
);
assert(
  clubDashboardClimateProjectsIntroCopy() ===
    "Press the blue S4P Climate Projects button to choose only one Featured Global Schools Solar project and 4 Climate Partner Projects from List provided" &&
    !clubDashboardClimateProjectsIntroCopy().startsWith(
      "Open S4P Climate Projects"
    ),
  "Club dashboard intro starts with the blue S4P Climate Projects button"
);
assert(
  clubDashboard.indexOf("Approved Projects") <
    clubDashboard.indexOf("<ClubClimateSponsorTabs") &&
    clubDashboard.includes("clubDashboardClimateProjectsIntroCopy") &&
    !clubDashboard.includes("MatchDayFolderPanel") &&
    !clubDashboard.includes("Signed copy of the sponsorship") &&
    !clubDashboard.includes("Voted-For Projects") &&
    clubDashboard.includes("Selected and Funded Projects, kept for lookback") &&
    clubDashboard.includes("clubDashboardLookbackCopy") &&
    !clubDashboard.includes("Incomplete or unstamped copies") &&
    clubDashboard.includes("MATCH_DAY_FULLY_FUNDED_LABEL") &&
    clubDashboard.includes("lookbackProjectFunding") &&
    clubDashboard.includes("clubDashboardLeadTabCount") &&
    clubDashboard.includes("leadTabCount") &&
    clubDashboard.includes("orderedSelected") &&
    clubDashboard.includes("matchDayProjectApprovalLabel") &&
    clubDashboard.includes("MATCH_DAY_PENDING_APPROVAL_LABEL") &&
    clubDashboard.includes("MATCH_DAY_APPROVED_LABEL"),
  "Club dashboard puts S4P Climate Projects above Our Climate Sponsors and drops the folder, signed copy, Voted-For and Funded blocks"
);
assert(
  clubDashboardChosenProjectsCopy().includes(MATCH_DAY_PENDING_APPROVAL_LABEL) &&
    clubDashboardChosenProjectsCopy().includes(MATCH_DAY_APPROVED_LABEL) &&
    clubDashboardChosenProjectsCopy().includes("published to your fans") &&
    clubDashboard.includes("clubDashboardChosenProjectsCopy") &&
    matchDayProjectApprovalLabel(false) === MATCH_DAY_PENDING_APPROVAL_LABEL &&
    matchDayProjectApprovalLabel(true) === MATCH_DAY_APPROVED_LABEL,
  "Chosen Match Day projects stay pending approval until sponsor sign-off, then publish to fans"
);
assert(
  clubDashboardLookbackCopy() ===
    "Confirmed and Approved Projects by Sponsors will appear here." &&
    MATCH_DAY_FULLY_FUNDED_LABEL === "Fully-Funded" &&
    !isMatchDayProjectFullyFunded(40, 100) &&
    isMatchDayProjectFullyFunded(100, 100) &&
    isMatchDayProjectFullyFunded(120, 100) &&
    !isMatchDayProjectFullyFunded(10, 0),
  "Lookback copy is sponsor-approved projects, with Fully-Funded when received meets the Climate Partner goal"
);
const fundingState = lookbackProjectFunding({
  project: { id: "gss", funding_goal: 150000 },
  fanFunding: [{ id: "gss", fundedGbp: 2300 }],
});
assert(
  fundingState.receivedGbp === 2300 &&
    fundingState.soughtGbp === 150000 &&
    !fundingState.fullyFunded &&
    matchDayProjectFundingLine(2300, 150000) === "£2,300 of £150,000",
  "Approved lookback projects show fan funds received out of the Climate Partner funding sought"
);
const fullyFundedState = lookbackProjectFunding({
  project: { id: "gss", funding_goal: null },
  fanFunding: [{ id: "gss", fundedGbp: 8000 }],
  catalog: [{ id: "gss", funding_goal: 8000 }],
});
assert(
  fullyFundedState.fullyFunded &&
    fullyFundedState.receivedGbp === 8000 &&
    fullyFundedState.soughtGbp === 8000,
  "A lookback project is Fully-Funded when fan funds meet the Climate Partner goal"
);
assert(
  clubDashboardLeadTabCount(false) === 0 &&
    clubDashboardLeadTabCount(true) === LEAD_CLIMATE_SPONSOR_SLOTS_PER_MATCH &&
    LEAD_CLIMATE_SPONSOR_SLOTS_PER_MATCH === 1,
  "Our Lead Climate Sponsor shows (1) as soon as the SD's chosen project list is visible"
);
const matchDayService = readFileSync("app/services/club-match-day.service.ts", "utf8");
const chosenPublish = matchDayService.slice(
  matchDayService.indexOf("async function publishChosenProjectsToSponsorsAndFans"),
  matchDayService.indexOf("async function writeClubPortfolio")
);
assert(
  !chosenPublish.includes("postMatchDayProjectsToFans") &&
    chosenPublish.includes("attachProjectsToClubSponsorships") &&
    chosenPublish.includes("occupyingLeadBrandNames") &&
    chosenPublish.includes("leadNames.length === 0") &&
    !chosenPublish.includes("leadNames.length ? leadNames : undefined") &&
    matchDayService.includes("findStoredClubSelectionByName") &&
    matchDayService.includes(
      "writeClubPortfolio(clubId, portfolioIds, MATCH_DAY_PORTFOLIO_SELECTED)"
    ) &&
    matchDayService.includes("export async function publishSignedSponsorshipToFans"),
  "SD selection attaches the five for sponsors as soon as chosen; fans only receive them after Approved sign-off"
);

const tabHelper = readFileSync("app/lib/s4p-tabs.ts", "utf8");
const clubSelect = readFileSync("app/club/projects/select/page.tsx", "utf8");
const clubNav = readFileSync("app/components/club/ClubNav.tsx", "utf8");
assert(
  tabHelper.includes("bg-s4p-mark") &&
    tabHelper.includes("border-s4p-mark") &&
    !tabHelper.includes("border-slate-700") &&
    !tabHelper.includes("bg-slate-800"),
  "Shared tab helper uses lime mark green, not dark slate fills"
);
assert(
  clubSelect.includes("s4pTabClass") &&
    !clubSelect.includes("border border-slate-700 text-slate-300") &&
    clubNav.includes("s4pTabClass") &&
    !clubNav.includes("bg-slate-800 text-slate-200") &&
    clubSelect.includes("climateProjectListLabel(3") &&
    clubSelect.includes("setNearbyProjects") &&
    !clubSelect.includes("List 1 shows those local projects"),
  "Club Climate Projects List tabs include Climate Projects near my Stadium"
);
assert(
  tabHelper.includes("s4pActionBarClass") &&
    clubSelect.includes("s4pActionBarClass") &&
    !clubSelect.includes("bg-slate-700 text-white") &&
    !clubSelect.includes("bg-slate-800 text-slate-500"),
  "Select project bars are lime with black text before and after they are chosen"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Club match-day pagination and CILT ranking passed.");
