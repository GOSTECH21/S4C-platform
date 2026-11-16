import { readFileSync } from "fs";
import {
  HOME_CLUBS_SPONSORS_LABEL,
  HOME_CONNECTS_COPY,
  HOME_INTRO_PRODUCTS,
  HOME_JOIN_CLUB_LABEL,
  HOME_JOIN_COMMUNITY_LABEL,
  HOME_JOIN_FAN_LABEL,
  HOME_JOIN_FREE_LABEL,
  HOME_MOBILE_HEADLINE,
  HOME_MOBILE_INTRO_STAMP,
  HOME_MOBILE_TAGLINE,
  HOME_TOGETHER_HEADING,
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
    HOME_MOBILE_TAGLINE.includes("sponsor-funded climate action") &&
    HOME_TOGETHER_HEADING.includes("Sport brings us together") &&
    HOME_CONNECTS_COPY.includes("club-approved climate projects") &&
    HOME_INTRO_PRODUCTS.length === 3 &&
    HOME_JOIN_COMMUNITY_LABEL === "Join the S4P Community" &&
    HOME_CLUBS_SPONSORS_LABEL === "For Clubs & Sponsors" &&
    HOME_JOIN_FAN_LABEL === "Join as a Fan" &&
    HOME_JOIN_CLUB_LABEL === "For Sports Clubs" &&
    HOME_JOIN_FREE_LABEL === "Join Free",
  "Mobile intro copy matches the Image 1 header"
);

assert(
  banner.includes(HOME_MOBILE_INTRO_STAMP) &&
    banner.includes("data-home-mobile-intro") &&
    banner.includes("md:hidden") &&
    banner.includes("hidden md:flex") &&
    banner.includes("EVERY FAN COUNTS") &&
    banner.includes(HOME_JOIN_FREE_LABEL) &&
    banner.includes("Login") &&
    banner.includes("Open menu") &&
    banner.includes("HOME_TOGETHER_HEADING") &&
    banner.includes("HOME_INTRO_PRODUCTS") &&
    banner.includes("Sport unites people") &&
    banner.includes("HOME_JOIN_COMMUNITY_LABEL") &&
    banner.includes("HOME_CLUBS_SPONSORS_LABEL") &&
    banner.includes("data-join-community") &&
    banner.includes("data-clubs-sponsors") &&
    !banner.includes("passion into progress") &&
    !banner.includes("Measure emissions") &&
    !banner.includes("Join as a Fan") &&
    !banner.includes("For Sports Clubs"),
  "The first homepage block uses the compact header, five-sports banner, Image 1 intro, two CTAs, and Login beside Join Free"
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
