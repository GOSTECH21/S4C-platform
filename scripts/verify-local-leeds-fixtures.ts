import { readFileSync } from "fs";
import { calendarFixturesForClub } from "../app/lib/sporting-calendar";
import { isSportingCalendarClub } from "../app/lib/calendar-clubs";
import { demoFixturesForClub } from "../app/lib/demo-club-fixtures";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const fromDate = "2026-10-20";
const leeds = calendarFixturesForClub("Leeds United", { fromDate });
assert(
  leeds.length > 0 &&
    leeds.every(
      (row) =>
        /leeds united/i.test(row.homeName) || /leeds united/i.test(row.awayName)
    ) &&
    !leeds.some(
      (row) =>
        /hibernian/i.test(row.fixtureName) || /heart of midlothian/i.test(row.fixtureName)
    ),
  "Leeds United local sponsors get Sporting Calendar Matches, not an empty demo list"
);
assert(
  demoFixturesForClub("Leeds United").length === 0,
  "Leeds United is not one of the three demo seed lists"
);
assert(
  isSportingCalendarClub("Leeds United") && isSportingCalendarClub("Arsenal"),
  "Leeds United is a Sporting Calendar club a Local Business can sponsor"
);

const picker = readFileSync(
  "app/components/sponsor/MatchSponsorshipPicker.tsx",
  "utf8"
);
assert(
  picker.includes("calendarFixturesForClub") &&
    picker.includes("startExpanded") &&
    !/const fixtures = demoFixturesForClub\(clubName\)/.test(picker),
  "The selected club's fixture list comes from the Sporting Calendar"
);

const local = readFileSync("app/lib/local-sponsor.ts", "utf8");
assert(
  local.includes("isSportingCalendarClub") &&
    !local.includes("isDemoClubName") &&
    local.includes("writeLocalSponsorRecord"),
  "A Leeds United Local Business sponsorship is stored, not dropped as a non-demo club"
);

const loader = readFileSync("app/services/club-fixtures.service.ts", "utf8");
assert(
  loader.includes("calendarFixturesForClub") &&
    loader.includes("withCalendarClubFixtures"),
  "Sponsor fixture loading fills Leeds United from the Sporting Calendar"
);

if (failures.length > 0) {
  console.error("verify-local-leeds-fixtures failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-local-leeds-fixtures: ok");
console.log(
  `Leeds United next local matches: ${leeds.length}, first ${leeds[0]?.fixtureName} on ${leeds[0]?.date}`
);
