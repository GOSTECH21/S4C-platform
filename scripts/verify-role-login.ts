import { readFileSync } from "fs";
import {
  roleLoginAccount,
  roleLoginEmailBelongsToTitle,
  type LoginRole,
} from "../app/lib/role-login";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const roles: LoginRole[] = ["fan", "club", "sponsor", "partner", "admin"];
const accounts = Object.fromEntries(
  roles.map((role) => [role, roleLoginAccount(role)])
) as Record<LoginRole, ReturnType<typeof roleLoginAccount>>;

assert(
  accounts.fan.email === "lauradaviesheartsfan@gmail.com" &&
    roleLoginEmailBelongsToTitle("fan", accounts.fan.email),
  "Fan Login defaults to the Hearts fan email"
);
assert(
  accounts.club.email === "lauradaviesheartssd@gmail.com" &&
    roleLoginEmailBelongsToTitle("club", accounts.club.email) &&
    accounts.club.email !== accounts.fan.email,
  "Club Login defaults to the Hearts Sustainability Director email, not the fan account"
);
assert(
  accounts.sponsor.email === "pumasponsor@gmail.com" &&
    accounts.sponsor.email !== accounts.fan.email,
  "Sponsor Login defaults to the Puma sponsor email, not the fan account"
);
assert(
  accounts.partner.email === "climatepartner@gmail.com" &&
    accounts.partner.email !== accounts.fan.email,
  "Climate Partner Login defaults to the partner email, not the fan account"
);
assert(
  accounts.admin.email === "s4pstaff@gmail.com" &&
    accounts.admin.email !== accounts.fan.email,
  "S4P Staff Login defaults to the staff email, not the fan account"
);
assert(
  new Set(roles.map((role) => accounts[role].email)).size === roles.length,
  "Every login title has a different default email"
);
assert(
  new Set(roles.map((role) => accounts[role].emailName)).size === roles.length,
  "Each login title has its own email field name so the browser keeps passwords separate"
);
assert(
  new Set(roles.map((role) => accounts[role].passwordName)).size ===
    roles.length,
  "Each login title has its own password field name"
);
assert(
  new Set(roles.map((role) => accounts[role].emailAutoComplete)).size ===
    roles.length &&
    roles.every((role) =>
      accounts[role].emailAutoComplete.startsWith(`section-s4p-${role}`)
    ),
  "Each login title has its own autocomplete section"
);

const roleForm = readFileSync("app/components/auth/RoleLoginForm.tsx", "utf8");
assert(
  roleForm.includes("role: LoginRole") &&
    roleForm.includes("roleLoginAccount(role)") &&
    roleForm.includes("account.emailAutoComplete") &&
    roleForm.includes("account.passwordAutoComplete") &&
    !roleForm.includes('name="email"'),
  "Shared role login form uses the title's account and a private username field"
);

const loginPages: Array<{ path: string; role: LoginRole; marker: string }> = [
  { path: "app/fan/login/page.tsx", role: "fan", marker: 'role="fan"' },
  {
    path: "app/supporter/login/page.tsx",
    role: "fan",
    marker: 'role="fan"',
  },
  { path: "app/club/login/page.tsx", role: "club", marker: 'role="club"' },
  {
    path: "app/partner/login/page.tsx",
    role: "partner",
    marker: 'role="partner"',
  },
  {
    path: "app/admin/login/page.tsx",
    role: "admin",
    marker: 'role="admin"',
  },
];

for (const page of loginPages) {
  const source = readFileSync(page.path, "utf8");
  assert(
    source.includes(page.marker) && !source.includes('name="email"'),
    `${page.path} uses the ${page.role} title account and does not share a generic email field`
  );
}

const sponsorLogin = readFileSync("app/sponsor/login/page.tsx", "utf8");
assert(
  sponsorLogin.includes('roleLoginAccount("sponsor")') &&
    sponsorLogin.includes("account.emailName") &&
    sponsorLogin.includes("account.emailAutoComplete") &&
    !sponsorLogin.includes('name="email"'),
  "Sponsor Login uses the sponsor title account, not the shared email field"
);

const genericLogin = readFileSync("app/login/page.tsx", "utf8");
assert(
  genericLogin.includes('roleLoginAccount("fan")') &&
    genericLogin.includes("account.emailName") &&
    genericLogin.includes("account.emailAutoComplete") &&
    !genericLogin.includes('name="email"'),
  "The navbar Login page uses Fan credentials and does not share Club field names"
);

if (failures.length > 0) {
  console.error("verify-role-login failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-role-login: ok");
