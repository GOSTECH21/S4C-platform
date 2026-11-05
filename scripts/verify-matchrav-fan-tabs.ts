import { readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const join = readFileSync("app/components/home/HomeJoinMission.tsx", "utf8");
const matchrav = readFileSync("app/lib/matchrav.ts", "utf8");
const apply = readFileSync("apply-matchrav-fan-tabs.mjs", "utf8");

assert(
  matchrav.includes("matchrav-fan-tabs-v1") &&
    matchrav.includes('MATCHRAV_NAME = "Matchrav"') &&
    !matchrav.includes("Matrav") &&
    !join.includes("Matrav"),
  "The travel product is named Matchrav"
);

assert(
  matchrav.includes("Match-day travel is an important part of a club's carbon footprint") &&
    matchrav.includes("Supporter travel can be one of the largest contributors to a club's match-day carbon footprint") &&
    matchrav.includes("Help them address Match Day emissions") &&
    matchrav.includes("Join S4P for free, use Matchrav to plan smarter, lower-emission journeys") &&
    matchrav.includes("play P4P to unlock sponsor-funded contributions towards your club's climate projects") &&
    join.includes("FAN_JOIN_KICKER") &&
    join.includes("FAN_JOIN_HEADING") &&
    join.includes("FAN_JOIN_BODY"),
  "Fan join heading sits above Matchrav travel copy"
);

assert(
  join.includes("grid-cols-3") &&
    matchrav.includes('id: "matchrav"') &&
    matchrav.includes('id: "p4p"') &&
    matchrav.includes('id: "s4p"') &&
    matchrav.includes("Before & after the match") &&
    matchrav.includes("During the match") &&
    matchrav.includes("When your team scores") &&
    join.includes("JOIN_S4P_FREE_LABEL") &&
    join.includes("EXPLORE_MATCHRAV_LABEL") &&
    join.includes("PLAY_P4P_LABEL") &&
    join.includes('data-fan-join-cta="join-s4p-free"') &&
    join.includes('data-fan-join-cta="explore-matchrav"') &&
    join.includes('data-fan-join-tab="play-p4p"'),
  "Fan join has three tabs plus Join S4P free, Explore Matchrav and Play P4P"
);

assert(
  apply.includes('BRANCH = "cursor/matchrav-fan-tabs-18f9"') &&
    apply.includes("matchrav-fan-tabs-1") &&
    apply.includes("app/lib/matchrav.ts") &&
    apply.includes("app/components/home/HomeJoinMission.tsx"),
  "PC overlay pulls the Matchrav fan tabs"
);

if (failures.length > 0) {
  console.error("verify-matchrav-fan-tabs failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-matchrav-fan-tabs: ok");
