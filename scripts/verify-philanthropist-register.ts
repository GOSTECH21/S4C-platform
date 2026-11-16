import { readFileSync } from "fs";
import { HOME_STAKEHOLDERS } from "../app/lib/home-stakeholders";
import {
  LOCAL_SPONSOR_HOME_PATH,
  PHILANTHROPIST_HOME_PATH,
  PHILANTHROPIST_REGISTER_PATH,
  SPONSOR_DASHBOARD_PATH,
  SPONSOR_REGISTER_PATH,
} from "../app/lib/routes";
import {
  PHILANTHROPIST_JOB_TITLE,
  PHILANTHROPIST_KICKER,
  PHILANTHROPIST_REGISTER_CTA,
  PHILANTHROPIST_REGISTER_HEADING,
  isPhilanthropistJobTitle,
  isPhilanthropistSponsor,
  philanthropistGiftCopy,
} from "../app/lib/philanthropist";
import { sponsorHomePath } from "../app/lib/sponsor-home";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const philanthropist = HOME_STAKEHOLDERS.find(
  (card) => card.title === "Philanthropists"
);
const global = HOME_STAKEHOLDERS.find((card) => card.title === "Global Brands");

assert(
  philanthropist?.register === PHILANTHROPIST_REGISTER_PATH &&
    philanthropist.register !== SPONSOR_REGISTER_PATH &&
    global?.register === SPONSOR_REGISTER_PATH,
  "Philanthropists register on their own card, not the Lead Climate Sponsor form"
);

assert(
  PHILANTHROPIST_REGISTER_PATH === "/sponsor/philanthropist/register" &&
    PHILANTHROPIST_HOME_PATH === "/sponsor/philanthropist" &&
    !PHILANTHROPIST_REGISTER_PATH.startsWith(SPONSOR_REGISTER_PATH),
  "Philanthropist URLs are distinct from /sponsor/register"
);

const register = readFileSync(
  "app/sponsor/philanthropist/register/page.tsx",
  "utf8"
);
const lib = readFileSync("app/lib/philanthropist.ts", "utf8");
const lead = readFileSync("app/sponsor/register/page.tsx", "utf8");
const nav = readFileSync("app/sponsor/sponsor-nav.tsx", "utf8");
const home = readFileSync("app/sponsor/philanthropist/page.tsx", "utf8");

assert(
  lib.includes(PHILANTHROPIST_REGISTER_HEADING) &&
    lib.includes(PHILANTHROPIST_KICKER) &&
    lib.includes("any amount per match") &&
    lib.includes("Climate Impact League Table (CILT)") &&
    lib.includes(PHILANTHROPIST_REGISTER_CTA),
  "Philanthropist copy is a climate gift, not Match-Sponsor / P4P"
);

assert(
  register.includes('data-philanthropist-register="philanthropist-register-v1"') &&
    register.includes("PHILANTHROPIST_REGISTER_HEADING") &&
    register.includes("PHILANTHROPIST_KICKER") &&
    register.includes("PHILANTHROPIST_REGISTER_COPY") &&
    register.includes("PHILANTHROPIST_REGISTER_CTA") &&
    register.includes("Gift per match") &&
    register.includes("ClubNetworkPicker") &&
    register.includes("MatchSponsorshipPicker") &&
    register.includes("Select the Match you wish to sponsor") &&
    register.includes("single") &&
    !register.includes("Gillette UK") &&
    !register.includes("Sponsorship Manager") &&
    !register.includes("Match-Sponsor") &&
    !register.includes("Register as Sponsor") &&
    !register.includes("Brand / Sponsor") &&
    !register.includes("GAME_TIME_PRODUCT_LABEL") &&
    register.includes("depositPhilanthropistClimateWallet"),
  "Philanthropist register is a donation card that deposits the Carbon Wallet"
);

assert(
  lead.includes("Gillette UK") &&
    lead.includes("Sponsorship Manager") &&
    lead.includes("Register as Sponsor") &&
    lead.includes("Brand / Sponsor") &&
    lead.includes("PHILANTHROPIST_REGISTER_PATH"),
  "Lead Climate Sponsor register stays on /sponsor/register"
);

assert(
  nav.includes("PHILANTHROPIST_NAV_REGISTER") &&
    nav.includes("Register as Sponsor") &&
    nav.includes("PHILANTHROPIST_REGISTER_PATH"),
  "Logged-out sponsor nav labels philanthropist register separately"
);

assert(
  home.includes("PHILANTHROPIST_HOME_HEADING") &&
    home.includes("philanthropistGiftCopy") &&
    home.includes("PhilanthropistMatchGift") &&
    !home.includes("LeadSponsorHome") &&
    !home.includes("GAME_TIME"),
  "Philanthropist home confirms the climate gift instead of the Lead dashboard"
);

assert(
  isPhilanthropistJobTitle(PHILANTHROPIST_JOB_TITLE) &&
    isPhilanthropistSponsor("Davies Family Trust", {
      jobTitle: PHILANTHROPIST_JOB_TITLE,
    }) &&
    !isPhilanthropistSponsor("Gillette UK", {
      jobTitle: "Sponsorship Manager",
    }) &&
    sponsorHomePath("Davies Family Trust", {
      jobTitle: PHILANTHROPIST_JOB_TITLE,
    }) === PHILANTHROPIST_HOME_PATH &&
    sponsorHomePath("American Express") === SPONSOR_DASHBOARD_PATH &&
    sponsorHomePath("The Fountain") === LOCAL_SPONSOR_HOME_PATH,
  "Philanthropist accounts land on their gift home, not Lead or Local dashboards"
);

const gift = philanthropistGiftCopy({
  name: "Alex Davies",
  organisation: "Davies Family Trust",
  email: "alex@example.com",
  clubName: "Rangers",
  giftGbp: 250,
  createdAt: "2026-11-14T00:00:00.000Z",
});
assert(
  gift.includes("Rangers") &&
    gift.includes("£250") &&
    gift.includes("Philanthropist Carbon Wallet") &&
    gift.includes("£0.50") &&
    gift.includes("not a Lead Climate Sponsorship"),
  "Gift copy tells fans they take £0.50 from the Philanthropist Carbon Wallet"
);

if (failures.length > 0) {
  console.error("verify-philanthropist-register failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-philanthropist-register: ok");
