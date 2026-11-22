import { readFileSync } from "fs";
import { HOME_STAKEHOLDERS } from "../app/lib/home-stakeholders";
import {
  CLUB_LOGIN_PATH,
  FAN_LOGIN_PATH,
  PARTNER_LOGIN_PATH,
  LOCAL_SPONSOR_SIGN_IN_PATH,
  PHILANTHROPIST_LOGIN_PATH,
  SPONSOR_LOGIN_PATH,
} from "../app/lib/routes";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const roles = readFileSync("app/components/home/HomeRoleSection.tsx", "utf8");
const sponsorLogin = readFileSync("app/sponsor/login/page.tsx", "utf8");
const local = HOME_STAKEHOLDERS.find((card) => card.title === "Local Businesses");
const club = HOME_STAKEHOLDERS.find((card) => card.title === "Sports Clubs");
const fan = HOME_STAKEHOLDERS.find((card) => card.title === "Fans");
const global = HOME_STAKEHOLDERS.find((card) => card.title === "Global Brands");
const philanthropist = HOME_STAKEHOLDERS.find(
  (card) => card.title === "Philanthropists"
);
const partner = HOME_STAKEHOLDERS.find(
  (card) => card.title === "Climate Project Providers"
);

assert(
  HOME_STAKEHOLDERS.length === 6 &&
    HOME_STAKEHOLDERS.every(
      (card) =>
        card.loginText === "Already registered? Login" && Boolean(card.login)
    ),
  "Every role card uses Already registered? Login and has a login path"
);

assert(
  club?.login === CLUB_LOGIN_PATH &&
    fan?.login === FAN_LOGIN_PATH &&
    local?.login === LOCAL_SPONSOR_SIGN_IN_PATH &&
    global?.login === SPONSOR_LOGIN_PATH &&
    philanthropist?.login === PHILANTHROPIST_LOGIN_PATH &&
    partner?.login === PARTNER_LOGIN_PATH,
  "Each role login line opens that role's login page"
);

assert(
  sponsorLogin.includes("Local Business Sponsor") &&
    sponsorLogin.includes(
      "Sign in as Local Business Climate Sponsor to receive a Partner Club's 5 Climate Project."
    ) &&
    sponsorLogin.includes('audience === "local"') &&
    sponsorLogin.includes("isLocalClimateSponsor") &&
    sponsorLogin.includes("Brand / Sponsor") &&
    sponsorLogin.includes("Philanthropic Sponsor") &&
    sponsorLogin.includes(
      "Sign in as a Philanthropic Sponsor to receive a Partner Club's 5 Climate Projects."
    ) &&
    sponsorLogin.includes('audience === "philanthropist"') &&
    sponsorLogin.includes(
      "Sign in as Sponsorship Manager to receive a club's 5 Climate Projects."
    ) &&
    !sponsorLogin.includes("create your own campaign list"),
  "Philanthropist and Global Brand sign-in use their own introductions, without create your own campaign list"
);

const firstLoginLine = roles.indexOf("<RoleLoginLine");
const secondLoginLine = roles.indexOf("<RoleLoginLine", firstLoginLine + 1);
assert(
  roles.includes("RoleLoginLine") &&
    roles.includes("card.loginText") &&
    roles.includes("card.login") &&
    roles.includes('data-role-card-login="role-card-login-v1"') &&
    firstLoginLine !== -1 &&
    secondLoginLine !== -1 &&
    roles.indexOf("<RoleLoginLine", secondLoginLine + 1) === -1 &&
    roles.indexOf("{text}") < firstLoginLine &&
    roles.indexOf("{selectedCta.text}") > firstLoginLine &&
    roles.indexOf("{selectedCta.text}") < secondLoginLine,
  "Already registered? Login sits under the green CTA on mobile tabs and desktop cards"
);

if (failures.length > 0) {
  console.error("verify-role-card-login-line failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-role-card-login-line: ok");
