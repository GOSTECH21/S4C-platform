/** Matchrav — intelligent supporter travel planning. Full product surface comes later. */

import { FAN_REGISTER_PATH } from "./routes";

export const MATCHRAV_STAMP = "matchrav-fan-tabs-v1";
export const MATCHRAV_MOBILE_STAMP = "matchrav-mobile-first-v1";
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

/** Join S4P to use Matchrav until the dedicated travel surface ships. */
export const MATCHRAV_EXPLORE_HREF = FAN_REGISTER_PATH;

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
