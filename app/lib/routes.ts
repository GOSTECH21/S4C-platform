/** Paths used by the homepage role cards and post-login destinations. */
export const HOME_PATH = "/";

export const FAN_LOGIN_PATH = "/fan/login";
export const FAN_REGISTER_PATH = "/fan/register";
export const SUPPORTER_CAMPAIGN_PATH = "/dashboard/supporter/my-s4p";
export const SUPPORTER_CAMPAIGN_ALIASES = [
  "/dashboard/supporter/my-s4p",
  "/supporter/dashboard/my-s4p",
];

export const CLUB_LOGIN_PATH = "/club/login";
export const CLUB_REGISTER_PATH = "/club/register";
export const CLUB_DASHBOARD_PATH = "/club/dashboard";

export const SPONSOR_LOGIN_PATH = "/sponsor/login";
export const SPONSOR_REGISTER_PATH = "/sponsor/register";
export const SPONSOR_DASHBOARD_PATH = "/sponsor/dashboard";

export const PARTNER_LOGIN_PATH = "/partner/login";
export const PARTNER_REGISTER_PATH = "/partner/register";
export const PARTNER_DASHBOARD_PATH = "/partner/dashboard";

export function destinationForRole(role: string | null | undefined): string {
  switch (role) {
    case "admin":
      return "/admin/match-centre";
    case "club":
      return CLUB_DASHBOARD_PATH;
    case "sponsor":
      return SPONSOR_DASHBOARD_PATH;
    case "partner":
      return PARTNER_DASHBOARD_PATH;
    default:
      return SUPPORTER_CAMPAIGN_PATH;
  }
}
