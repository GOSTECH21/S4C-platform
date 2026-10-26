/** Paths used by homepage role cards and post-login destinations. */

import {
  SPONSOR_OFFER_SIGN_SECTION_ID,
  SPONSOR_RECEIVE_SECTION_ID,
  SPONSOR_SIGNED_SECTION_ID,
} from "./sponsor-completion-flow";

export {
  SPONSOR_OFFER_SIGN_SECTION_ID,
  SPONSOR_RECEIVE_SECTION_ID,
  SPONSOR_SIGNED_SECTION_ID,
};

export const HOME_PATH = "/";

export const FAN_LOGIN_PATH = "/fan/login";
export const FAN_REGISTER_PATH = "/fan/register";
export const SUPPORTER_LOGIN_PATH = "/supporter/login";

/** Same-origin fan return paths only — used after homepage match-day Continue. */
export function safeFanReturnPath(
  value: string | null | undefined
): string | null {
  const raw = String(value ?? "").trim();
  if (!raw.startsWith("/")) return null;
  if (raw.startsWith("//") || raw.includes("://")) return null;
  const allowed =
    raw.startsWith("/supporter") ||
    raw.startsWith("/dashboard/supporter") ||
    raw.startsWith("/fan/");
  if (!allowed) return null;
  if (raw.startsWith("/fan/login") || raw.startsWith("/supporter/login")) {
    return null;
  }
  return raw;
}

export function fanLoginPath(next?: string | null): string {
  const returnTo = safeFanReturnPath(next);
  if (!returnTo) return FAN_LOGIN_PATH;
  return `${FAN_LOGIN_PATH}?next=${encodeURIComponent(returnTo)}`;
}

/** The URL fans actually land on after login (matches localhost bookmarks). */
export const SUPPORTER_CAMPAIGN_PATH = "/supporter/dashboard";
export const SUPPORTER_PROJECTS_PATH = "/dashboard/supporter/vote";
export const SUPPORTER_TEAMS_PATH = "/dashboard/supporter/preferences";
/** Old fan Sponsor tab; now redirects to My S4P. */
export const SUPPORTER_SPONSOR_PATH = "/dashboard/supporter/sponsors";
/** Climate Project Sponsor wallets and FUND-IT dropdown. */
export const SUPPORTER_CLIMATE_SPONSORS_PATH =
  "/supporter/dashboard/climate-sponsors";

export const SUPPORTER_CAMPAIGN_ALIASES = [
  "/supporter/dashboard",
  "/supporter/dashboard/my-s4p",
  "/dashboard/supporter/my-s4p",
];

export const CLUB_LOGIN_PATH = "/club/login";
export const CLUB_REGISTER_PATH = "/club/register";
export const CLUB_DASHBOARD_PATH = "/club/dashboard";
export const CLUB_SELECT_PROJECTS_PATH = "/club/s4p-climate-projects";
export const CLUB_SELECT_PROJECTS_ALIASES = [
  "/club/s4p-climate-projects",
  "/club/projects/select",
  "/club/dashboard/s4p-climate-projects",
];
export const CLUB_SPONSORS_PATH = "/club/sponsors";
export const CLUB_SPONSOR_LEADERBOARD_PATH = "/club/sponsor";
export const SPONSOR_INVITATIONS_PATH = "/sponsor/invitations";
export const SPONSOR_LOGIN_PATH = "/sponsor/login";
export const SPONSOR_REGISTER_PATH = "/sponsor/register";
export const LOCAL_SPONSOR_REGISTER_PATH = "/sponsor/local/register";
export const LOCAL_SPONSOR_HOME_PATH = "/sponsor/local";
export const SPONSOR_DASHBOARD_PATH = "/sponsor/dashboard";
export const SPONSOR_FROM_MATCH_PATH = "/sponsor/from-match";
export const SPONSOR_CALENDAR_PATH = "/sponsor/calendar";
export const SPONSOR_NEW_SPONSORSHIP_QUERY = "new";
export const SPONSOR_NEW_SPONSORSHIP_LABEL =
  "Click here to initiate a New Sponsorship";
export const SPONSOR_WALLET_PATH = "/sponsor/wallet";
export const SPONSOR_OFFERS_PATH = "/sponsor/offers";

