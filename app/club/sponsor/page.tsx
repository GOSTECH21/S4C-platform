"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClubNav from "@/app/components/club/ClubNav";
import { SponsorLeaderboard } from "@/app/components/fan/SponsorLeaderboard";
import { loadClubSponsorLeaderboard } from "@/app/services/sponsor-leaderboard.service";
import { loadClubSession } from "@/app/services/club-match-day.service";
import {
  CLUB_LOGIN_PATH,
  CLUB_SELECT_PROJECTS_PATH,
} from "@/app/lib/routes";
import type { SponsorLeaderboardRow } from "@/app/lib/sponsor-leaderboard";
import Link from "next/link";

export default function ClubSponsorLeaderboardPage() {
  const router = useRouter();
  const [clubName, setClubName] = useState("your club");
  const [rows, setRows] = useState<SponsorLeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const session = await loadClubSession();
        if (!session) {
          router.replace(CLUB_LOGIN_PATH);
          return;
        }
        setClubName(session.club.name);
        setRows(await loadClubSponsorLeaderboard(session.club.name));
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
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <ClubNav />
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
          Sponsor
        </p>
        <h1 className="mt-2 text-4xl font-black">Sponsor Leaderboard</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          This board is {clubName} only. It lists the one Lead Climate Sponsor
          and the Local Business Climate Sponsors that chose {clubName} — never
          another club&apos;s brands. Choose Global Leaderboard for that Lead
          Climate Sponsor, Local Leaderboard for Local Business Climate
          Sponsors, or Affiliates for both. Use the Sort-Selector beside the
          board to rank Restaurants, Car Companies, Hotels, Fashion Retailers,
          or Others. Global Leaderboard opens first. Affiliates ranks{" "}
          {clubName}&apos;s sponsors from the largest donation to the smallest.
        </p>
        <p className="mt-3 max-w-3xl text-sm text-slate-400">
          After you shortlist brands here, attach them on the Dashboard and in{" "}
          <Link
            href={CLUB_SELECT_PROJECTS_PATH}
            className="font-semibold text-green-300 hover:underline"
          >
            S4P Climate Projects
          </Link>
          .
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
            <SponsorLeaderboard rows={rows} affiliateClubs={[clubName]} />
          )}
        </div>
      </div>
    </main>
  );
}
