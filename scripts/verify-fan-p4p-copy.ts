import { readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const join = readFileSync("app/components/home/HomeJoinMission.tsx", "utf8");
const front = readFileSync("app/components/home/HomeFrontPage.tsx", "utf8");
const roles = readFileSync("app/components/home/HomeRoleSection.tsx", "utf8");
const matchrav = readFileSync("app/lib/matchrav.ts", "utf8");

assert(
  matchrav.includes('MATCHRAV_NAME = "Matchrav"') &&
    !matchrav.includes("Matrav") &&
    join.includes("MATCHRAV_NAME") &&
    !join.includes("Matrav"),
  "Fan join names the travel product Matchrav, not Matrav"
);

assert(
  join.includes('data-fan-join-copy={MATCHRAV_STAMP}') &&
    matchrav.includes("matchrav-fan-tabs-v1") &&
    matchrav.includes("Match-day travel is an important part of a club's carbon footprint") &&
    matchrav.includes("Supporter travel can be one of the largest contributors") &&
    matchrav.includes("Help them address Match Day emissions") &&
    matchrav.includes("Join S4P for free, use Matchrav") &&
    matchrav.includes("plan smarter, lower-emission journeys") &&
    matchrav.includes("play P4P to unlock sponsor-funded contributions") &&
    join.includes("FAN_JOIN_BODY") &&
    !join.includes("Over 50% of a Match Day carbon emissions") &&
    !join.includes("Predict-4-Planet (P4P)") &&
    !join.includes("At the stadium or following from anywhere") &&
    !join.includes("Match Day entertainment that generates"),
  "Fan join panel uses Matchrav travel copy"
);

assert(
  join.includes("data-fan-join-tabs={MATCHRAV_STAMP}") &&
    join.includes("grid-cols-3") &&
    join.includes('data-fan-join-tab={tab.id}') &&
    matchrav.includes('id: "matchrav"') &&
    matchrav.includes('id: "p4p"') &&
    matchrav.includes('id: "s4p"') &&
    matchrav.includes("Before & after the match") &&
    matchrav.includes("During the match") &&
    matchrav.includes("When your team scores") &&
    matchrav.includes('JOIN_S4P_FREE_LABEL = "Join S4P free"') &&
    matchrav.includes('EXPLORE_MATCHRAV_LABEL = "Explore Matchrav"') &&
    matchrav.includes('PLAY_P4P_LABEL = "Play P4P"') &&
    join.includes('data-fan-join-cta="join-s4p-free"') &&
    join.includes('data-fan-join-cta="explore-matchrav"') &&
    join.includes('data-fan-join-tab="play-p4p"') &&
    join.includes("FAN_REGISTER_PATH") &&
    join.includes("FAN_LOGIN_PATH") &&
    join.includes("play-p4p-fan-login-v1"),
  "Fan join panel has Matchrav, P4P and S4P tabs plus Join S4P free, Explore Matchrav and Play P4P"
);

assert(
  !front.includes("showFanP4P") &&
    !front.includes("onPlayP4P") &&
    front.includes("<HomeJoinMission />") &&
    join.includes("FAN_LOGIN_PATH") &&
    roles.includes("data-role-tab={card.title}"),
  "Play P4P opens Fan Login, which still offers Register here"
);

if (failures.length > 0) {
  console.error("verify-fan-p4p-copy failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-fan-p4p-copy: ok");