export function sponsorWalletPath(clubName?: string | null): string {
  const club = String(clubName ?? "").trim();
  if (!club) return SPONSOR_WALLET_PATH;
  return `${SPONSOR_WALLET_PATH}?club=${encodeURIComponent(club)}`;
}

/** Same-origin /sponsor… return paths only — used after homepage match clicks. */
export function safeSponsorReturnPath(
  value: string | null | undefined
): string | null {
  const raw = String(value ?? "").trim();
  if (!raw.startsWith("/sponsor")) return null;
  if (raw.startsWith("//") || raw.includes("://")) return null;
  return raw;
}

export function sponsorLoginPath(next?: string | null): string {
  const returnTo = safeSponsorReturnPath(next);
  if (!returnTo) return SPONSOR_LOGIN_PATH;
  return `${SPONSOR_LOGIN_PATH}?next=${encodeURIComponent(returnTo)}`;
}

export function sponsorRegisterPath(next?: string | null): string {
  const returnTo = safeSponsorReturnPath(next);
  if (!returnTo) return SPONSOR_REGISTER_PATH;
  return `${SPONSOR_REGISTER_PATH}?next=${encodeURIComponent(returnTo)}`;
}

export function localSponsorRegisterPath(next?: string | null): string {
  const returnTo = safeSponsorReturnPath(next);
  if (!returnTo) return LOCAL_SPONSOR_REGISTER_PATH;
  return `${LOCAL_SPONSOR_REGISTER_PATH}?next=${encodeURIComponent(returnTo)}`;
}

export const SPONSOR_ANOTHER_TEAM_PROMPT =
  "Want to see or sponsor another team?";
export const SPONSOR_ANOTHER_TEAM_CLICK = "Click here";
export const SPONSOR_CLUB_TYPE_IN_PATH = `${SPONSOR_CALENDAR_PATH}#match-day-lock-in`;

export function sponsorDashboardReceivePath(): string {
  return `${SPONSOR_DASHBOARD_PATH}#${SPONSOR_RECEIVE_SECTION_ID}`;
}

export function sponsorNewSponsorshipPath(): string {
  return `${SPONSOR_DASHBOARD_PATH}?${SPONSOR_NEW_SPONSORSHIP_QUERY}=1`;
}

export function localNewSponsorshipPath(): string {
  return `${SPONSOR_WALLET_PATH}?${SPONSOR_NEW_SPONSORSHIP_QUERY}=1`;
}

export function isNewSponsorshipRequest(
  search: string | null | undefined
): boolean {
  const query = String(search ?? "").replace(/^\?/, "");
  return new URLSearchParams(query).get(SPONSOR_NEW_SPONSORSHIP_QUERY) === "1";
}
export const SPONSOR_OFFER_SIGN_OFF_PATH = "/sponsor/offers/sign-off";
export const SPONSOR_CREATE_CAMPAIGN_PATH = "/sponsor/campaigns/select";

export function sponsorOfferSignOffPath(offerId: string): string {
  return `${SPONSOR_OFFER_SIGN_OFF_PATH}?id=${encodeURIComponent(offerId)}`;
}
export const ADMIN_LOGIN_PATH = "/admin/login";
export const ADMIN_REGISTER_PATH = "/admin/register";
export const ADMIN_PATH = "/admin";
export const PARTNER_LOGIN_PATH = "/partner/login";
export const PARTNER_REGISTER_PATH = "/partner/register";
export const PARTNER_DASHBOARD_PATH = "/partner/dashboard";

export const CLIMATE_SPONSORSHIP_PATH = "/climate-sponsorship";
export const CLIMATE_CREDITS_PATH = "/climate-credits";
export const CLIMATE_IMPACT_LEAGUE_PATH = "/climate-impact-league";
export const S4P_IMPACT_TABLES_PATH = "/s4p-impact-tables";
export const GLOBAL_SCHOOLS_SOLAR_PATH = "/global-schools-solar";
export const DESIGN_PREVIEW_PATH = "/preview/design";

export function isMyS4PPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return SUPPORTER_CAMPAIGN_ALIASES.includes(pathname);
}

export function destinationForRole(role: string | null | undefined): string {
  switch (role) {
    case "admin":
      return ADMIN_PATH;
    case "club":
      return "/club/dashboard";
    case "sponsor":
      return "/sponsor/dashboard";
    case "partner":
      return PARTNER_DASHBOARD_PATH;
    default:
      return SUPPORTER_CAMPAIGN_PATH;
  }
}
