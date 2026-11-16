import { readFileSync } from "fs";
import {
  HOME_CLUBS_SPONSORS_HREF,
  HOME_CLUBS_SPONSORS_LABEL,
  HOME_JOIN_COMMUNITY_HREF,
  HOME_JOIN_COMMUNITY_LABEL,
} from "../app/lib/home-hero";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const banner = readFileSync("app/components/home/HomeTopBanner.tsx", "utf8");
const front = readFileSync("app/components/home/HomeFrontPage.tsx", "utf8");
assert(
  HOME_JOIN_COMMUNITY_LABEL === "Join the S4P Community" &&
    HOME_JOIN_COMMUNITY_HREF === "#are-you" &&
    HOME_CLUBS_SPONSORS_LABEL === "For Clubs & Sponsors" &&
    HOME_CLUBS_SPONSORS_HREF === "#join-s4p-community",
  "Join the S4P Community points at the role section; Clubs & Sponsors opens the club panel"
);

assert(
  banner.includes("SportClusterImage") &&
    banner.includes("FirstBlock") &&
    !banner.includes("JoinRoleTabs") &&
    !banner.includes("Join as a Fan") &&
    !banner.includes("For Sports Clubs"),
  "The first homepage block no longer duplicates Fan and Sports Clubs tabs"
);

assert(
  banner.includes('data-join-community="join-community-v1"') &&
    banner.includes("HOME_JOIN_COMMUNITY_LABEL") &&
    banner.includes("onJoinCommunity") &&
    banner.includes("HOME_JOIN_COMMUNITY_HREF") &&
    banner.includes("HOME_CLUBS_SPONSORS_LABEL") &&
    banner.includes("HOME_CLUBS_SPONSORS_HREF") &&
    !banner.includes("hover:brightness-110 md:hidden"),
  "Join the S4P Community and For Clubs & Sponsors sit under the Image 1 intro on every screen"
);

assert(
  front.includes("onJoinCommunity") &&
    front.includes('data-how-s4p-desktop="true"') &&
    front.includes("hidden md:block") &&
    front.includes("<HowItWorks"),
  "How S4P Works stays on desktop and is removed from the mobile homepage"
);

if (failures.length > 0) {
  console.error("verify-join-community-tab failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-join-community-tab: ok");
