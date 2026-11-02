import { readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const nav = readFileSync("app/sponsor/sponsor-nav.tsx", "utf8");
const layout = readFileSync("app/sponsor/layout.tsx", "utf8");
const preview = readFileSync("app/preview/sponsor-nav/page.tsx", "utf8");

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
    preview.includes("SPONSOR_DASHBOARD_PATH"),
  "Sponsor nav preview shows the five Lead tabs including Invitations (1)"
);

if (failures.length > 0) {
  console.error("verify-sponsor-tabs-visible failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-sponsor-tabs-visible: ok");
