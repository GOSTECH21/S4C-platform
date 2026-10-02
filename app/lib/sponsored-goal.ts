import { seasonNamesMatch } from "./current-season";
import { fixtureSides, sameNamedFixture } from "./club-fixtures";
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
  const clubAlerts = alerts.filter((alert) =>
    clubNamesMatchForGoal(alert.clubName, clubName)
  );
  const belonging = clubAlerts.map((alert) => ({
    alert,
    belongs: alertBelongsToFixture(alert, matchTitle),
  }));
  const forThisMatch = belonging.filter((row) => row.belongs === true);
  const unknownMatch = belonging.filter((row) => row.belongs !== false);
  const pool = (forThisMatch.length > 0 ? forThisMatch : unknownMatch).map(
    (row) => row.alert
  );
  const latest = pool[0] ?? null;
  if (!latest) return null;
  const brand = String(sponsorName ?? "").trim();
  if (!brand) return latest;
  return { ...latest, brandName: brand };
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
