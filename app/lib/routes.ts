/** Paths used by homepage role cards and post-login destinations. */

export const HOME_PATH = "/";

export const FAN_LOGIN_PATH = "/fan/login";
export const FAN_REGISTER_PATH = "/fan/register";
export const SUPPORTER_LOGIN_PATH = "/supporter/login";

/** The URL fans actually land on after login (matches localhost bookmarks). */
export const SUPPORTER_CAMPAIGN_PATH = "/supporter/dashboard";
export const SUPPORTER_PROJECTS_PATH = "/dashboard/supporter/vote";
export const SUPPORTER_TEAMS_PATH = "/dashboard/supporter/preferences";

export const SUPPORTER_CAMPAIGN_ALIASES = [
  "/supporter/dashboard",
  "/supporter/dashboard/my-s4p",
  "/dashboard/supporter/my-s4p",
];

export const CLUB_LOGIN_PATH = "/club/login";
export const CLUB_REGISTER_PATH = "/club/register";
export const CLUB_DASHBOARD_PATH = "/club/dashboard";
export const CLUB_SELECT_PROJECTS_PATH = "/club/projects/select";
export const CLUB_SPONSORS_PATH = "/club/sponsors";
export const SPONSOR_LOGIN_PATH = "/sponsor/login";
export const SPONSOR_REGISTER_PATH = "/sponsor/register";
export const SPONSOR_DASHBOARD_PATH = "/sponsor/dashboard";
export const SPONSOR_OFFERS_PATH = "/sponsor/offers";
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
export const GLOBAL_SCHOOLS_SOLAR_PATH = "/global-schools-solar";

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
