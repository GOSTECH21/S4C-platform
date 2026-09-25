"use client";

import { BrandMark } from "@/app/components/club/BrandMark";
import type { SponsorLeaderboardRow } from "@/app/lib/sponsor-leaderboard";
import { formatMoney } from "@/app/lib/sponsorship-auction";

function rankTone(rank: number): string {
  if (rank === 1) return "bg-amber-400 text-slate-950";
  if (rank === 2) return "bg-slate-300 text-slate-950";
  if (rank === 3) return "bg-amber-700 text-white";
  return "bg-slate-800 text-slate-200";
}

export function SponsorLeaderboard({
  rows,
}: {
  rows: SponsorLeaderboardRow[];
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
        No sponsor donations are recorded yet. When Climate Sponsors pledge,
        they appear here from the largest donation to the smallest.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800">
      <table className="w-full text-left">
        <thead className="bg-slate-900 text-xs uppercase tracking-[0.16em] text-slate-400">
          <tr>
            <th className="p-4">Rank</th>
            <th className="p-4">Sponsor</th>
            <th className="p-4">Type</th>
            <th className="p-4">Club</th>
            <th className="p-4 text-right">Donation</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={`${row.rank}:${row.brandName}`}
              className="border-t border-slate-800 bg-slate-950/60 hover:bg-slate-900"
            >
              <td className="p-4">
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${rankTone(row.rank)}`}
                >
                  {row.rank}
                </span>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <BrandMark
                    name={row.brandName}
                    logoUrl={row.logoUrl}
                    className="h-10 w-10 text-xs"
                  />
                  <span className="font-bold text-white">{row.brandName}</span>
                </div>
              </td>
              <td className="p-4 text-sm text-slate-300">{row.kind}</td>
              <td className="p-4 text-sm text-slate-400">
                {row.clubNames.join(", ") || "—"}
              </td>
              <td className="p-4 text-right text-lg font-black text-green-400">
                {formatMoney(row.donationGbp)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
