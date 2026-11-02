import { readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const nav = readFileSync("app/sponsor/sponsor-nav.tsx", "utf8");
const layout = readFileSync("app/sponsor/layout.tsx", "utf8");
const preview = readFileSync("app/preview/sponsor-nav/page.tsx", "utf8");
const home = readFileSync("app/components/sponsor/LeadSponsorHome.tsx", "utf8");
const leadLib = readFileSync("app/lib/lead-sponsor-home.ts", "utf8");

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
    nav.includes("Game-Time") &&
    nav.includes("sponsorInvitationsNavLabel") &&
    nav.includes("Logout") &&
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
    !layout.includes("overflow-x-auto") &&
    !layout.includes("justify-end"),
  "The sponsor header stacks S4P SPONSOR above a full-width tab row on a phone"
);

assert(
  preview.includes("SponsorTabBar") &&
    preview.includes("inviteCount={1}") &&
    preview.includes("SPONSOR_DASHBOARD_PATH") &&
    preview.includes("LeadSponsorHome") &&
    preview.includes("S4P_SPONSOR_MARK") &&
    preview.includes("pending={[]}"),
  "Sponsor nav preview shows Dashboard, Game-Time, Invitations and Logout"
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
