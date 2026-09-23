import { LOCAL_SPONSOR_MIN_GBP } from "./local-sponsor";

export const LEAD_CLIMATE_SPONSOR_SHARE = 65;
export const LOCAL_BUSINESS_SPONSOR_SHARE = 35;
export const LEAD_CLIMATE_SPONSOR_LABEL = "Lead Climate Sponsor";
export const LOCAL_BUSINESS_SPONSOR_LABEL = "Local Business Climate Sponsor";

/** Logo size inside the 35% local slot, relative to the highest local pledge. */
export function localSlotScale(
  pledgeGbp: number,
  maxPledgeGbp: number
): number {
  const max = Math.max(LOCAL_SPONSOR_MIN_GBP, Number(maxPledgeGbp) || 0);
  const pledge = Math.max(0, Number(pledgeGbp) || 0);
  if (max <= 0) return 1;
  return Math.min(1, pledge / max);
}

/** Flex weight for a local logo in the Today's Climate Sponsors header. */
export function localHeaderFlex(
  pledgeGbp: number,
  pledges: number[]
): number {
  const total = pledges.reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
  if (total <= 0) return 1;
  return Math.max(0.08, (Number(pledgeGbp) || 0) / total);
}
