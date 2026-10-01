import { readFileSync } from "fs";
import {
  appendChosenMatch,
  leadSponsorsForClubFromStores,
  type GoalSponsorshipNetwork,
  type MatchDayClubLock,
} from "../app/lib/climate-sponsors";
import {
  clubFixtureFromUpcoming,
  fixtureByIdOrName,
  matchDetailsLines,
} from "../app/lib/club-fixtures";
import {
  LOCAL_SPONSOR_MIN_GBP,
  isSubmittedLocalSponsor,
  localMatchLabels,
  totalLocalPledge,
  type LocalSponsorRecord,
} from "../app/lib/local-sponsor";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const arsenalLeeds = clubFixtureFromUpcoming({
  id: "list-arsenal-leeds",
  date: "2026-10-10",
  kickoff: "12:30",
  homeName: "Arsenal",
  awayName: "Leeds United",
  venue: "Emirates Stadium",
  competition: "England - Premier League",
  source: "fixtures-list",
  sourceUrl: "https://www.bbc.co.uk/sport/football/teams/arsenal/scores-fixtures",
});
assert(
  arsenalLeeds.fixtureName === "Arsenal v Leeds United" &&
    arsenalLeeds.date === "2026-10-10" &&
    arsenalLeeds.venue === "Emirates Stadium" &&
    arsenalLeeds.kickoff === "12:30",
  "Lock-in fixtures keep the published date, venue and kick-off"
);
assert(
  fixtureByIdOrName([arsenalLeeds], "Bournemouth v Arsenal") === null,
  "Invented catalog matches such as Bournemouth v Arsenal are not treated as published fixtures"
);
const details = matchDetailsLines(arsenalLeeds);
assert(
  details.date.includes("10") &&
    details.venue === "Emirates Stadium" &&
    details.kickoff === "12:30 pm",
  "See Match details formats Date, Venue and Kick-off"
);

const diageo: GoalSponsorshipNetwork = {
  brandKey: "diageo",
  brandName: "Diageo",
  email: "sm@diageo.test",
  clubNames: ["Arsenal", "Liverpool"],
  leagues: ["Premier League"],
};
const puma: GoalSponsorshipNetwork = {
  brandKey: "puma",
  brandName: "Puma",
  email: "puma@puma.test",
  clubNames: ["Arsenal"],
  leagues: ["Premier League"],
};
const cafe: GoalSponsorshipNetwork = {
  brandKey: "the stadium cafe",
  brandName: "The Stadium Cafe",
  email: "cafe@local.test",
  clubNames: ["Arsenal"],
  leagues: [],
};

const now = "2026-10-01T12:00:00.000Z";
const diageoLock: MatchDayClubLock = appendChosenMatch(null, {
  brandKey: "diageo",
  clubName: "Arsenal",
  matchLabel: "Premier League Match",
  fixtureName: "Arsenal v Chelsea",
  competition: "Premier League Match",
  lockedAt: now,
});
const afterSecond = appendChosenMatch(diageoLock, {
  brandKey: "diageo",
  clubName: "Arsenal",
  matchLabel: "Champions League Match",
  fixtureName: "Bayern Munich v Arsenal",
  competition: "Champions League Match",
  lockedAt: now,
});
assert(
  afterSecond.matches?.map((row) => row.fixtureName).join(",") ===
    "Arsenal v Chelsea,Bayern Munich v Arsenal",
  "A Lead Climate Sponsor can lock more than one Arsenal fixture"
);

const pumaLock: MatchDayClubLock = {
  brandKey: "puma",
  clubName: "Arsenal",
  matchLabel: "Premier League Match",
  fixtureName: "Arsenal v Manchester United",
  lockedAt: now,
};

const leads = leadSponsorsForClubFromStores({
  clubName: "Arsenal",
  networks: [diageo, puma, cafe],
  locks: [afterSecond, pumaLock],
  excludeBrandKeys: ["The Stadium Cafe"],
});
assert(
  leads.map((row) => row.brandName).join(",") === "Diageo,Puma",
  "Arsenal Lead tab lists opted-in Lead brands and hides local businesses"
);
assert(
  leads[0].matches.includes("Arsenal v Chelsea") &&
    leads[0].matches.includes("Bayern Munich v Arsenal"),
  "Diageo shows the Arsenal matches it chose to sponsor"
);
assert(
  leads[1].matches.join(",") === "Arsenal v Manchester United",
  "Puma shows Arsenal v Manchester United"
);

