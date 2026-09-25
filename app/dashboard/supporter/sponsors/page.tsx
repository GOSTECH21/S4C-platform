"use client";

import { useEffect, useState } from "react";
import FanNav from "../components/FanNav";
import { SponsorLeaderboard } from "@/app/components/fan/SponsorLeaderboard";
import { loadSponsorLeaderboard } from "@/app/services/sponsor-leaderboard.service";
import { getOrCreateSupporter } from "@/app/services/votes.service";
import { FAN_LOGIN_PATH } from "@/app/lib/routes";
import type { SponsorLeaderboardRow } from "@/app/lib/sponsor-leaderboard";

export default function SponsorLeaderboardPage() {
  const [rows, setRows] = useState<SponsorLeaderboardRow[]>([]);
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
        setRows(await loadSponsorLeaderboard());
      } catch (err) {
        console.error("Failed to load sponsor leaderboard:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Could not load the sponsor leaderboard."
        );
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <FanNav />
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
          Sponsor
        </p>
        <h1 className="mt-2 text-4xl font-black">Sponsor Leaderboard</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Choose Global Leaderboard or Local Leaderboard. Global Leaderboard
          opens first and ranks Lead Climate Sponsors from the largest donation
          to the smallest. Local Leaderboard ranks Local Business Climate
          Sponsors the same way.
        </p>
        {error ? (
          <p className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
            {error}
          </p>
        ) : null}
        <div className="mt-8">
          {loading ? (
            <p className="text-slate-400">Loading sponsor donations...</p>
          ) : (
            <SponsorLeaderboard rows={rows} />
          )}
        </div>
      </div>
    </main>
  );
}
