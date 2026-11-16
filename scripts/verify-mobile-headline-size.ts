import { readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const banner = readFileSync("app/components/home/HomeTopBanner.tsx", "utf8");
const join = readFileSync("app/components/home/HomeJoinMission.tsx", "utf8");

assert(
  banner.includes('data-home-headline-size="mobile-headline-size-v1"') &&
    banner.includes("text-[1.65rem]") &&
    banner.includes("sm:text-4xl") &&
    !banner.includes("text-[1.85rem]") &&
    !banner.includes("sm:text-5xl") &&
    !banner.includes("passion into progress"),
  "Every Score Counts headline stays compact; the old progress headline is gone"
);

assert(
  join.includes('id="club-director-heading"') &&
    join.includes("text-[1.45rem]") &&
    join.includes("HOME_CLUB_HEADING") &&
    join.includes("sm:text-4xl"),
  "Match Day Scores heading is smaller on mobile and unchanged from sm up"
);

if (failures.length > 0) {
  console.error("verify-mobile-headline-size failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-mobile-headline-size: ok");
