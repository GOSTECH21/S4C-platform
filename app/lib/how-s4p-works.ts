/** How S4P Works phone steps, assigned to the people who use them. */

export const HOW_S4P_ACCESS_JOIN = {
  src: "/images/home/access-join-phone.png",
  alt: "Access and join Score-For-Planet. Same passion. Cleaner planet. Scan the QR code to join, create an account, or log in.",
  width: 248,
  height: 584,
  title: "Access & Join",
  caption:
    "Join in seconds. A free account gives you access to your club's matches, predictions and climate impact features.",
  points: [
    "Create a free account in seconds",
    "Join by QR, website, app or TV",
    "Open your club's matches, predictions and climate impact features",
  ],
} as const;

export const HOW_S4P_SELECT_MATCH = {
  src: "/images/home/select-match-phone.png",
  alt: "Select match. Choose your club and see their next 10 upcoming league and cup matches.",
  width: 247,
  height: 589,
  title: "Select Match",
} as const;

export const HOW_S4P_SELECT_MATCH_FAN = {
  caption:
    "See the Matches your Team is playing. Kick-off, venue and the climate mission sit on this Match Day phone.",
  points: [
    "Your selected clubs from My Teams appear here",
    "See the next league and cup Matches",
    "Follow kick-off time, venue and the climate mission",
  ],
} as const;

export const HOW_S4P_SELECT_MATCH_SPONSOR = {
  caption:
    "Pick the upcoming Match you want to sponsor. See key details, kick-off time and the climate mission.",
  points: [
    "Choose the Club you wish to sponsor",
    "Pick an upcoming fixture from the calendar",
    "See kick-off time, venue and the climate mission",
  ],
} as const;

export const HOW_S4P_SELECT_MATCH_CLUB = {
  caption:
    "Select the Match you want to get sponsorship for. Your Club's next league and cup fixtures are on this phone.",
  points: [
    "This Club's next Matches are on the phone",
    "Pick the Match Day you want sponsored",
    "Then choose Climate Projects and send invitations",
  ],
} as const;

export const HOW_S4P_P4P = {
  src: "/images/home/plan-your-travel-phone.png",
  alt: "Predict-For Planet. Choose 3 likely events that could happen in this 5-minute slot of the Game.",
  width: 244,
  height: 581,
  title: "Predict-For Planet",
} as const;

export type HowS4pSelectMatchAudience = "fan" | "sponsor" | "club";

export function howS4pSelectMatchCopy(audience: HowS4pSelectMatchAudience) {
  if (audience === "fan") return HOW_S4P_SELECT_MATCH_FAN;
  if (audience === "club") return HOW_S4P_SELECT_MATCH_CLUB;
  return HOW_S4P_SELECT_MATCH_SPONSOR;
}
