"use client";

import { BrandMark } from "@/app/components/club/BrandMark";
import {
  LOCAL_MY_S4P_COPY,
  LOCAL_MY_S4P_HEADING,
  type LocalMyS4pSnapshot,
} from "@/app/lib/local-sponsor-mys4p";
import { formatStatCount } from "@/app/lib/platform-stats";

function barWidth(value: number, max: number): string {
  if (max <= 0) return "0%";
  return `${Math.max(4, Math.round((value / max) * 100))}%`;
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <li className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
        {value}
      </p>
    </li>
  );
}

export function LocalSponsorMyS4p({
  brand,
  logoUrl,
  snapshot,
}: {
  brand: string;
  logoUrl: string | null;
  snapshot: LocalMyS4pSnapshot;
}) {
  const spendMax = Math.max(
    snapshot.spentGbp,
    ...snapshot.projects.map((row) => row.spentGbp),
    1
  );
  const fanMax = Math.max(
    snapshot.fansEngaged,
    ...snapshot.projects.map((row) => row.fans),
    1
  );
  const walletTotal = Math.max(
    snapshot.remainingGbp + snapshot.takenGbp,
    1
  );
  const takenPct =
    walletTotal > 0 ? (snapshot.takenGbp / walletTotal) * 100 : 0;

  return (
    <div
      data-testid="local-mys4p"
      data-local-mys4p="local-mys4p-v1"
      className="min-w-0 space-y-10"
    >
      <div className="flex items-center gap-4">
        <BrandMark name={brand} logoUrl={logoUrl} large />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
            Local Business Climate Sponsor
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">
            {LOCAL_MY_S4P_HEADING}
          </h1>
        </div>
      </div>
      <p className="max-w-3xl text-slate-300">{LOCAL_MY_S4P_COPY}</p>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Spent" value={snapshot.spentLabel} />
        <StatCard label="Taken by Fans" value={snapshot.takenLabel} />
        <StatCard
          label="Fans who saw your brand"
          value={formatStatCount(snapshot.brandSightings)}
        />
        <StatCard
          label="Still in Carbon Wallet"
          value={snapshot.remainingLabel}
        />
      </ul>

      <section className="rounded-3xl border border-green-500/30 bg-slate-900 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
          Carbon Wallet
        </p>
        <h2 className="mt-2 text-2xl font-black">Spend vs Fan takes</h2>
        <p className="mt-2 text-sm text-slate-400">
          Fans who press FUND-IT take money from your Carbon Wallet and see
          your brand on the Climate Project they choose.
        </p>
        <div className="mt-5 flex h-4 overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full bg-s4p-mark"
            style={{
              width: `${takenPct}%`,
              minWidth: snapshot.takenGbp > 0 ? 8 : 0,
            }}
          />
          <div className="h-full flex-1 bg-s4p-mark/30" />
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold text-slate-700">
          <p>
            <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-s4p-mark" />
            Taken by Fans {snapshot.takenLabel}
          </p>
          <p>
            <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-s4p-mark/40" />
            Remaining {snapshot.remainingLabel}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-700 bg-slate-900 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
          Climate Projects
        </p>
        <h2 className="mt-2 text-2xl font-black">Projects you have sponsored</h2>
        {snapshot.projects.length === 0 ? (
          <p className="mt-4 text-slate-300">
            No sponsored Climate Project is stored for this login yet. Sign a
            Match Day invitation or start a new sponsorship, then Fans can
            take from your Carbon Wallet.
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {snapshot.projects.map((row) => (
              <li
                key={row.key}
                className="rounded-2xl border border-slate-700 bg-slate-950 p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-400">
                  {row.clubName}
                </p>
                <p className="mt-1 text-lg font-bold">{row.name}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {row.spentLabel} spent · {row.takenLabel} taken ·{" "}
                  {formatStatCount(row.fans)} Fans
                </p>
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Spend
                    </p>
                    <div className="mt-1 h-3 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-s4p-mark"
                        style={{ width: barWidth(row.spentGbp, spendMax) }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Fans who saw your brand
                    </p>
                    <div className="mt-1 h-3 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-green-400"
                        style={{ width: barWidth(row.fans, fanMax) }}
                      />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
