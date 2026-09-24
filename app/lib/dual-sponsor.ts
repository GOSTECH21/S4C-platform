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

/**
 * The five local logos share the 35% header band equally so one pledge
 * cannot spill into Lead Climate Sponsor space.
 */
export function localHeaderFlex(
  _pledgeGbp?: number,
  _pledges?: number[]
): number {
  return 1;
}
