/** Paths used by homepage role cards and post-login destinations. */

export const HOME_PATH = "/";

export const FAN_LOGIN_PATH = "/fan/login";
export const FAN_REGISTER_PATH = "/fan/register";
export const SUPPORTER_LOGIN_PATH = "/supporter/login";

/** The URL fans actually land on after login (matches localhost bookmarks). */
export const SUPPORTER_CAMPAIGN_PATH = "/supporter/dashboard";
export const SUPPORTER_PROJECTS_PATH = "/dashboard/supporter/vote";

export const SUPPORTER_CAMPAIGN_ALIASES = [
  "/supporter/dashboard",
  "/supporter/dashboard/my-s4p",
  "/dashboard/supporter/my-s4p",
];

export const CLUB_LOGIN_PATH = "/club/login";
export const SPONSOR_LOGIN_PATH = "/sponsor/login";

export function isMyS4PPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return SUPPORTER_CAMPAIGN_ALIASES.includes(pathname);
}

export function destinationForRole(role: string | null | undefined): string {
  switch (role) {
    case "admin":
      return "/admin/match-centre";
    case "club":
      return "/club/dashboard";
    case "sponsor":
      return "/sponsor/dashboard";
    default:
      return SUPPORTER_CAMPAIGN_PATH;
  }
}
