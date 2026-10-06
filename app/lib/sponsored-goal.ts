import { seasonNamesMatch } from "./current-season";
import { fixtureSides, sameNamedFixture } from "./club-fixtures";
import {
  applyLeadCommitment,
  committedGbp,
  remainingGbp,
  normalizeClimateWallet,
  type ClimateWallet,
} from "./sponsor-wallet";

export const SPONSORED_GOAL_EVENT = "s4p-sponsored-goal";
export const FAN_GOAL_ALERTS_STORAGE = "s4p.fan.goalAlerts";
export const DEFAULT_LEAD_GOAL_SPONSOR = "American Express";
export const DEFAULT_LEAD_GBP_PER_GOAL = 3000;
export const DEFAULT_LEAD_COMMITMENT_GBP = 3000;

export type FanGoalAlert = {
  clubName: string;
  opponentName: string;
  fixtureDate: string;
  scoreline: string;
  brandName: string;
  amountGbp: number;
  at: string;
};

export type SponsoredGoalResult = {
  fixtureId: string;
  clubId: string;
  clubName: string;
  opponentName: string;
  fixtureDate: string;
  homeName: string;
  awayName: string;
  homeScore: number;
  awayScore: number;
  scoreEventId: string;
  brandName: string;
  amountGbp: number;
  alertedFans: number;
};

export function clubNamesMatchForGoal(clubName: string, otherName: string) {
  return seasonNamesMatch(clubName, otherName);
}

export function isGenericLeadSponsorName(name: string | null | undefined): boolean {
  const key = String(name ?? "").trim().toLowerCase();
  return key === "lead climate sponsor" || key === "goal sponsor";
}

/** Amount fans see on that sponsor's Carbon Wallet (committed cash, not a leftover £3,000 default). */
export function goalStatementAmountGbp(wallet: ClimateWallet): number {
  const committed = committedGbp(wallet);
  if (committed > 0) return committed;
  const remaining = remainingGbp(wallet);
  if (remaining > 0) return remaining;
  return 0;
}

export function sponsorNamesMatch(
  left?: string | null,
  right?: string | null
): boolean {
  const a = String(left ?? "").trim().toLowerCase();
  const b = String(right ?? "").trim().toLowerCase();
  if (!a || !b) return false;
  return a === b;
}

export function leadWalletForGoalStatement(
  wallets: ClimateWallet[],
  clubName: string,
  brandName?: string | null
): ClimateWallet | null {
  const leads = wallets.filter(
    (wallet) =>
      wallet.kind === "lead" && clubNamesMatchForGoal(wallet.clubName, clubName)
  );
  const brand = String(brandName ?? "").trim();
  if (brand && !isGenericLeadSponsorName(brand)) {
    return (
      leads.find((wallet) => sponsorNamesMatch(wallet.brandName, brand)) ?? null
    );
  }
  if (isGenericLeadSponsorName(brand) && leads.length === 1) {
    return leads[0];
  }
  return null;
}

export function withSponsorWalletOnGoalAlert(
  alert: FanGoalAlert,
  wallet: ClimateWallet | null,
  displayedRemainingGbp?: number | null
): FanGoalAlert {
  const walletBrand = wallet?.brandName?.trim() ?? "";
  const canUseWallet =
    Boolean(wallet) &&
    Boolean(walletBrand) &&
    !isGenericLeadSponsorName(walletBrand) &&
    (!alert.brandName ||
      isGenericLeadSponsorName(alert.brandName) ||
      sponsorNamesMatch(walletBrand, alert.brandName));
  const brand = canUseWallet ? walletBrand : alert.brandName;
  const fromWallet = canUseWallet && wallet ? goalStatementAmountGbp(wallet) : 0;
  const fromDisplay = Number(displayedRemainingGbp) || 0;
  const amountGbp =
    fromWallet > 0 ? fromWallet : fromDisplay > 0 ? fromDisplay : alert.amountGbp;
  return { ...alert, brandName: brand, amountGbp };
}

export function creditLeadWalletForGoal(wallet: ClimateWallet): ClimateWallet {
  if (wallet.kind !== "lead") return wallet;
  const current = normalizeClimateWallet(wallet);
  return applyLeadCommitment(current, {
    goalsScored: current.goalsScored + 1,
  });
}

export function leadWalletIncreaseGbp(wallet: ClimateWallet) {
  const before = remainingGbp(wallet);
  const after = remainingGbp(creditLeadWalletForGoal(wallet));
  return Math.max(0, after - before);
}

