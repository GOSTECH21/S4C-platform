"use client";

import { useState } from "react";
import {
  IMPACT_TABLES,
  IMPACT_TABLE_TOP_COUNT,
  impactTablesOrEmpty,
  type ImpactTableBoard,
  type ImpactTableId,
} from "@/app/lib/s4p-impact-tables";
import { S4P_IMPACT_TABLES_PATH } from "@/app/lib/routes";

export default function S4pImpactTables({
  boards,
}: {
  boards?: ImpactTableBoard[];
}) {
  const tables = impactTablesOrEmpty(boards);
  const [active, setActive] = useState<ImpactTableId>("cilt");
  const board = tables.find((table) => table.id === active) ?? tables[0];
  const topRows = board.rows.slice(0, IMPACT_TABLE_TOP_COUNT);

  return (
    <aside className="s4p-navy-panel flex h-fit flex-col self-center rounded-3xl border border-white/10 p-4 shadow-xl md:p-5">
      <h2 className="text-center text-lg font-black tracking-[0.14em] text-white md:text-xl">
        S4P IMPACT TABLES
      </h2>
      <div
        role="tablist"
        aria-label="S4P Impact Tables"
        className="mt-3 flex items-center justify-center gap-1 text-sm font-black"
      >
        {IMPACT_TABLES.map((tab, index) => (
          <span key={tab.id} className="flex items-center gap-1">
            {index > 0 ? (
              <span className="px-1 text-slate-500" aria-hidden>
                |
              </span>
            ) : null}
            <button
              type="button"
              role="tab"
              aria-selected={active === tab.id}
              title={tab.title}
              onClick={() => setActive(tab.id)}
              className={`rounded-md px-2 py-1 ${
                active === tab.id
                  ? "bg-s4p-mark text-slate-950"
                  : "text-s4p-mint hover:bg-slate-800"
              }`}
            >
              {tab.shortName}
            </button>
          </span>
        ))}
      </div>
      <p className="mt-3 text-center text-[0.82rem] font-semibold leading-snug text-s4p-mint">
        {board.topHeading}
      </p>
      <div className="mt-3 overflow-x-auto">
        {topRows.length === 0 ? (
          <p className="py-6 text-center text-sm font-semibold text-s4p-mint">
            {board.emptyLabel}
          </p>
        ) : (
          <table className="w-full min-w-[22rem] text-left">
            <thead className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-slate-400">
              <tr>
                <th className="py-2 pr-2 font-semibold">Pos</th>
                <th className="py-2 pr-2 font-semibold">{board.entityColumn}</th>
                <th className="py-2 pr-2 text-right font-semibold">Impact Moments</th>
                <th className="py-2 pr-2 text-right font-semibold">Climate Funding</th>
                <th className="py-2 text-right font-semibold">Climate Impact</th>
              </tr>
            </thead>
            <tbody>
              {topRows.map((row) => (
                <tr
                  key={`${board.id}-${row.rank}-${row.name}`}
                  className="border-t border-white/10"
                >
                  <td className="py-1.5 pr-2 font-black text-s4p-mark">{row.rank}</td>
                  <td className="max-w-[7rem] truncate py-1.5 pr-2 text-sm font-semibold text-white">
                    {row.name}
                  </td>
                  <td className="py-1.5 pr-2 text-right text-sm font-semibold text-s4p-mint">
                    {row.impactMoments}
                  </td>
                  <td className="py-1.5 pr-2 text-right text-sm font-semibold text-s4p-mint">
                    {row.funding}
                  </td>
                  <td className="py-1.5 text-right text-sm font-semibold text-s4p-mint">
                    {row.climateImpact}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <a
        href={`${S4P_IMPACT_TABLES_PATH}?tab=${board.id}`}
        className="mt-3 block text-center text-xs font-bold text-s4p-mint hover:text-white"
      >
        {board.viewFullLabel}
      </a>
      {board.sponsoredBy ? (
        <p className="mt-3 text-center text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
          Table sponsored by {board.sponsoredBy}
        </p>
      ) : null}
    </aside>
  );
}
