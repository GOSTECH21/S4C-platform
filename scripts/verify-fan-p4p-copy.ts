import { readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const join = readFileSync("app/components/home/HomeJoinMission.tsx", "utf8");

assert(
  join.includes('data-fan-join-copy="fan-p4p-copy-v1"') &&
    join.includes("At the stadium or following from anywhere, join S4P for free.") &&
    join.includes("Predict-4-Planet (P4P)") &&
    join.includes("whitespace-nowrap") &&
    join.includes("Match Day entertainment that generates") &&
    join.includes("sponsored-funding for Climate Projects") &&
    !join.includes("take part in match-day activities") &&
    !join.includes("eligible sponsor-funded") &&
    !join.includes("qnywhere"),
  "Fan join panel describes Predict-4-Planet match-day entertainment"
);

if (failures.length > 0) {
  console.error("verify-fan-p4p-copy failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-fan-p4p-copy: ok");
