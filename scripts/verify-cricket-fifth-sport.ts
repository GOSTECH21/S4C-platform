import { readFileSync } from "fs";
import { SPORT_CATEGORIES, SPORT_SELECT_OPTIONS } from "../app/lib/sports";
import {
  clubRegisterCountries,
  clubRegisterLeaguesFor,
} from "../app/lib/club-register-options";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  SPORT_SELECT_OPTIONS.join(",") === "Football,Rugby,NFL,NBA,Cricket" &&
    SPORT_CATEGORIES.length === 5 &&
    SPORT_CATEGORIES[4]?.name === "Cricket" &&
    SPORT_CATEGORIES[4]?.scoreLabel === "Six" &&
    SPORT_CATEGORIES[4]?.icon === "🏏",
  "The five platform sports are Football, Rugby, NFL, NBA and Cricket"
);

assert(
  clubRegisterCountries().includes("India") &&
    clubRegisterCountries().includes("Australia") &&
    clubRegisterLeaguesFor("England", "Cricket").includes("County Championship") &&
    clubRegisterLeaguesFor("India", "Cricket").includes("Indian Premier League"),
  "Club Registration can pick Cricket leagues including IPL"
);

const banner = readFileSync("app/components/home/HomeTopBanner.tsx", "utf8");
assert(
  banner.includes('data-home-five-sports="cricket-fifth-sport-v1"') &&
    banner.includes("SPORT_CATEGORIES") &&
    banner.includes("grid-cols-5"),
  "Mobile homepage lists all five sports including Cricket"
);

const campaign = readFileSync("app/sponsor/campaigns/new/page.tsx", "utf8");
assert(
  campaign.includes("SPORT_SELECT_OPTIONS") &&
    !campaign.includes('["Football", "Rugby", "NFL", "NBA"]'),
  "Choose a Sport includes Cricket as the fifth sport"
);

if (failures.length > 0) {
  console.error("verify-cricket-fifth-sport failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-cricket-fifth-sport: ok");
