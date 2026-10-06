"use client";

import { useEffect, useMemo, useState } from "react";
import {
  alertsForClub,
  mergeFanGoalAlerts,
  resolveVisibleFanGoalAlert,
  SPONSORED_GOAL_EVENT,
  type FanGoalAlert,
} from "@/app/lib/sponsored-goal";
import { leadSponsorBrandForFixture } from "@/app/lib/climate-sponsors";
import { formatFundingGbp } from "@/app/lib/platform-stats";
import { loadLatestGoalAlerts } from "@/app/services/sponsored-goal.service";
import {
  leadClimateSponsorsForClub,
  listGoalNetworks,
  listMatchDayLocks,
} from "@/app/services/climate-sponsors.service";
import { listClimateWalletsForClub } from "@/app/services/sponsor-wallet.service";

export function FanGoalAlertBanner({
  clubNames,
  matchTitle,
  sponsorName,
  sponsorRemainingGbp,
}: {
  clubNames: string[];
  matchTitle?: string | null;
  sponsorName?: string | null;
  sponsorRemainingGbp?: number | null;
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
    return resolveVisibleFanGoalAlert({
      alerts,
      clubName,
      matchTitle,
      sponsorName,
      lockBrand,
      clubLeadBrands: leadClimateSponsorsForClub(clubName).map(
        (row) => row.brandName
      ),
      wallets: names.flatMap((name) => listClimateWalletsForClub(name)),
      sponsorRemainingGbp,
    });
  }, [alerts, clubKey, matchTitle, sponsorName, sponsorRemainingGbp]);

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
