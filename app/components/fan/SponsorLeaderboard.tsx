"use client";

import { useMemo, useState } from "react";
import { BrandMark } from "@/app/components/club/BrandMark";
import {
  DEFAULT_SPONSOR_LEADERBOARD_SCOPE,
  SPONSOR_LEADERBOARD_SCOPE_OPTIONS,
  leaderboardForScope,
  type SponsorLeaderboardRow,
  type SponsorLeaderboardScope,
} from "@/app/lib/sponsor-leaderboard";
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
  const [scope, setScope] = useState<SponsorLeaderboardScope>(
    DEFAULT_SPONSOR_LEADERBOARD_SCOPE
  );
  const ranked = useMemo(() => leaderboardForScope(rows, scope), [rows, scope]);
  const scopeLabel =
    SPONSOR_LEADERBOARD_SCOPE_OPTIONS.find((option) => option.value === scope)
      ?.label ?? "Global Leaderboard";

  return (
    <div className="space-y-4">
      <label className="flex max-w-md flex-col gap-2 text-sm font-semibold text-slate-300">
        Leaderboard
        <select
          aria-label="Select leaderboard"
          value={scope}
          onChange={(event) =>
            setScope(event.target.value as SponsorLeaderboardScope)
          }
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-base font-bold text-white"
        >
          {SPONSOR_LEADERBOARD_SCOPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {ranked.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
          {scope === "local"
            ? "No Local Business Climate Sponsor donations are recorded yet."
            : "No Global Climate Sponsor donations are recorded yet."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full text-left">
            <caption className="sr-only">{scopeLabel} by donation</caption>
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
              {ranked.map((row) => (
                <tr
                  key={`${scope}:${row.rank}:${row.brandName}`}
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
      )}
    </div>
  );
}
