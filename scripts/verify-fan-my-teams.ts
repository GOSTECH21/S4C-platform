import { readFileSync } from "fs";
import { fanRegisterCatalog, selectedTeamsFromSources } from "../app/services/teams.service";
import { calendarMatchesAsUpcoming } from "../app/lib/sporting-calendar";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const catalog = fanRegisterCatalog();
const hibernianId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const leedsFromPrefs = selectedTeamsFromSources(catalog, {
  favouriteClubId: hibernianId,
  preferenceClubNames: ["Leeds United"],
});
assert(
  leedsFromPrefs.length === 1 &&
    /leeds united/i.test(leedsFromPrefs[0].name) &&
    !leedsFromPrefs.some((team) => /hibernian|heart/i.test(team.name)),
  "A Leeds United preference is shown instead of a leftover Hibernian favourite"
);

const leftoverFavourite = selectedTeamsFromSources(catalog, {
  favouriteClubId: hibernianId,
  preferenceClubNames: [],
});
assert(
  leftoverFavourite.length === 0,
  "An unknown leftover favourite UUID does not invent Hibernian or Hearts"
);

const hibernian = catalog
  .flatMap((group) =>
    group.competitions.flatMap((competition) => competition.teams)
  )
  .find((team) => /hibernian/i.test(team.name));
assert(Boolean(hibernian), "Hibernian remains in the Fan catalog");
assert(
  selectedTeamsFromSources(catalog, {
    favouriteClubId: hibernian?.id,
    preferenceClubNames: [],
  }).length === 0,
  "A leftover Hibernian favourite is not treated as My Teams"
);
assert(
  selectedTeamsFromSources(catalog, {
    favouriteClubId: hibernian?.id,
    storedClubNames: ["Leeds United"],
  }).length === 1 &&
    /leeds united/i.test(
      selectedTeamsFromSources(catalog, {
        favouriteClubId: hibernian?.id,
        storedClubNames: ["Leeds United"],
      })[0].name
    ),
  "A stored Leeds United club wins over leftover Hibernian"
);

const seasonLeeds = selectedTeamsFromSources(catalog, {
  favouriteClubId: "season:Premier League:Leeds United",
  preferenceClubNames: [],
});
assert(
  seasonLeeds.length === 1 && /leeds united/i.test(seasonLeeds[0].name),
  "A Sporting Calendar team id still resolves to Leeds United"
);

const fromDate = "2026-10-19";
const leedsMatches = calendarMatchesAsUpcoming("Leeds United", { fromDate });
assert(
  leedsMatches.length > 0 &&
    leedsMatches.every(
      (match) =>
        /leeds united/i.test(match.homeName) ||
        /leeds united/i.test(match.awayName)
    ) &&
    !leedsMatches.some(
      (match) =>
        /hibernian/i.test(match.homeName) || /hibernian/i.test(match.awayName)
    ) &&
    !leedsMatches.some(
      (match) =>
        /heart of midlothian|^hearts$/i.test(match.homeName) ||
        /heart of midlothian|^hearts$/i.test(match.awayName)
    ),
  "Leeds United My Teams fixtures come from the Sporting Calendar, not Hibernian or Hearts"
);

const hibsMatches = calendarMatchesAsUpcoming("Hibernian", { fromDate });
assert(
  hibsMatches.length === 0 ||
    hibsMatches.every(
      (match) =>
        /hibernian/i.test(match.homeName) || /hibernian/i.test(match.awayName)
    ),
  "Hibernian fixtures stay on Hibernian, so they are not reused as a static form"
);

const teamsService = readFileSync("app/services/teams.service.ts", "utf8");
assert(
  teamsService.includes("selectedTeamsFromSources") &&
    teamsService.includes("preferenceClubNames") &&
    /favourite_club_id: favouriteId/.test(teamsService) &&
    !/if \(favouriteId\) \{\s*const \{ error: favError \}/.test(teamsService),
  "Saving My Teams writes preferences and clears a leftover favourite UUID"
);

const registerPage = readFileSync("app/register/page.tsx", "utf8");
assert(
  registerPage.includes("uuidOrNull(teams[0]?.id)") &&
    !registerPage.includes("readInvitedClubs") &&
    !registerPage.includes("favourite_club_id: teams[0]?.id"),
  "Fan registration stores a real club UUID, not a leftover Hibernian invite"
);

const nextFixtures = readFileSync("app/services/next-fixtures.service.ts", "utf8");
assert(
  nextFixtures.includes("upcomingFromCalendar") &&
    nextFixtures.includes("calendarMatchesAsUpcoming") &&
    nextFixtures.includes("involvesTeam") &&
    !nextFixtures.includes("fromDb.filter(keepCurrentSeasonFixture)"),
  "Fan upcoming matches keep the selected club's league games, not only demo clubs"
);

const preferences = readFileSync(
  "app/dashboard/supporter/preferences/page.tsx",
  "utf8"
);
assert(
  preferences.includes("fixturesWithCalendar") &&
    preferences.includes("calendarMatchesAsUpcoming") &&
    preferences.includes("writeLocalSupportedClubs"),
  "My Teams fills empty fixture lists from the Sporting Calendar"
);

const roster = readFileSync("app/services/season-roster.service.ts", "utf8");
assert(
  !roster.includes("pruneNonDemoClubParticipants") &&
    !roster.includes("supporter_preferences") &&
    roster.includes("Fan registration is worldwide"),
  "Loading the team catalog does not delete Leeds United preferences"
);

if (failures.length > 0) {
  console.error("verify-fan-my-teams failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-fan-my-teams: ok");
console.log(
  `Leeds United upcoming from ${fromDate}: ${leedsMatches.length} matches, next ${leedsMatches[0]?.homeName} vs ${leedsMatches[0]?.awayName} on ${leedsMatches[0]?.date}`
);
