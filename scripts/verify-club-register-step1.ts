import { readFileSync } from "fs";
import { currentSeasonTeamCount } from "../app/lib/current-season";
import { isSportingCalendarClub } from "../app/lib/calendar-clubs";
import { SPORT_SELECT_OPTIONS } from "../app/lib/sports";
import {
  clubRegisterCountries,
  clubRegisterLeaguesFor,
  leagueStillValidFor,
} from "../app/lib/club-register-options";
import {
  bounceEmailOutOfPhone,
  clubRegisterStateKey,
} from "../app/lib/club-register-contact";
import { roleRegisterAccount } from "../app/lib/role-login";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  SPORT_SELECT_OPTIONS.join(",") === "Football,Rugby,NFL,NBA,Cricket",
  "Sport lists Football, Rugby, NFL, NBA and Cricket"
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
    !englandFootball.includes("NFL") &&
    !englandFootball.includes("County Championship"),
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

const englandCricket = clubRegisterLeaguesFor("England", "Cricket");
assert(
  englandCricket.includes("County Championship") &&
    englandCricket.includes("Vitality Blast") &&
    englandCricket.includes("The Hundred") &&
    !englandCricket.includes("Premier League") &&
    clubRegisterLeaguesFor("India", "Cricket").includes("Indian Premier League") &&
    clubRegisterLeaguesFor("Australia", "Cricket").includes("Big Bash League"),
  "Cricket lists County Championship, The Hundred, IPL and Big Bash by country"
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
    !page.includes("Tell us about your football club.") &&
    page.includes("Join Score-4-Planet") &&
    page.includes("Measurable Climate Impact Moment") &&
    page.includes("Brands-led") &&
    page.includes("Match Day carbon footprint") &&
    !page.includes(
      "Join Score-4-Our-Planet and enable every sporting moment"
    ),
  "Club Registration Step 1 uses Sport, Country then League dropdowns"
);
assert(
  page.indexOf('name="country"') < page.indexOf('name="league"') &&
    page.indexOf('aria-label="Country"') < page.indexOf('aria-label="League"'),
  "Country sits to the left of League"
);
assert(
  page.includes("suppressHydrationWarning") &&
    page.includes("formReady") &&
    page.includes('autoComplete="off"') &&
    page.includes("<form") &&
    page.includes('roleRegisterAccount("club")') &&
    page.includes("bounceEmailOutOfPhone") &&
    page.includes('type="tel"') &&
    page.includes("account.phoneName") &&
    page.includes("account.emailName") &&
    page.includes("account.passwordName") &&
    !page.includes('name="phone"') &&
    !page.includes('name="password"') &&
    page.indexOf("account.phoneName") < page.indexOf("account.emailName") &&
    page.indexOf("account.emailName") < page.indexOf("account.passwordName"),
  "Club Registration keeps Phone as tel and puts Club Email beside Password so Chrome does not fill an email into Phone"
);

assert(
  isSportingCalendarClub("Bournemouth") &&
    isSportingCalendarClub("AFC Bournemouth") &&
    isSportingCalendarClub("Chelsea") &&
    isSportingCalendarClub("Arsenal") &&
    isSportingCalendarClub("Hearts of Midlothian FC") &&
    isSportingCalendarClub("Hibernian") &&
    !isSportingCalendarClub("Not a real club"),
  "Club Registration accepts Sporting Calendar clubs such as Bournemouth"
);
assert(
  currentSeasonTeamCount() === 3,
  "Homepage Sports Teams stays the three-club demo"
);

const clubAccount = roleRegisterAccount("club");
assert(
  bounceEmailOutOfPhone({
    email: "",
    phone: "jamesstewartbud@gmail.com",
  }).email === "jamesstewartbud@gmail.com" &&
    bounceEmailOutOfPhone({
      email: "",
      phone: "jamesstewartbud@gmail.com",
    }).phone === "" &&
    bounceEmailOutOfPhone({
      email: "club@example.com",
      phone: "jamesstewartbud@gmail.com",
    }).email === "club@example.com" &&
    bounceEmailOutOfPhone({
      email: "club@example.com",
      phone: "0131 123 4567",
    }).phone === "0131 123 4567" &&
    clubRegisterStateKey(clubAccount.phoneName, clubAccount) === "phone" &&
    clubAccount.phoneAutoComplete.includes("tel") &&
    clubAccount.phoneName === "s4p-club-register-phone",
  "An email pasted or autofilled into Phone moves to Club Email"
);

const clubService = readFileSync("app/services/club-match-day.service.ts", "utf8");
assert(
  clubService.includes("isSportingCalendarClub") &&
    !clubService.includes(
      "This demo only includes Hearts of Midlothian FC, Hibernian FC, and Arsenal FC."
    ) &&
    clubService.includes("2026/27 Sporting Calendar"),
  "Complete Club Registration no longer limits the demo to Hearts, Hibernian and Arsenal"
);

if (failures.length > 0) {
  console.error("verify-club-register-step1 failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-club-register-step1: ok");