const liverpool = leadSponsorsForClubFromStores({
  clubName: "Liverpool",
  networks: [diageo, puma],
  locks: [afterSecond, pumaLock],
});
assert(
  liverpool.length === 1 &&
    liverpool[0].brandName === "Diageo" &&
    liverpool[0].matches.length === 0,
  "Liverpool sees Diageo as opted-in without Arsenal fixtures attached"
);

const local: LocalSponsorRecord = {
  brandName: "The Stadium Cafe",
  email: "cafe@local.test",
  clubName: "Arsenal",
  pledgeGbp: 1250,
  createdAt: now,
  submittedAt: now,
  source: "registered",
  matchSponsorships: [
    { fixtureName: "Arsenal v Chelsea", amountGbp: 750 },
    { fixtureName: "Arsenal v Manchester United", amountGbp: 500 },
  ],
};
assert(isSubmittedLocalSponsor(local), "Submitted local sponsorships appear for the SD");
assert(
  localMatchLabels(local).join(",") ===
    "Arsenal v Chelsea,Arsenal v Manchester United",
  "Local tab lists the matches the business chose"
);
assert(
  totalLocalPledge(local) === 1250,
  "Local tab totals the submitted Match Day amounts"
);
assert(
  LOCAL_SPONSOR_MIN_GBP === 500,
  "Local match amounts still start from £500"
);

const example: LocalSponsorRecord = {
  brandName: "Braidview Garage",
  email: "",
  clubName: "Arsenal",
  pledgeGbp: 1500,
  createdAt: now,
  source: "example",
};
assert(
  !isSubmittedLocalSponsor(example),
  "Example local brands do not appear as submitted Local Business Climate Sponsors"
);

const nextFixtures = readFileSync("app/services/next-fixtures.service.ts", "utf8");
assert(
  nextFixtures.includes("getPublishedFixturesForClub") &&
    !readFileSync("app/lib/club-fixtures.ts", "utf8").includes("FEATURED_FIXTURES"),
  "Lock-in uses published fixtures instead of a generated catalog"
);
assert(
  readFileSync("app/api/sponsor/club-fixtures/route.ts", "utf8").includes(
    "getPublishedFixturesForClub"
  ),
  "Sponsors load club fixtures from the published fixtures API"
);

const dashboard = readFileSync("app/club/dashboard/page.tsx", "utf8");
assert(
  dashboard.includes("ClubClimateSponsorTabs") &&
    !dashboard.includes("setMatchDaySponsorTargets"),
  "Club dashboard shows inbound Climate Sponsor tabs instead of picking who receives the five"
);

const tabs = readFileSync("app/components/club/ClubClimateSponsorTabs.tsx", "utf8");
assert(
  tabs.includes("Our Lead Climate Sponsor") &&
    tabs.includes("Our Local Businesses Sponsor") &&
    tabs.includes("Local Businesses Climate Sponsors"),
  "The two tabs are Our Lead Climate Sponsor and Our Local Businesses Sponsor"
);

const sponsorDash = readFileSync("app/sponsor/dashboard/page.tsx", "utf8");
assert(
  sponsorDash.includes("loadClubFixtures") &&
    sponsorDash.includes("Select the Match") &&
    sponsorDash.includes("SeeMatchDetails"),
  "Lead Climate Sponsors pick a published fixture and can See Match details"
);

const localPage = readFileSync("app/sponsor/local/register/page.tsx", "utf8");
assert(
  localPage.includes("MatchSponsorshipPicker") &&
    localPage.includes("SUBMIT sponsorship") &&
    localPage.includes("matchSponsorships"),
  "Local Business Climate Sponsors select matches, enter amounts and SUBMIT"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Club dashboard Lead and Local Business Climate Sponsor tabs list opted-in brands and named fixtures."
);
