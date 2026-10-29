"use client";

import { useEffect, useMemo, useState } from "react";
import {
  findImpactRow,
  impactTableMeta,
  type ImpactTableRow,
} from "@/app/lib/s4p-impact-tables";
import { FAN_LOGIN_PATH } from "@/app/lib/routes";
import { getOrCreateSupporter } from "@/app/services/votes.service";
import { loadFanCiftRows } from "@/app/services/s4p-impact-tables.service";

const meta = impactTableMeta("cift");

export default function FanCiftTable() {
  const [rows, setRows] = useState<ImpactTableRow[]>([]);
  const [supporterId, setSupporterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const supporter = await getOrCreateSupporter();
        if (!supporter) {
          window.location.href = FAN_LOGIN_PATH;
          return;
        }
        setSupporterId(supporter.id);
        setRows(await loadFanCiftRows());
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not load the Climate Impact Fans Table."
        );
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const self = useMemo(
    () => findImpactRow(rows, supporterId),
    [rows, supporterId]
  );

  return (
    <section className="px-6 pb-16 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          CIFT
        </p>
        <h1 className="mt-2 text-4xl font-black">{meta.title}</h1>
        <p className="mt-3 max-w-2xl text-slate-300">{meta.description}</p>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        ) : null}

        {loading ? (
          <p className="mt-10 text-slate-400">Loading CIFT...</p>
        ) : (
          <>
            <div
              data-cift-self
              className="mt-8 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-5"
            >
              {self ? (
                <>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                    Your position
                  </p>
                  <p className="mt-2 text-3xl font-black">
                    You are #{self.rank} on the Climate Impact Fans Table
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-300">
                    {self.impactMoments} impact moments · {self.funding} climate
                    funding
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                    Your position
                  </p>
                  <p className="mt-2 text-2xl font-black">
                    You are not on the CIFT yet
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-300">
                    FUND-IT from Climate Projects to earn your place on the
                    table.
                  </p>
                </>
              )}
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
              {rows.length === 0 ? (
                <p className="p-6 text-sm font-semibold text-slate-300">
                  {meta.emptyLabel}
                </p>
              ) : (
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
                    {rows.map((row) => {
                      const mine = row.id === supporterId;
                      return (
                        <tr
                          key={`${row.rank}-${row.id ?? row.name}`}
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
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
