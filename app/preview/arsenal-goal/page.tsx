"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatFundingGbp, formatStatCount } from "@/app/lib/platform-stats";
import { loadPlatformStats } from "@/app/services/platform-stats.service";
import {
  findUpcomingClubFixture,
  runClientSponsoredGoal,
} from "@/app/services/sponsored-goal.service";
import {
  DEFAULT_LEAD_GBP_PER_GOAL,
  DEFAULT_LEAD_GOAL_SPONSOR,
  type SponsoredGoalResult,
} from "@/app/lib/sponsored-goal";
import { formatWalletGbp, remainingGbp, type ClimateWallet } from "@/app/lib/sponsor-wallet";
import { currentSeasonTeamCount } from "@/app/lib/current-season";

export default function ArsenalGoalSimulationPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SponsoredGoalResult | null>(null);
  const [wallets, setWallets] = useState<ClimateWallet[]>([]);
  const [moments, setMoments] = useState<number | null>(null);
  const [fixtureLabel, setFixtureLabel] = useState("Looking up Arsenal's next fixture…");

  useEffect(() => {
    void loadPlatformStats()
      .then((stats) => setMoments(stats.impactMomentsCreated))
      .catch(() => setMoments(null));
    void findUpcomingClubFixture("Arsenal")
      .then((fixture) => {
        if (!fixture) {
          setFixtureLabel("No Arsenal fixture is stored yet.");
          return;
        }
        setFixtureLabel(
          `${fixture.home_club?.name ?? "Arsenal"} v ${fixture.away_club?.name ?? "Opponent"} · ${fixture.fixture_date ?? ""} · ${fixture.home_score ?? 0}-${fixture.away_score ?? 0}`
        );
      })
      .catch(() => setFixtureLabel("Could not load the Arsenal fixture."));
  }, []);

  async function simulate() {
    setBusy(true);
    setError(null);
    try {
      const before = await loadPlatformStats();
      const { scored, wallets: credited } = await runClientSponsoredGoal("Arsenal");
      const after = await loadPlatformStats();
      setMoments(after.impactMomentsCreated);
      setWallets(credited);
      setResult(scored);
      if (after.impactMomentsCreated !== before.impactMomentsCreated + 1) {
        setError(
          `Impact Moments moved from ${before.impactMomentsCreated} to ${after.impactMomentsCreated}. Expected +1.`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not simulate the Arsenal goal.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl space-y-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
          Platform test
        </p>
        <h1 className="text-4xl font-black">Simulate an Arsenal sponsored goal</h1>
        <p className="text-slate-300">
          This posts a Goal-scored event on Arsenal's upcoming fixture, releases
          the agreed {formatWalletGbp(DEFAULT_LEAD_GBP_PER_GOAL)} / Goal from{" "}
          {DEFAULT_LEAD_GOAL_SPONSOR} into the Carbon Wallet, alerts registered
          Arsenal fans, and adds one Impact Moment on the homepage.
        </p>
        <p className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-300">
          Fixture: {fixtureLabel}
        </p>
        <p className="text-sm text-slate-400">
          Sports Teams on the homepage must be exactly {formatStatCount(currentSeasonTeamCount())}{" "}
          current-season clubs, not leftover duplicate rows.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => void simulate()}
          className="rounded-xl bg-emerald-500 px-6 py-3 font-bold text-slate-950 disabled:opacity-50"
        >
          {busy ? "Posting Arsenal goal…" : "Arsenal scored a goal"}
        </button>
        {error && (
          <p className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
            {error}
          </p>
        )}
        {result && (
          <div className="space-y-3 rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-5">
            <p className="text-2xl font-black text-emerald-300">
              GOAL! {result.homeName} {result.homeScore} - {result.awayScore} {result.awayName}
            </p>
            <p>
              {result.brandName} released {formatFundingGbp(result.amountGbp)} into the
              Carbon Wallet.
            </p>
            <p>
              Impact Moments Created: {moments ?? "—"} · Arsenal fans alerted:{" "}
              {result.alertedFans}
            </p>
            {wallets.map((wallet) => (
              <p key={wallet.id}>
                {wallet.brandName} wallet remaining: {formatWalletGbp(remainingGbp(wallet))}{" "}
                ({wallet.goalsScored} goal{wallet.goalsScored === 1 ? "" : "s"})
              </p>
            ))}
            <div className="flex gap-4 pt-2 text-sm font-semibold">
              <Link className="text-emerald-300" href="/">
                Homepage stats bar
              </Link>
              <Link className="text-emerald-300" href="/supporter/dashboard">
                My S4P fan alert
              </Link>
              <Link className="text-emerald-300" href="/admin/notifications">
                Staff notifications
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
