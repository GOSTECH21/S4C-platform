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
    <aside className="flex h-full flex-col rounded-3xl border border-emerald-400/30 bg-slate-950/85 p-4 shadow-xl backdrop-blur md:p-5">
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
                  ? "bg-emerald-500 text-slate-950"
                  : "text-emerald-200 hover:bg-slate-800"
              }`}
            >
              {tab.shortName}
            </button>
          </span>
        ))}
      </div>
      <p className="mt-3 text-center text-[0.82rem] font-semibold leading-snug text-emerald-300">
        {board.topHeading}
      </p>
      <ol className="mt-3 space-y-1">
        {topRows.length === 0 ? (
          <li className="py-6 text-center text-sm text-slate-400">
            {board.emptyLabel}
          </li>
        ) : (
          topRows.map((row) => (
            <li
              key={`${board.id}-${row.rank}-${row.name}`}
              className="flex items-baseline justify-between gap-3 rounded-lg bg-slate-900/70 px-3 py-1.5"
            >
              <span className="min-w-0 truncate text-base font-bold text-white">
                <span className="mr-2 font-black text-emerald-400">
                  {row.rank}.
                </span>
                {row.name}
              </span>
              <span className="shrink-0 text-sm font-semibold text-amber-300">
                {row.metric}
              </span>
            </li>
          ))
        )}
      </ol>
      <a
        href={`${S4P_IMPACT_TABLES_PATH}?tab=${board.id}`}
        className="mt-4 block text-center text-xs font-bold text-emerald-300 hover:text-white"
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
