import { readFileSync } from "fs";
import { inviteTabFlashClass, inviteTabShouldFlash } from "../app/lib/s4p-tabs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const nav = readFileSync("app/sponsor/sponsor-nav.tsx", "utf8");
const layout = readFileSync("app/sponsor/layout.tsx", "utf8");
const preview = readFileSync("app/preview/sponsor-nav/page.tsx", "utf8");
const home = readFileSync("app/components/sponsor/LeadSponsorHome.tsx", "utf8");
const leadLib = readFileSync("app/lib/lead-sponsor-home.ts", "utf8");
const css = readFileSync("app/globals.css", "utf8");

assert(
  nav.includes("sponsor-tabs-visible-v1") &&
    nav.includes("sponsor-drop-calendar-v1") &&
    nav.includes("sponsor-nav-pc-fix-v1") &&
    !nav.includes("local-sponsor.service") &&
    nav.includes("SponsorTabBar") &&
    nav.includes('data-testid="sponsor-tab-bar"') &&
    nav.includes("grid-cols-4") &&
    nav.includes("grid-cols-3") &&
    nav.includes("overflow-x-hidden") &&
    nav.includes("whitespace-normal") &&
    nav.includes("Dashboard") &&
    nav.includes("GAME_TIME_NAV_LABEL") &&
    nav.includes("sponsorInvitationsNavLabel") &&
    nav.includes("s4p-invite-flash") &&
    nav.includes("invite-tab-flash-v1") &&
    nav.includes("LOCAL_MY_S4P_NAV") &&
    nav.includes("LOCAL_SPONSOR_MY_S4P_PATH") &&
    nav.includes("local-mys4p-tab-v1") &&
    nav.includes("Logout") &&
    nav.includes("s4p-logo-back-home-v1") &&
    nav.includes("grid-cols-3") &&
    !nav.includes("href={SPONSOR_CALENDAR_PATH}") &&
    !nav.includes("s4pTabClass(onCalendar)") &&
    !nav.includes("overflow-x-auto"),
  "Sponsor tabs are Dashboard, Game-Time, Invitations and Logout, with no Calendar tab"
);

assert(
  layout.includes('data-sponsor-tabs-visible="sponsor-tabs-visible-v1"') &&
    layout.includes("flex-col gap-3") &&
    layout.includes("overflow-x-hidden") &&
    layout.includes("SponsorNav") &&
    layout.includes("S4P_SPONSOR_MARK") &&
    layout.includes('data-testid="s4p-sponsor-mark"') &&
    layout.includes("s4p-logo-back-home-v1") &&
    !layout.includes("overflow-x-auto") &&
    !layout.includes("justify-end"),
  "The sponsor header keeps a full-width tab row on a phone under the lockup"
);

assert(
  preview.includes("SponsorTabBar") &&
    preview.includes("inviteCount={1}") &&
    preview.includes("SPONSOR_DASHBOARD_PATH") &&
    preview.includes("LOCAL_SPONSOR_HOME_PATH") &&
    preview.includes("PHILANTHROPIST_HOME_PATH") &&
    preview.includes("inviteCount={0}") &&
    preview.includes("LeadSponsorHome") &&
    preview.includes("S4P_SPONSOR_MARK") &&
    preview.includes("pending={[]}"),
  "Sponsor nav preview shows Dashboard, Game-Time, Invitations and Logout, plus local My S4P"
);

assert(
  css.includes("@keyframes s4p-invite-flash") &&
    css.includes("@keyframes s4p-invite-flash-fill") &&
    css.includes(".s4p-invite-flash") &&
    css.includes("prefers-reduced-motion") &&
    nav.includes("inviteTabFlashClass") &&
    nav.includes("showInvitations = true") &&
    nav.includes("PHILANTHROPIST_HOME_PATH") &&
    inviteTabShouldFlash(1) &&
    inviteTabShouldFlash(2) &&
    !inviteTabShouldFlash(0) &&
    inviteTabFlashClass(1) === "s4p-invite-flash" &&
    inviteTabFlashClass(0) === "",
  "Invitations tab flashes for Lead, Local and Philanthropist while a Match Day invitation is waiting"
);

assert(
  home.includes("lead-awaiting-no-empty-v1") &&
    !home.includes("LEAD_AWAITING_EMPTY") &&
    !home.includes("No Climate Projects are waiting") &&
    !leadLib.includes("LEAD_AWAITING_EMPTY") &&
    !leadLib.includes("No Climate Projects are waiting"),
  "Section (A) does not show No Climate Projects are waiting when the list is empty"
);

if (failures.length > 0) {
  console.error("verify-sponsor-tabs-visible failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-sponsor-tabs-visible: ok");
