"use client";

import { useMemo, useState } from "react";
import {
  PHILANTHROPIST_PST_COPY,
  PHILANTHROPIST_PST_SHORT,
  PHILANTHROPIST_PST_TITLE,
  philanthropistDisplayName,
  type PhilanthropistRecord,
} from "@/app/lib/philanthropist";
import {
  PST_ALL_AREA,
  PST_CATALOG,
  countryForClub,
  mergePstCatalog,
  pstAreas,
  pstOwnRow,
  pstPositionCopy,
  pstRowsForArea,
} from "@/app/lib/pst";
import { PHILANTHROPIST_PST_ID } from "@/app/lib/routes";

export function PhilanthropistSponsorsTable({
  record,
}: {
  record: PhilanthropistRecord;
}) {
  const ownName = philanthropistDisplayName(record);
  const ownCountry = countryForClub(record.clubName);
  const catalog = useMemo(
    () => mergePstCatalog([record], PST_CATALOG),
    [record]
  );
  const areas = useMemo(() => [PST_ALL_AREA, ...pstAreas(catalog)], [catalog]);
  const [area, setArea] = useState(
    areas.includes(ownCountry) ? ownCountry : PST_ALL_AREA
  );
  const rows = useMemo(
    () => pstRowsForArea({ area, ownName, catalog }),
    [area, ownName, catalog]
  );
  const own = pstOwnRow(rows, ownName);

  return (
    <section
      id={PHILANTHROPIST_PST_ID}
      data-testid="philanthropist-pst"
      data-pst="philanthropist-admin-pst-v1"
      className="mt-10 scroll-mt-6 rounded-3xl border border-slate-700 bg-slate-900 p-6 sm:p-8"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
        {PHILANTHROPIST_PST_SHORT}
      </p>
      <h2 className="mt-2 text-3xl font-black">{PHILANTHROPIST_PST_TITLE}</h2>
      <p className="mt-3 max-w-3xl text-slate-300">{PHILANTHROPIST_PST_COPY}</p>

      <div
        data-pst-position
        className="mt-6 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-5"
      >
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
          Your position
        </p>
        <p className="mt-2 text-2xl font-black sm:text-3xl">
          {pstPositionCopy(own, area)}
        </p>
        {own ? (
          <p className="mt-2 text-sm font-semibold text-slate-300">
            {own.funding} into {own.clubs.join(", ") || "your club"}
          </p>
        ) : null}
      </div>

      <div
        role="tablist"
        aria-label="PST geographical area"
        className="mt-6 flex flex-wrap gap-2"
      >
        {areas.map((name) => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={area === name}
            data-pst-area={name}
            onClick={() => setArea(name)}
            className={`rounded-full px-3 py-1.5 text-sm font-bold ${
              area === name
                ? "bg-s4p-mark text-slate-950"
                : "border border-slate-700 text-s4p-mint hover:bg-slate-800"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <ul className="mt-6 space-y-3 md:hidden">
        {rows.map((row) => (
          <li
            key={`${row.rank}-${row.organisation}`}
            data-pst-row={row.organisation}
            className={`rounded-2xl border px-4 py-3 ${
              row.highlighted
                ? "border-green-400 bg-green-500/20"
                : "border-slate-700 bg-slate-950"
            }`}
          >
            <p className="text-xs font-black uppercase tracking-[0.14em] text-green-300">
              #{row.rank} · {row.country}
              {row.highlighted ? " · You" : ""}
            </p>
            <p className="mt-1 font-black">{row.organisation}</p>
            <p className="mt-1 text-sm font-semibold text-slate-300">
              {row.clubs.join(", ")}
            </p>
            <p className="mt-1 text-sm font-semibold text-green-300">
              {row.funding}
            </p>
          </li>
        ))}
      </ul>
      <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-slate-700 md:block">
        <table className="w-full min-w-[32rem] text-left">
          <thead className="bg-slate-950 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Pos</th>
              <th className="px-4 py-3 font-semibold">Philanthropist</th>
              <th className="px-4 py-3 font-semibold">Area</th>
              <th className="px-4 py-3 font-semibold">Clubs</th>
              <th className="px-4 py-3 text-right font-semibold">Climate Funding</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${row.rank}-${row.organisation}`}
                data-pst-row={row.organisation}
                className={
                  row.highlighted
                    ? "bg-green-500/20 ring-1 ring-inset ring-green-400"
                    : "border-t border-slate-800"
                }
              >
                <td className="px-4 py-3.5 font-black text-green-400">{row.rank}</td>
                <td className="px-4 py-3.5 font-semibold">
                  {row.organisation}
                  {row.highlighted ? (
                    <span className="ml-2 text-xs font-semibold uppercase tracking-[0.16em] text-green-300">
                      You
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3.5 font-semibold text-slate-300">
                  {row.country}
                </td>
                <td className="px-4 py-3.5 font-semibold text-slate-300">
                  {row.clubs.join(", ")}
                </td>
                <td className="px-4 py-3.5 text-right font-semibold text-green-300">
                  {row.funding}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
