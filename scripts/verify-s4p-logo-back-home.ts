import { readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const lockup = readFileSync("app/components/S4PLockup.tsx", "utf8");
const bar = readFileSync("app/components/GlobalSiteBar.tsx", "utf8");
const root = readFileSync("app/layout.tsx", "utf8");
const layout = readFileSync("app/sponsor/layout.tsx", "utf8");
const nav = readFileSync("app/sponsor/sponsor-nav.tsx", "utf8");
const sponsorLogin = readFileSync("app/sponsor/login/page.tsx", "utf8");
const fanNav = readFileSync(
  "app/dashboard/supporter/components/FanNav.tsx",
  "utf8"
);
const clubNav = readFileSync("app/components/club/ClubNav.tsx", "utf8");
const roleLogin = readFileSync(
  "app/components/auth/RoleLoginForm.tsx",
  "utf8"
);
const apply = readFileSync("apply-s4p-logo-back-home.mjs", "utf8");

assert(
  lockup.includes('S4P_LOCKUP_SRC = "/images/home/s4p-lockup.png"') &&
    lockup.includes("S4PBrandRow") &&
    lockup.includes("BackToHomeButton") &&
    lockup.includes('data-testid="back-to-home"') &&
    lockup.includes("← Back to home") &&
    lockup.includes("h-14 w-auto max-w-[12rem]") &&
    lockup.includes("s4p-logo-back-home-v1"),
  "Shared chrome is the Score-For-Planet lockup plus a Back to home button"
);

assert(
  bar.includes("s4p-logo-back-home-v1") &&
    bar.includes("S4PBrandRow") &&
    bar.includes('pathname === "/"') &&
    root.includes("GlobalSiteBar") &&
    root.includes("<GlobalSiteBar />"),
  "Every page except Home shows the lockup and Back to home"
);

assert(
  layout.includes("s4p-logo-back-home-v1") &&
    layout.includes("S4P_SPONSOR_MARK") &&
    layout.includes("SponsorNav") &&
    !layout.includes("text-2xl font-black text-green-400") &&
    nav.includes("s4p-logo-back-home-v1") &&
    nav.includes('data-sponsor-logged-out="s4p-logo-back-home-v1"') &&
    nav.includes("grid-cols-3") &&
    nav.includes("Logout") &&
    nav.includes("HOME_PATH") &&
    nav.includes("Register as Sponsor") &&
    nav.includes("Login"),
  "Sponsor login shows Register, Login and Logout tabs instead of jammed text links"
);

assert(
  sponsorLogin.includes("← Back to home") &&
    sponsorLogin.includes("HOME_PATH") &&
    roleLogin.includes("← Back to home") &&
    fanNav.includes("top-[4.75rem]") &&
    !fanNav.includes("text-2xl font-black tracking-tight text-green-400") &&
    clubNav.includes("top-[4.75rem]") &&
    !clubNav.includes("text-2xl font-black tracking-tight text-green-400"),
  "Fan, club and sponsor screens no longer use a plain S4P wordmark"
);

assert(
  apply.includes('BRANCH = "cursor/s4p-logo-back-home-18f9"') &&
    apply.includes("s4p-logo-back-home-1") &&
    apply.includes("app/components/GlobalSiteBar.tsx") &&
    apply.includes("app/sponsor/sponsor-nav.tsx"),
  "PC overlay pulls the lockup, Back to home and Logout tab"
);

if (failures.length > 0) {
  console.error("verify-s4p-logo-back-home failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-s4p-logo-back-home: ok");
