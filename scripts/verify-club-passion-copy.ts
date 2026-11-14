import { existsSync, readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const join = readFileSync("app/components/home/HomeJoinMission.tsx", "utf8");

assert(
  join.includes('data-club-director-copy={HOME_CLUB_STAMP}') &&
    join.includes("HOME_CLUB_HEADING") &&
    join.includes("HOME_CLUB_SUPPORT") &&
    join.includes("HOME_CLUB_POINTS") &&
    join.includes("HOME_CLUB_IMAGE") &&
    join.includes("HOME_CLUB_CTA") &&
    join.includes("club-cta-one-line-v1") &&
    join.includes("whitespace-nowrap") &&
    join.includes("text-[0.72rem]") &&
    join.includes("CLUB_REGISTER_PATH") &&
    !join.includes("inside.lighting") &&
    !join.includes("Inside.lighting") &&
    existsSync("public/images/home/club-stadium-night.jpg"),
  "Club-director panel uses the stadium photo, Turn match days heading, three points, and Explore club partnerships"
);

assert(
  !join.includes("Turn every score in a match into a sponsored climate action") &&
    !join.includes("Turn match-day passion into sponsorship revenue and climate action") &&
    !join.includes("Turn Match Day Scores into sponsored funding for Climate Projects") &&
    !join.includes("Turn Match Day Scores into sponsorship for Climate Projects") &&
    !join.includes("Turn match-day emissions into a measurable climate funding mission") &&
    !join.includes("Emissions measurement") &&
    !join.includes("Global fan engagement") &&
    !join.includes("Four funding channels") &&
    !join.includes("Transparent project reporting") &&
    !join.includes("const CLUB_POINTS") &&
    !join.includes("ClubPointIcon"),
  "Old club-director bullets and heading are gone"
);

assert(
  join.includes("FAN_JOIN_KICKER") &&
    join.includes("FAN_JOIN_HEADING") &&
    join.includes("FAN_WAYS_HEADING") &&
    join.includes("FAN_FUNDING_HEADING") &&
    join.includes("FAN_FUNDING_POINTS") &&
    join.includes("MATCHRAV_NAME") &&
    join.includes("JOIN_S4P_FREE_LABEL") &&
    join.includes("EXPLORE_MATCHRAV_LABEL") &&
    join.includes("PLAY_P4P_LABEL") &&
    join.includes("FAN_REGISTER_PATH") &&
    join.includes("FAN_LOGIN_PATH") &&
    !join.includes("Predict-4-Planet (P4P)") &&
    !join.includes("Over 50% of a Match Day carbon emissions"),
  "Fan join panel uses Matchrav copy with Join S4P free, Explore Matchrav and Play P4P"
);

if (failures.length > 0) {
  console.error("verify-club-passion-copy failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-club-passion-copy: ok");
