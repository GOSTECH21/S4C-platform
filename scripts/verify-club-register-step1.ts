import { readFileSync } from "fs";
import { SPORT_SELECT_OPTIONS } from "../app/lib/sports";
import {
  clubRegisterCountries,
  clubRegisterLeaguesFor,
  leagueStillValidFor,
} from "../app/lib/club-register-options";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  SPORT_SELECT_OPTIONS.join(",") === "Football,Rugby,NFL,NBA",
  "Sport lists Football, Rugby, NFL and NBA"
);

const countries = clubRegisterCountries();
assert(
  countries[0] === "England" && countries[1] === "Scotland",
  "Country puts England and Scotland first"
);
assert(
  countries.includes("Germany") &&
    countries.includes("Spain") &&
    countries.includes("France") &&
    countries.includes("Italy") &&
    countries.includes("United States") &&
    countries.includes("Europe") &&
    countries.includes("International"),
  "Country lists every Sporting Calendar country"
);
assert(
  countries.indexOf("England") < countries.indexOf("France") &&
    countries.indexOf("Scotland") < countries.indexOf("Germany"),
  "Pinned countries stay above the rest of the Country list"
);

const englandFootball = clubRegisterLeaguesFor("England", "Football");
assert(
  englandFootball.includes("Premier League") &&
    englandFootball.includes("EFL Championship") &&
    englandFootball.includes("EFL League One") &&
    englandFootball.includes("Women's Super League") &&
    englandFootball.includes("FA Cup") &&
    englandFootball.includes("Carabao Cup") &&
    !englandFootball.includes("Scottish Premiership") &&
    !englandFootball.includes("Premiership Rugby") &&
    !englandFootball.includes("NFL"),
  "England + Football lists English football leagues and cups"
);

const scotlandFootball = clubRegisterLeaguesFor("Scotland", "Football");
assert(
  scotlandFootball.includes("Scottish Premiership") &&
    scotlandFootball.includes("Scottish Cup") &&
    !scotlandFootball.includes("Premier League"),
  "Scotland + Football lists Scottish Premiership and Scottish Cup"
);

const englandRugby = clubRegisterLeaguesFor("England", "Rugby");
assert(
  englandRugby.includes("Premiership Rugby") &&
    englandRugby.includes("Super League") &&
    !englandRugby.includes("Premier League"),
  "England + Rugby lists Premiership Rugby and Super League"
);

assert(
  clubRegisterLeaguesFor("United States", "NFL").join(",") === "NFL" &&
    clubRegisterLeaguesFor("United States", "NBA").join(",") === "NBA",
  "United States lists NFL or NBA from the chosen sport"
);

assert(
  clubRegisterLeaguesFor("", "Football").length === 0 &&
    !leagueStillValidFor("Premier League", "Scotland", "Football") &&
    leagueStillValidFor("Premier League", "England", "Football"),
  "League stays empty until a Country is chosen and clears when it no longer belongs"
);

const page = readFileSync("app/club/register/page.tsx", "utf8");
assert(
  page.includes("SPORT_SELECT_OPTIONS") &&
    page.includes("clubRegisterCountries") &&
    page.includes("clubRegisterLeaguesFor") &&
    page.includes('aria-label="Country"') &&
    page.includes('aria-label="League"') &&
    page.includes('aria-label="Sport"') &&
    page.includes("Select the Country") &&
    page.includes("Select the League") &&
    page.includes("Select a Country first") &&
    page.includes("Tell us about your club.") &&
    !page.includes("Tell us about your football club."),
  "Club Registration Step 1 uses Sport, Country then League dropdowns"
);
assert(
  page.indexOf('name="country"') < page.indexOf('name="league"') &&
    page.indexOf('aria-label="Country"') < page.indexOf('aria-label="League"'),
  "Country sits to the left of League"
);

if (failures.length > 0) {
  console.error("verify-club-register-step1 failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-club-register-step1: ok");
