"use client";

import { useEffect, useMemo, useState } from "react";
import {
  alertsForClub,
  goalAlertForCampaign,
  mergeFanGoalAlerts,
  SPONSORED_GOAL_EVENT,
  type FanGoalAlert,
} from "@/app/lib/sponsored-goal";
import { leadSponsorBrandForFixture } from "@/app/lib/climate-sponsors";
import { formatFundingGbp } from "@/app/lib/platform-stats";
import { loadLatestGoalAlerts } from "@/app/services/sponsored-goal.service";
import {
  listGoalNetworks,
  listMatchDayLocks,
} from "@/app/services/climate-sponsors.service";
import { readClimateWallet } from "@/app/services/sponsor-wallet.service";

export function FanGoalAlertBanner({
  clubNames,
  matchTitle,
  sponsorName,
}: {
  clubNames: string[];
  matchTitle?: string | null;
  sponsorName?: string | null;
}) {
  const [alerts, setAlerts] = useState<FanGoalAlert[]>([]);
  const clubKey = clubNames.slice().sort().join("|");

  useEffect(() => {
    const names = clubKey ? clubKey.split("|") : [];
    function refreshLocal() {
      setAlerts(names.flatMap((name) => alertsForClub(name)));
    }
    refreshLocal();
    void loadLatestGoalAlerts(names)
      .then((server) => {
        setAlerts(
          mergeFanGoalAlerts(
            names.flatMap((name) => alertsForClub(name)),
            server
          )
        );
      })
      .catch(() => null);
    window.addEventListener(SPONSORED_GOAL_EVENT, refreshLocal);
    window.addEventListener("storage", refreshLocal);
    return () => {
      window.removeEventListener(SPONSORED_GOAL_EVENT, refreshLocal);
      window.removeEventListener("storage", refreshLocal);
    };
  }, [clubKey]);

  const latest = useMemo(() => {
    const names = clubKey ? clubKey.split("|") : [];
    const clubName = names[0] ?? "";
    const lockBrand = leadSponsorBrandForFixture({
      clubName,
      fixtureName: matchTitle,
      locks: listMatchDayLocks(),
      networks: listGoalNetworks(),
    });
    const brand = lockBrand || String(sponsorName ?? "").trim() || null;
    const alert = goalAlertForCampaign({
      alerts,
      clubName,
      matchTitle,
      sponsorName: brand,
    });
    if (!alert) return null;
    if (matchTitle && !brand) return null;
    if (!brand) return alert;
    const wallet = readClimateWallet(alert.clubName, brand);
    const amountGbp =
      Number(wallet?.gbpPerGoal) > 0 ? Number(wallet?.gbpPerGoal) : alert.amountGbp;
    return { ...alert, brandName: brand, amountGbp };
  }, [alerts, clubKey, matchTitle, sponsorName]);

  if (!latest) return null;

  return (
    <div className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-4 text-center text-emerald-200">
      <p className="text-lg font-black">GOAL! {latest.scoreline}</p>
      <p className="mt-1 text-sm">
        {latest.brandName} released {formatFundingGbp(latest.amountGbp)} into the
        Carbon Wallet for {latest.clubName} fans.
      </p>
    </div>
  );
}
