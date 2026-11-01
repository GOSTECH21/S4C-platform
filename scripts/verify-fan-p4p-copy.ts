import { readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const join = readFileSync("app/components/home/HomeJoinMission.tsx", "utf8");
const front = readFileSync("app/components/home/HomeFrontPage.tsx", "utf8");
const roles = readFileSync("app/components/home/HomeRoleSection.tsx", "utf8");

assert(
  join.includes('data-fan-join-copy="fan-p4p-tabs-v1"') &&
    join.includes("Over 50% of a Match Day carbon emissions") &&
    join.includes(
      "is from fans travelling to"
    ) &&
    join.includes("a Stadium to watch their team play") &&
    join.includes("Help them address Match Day") &&
    join.includes("emissions; join S4P for free") &&
    join.includes("join S4P for free") &&
    join.includes("Predict-4-Planet (P4P)") &&
    join.includes(
      "in-game entertainment to generate sponsored-funding for Climate Projects"
    ) &&
    !join.includes("At the stadium or following from anywhere") &&
    !join.includes("Match Day entertainment that generates"),
  "Fan join panel uses Match Day emissions and in-game P4P copy"
);

assert(
  join.includes('data-fan-join-tabs="fan-p4p-tabs-v1"') &&
    join.includes('data-fan-join-tab="join-free"') &&
    join.includes('data-fan-join-tab="play-p4p"') &&
    join.includes("Join free") &&
    join.includes("Play P4P") &&
    join.includes("FAN_REGISTER_PATH") &&
    join.includes("onPlayP4P") &&
    join.includes("grid-cols-2"),
  "Fan join panel has Join free and Play P4P tabs"
);

assert(
  front.includes("showFanP4P") &&
    front.includes('title: "Fans"') &&
    front.includes("roleFocus") &&
    front.includes("onPlayP4P={showFanP4P}") &&
    roles.includes("roleFocus") &&
    roles.includes("setSelectedTitle(roleFocus.title)") &&
    roles.includes('data-role-tab={card.title}'),
  "Play P4P scrolls to the Fans registration and login card"
);

if (failures.length > 0) {
  console.error("verify-fan-p4p-copy failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-fan-p4p-copy: ok");
