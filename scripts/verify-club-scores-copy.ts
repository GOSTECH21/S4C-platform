import { readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const join = readFileSync("app/components/home/HomeJoinMission.tsx", "utf8");

assert(
  join.includes('data-club-director-copy="club-sponsorship-copy-v1"') &&
    join.includes(
      "Turn Match Day Scores into sponsorship for Climate Projects"
    ) &&
    !join.includes(
      "Turn match-day passion into sponsorship revenue and climate action"
    ) &&
    !join.includes(
      "Turn Match Day Scores into sponsored funding for Climate Projects"
    ),
  "Club-director heading is Turn Match Day Scores into sponsorship for Climate Projects"
);

assert(
  join.includes('data-club-cta="club-cta-one-line-v1"') &&
    join.includes("Explore club partnership") &&
    join.includes("whitespace-nowrap") &&
    join.includes("text-[0.72rem]") &&
    join.includes("sm:text-base"),
  "Explore club partnership stays on one line in the green tab on a phone"
);

if (failures.length > 0) {
  console.error("verify-club-scores-copy failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-club-scores-copy: ok");