export function listFanGoalAlerts(): FanGoalAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FAN_GOAL_ALERTS_STORAGE);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FanGoalAlert[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordFanGoalAlert(alert: FanGoalAlert): FanGoalAlert {
  if (typeof window !== "undefined") {
    const next = [alert, ...listFanGoalAlerts()].slice(0, 20);
    window.localStorage.setItem(FAN_GOAL_ALERTS_STORAGE, JSON.stringify(next));
    window.dispatchEvent(
      new CustomEvent(SPONSORED_GOAL_EVENT, { detail: alert })
    );
  }
  return alert;
}

export function alertsForClub(clubName: string): FanGoalAlert[] {
  return listFanGoalAlerts().filter((alert) =>
    clubNamesMatchForGoal(alert.clubName, clubName)
  );
}

export function brandNameFromGoalMessage(message: string): string | null {
  const match = String(message ?? "").match(
    /\.\s*([^.]+?) has released £/
  );
  const brand = match?.[1]?.trim() ?? "";
  return brand || null;
}

/** true = this fixture, false = a different named fixture, null = opponent unknown. */
export function alertBelongsToFixture(
  alert: FanGoalAlert,
  matchTitle?: string | null
): boolean | null {
  const fixture = String(matchTitle ?? "")
    .replace(/\s+climate campaign$/i, "")
    .trim();
  if (!fixture) return null;
  if (
    sameNamedFixture(alert.scoreline, fixture) ||
    (alert.opponentName &&
      sameNamedFixture(`${alert.clubName} v ${alert.opponentName}`, fixture))
  ) {
    return true;
  }
  const scoreSides = fixtureSides(alert.scoreline);
  const matchSides = fixtureSides(fixture);
  if (scoreSides && matchSides) return sameNamedFixture(alert.scoreline, fixture);
  const opponent = String(alert.opponentName ?? "").trim();
  if (opponent && matchSides) {
    if (
      seasonNamesMatch(opponent, matchSides[0]) ||
      seasonNamesMatch(opponent, matchSides[1])
    ) {
      return true;
    }
  }
  return null;
}

export function goalAlertMatchesLeadSponsor(
  alert: FanGoalAlert,
  sponsorName?: string | null
): boolean {
  const preferred = String(sponsorName ?? "").trim();
  if (!preferred || isGenericLeadSponsorName(preferred)) return false;
  const named = String(alert.brandName ?? "").trim();
  if (!named || isGenericLeadSponsorName(named)) return true;
  return sponsorNamesMatch(named, preferred);
}

/** Latest goal for this club's current match, using that match's Lead sponsor. */
export function goalAlertForCampaign({
  alerts,
  clubName,
  matchTitle,
  sponsorName,
}: {
  alerts: FanGoalAlert[];
  clubName: string;
  matchTitle?: string | null;
  sponsorName?: string | null;
}): FanGoalAlert | null {
  const preferred = String(sponsorName ?? "").trim();
  if (!preferred || isGenericLeadSponsorName(preferred)) return null;
  const clubAlerts = alerts.filter((alert) =>
    clubNamesMatchForGoal(alert.clubName, clubName)
  );
  const belonging = clubAlerts.map((alert) => ({
    alert,
    belongs: alertBelongsToFixture(alert, matchTitle),
  }));
  const forThisMatch = belonging.filter((row) => row.belongs === true);
  const unknownMatch = belonging.filter((row) => row.belongs !== false);
  const pool = (forThisMatch.length > 0 ? forThisMatch : unknownMatch)
    .map((row) => row.alert)
    .filter((alert) => goalAlertMatchesLeadSponsor(alert, preferred));
  const latest = pool[0] ?? null;
  if (!latest) return null;
  return { ...latest, brandName: preferred };
}

/** Hide leftover GOAL copy unless this club still has that Lead Climate Sponsor. */
export function resolveVisibleFanGoalAlert({
  alerts,
  clubName,
  matchTitle,
  sponsorName,
  lockBrand,
  clubLeadBrands = [],
  wallets = [],
  sponsorRemainingGbp,
}: {
  alerts: FanGoalAlert[];
  clubName: string;
  matchTitle?: string | null;
  sponsorName?: string | null;
  lockBrand?: string | null;
  clubLeadBrands?: string[];
  wallets?: ClimateWallet[];
  sponsorRemainingGbp?: number | null;
}): FanGoalAlert | null {
  const preferredBrand = [
    lockBrand,
    sponsorName,
    ...(matchTitle ? [] : clubLeadBrands),
  ].find((name) => name && !isGenericLeadSponsorName(name));
  if (!preferredBrand) return null;
  const wallet = leadWalletForGoalStatement(wallets, clubName, preferredBrand);
  const alert = goalAlertForCampaign({
    alerts,
    clubName,
    matchTitle,
    sponsorName: preferredBrand,
  });
  if (!alert) return null;
  return withSponsorWalletOnGoalAlert(alert, wallet, sponsorRemainingGbp);
}

export function goalScoreline(result: Pick<
  SponsoredGoalResult,
  "homeName" | "homeScore" | "awayName" | "awayScore"
>) {
  return `${result.homeName} ${result.homeScore} - ${result.awayScore} ${result.awayName}`;
}

export function mergeFanGoalAlerts(
  ...groups: FanGoalAlert[][]
): FanGoalAlert[] {
  const seen = new Set<string>();
  const merged: FanGoalAlert[] = [];
  for (const group of groups) {
    for (const alert of group) {
      const key = `${alert.at}|${alert.scoreline}|${alert.clubName}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(alert);
    }
  }
  return merged.sort((left, right) => right.at.localeCompare(left.at));
}
