/** Matchrav — intelligent supporter travel planning. Full product surface comes later. */

import { fanLoginPath, SUPPORTER_MATCHRAV_PATH } from "./routes";

export const MATCHRAV_STAMP = "matchrav-fan-tabs-v1";
export const MATCHRAV_BELOW_CLUB_STAMP = "matchrav-below-club-v1";
export const MATCHRAV_ACCOUNT_STAMP = "matchrav-fan-account-v1";
export const MATCHRAV_PLANNER_STAMP = "matchrav-planner-mobile-pc-v1";
export const MATCHRAV_JOURNEY_STAMP = "matchrav-journey-ops-v1";
export const MATCHRAV_NAME = "Matchrav";
export const MATCHRAV_PREVIEW_PATH = "/preview/matchrav";

export const FAN_JOIN_KICKER = "Every fan counts";
export const FAN_JOIN_HEADING = "Support your team. Help fund climate action.";
export const FAN_JOIN_BODY =
  "Match-day travel is an important part of a club's carbon footprint. Supporter travel can be one of the largest contributors to a club's match-day carbon footprint. Help them address Match Day emissions. Join S4P for free, use Matchrav to plan smarter, lower-emission journeys, and play P4P to unlock sponsor-funded contributions towards your club's climate projects.";

export const MATCHRAV_TAB_DETAIL = "Before & after the match";
export const P4P_FAN_TAB_DETAIL = "During the match";
export const S4P_FAN_TAB_DETAIL = "When your team scores";

export const JOIN_S4P_FREE_LABEL = "Join S4P free";
export const EXPLORE_MATCHRAV_LABEL = "Explore Matchrav";
export const PLAY_P4P_LABEL = "Play P4P";

/** Explore Matchrav opens Fan Login; Register here remains on that page. */
export const MATCHRAV_EXPLORE_HREF = fanLoginPath(SUPPORTER_MATCHRAV_PATH);

export const MATCHRAV_ACCOUNT_INTRO =
  "Matchrav helps supporters plan smarter, lower-emission journeys to matches. Compare travel options, reduce estimated carbon, and connect that travel to sponsor-funded climate action through S4P.";

export const MATCHRAV_ACCOUNT_STEPS = [
  {
    title: "Plan your journey",
    body: "Work out an efficient route to the match before you travel, and after you leave.",
  },
  {
    title: "Compare options",
    body: "See how different ways of getting there change the estimated carbon of the trip.",
  },
  {
    title: "Fund climate action",
    body: "Use Matchrav with S4P so sponsor-funded contributions follow the journey you take.",
  },
] as const;

export const FAN_PRODUCT_TABS = [
  {
    id: "matchrav",
    label: MATCHRAV_NAME,
    detail: MATCHRAV_TAB_DETAIL,
    icon: "route",
  },
  {
    id: "p4p",
    label: "P4P",
    detail: P4P_FAN_TAB_DETAIL,
    icon: "target",
  },
  {
    id: "s4p",
    label: "S4P",
    detail: S4P_FAN_TAB_DETAIL,
    icon: "score",
  },
] as const;

export type FanProductTabId = (typeof FAN_PRODUCT_TABS)[number]["id"];
