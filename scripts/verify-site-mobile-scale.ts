import { readFileSync } from "fs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const layout = readFileSync("app/layout.tsx", "utf8");
const css = readFileSync("app/globals.css", "utf8");
const nav = readFileSync("app/components/calendar/CalendarMonthNav.tsx", "utf8");
const sponsored = readFileSync(
  "app/components/sponsor/SponsoredMatchCalendar.tsx",
  "utf8"
);
const board = readFileSync(
  "app/components/sponsor/SportingCalendarBoard.tsx",
  "utf8"
);
const clubCal = readFileSync(
  "app/components/sponsor/ClubMatchCalendar.tsx",
  "utf8"
);
const sponsorLayout = readFileSync("app/sponsor/layout.tsx", "utf8");
const appLayout = readFileSync("app/layout/AppLayout.tsx", "utf8");
const fanLayout = readFileSync("app/supporter/dashboard/layout.tsx", "utf8");
const banner = readFileSync("app/components/home/HomeTopBanner.tsx", "utf8");

assert(
  layout.includes('data-site-mobile-scale="site-mobile-scale-v1"') &&
    layout.includes("export const viewport") &&
    layout.includes('width: "device-width"') &&
    layout.includes("initialScale: 1"),
  "Root layout pins the phone viewport and the site mobile scale stamp"
);

assert(
  css.includes("overflow-x: clip") &&
    css.includes("@media (max-width: 639px)") &&
    css.includes(".p-8") &&
    css.includes(".px-6") &&
    css.includes(".text-6xl") &&
    css.includes('[class*="tracking-[0."]') &&
    css.includes("@layer base"),
  "Global CSS scales desktop padding, type, and letter-spacing on a phone"
);

assert(
  nav.includes('data-calendar-month-nav="site-mobile-scale-v1"') &&
    nav.includes("CALENDAR_WEEKDAY_CLASS") &&
    nav.includes("tracking-wide") &&
    nav.includes("sm:tracking-[0.16em]") &&
    nav.includes("min-w-0 flex-1") &&
    sponsored.includes("CalendarMonthNav") &&
    board.includes("CalendarMonthNav") &&
    clubCal.includes("CALENDAR_WEEKDAY_CLASS") &&
    !sponsored.includes("mt-6 flex items-center justify-between gap-4") &&
    !board.includes("mt-6 flex items-center justify-between gap-4"),
  "Calendars keep Previous, the month, Next, and weekday labels inside the phone"
);

assert(
  sponsorLayout.includes("px-4 py-6 sm:px-6 sm:py-10") &&
    sponsorLayout.includes("flex-wrap") &&
    appLayout.includes("p-4 text-white sm:p-8") &&
    fanLayout.includes("px-4 pt-6 sm:px-6"),
  "Sponsor, fan, and staff shells use phone padding"
);

assert(
  banner.includes("max-w-[6.75rem]") &&
    banner.includes("flex min-w-0 items-center justify-between gap-2"),
  "Homepage mobile lockup leaves room for Login and Join Free"
);

if (failures.length > 0) {
  console.error("verify-site-mobile-scale failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-site-mobile-scale: ok");
