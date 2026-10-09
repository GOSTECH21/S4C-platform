import { readFileSync } from "fs";
import {
  campaignBelongsToFan,
  filterCampaignsForFan,
  teamsForFanCampaigns,
} from "../app/lib/fan-campaign-scope";
import { fanTeamMatchesPostedClub } from "../app/lib/match-day-post";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const arsenal = {
  id: "season:Premier League:Arsenal",
  name: "Arsenal",
  displayName: "Arsenal",
};
const hibernian = {
  id: "season:Scottish Premiership:Hibernian",
  name: "Hibernian",
  displayName: "Hibernian",
};
const liverpool = {
  id: "season:Premier League:Liverpool",
  name: "Liverpool",
  displayName: "Liverpool",
};

const arsenalCampaign = {
  clubId: "arsenal-sd",
  postedClubId: "arsenal-sd",
  clubName: "Arsenal",
  matchTitle: "Arsenal v Leeds United Climate Campaign",
};
const hibsCampaign = {
  clubId: "hibs-sd",
  postedClubId: "hibs-sd",
  clubName: "Hibernian",
  matchTitle: "Dundee United v Hibernian Climate Campaign",
};

assert(
  teamsForFanCampaigns(
    [arsenal],
    [{ clubId: "hibs-sd", clubName: "Hibernian" }]
  ).length === 1 &&
    teamsForFanCampaigns(
      [arsenal],
      [{ clubId: "hibs-sd", clubName: "Hibernian" }]
    )[0].name === "Arsenal",
  "An Arsenal supporter does not inherit a leftover Hibernian invite"
);
assert(
  teamsForFanCampaigns([], [{ clubId: "hibs-sd", clubName: "Hibernian" }])
    .length === 0,
  "Invite leftovers never stand in for the clubs a supporter actually follows"
);
assert(
  campaignBelongsToFan(arsenalCampaign, [arsenal]) &&
    !campaignBelongsToFan(hibsCampaign, [arsenal]),
  "Alan Bates' Arsenal My S4P does not own a Hibernian campaign"
);
assert(
  filterCampaignsForFan([arsenalCampaign, hibsCampaign], [arsenal]).length ===
    1 &&
    filterCampaignsForFan([arsenalCampaign, hibsCampaign], [arsenal])[0]
      .clubName === "Arsenal",
  "My S4P drops Hibernian projects and Carbon Wallets for an Arsenal fan"
);
assert(
  !fanTeamMatchesPostedClub(arsenal, {
    clubId: "hibs-sd",
    clubName: "Hibernian",
    title: "Dundee United v Hibernian Climate Campaign",
  }),
  "An Arsenal fan does not match a Hibernian fixture title"
);
assert(
  fanTeamMatchesPostedClub(arsenal, {
    clubId: "arsenal-sd",
    clubName: "Arsenal",
    title: "Arsenal v Leeds United Climate Campaign",
  }),
  "An Arsenal fan still matches the Arsenal posting club"
);
assert(
  !fanTeamMatchesPostedClub(liverpool, {
    clubId: "sd-united",
    clubName: "Manchester United",
    title: "Man United vs Liverpool Climate Campaign",
  }),
  "A Liverpool fan does not receive a Manchester United campaign just because they are the opponent"
);
assert(
  campaignBelongsToFan(hibsCampaign, [hibernian]) &&
    !campaignBelongsToFan(arsenalCampaign, [hibernian]),
  "A Hibernian supporter still sees only Hibernian campaigns"
);

const votes = readFileSync("app/services/votes.service.ts", "utf8");
assert(
  votes.includes("teamsForFanCampaigns(await getSupportedTeams(supporter))") &&
    votes.includes("filterCampaignsForFan(") &&
    !/readInvitedClubs\(\)/.test(votes),
  "getMyS4PCampaigns no longer merges browser-wide invited clubs into a signed-in fan"
);

const myS4p = readFileSync("app/components/fan/FanCampaignWorkspace.tsx", "utf8");
assert(
  myS4p.includes("filterCampaignsForFan(camps, supported)") &&
    !myS4p.includes("captureClimateInviteFromSearch()"),
  "My S4P filters campaigns to the supporter's clubs and does not capture another club's invite"
);

const climateProjects = readFileSync(
  "app/dashboard/supporter/vote/page.tsx",
  "utf8"
);
assert(
  climateProjects.includes("filterCampaignsForFan(posted, supported)"),
  "Climate Projects is scoped to the same clubs as My S4P"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Fan club isolation on My S4P passed.");
