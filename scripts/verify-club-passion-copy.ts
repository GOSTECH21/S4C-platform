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
    join.includes(
      "Give your club a new way to engage supporters, attract global and"
    ) &&
    join.includes("local sponsors, fund approved climate projects and demonstrate") &&
    join.includes("measurable progress.") &&
    join.includes("From scoring moments to live fan predictions, S4P creates new") &&
    join.includes("commercial opportunities around every match.") &&
    join.includes("Explore club partnership") &&
    join.includes("club-cta-one-line-v1") &&
    join.includes("whitespace-nowrap") &&
    join.includes("text-[0.72rem]") &&
    join.includes("CLUB_REGISTER_PATH"),
  "Club-director panel uses the Match Day Scores heading, two body paragraphs, and a one-line Explore club partnership CTA"
);

assert(
  !join.includes("Turn every score in a match into a sponsored climate action") &&
    !join.includes("Turn match-day passion into sponsorship revenue and climate action") &&
    !join.includes("Turn Match Day Scores into sponsored funding for Climate Projects") &&
    !join.includes("Turn match-day emissions into a measurable climate funding mission") &&
    !join.includes("Emissions measurement") &&
    !join.includes("Global fan engagement") &&
    !join.includes("Four funding channels") &&
    !join.includes("Transparent project reporting") &&
    !join.includes("CLUB_POINTS") &&
    !join.includes("ClubPointIcon"),
  "Old club-director bullets and heading are gone"
);

assert(
  join.includes("Every fan counts") &&
    join.includes("Support your team. Help fund climate action") &&
    join.includes("Predict-4-Planet (P4P)") &&
    join.includes("Join free") &&
    join.includes("FAN_REGISTER_PATH"),
  "Fan join panel uses Predict-4-Planet copy"
);

if (failures.length > 0) {
  console.error("verify-club-passion-copy failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-club-passion-copy: ok");
