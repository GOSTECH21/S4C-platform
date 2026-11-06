"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MATCHRAV_JOURNEY_STAMP,
  matchravStadiumCoverage,
  readMatchravAnalytics,
  type MatchravAnalytics,
} from "@/app/lib/matchrav-journey";
import { TRAVEL_MODES, formatTravelKgCo2e } from "@/app/lib/match-day-travel";

export function MatchravOpsBoard() {
  const coverage = useMemo(() => matchravStadiumCoverage(), []);
  const [analytics, setAnalytics] = useState<MatchravAnalytics | null>(null);

  useEffect(() => {
    setAnalytics(readMatchravAnalytics());
  }, []);

  const mix = TRAVEL_MODES.map((row) => ({
    ...row,
    count: analytics?.byMode[row.id] ?? 0,
  }));
  const clubs = Object.entries(analytics?.clubs ?? {}).sort(
    (left, right) => right[1] - left[1]
  );

  return (
    <section data-matchrav-ops={MATCHRAV_JOURNEY_STAMP} className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          Operations
        </p>
        <h1 className="mt-2 text-4xl font-black">Matchrav analytics</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Basic counts from journeys fans choose to share anonymously. Stadium
          coverage is the public ground list used when a supported club is
          selected.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Known stadiums" value={String(coverage.stadiums)} />
        <Stat label="Planned journeys" value={String(analytics?.planned ?? 0)} />
        <Stat
          label="Confirmed travel"
          value={String(analytics?.confirmed ?? 0)}
        />
        <Stat
          label="kg saved vs solo car"
          value={formatTravelKgCo2e(analytics?.savedKg ?? 0)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-emerald-400/25 bg-slate-900/80 p-5">
          <h2 className="text-xl font-black">Travel mode mix</h2>
          <ul className="mt-4 space-y-2">
            {mix.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between rounded-xl border border-emerald-400/20 px-4 py-3"
              >
                <span className="text-sm font-black">{row.label}</span>
                <span className="text-lg font-black">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-emerald-400/25 bg-slate-900/80 p-5">
          <h2 className="text-xl font-black">Clubs with shared journeys</h2>
          {clubs.length === 0 ? (
            <p className="mt-4 text-sm font-medium text-slate-300">
              No anonymised journeys have been shared yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {clubs.slice(0, 12).map(([name, count]) => (
                <li
                  key={name}
                  className="flex items-center justify-between rounded-xl border border-emerald-400/20 px-4 py-3"
                >
                  <span className="text-sm font-black">{name}</span>
                  <span className="text-lg font-black">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-emerald-400/25 bg-slate-900/80 p-5">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-300">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}
