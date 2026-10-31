import { readFileSync } from "fs";
import {
  HOME_JOIN_CLUB_LABEL,
  HOME_JOIN_COMMUNITY_LABEL,
  HOME_JOIN_FAN_LABEL,
  HOME_JOIN_FREE_LABEL,
  HOME_MOBILE_HEADLINE,
  HOME_MOBILE_INTRO_STAMP,
  HOME_MOBILE_SUPPORT,
} from "../app/lib/home-hero";
import { CLUB_REGISTER_PATH, FAN_REGISTER_PATH } from "../app/lib/routes";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const banner = readFileSync("app/components/home/HomeTopBanner.tsx", "utf8");
const front = readFileSync("app/components/home/HomeFrontPage.tsx", "utf8");

assert(
  HOME_MOBILE_HEADLINE === "EVERY SCORE COUNTS. EVERY FAN COUNTS." &&
    HOME_MOBILE_SUPPORT.includes("sponsor-funded climate action") &&
    HOME_JOIN_FAN_LABEL === "Join as a Fan" &&
    HOME_JOIN_CLUB_LABEL === "For Sports Clubs" &&
    HOME_JOIN_FREE_LABEL === "Join Free",
  "Mobile intro copy matches the simplified header"
);

assert(
  banner.includes(HOME_MOBILE_INTRO_STAMP) &&
    banner.includes("data-home-mobile-intro") &&
    banner.includes("md:hidden") &&
    banner.includes("hidden md:flex") &&
    banner.includes("EVERY FAN COUNTS") &&
    banner.includes(HOME_JOIN_FAN_LABEL) &&
    banner.includes(HOME_JOIN_CLUB_LABEL) &&
    banner.includes(HOME_JOIN_FREE_LABEL) &&
    banner.includes("Login") &&
    banner.includes("Open menu") &&
    banner.includes("FAN_REGISTER_PATH") &&
    banner.includes("CLUB_REGISTER_PATH") &&
    banner.includes("passion into progress") &&
    banner.includes("Sport unites people") &&
    banner.includes("HOME_JOIN_COMMUNITY_LABEL") &&
    banner.includes("data-join-community"),
  "Mobile uses the compact header, five-sports banner, Join the Community, and Login beside Join Free"
);

assert(
  front.includes("onJoinFree") &&
    front.includes("onJoinCommunity") &&
    front.includes('showJoin("register")') &&
    front.includes("onLogin") &&
    front.includes("hidden md:block") &&
    !front.includes(">Register<") &&
    !front.includes("{children}"),
  "The front page passes Login and Join Free into the simplified banner"
);

assert(
  FAN_REGISTER_PATH === "/fan/register" &&
    CLUB_REGISTER_PATH === "/club/register",
  "Join as a Fan and For Sports Clubs open the Fan and Club register pages"
);

if (failures.length > 0) {
  console.error("verify-home-mobile-simplify failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-home-mobile-simplify: ok");
