"use client";

import { FanTabBar } from "@/app/dashboard/supporter/components/FanTabBar";
import { SUPPORTER_CIFT_PATH } from "@/app/lib/routes";
import { impactTableMeta, type ImpactTableRow } from "@/app/lib/s4p-impact-tables";

const meta = impactTableMeta("cift");

const ROWS: ImpactTableRow[] = [
  {
    rank: 1,
    name: "Alex M.",
    metric: "£1.00",
    impactMoments: "5",
    funding: "£1.00",
    climateImpact: "—",
    id: "fan-1",
  },
  {
    rank: 2,
    name: "Priya S.",
    metric: "£0.80",
    impactMoments: "4",
    funding: "£0.80",
    climateImpact: "—",
    id: "fan-2",
  },
  {
    rank: 3,
    name: "You",
    metric: "£0.60",
    impactMoments: "3",
    funding: "£0.60",
    climateImpact: "—",
    id: "self",
  },
  {
    rank: 4,
    name: "Jordan K.",
    metric: "£0.40",
    impactMoments: "2",
    funding: "£0.40",
    climateImpact: "—",
    id: "fan-4",
  },
];

export default function CiftPreviewPage() {
  const self = ROWS.find((row) => row.id === "self")!;
  return (
    <main className="min-h-screen p-4 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="sticky top-0 z-30 mb-10 flex flex-col gap-4 border-b border-slate-800 bg-slate-950/95 px-1 py-4">
          <p className="text-2xl font-black tracking-tight text-green-400">S4P</p>
          <FanTabBar pathname={SUPPORTER_CIFT_PATH} onLogout={() => {}} />
        </header>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          CIFT
        </p>
        <h1 className="mt-2 text-4xl font-black">{meta.title}</h1>
        <p className="mt-3 max-w-2xl text-slate-300">{meta.description}</p>
        <div
          data-cift-self
          className="mt-8 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-5"
        >
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
            Your position
          </p>
          <p className="mt-2 text-3xl font-black">
            You are #{self.rank} on the Climate Impact Fans Table
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-300">
            {self.impactMoments} impact moments · {self.funding} climate funding
          </p>
        </div>
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left">
            <thead className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-400">
              <tr>
                <th className="px-4 py-3">Pos</th>
                <th className="px-4 py-3">Fan</th>
                <th className="px-4 py-3 text-right">Impact Moments</th>
                <th className="px-4 py-3 text-right">Climate Funding</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => {
                const mine = row.id === "self";
                return (
                  <tr
                    key={row.id}
                    className={`border-t border-slate-800 ${
                      mine ? "bg-s4p-mark/20" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-black text-s4p-mark">
                      #{row.rank}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">
                      {row.name}
                      {mine ? " · you" : ""}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold">
                      {row.impactMoments}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold">
                      {row.funding}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
