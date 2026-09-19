import {
  groupFansByClub,
  looksLikeEmailLocalPart,
  resolvedFullName,
  storedFullName,
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

const fans: RegisteredFan[] = [
  {
    id: "1",
    fullName: "Paul Adam",
    email: "pauladamvillafc@gmail.com",
    clubName: "Aston Villa",
  },
  {
    id: "2",
    fullName: "Jacob Ramsey",
    email: "jacobramsey22@gmail.com",
    clubName: "Aston Villa",
  },
  {
    id: "3",
    fullName: "Bukayo Saka",
    email: "saka@example.com",
    clubName: "Arsenal",
  },
];

const groups = groupFansByClub(fans);
assert(groups[0].clubName === "Aston Villa", "Largest club group is listed first");
assert(groups[0].count === 2, "Counts Aston Villa fans");
assert(groups[1].clubName === "Arsenal", "Groups Arsenal fans separately");
assert(groups[1].count === 1, "Counts Arsenal fans");
assert(
  groups[0].members.some(
    (fan) => fan.fullName === "Paul Adam" && fan.email === "pauladamvillafc@gmail.com"
  ),
  "Staff see the Villa fan name and email"
);
assert(
  groups[0].members[0].fullName === "Jacob Ramsey",
  "Fans within a club are sorted by name"
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
