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
    nav.includes("SponsorTabBar") &&
    nav.includes('data-testid="sponsor-tab-bar"') &&
    nav.includes("grid-cols-5") &&
    nav.includes("grid-cols-3") &&
    nav.includes("overflow-x-hidden") &&
    nav.includes("whitespace-normal") &&
    nav.includes("Dashboard") &&
    nav.includes("Calendar") &&
    nav.includes("Game-Time") &&
    nav.includes("sponsorInvitationsNavLabel") &&
    nav.includes("Logout") &&
    !nav.includes("overflow-x-auto"),
  "Sponsor tabs are a full-width phone grid so Dashboard through Logout all stay on screen"
);

assert(
  layout.includes('data-sponsor-tabs-visible="sponsor-tabs-visible-v1"') &&
    layout.includes("flex-col gap-3") &&
    layout.includes("overflow-x-hidden") &&
    layout.includes("SponsorNav") &&
    !layout.includes("overflow-x-auto") &&
    !layout.includes("justify-end"),
  "The sponsor header stacks the S4P mark above a full-width tab row on a phone"
);

assert(
  preview.includes("SponsorTabBar") &&
    preview.includes("inviteCount={1}") &&
    preview.includes("SPONSOR_DASHBOARD_PATH") &&
    preview.includes("LeadSponsorHome") &&
    preview.includes("pending={[]}"),
  "Sponsor nav preview shows the five Lead tabs including Invitations (1)"
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
