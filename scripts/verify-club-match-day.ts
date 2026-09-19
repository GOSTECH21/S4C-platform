import {
  MATCH_DAY_CHOICE_COUNT,
  MATCH_DAY_PROJECT_COUNT,
  PARTNER_PAGE_SIZE,
  isPartnerUpload,
  listsWithUploadsFirst,
  partnerPageCount,
  partnerProjectPage,
} from "../app/lib/partner-projects";
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
} from "../app/lib/match-day-post";
import { sponsorOfferHeadline } from "../app/lib/s4p-climate-projects";
import {
  isCampaignIdNotNullError,
  ownedCampaignId,
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
assert(MATCH_DAY_PROJECT_COUNT === 5, "Match Day portfolio is 5 projects including featured GSS");
assert(MATCH_DAY_CHOICE_COUNT === 4, "SD chooses 4 partner projects; GSS is included as a must");
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
  localCatalogCountryForClub({ clubName: "AC Milan" }) === "Italy",
  "AC Milan local catalog is Italy"
);
assert(
  selectableCatalogForClub({ clubName: "Arsenal" })
    .slice(0, 10)
    .every((project) => project.country === "England"),
  "Arsenal chooses from 10 England projects on page 1"
);
assert(
  selectableCatalogForCountry("Italy")
    .slice(0, 10)
    .every((project) => project.country === "Italy"),
  "AC Milan chooses from 10 Italy projects on page 1"
);
assert(
  selectableCatalogForClub({ clubName: "Hearts of Midlothian FC" })
    .slice(10)
    .some((project) => project.name === "Ugandan Cookstove"),
  "Every club still sees international projects including Ugandan Cookstove"
);

const table = premierLeagueCilt("Arsenal FC");
assert(table.length === 20, "CILT ranks all 20 Premier League clubs");
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
assert(spl.length === 12, "CILT ranks all 12 Scottish Premiership clubs");
const hearts = spl.find((row) => row.isClub);
assert(Boolean(hearts), "Hearts is highlighted on the Scottish Premiership CILT");
assert((hearts?.position ?? 99) <= 3, "Hearts starts in the Scottish Premiership top 3");

const climbed = scottishPremiershipCilt("Hearts of Midlothian FC", 3000);
const climbedHearts = climbed.find((row) => row.isClub);
const celtic = climbed.find((row) => row.club === "Celtic");
assert(
  (climbedHearts?.position ?? 99) < (hearts?.position ?? 0),
  "Hearts climbs the Scottish Premiership CILT when extra carbon impact is added"
);
assert(
  (climbedHearts?.tonnes ?? 0) > (celtic?.tonnes ?? 0) ||
    (climbedHearts?.position ?? 99) <= 2,
  "Hearts can overtake higher Scottish Premiership clubs on the CILT"
);

assert(
  leagueForClubName("Real Madrid") === "La Liga",
  "Real Madrid is a La Liga club"
);
const laLiga = climateImpactLeagueTable("La Liga", "Real Madrid");
assert(laLiga.length === 20, "CILT ranks all 20 La Liga clubs");
assert(
  Boolean(laLiga.find((row) => row.isClub)),
  "Real Madrid is highlighted on the La Liga CILT"
);
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
  [
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
    { id: "i1", name: "Ugandan Cookstove", country: "Uganda" },
  ],
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
assert(
  isPartnerUpload({ location: "Carbon Warriors · Climate Partner" }),
  "Form uploads are tagged as Climate Partner projects"
);
assert(
  !isPartnerUpload({ location: "SCCAN" }),
  "Generic catalog projects are not treated as form uploads"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Club match-day pagination and CILT ranking passed.");
