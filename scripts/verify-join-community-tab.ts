import { readFileSync } from "fs";
import {
  HOME_JOIN_COMMUNITY_HREF,
  HOME_JOIN_COMMUNITY_LABEL,
} from "../app/lib/home-hero";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const banner = readFileSync("app/components/home/HomeTopBanner.tsx", "utf8");
const front = readFileSync("app/components/home/HomeFrontPage.tsx", "utf8");
const intro = banner.slice(
  banner.indexOf("data-home-mobile-intro"),
  banner.indexOf("<HeadlineAndFeatures")
);

assert(
  HOME_JOIN_COMMUNITY_LABEL === "Join the Community" &&
    HOME_JOIN_COMMUNITY_HREF === "#are-you",
  "Join the Community points at the S4P community role section"
);

assert(
  !intro.includes("JoinRoleTabs") &&
    intro.includes("SportClusterImage") &&
    banner.includes("JoinRoleTabs") &&
    banner.includes("hidden min-w-0 md:block"),
  "Fan and Sports Clubs tabs sit under the desktop sports banner only"
);

assert(
  banner.includes('data-join-community="join-community-v1"') &&
    banner.includes("HOME_JOIN_COMMUNITY_LABEL") &&
    banner.includes("md:hidden") &&
    banner.includes("onJoinCommunity") &&
    banner.includes("HOME_JOIN_COMMUNITY_HREF"),
  "Join the Community sits under the global sports copy on mobile"
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
