import {
  adminDisplayName,
  groupFansByClub,
  guessPersonNameFromEmailLocal,
  looksLikeEmailLocalPart,
  resolvedFullName,
  staffFanRoster,
  storedFullName,
  uniqueClubNames,
  welcomeBackMessage,
  welcomeFirstName,
  type RegisteredFan,
} from "../app/lib/s4p-admin";
import { destinationForRole } from "../app/lib/routes";
import {
  clubGateCopy,
  clubLoginWrongRoleMessage,
  kindFromProfileRole,
} from "../app/lib/signed-in-role";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(storedFullName(" Paul ", " Adam ") === "Paul Adam", "Stores first and last name");
assert(welcomeFirstName("Paul Adam") === "Paul", "Greeting uses the first name");
assert(
  welcomeBackMessage("Paul Adam") === "Welcome back Paul",
  "My S4P greets Paul Adam as Welcome back Paul"
);
assert(
  welcomeBackMessage("paul adam") === "Welcome back Paul",
  "Greeting capitalizes the first name"
);
assert(welcomeBackMessage("   ") === null, "No greeting when the name is missing");
assert(
  looksLikeEmailLocalPart("pauladamvillafc", "pauladamvillafc@gmail.com"),
  "Email-prefix names are detected"
);
assert(
  resolvedFullName(
    "pauladamvillafc",
    "pauladamvillafc@gmail.com",
    "Paul Adam"
  ) === "Paul Adam",
  "Replaces an email-prefix stored name with the registered full name"
);
assert(
  resolvedFullName("Paul Adam", "pauladamvillafc@gmail.com", "Ignored") ===
    "Paul Adam",
  "Keeps an accurate stored full name"
);

assert(
  guessPersonNameFromEmailLocal("pauladamvillafc") === "Paul Adam",
  "Recovers Paul Adam from the Villa fan email"
);
assert(
  adminDisplayName("pauladamvillafc", "pauladamvillafc@gmail.com") ===
    "Paul Adam",
  "Admin shows Paul Adam instead of the email prefix"
);
assert(
  resolvedFullName(
    "pauladamvillafc",
    "pauladamvillafc@gmail.com",
    null
  ) === "Paul Adam",
  "Resolves Paul Adam when metadata is missing"
);

const rawFans: RegisteredFan[] = [
  {
    id: "1",
    fullName: "pauladamvillafc",
    email: "pauladamvillafc@gmail.com",
    clubName: "Aston Villa",
  },
  {
    id: "2",
    fullName: "jacobramsey22",
    email: "jacobramsey22@gmail.com",
    clubName: "Aston Villa",
  },
  {
    id: "3",
    fullName: "Jacob Ramsey",
    email: "jacobramseyful@gmail.com",
    clubName: "Fulham",
  },
  {
    id: "4",
    fullName: "jamesstewartbud",
    email: "jamesstewartbud@gmail.com",
    clubName: "Aston Villa",
    authUserId: "sponsor-bud",
  },
  {
    id: "5",
    fullName: "johnsmithvillafc",
    email: "johnsmithvillafc@gmail.com",
    clubName: "Aston Villa",
  },
];

const staffFans = staffFanRoster(rawFans, {
  emails: ["johnsmithvillafc@gmail.com"],
  authUserIds: ["sponsor-bud"],
  contactKeys: ["johnsmith", "jamesstewart"],
});
const groups = groupFansByClub(staffFans);
const villa = groups.find((group) => group.clubName === "Aston Villa");
const fulham = groups.find((group) => group.clubName === "Fulham");
assert(villa?.count === 1, "Aston Villa has one fan after removing SD/sponsor rows");
assert(
  villa?.members[0]?.fullName === "Paul Adam" &&
    villa?.members[0]?.email === "pauladamvillafc@gmail.com",
  "Aston Villa fans list is only Paul Adam"
);
assert(
  !staffFans.some((fan) => /jamesstewartbud|johnsmithvillafc/i.test(fan.email)),
  "Sponsor and Sustainability Director emails are not listed as fans"
);
assert(fulham?.members[0]?.fullName === "Jacob Ramsey", "Fulham keeps Jacob Ramsey");
assert(
  !villa?.members.some((fan) => /jacobramsey/i.test(fan.email)),
  "The Fulham Jacob Ramsey account is not also listed under Aston Villa"
);
assert(
  uniqueClubNames(["Arsenal", "arsenal", "Aston Villa"]).join(",") ===
    "Arsenal,Aston Villa",
  "Sponsored club lists de-duplicate club names"
);

assert(kindFromProfileRole("admin") === "admin", "profiles.role admin is S4P staff");
assert(destinationForRole("admin") === "/admin", "Staff land on the Admin Database");
assert(
  clubGateCopy("admin").primaryHref === "/admin",
  "Staff hitting the club dashboard are sent to the Admin Database"
);
assert(
  /s4p staff/i.test(clubLoginWrongRoleMessage("admin")),
  "Club login tells S4P staff to use staff login"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("S4P admin roster and Welcome back greeting passed.");
