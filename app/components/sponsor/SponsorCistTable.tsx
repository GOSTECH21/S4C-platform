"use client";

import { useEffect, useState } from "react";
import {
  cistRowsForSponsor,
} from "@/app/lib/sponsor-signed-home";
import { impactTableMeta } from "@/app/lib/s4p-impact-tables";
import { loadSponsorLeaderboard } from "@/app/services/sponsor-leaderboard.service";

export function SponsorCistTable({
  brandName,
  ownFundingGbp,
  title,
  sectionId,
  eyebrow,
}: {
  brandName: string;
  ownFundingGbp: number;
  title?: string;
  sectionId?: string;
  eyebrow?: string;
}) {
  const meta = impactTableMeta("cist");
  const [rows, setRows] = useState(() =>
    cistRowsForSponsor({ rows: [], brandName, ownFundingGbp })
  );

  useEffect(() => {
    let cancelled = false;
    void loadSponsorLeaderboard()
      .then((leaderboard) => {
        if (cancelled) return;
        setRows(
          cistRowsForSponsor({
            rows: leaderboard.map((row) => ({
              name: row.brandName,
              donationGbp: row.donationGbp,
            })),
            brandName,
            ownFundingGbp,
          })
        );
      })
      .catch(() => {
        if (!cancelled) {
          setRows(cistRowsForSponsor({ rows: [], brandName, ownFundingGbp }));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [brandName, ownFundingGbp]);

  return (
    <section
      id={sectionId}
      className="scroll-mt-6 rounded-3xl border border-slate-700 bg-slate-900 p-8"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
        {eyebrow ?? meta.shortName}
      </p>
      <h2 className="mt-2 text-3xl font-black">{title ?? meta.title}</h2>
      <p className="mt-3 max-w-3xl text-slate-300">
        Your position is highlighted. {meta.description}.
      </p>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-700">
        <table className="w-full min-w-[32rem] text-left">
          <thead className="bg-slate-950 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Pos</th>
              <th className="px-4 py-3 font-semibold">{meta.entityColumn}</th>
              <th className="px-4 py-3 text-right font-semibold">Impact Moments</th>
              <th className="px-4 py-3 text-right font-semibold">Climate Funding</th>
              <th className="px-4 py-3 text-right font-semibold">Climate Impact</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${row.rank}-${row.name}`}
                className={
                  row.highlighted
                    ? "bg-green-500/20 ring-1 ring-inset ring-green-400"
                    : "border-t border-slate-800"
                }
              >
                <td className="px-4 py-3.5 font-black text-green-400">{row.rank}</td>
                <td className="px-4 py-3.5 font-semibold">
                  {row.name}
                  {row.highlighted ? (
                    <span className="ml-2 text-xs font-semibold uppercase tracking-[0.16em] text-green-300">
                      You
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3.5 text-right font-semibold text-green-300">
                  {row.impactMoments}
                </td>
                <td className="px-4 py-3.5 text-right font-semibold text-green-300">
                  {row.funding}
                </td>
                <td className="px-4 py-3.5 text-right font-semibold text-green-300">
                  {row.climateImpact}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
