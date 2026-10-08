import { readFileSync } from "fs";
import {
  roleLoginAccount,
  roleRegisterAccount,
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

const hardcodedEmails = [
  "lauradaviesheartsfan@gmail.com",
  "lauradaviesheartssd@gmail.com",
  "pumasponsor@gmail.com",
  "climatepartner@gmail.com",
  "s4pstaff@gmail.com",
];

assert(
  roles.every((role) => accounts[role].email === "" && accounts[role].password === ""),
  "Fan, Club, Sponsor, Partner and Staff logins start with empty email and password"
);

const helperSource = readFileSync("app/lib/role-login.ts", "utf8");
assert(
  hardcodedEmails.every((email) => !helperSource.includes(email)),
  "No title-associated emails are hardcoded into login defaults"
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
  "Shared role login form uses private per-title fields"
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
    source.includes(page.marker) &&
      !source.includes('name="email"') &&
      hardcodedEmails.every((email) => !source.includes(email)),
    `${page.path} uses empty ${page.role} fields and does not share a generic email field`
  );
}

const sponsorLogin = readFileSync("app/sponsor/login/page.tsx", "utf8");
assert(
  sponsorLogin.includes('roleLoginAccount("sponsor")') &&
    sponsorLogin.includes("account.emailName") &&
    sponsorLogin.includes("account.emailAutoComplete") &&
    !sponsorLogin.includes('name="email"') &&
    hardcodedEmails.every((email) => !sponsorLogin.includes(email)),
  "Sponsor Login starts empty and does not share the Fan email field"
);

const partnerRegisterAccount = roleRegisterAccount("partner");
assert(
  partnerRegisterAccount.emailName !== accounts.partner.emailName &&
    partnerRegisterAccount.passwordName !== accounts.partner.passwordName &&
    partnerRegisterAccount.emailName === "s4p-partner-register-email" &&
    partnerRegisterAccount.passwordAutoComplete.includes("new-password"),
  "Climate Partner registration uses its own blank fields, not the Partner login names"
);

const partnerRegister = readFileSync("app/partner/register/page.tsx", "utf8");
assert(
  partnerRegister.includes('useState("")') &&
    partnerRegister.includes('roleRegisterAccount("partner")') &&
    partnerRegister.includes("account.emailName") &&
    partnerRegister.includes("FreshRegisterInput") &&
    partnerRegister.includes("tabIndex={-1}") &&
    !partnerRegister.includes("godwinokey") &&
    hardcodedEmails.every((email) => !partnerRegister.includes(email)),
  "Climate Partner registration starts as a blank sheet with no defaulted email"
);

const genericLogin = readFileSync("app/login/page.tsx", "utf8");
assert(
  genericLogin.includes('roleLoginAccount("fan")') &&
    genericLogin.includes("account.emailName") &&
    genericLogin.includes("account.emailAutoComplete") &&
    !genericLogin.includes('name="email"') &&
    hardcodedEmails.every((email) => !genericLogin.includes(email)),
  "The navbar Login page starts empty and does not share Club field names"
);

if (failures.length > 0) {
  console.error("verify-role-login failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-role-login: ok");
