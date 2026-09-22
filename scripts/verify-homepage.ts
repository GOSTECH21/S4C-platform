import { readFileSync } from "fs";
import {
  HOME_STAKEHOLDERS,
} from "../app/lib/home-stakeholders";
import {
  catalogClimateProjectCount,
  catalogCo2Avoided,
  formatStatCount,
  mergePlatformStats,
} from "../app/lib/platform-stats";
import { currentSeasonTeamCount } from "../app/lib/current-season";
import { treesEquivalentFromCo2 } from "../app/lib/impact";
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

const before = mergePlatformStats({ fansEngaged: 3 });
const after = mergePlatformStats({ fansEngaged: 4 });
assert(after.fansEngaged === before.fansEngaged + 1, "Fans engaged rises when a fan registers");
assert(
  after.teamsInvolved >= currentSeasonTeamCount(),
  "Teams involved includes the current-season roster"
);
assert(
  after.climateProjects >= catalogClimateProjectCount(),
  "Climate Projects include every provider catalog project"
);
assert(
  after.co2Avoided === catalogCo2Avoided() || after.co2Avoided >= catalogCo2Avoided(),
  "tCO2e avoided is the cumulative provider estimated_co2 figures"
);
assert(
  after.treesPlanted === treesEquivalentFromCo2(after.co2Avoided),
  "Trees planted is derived from cumulative tCO2e"
);
assert(formatStatCount(1230000) === "1,230,000", "Stat windows use grouped thousands");

const homePage = readFileSync("app/page.tsx", "utf8");
assert(homePage.includes("HomeFrontPage"), "Front page uses the new hero and stakeholder layout");
assert(
  !homePage.includes("WHO ARE YOU?"),
  "Old WHO ARE YOU heading is replaced"
);

const front = readFileSync("app/components/home/HomeFrontPage.tsx", "utf8");
assert(front.includes("Are You……?"), "New Are You heading is on the front page");
assert(front.includes("Fans Engaged"), "Fans engaged window is on the front page");
assert(front.includes("/api/platform-stats"), "Stat windows refresh from live platform stats");

const localPage = readFileSync("app/sponsor/local/register/page.tsx", "utf8");
assert(
  localPage.includes("Local Business Climate Sponsor"),
  "Local sponsor registration exists"
);
assert(
  localPage.includes(String(LOCAL_SPONSOR_MIN_GBP)),
  "Local registration states the £500 minimum"
);

const sql = readFileSync(
  "supabase/migrations/0011_platform_stats.sql",
  "utf8"
);
assert(
  sql.includes("platform_stats"),
  "Hosted SQL can return public homepage counters"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Homepage: five stakeholders including Local Business Climate Sponsor; live stats; leftover projects."
);
