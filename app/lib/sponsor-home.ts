import { isLeadClimateBrand } from "./match-day-branding";
import { readSponsorTier } from "./local-sponsor";
import { SPONSOR_DASHBOARD_PATH, SPONSOR_WALLET_PATH } from "./routes";

/** Lead Climate Sponsors use the S4P Sponsorship Dashboard. Locals use the wallet. */
export function sponsorHomePath(brandName?: string | null): string {
  if (brandName && isLeadClimateBrand(brandName)) return SPONSOR_DASHBOARD_PATH;
  if (readSponsorTier() === "local") return SPONSOR_WALLET_PATH;
  return SPONSOR_DASHBOARD_PATH;
}

export function isLeadSponsorHome(brandName?: string | null): boolean {
  return sponsorHomePath(brandName) === SPONSOR_DASHBOARD_PATH;
}
