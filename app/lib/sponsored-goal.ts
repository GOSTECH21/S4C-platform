import { seasonNamesMatch } from "./current-season";
import {
  applyLeadCommitment,
  normalizeClimateWallet,
  remainingGbp,
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
