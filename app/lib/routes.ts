/** Canonical fan destinations used after login and in supporter nav. */
export const SUPPORTER_CAMPAIGN_PATH = "/dashboard/supporter/my-s4p";
export const SUPPORTER_CAMPAIGN_ALIASES = [
  "/dashboard/supporter/my-s4p",
  "/supporter/dashboard/my-s4p",
];

export function destinationForRole(role: string | null | undefined): string {
  switch (role) {
    case "admin":
      return "/admin/match-centre";
    case "club":
      return "/dashboard/club";
    case "sponsor":
      return "/dashboard/sponsor";
    default:
      return SUPPORTER_CAMPAIGN_PATH;
  }
}
