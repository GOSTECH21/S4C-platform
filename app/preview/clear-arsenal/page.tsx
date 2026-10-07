"use client";

import { useState } from "react";
import Link from "next/link";
import { clearClubProjectsAndSponsors } from "@/app/services/clear-club-data.service";
import type { ClearedClubData } from "@/app/services/clear-club-data.service";

export default function ClearArsenalPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClearedClubData | null>(null);

  async function clear() {
    setBusy(true);
    setError(null);
    try {
      const cleared = await clearClubProjectsAndSponsors("Arsenal");
      setResult(cleared);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not clear Arsenal projects and sponsors."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl space-y-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
          Platform test
        </p>
        <h1 className="text-4xl font-black">Start Arsenal afresh</h1>
        <p className="text-slate-300">
          This removes Arsenal&apos;s posted Climate Projects, sponsor funded
          lists, Match Day file records and every sponsor attached to
          Arsenal. Opening the Arsenal club dashboard also starts the
          Sustainability Director on a blank Match Day until a new five is
          saved. Shared catalog projects and other clubs are left in place.
        </p>
        <p className="text-sm text-slate-400">
          If the hosted campaign still remains after this click, paste{" "}
          <code className="text-amber-200">supabase/migrations/0016_clear_arsenal_projects_sponsors.sql</code>{" "}
          into the Supabase SQL editor once, then click again.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => void clear()}
          className="rounded-xl bg-amber-400 px-6 py-3 font-bold text-slate-950 disabled:opacity-50"
        >
          {busy ? "Clearing Arsenal…" : "Delete Arsenal projects and sponsors"}
        </button>
        {error && (
          <p className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
            {error}
          </p>
        )}
        {result && (
          <div className="space-y-2 rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-5">
            <p className="text-xl font-black text-emerald-300">
              {result.remainingCampaigns > 0
                ? "Arsenal dashboard will start blank; hosted campaign still needs SQL"
                : "Arsenal is clear"}
            </p>
            <p>
              The Sustainability Director now sees 0 selected Climate Projects,
              no leftover funded lists, and no Match Day lookback until
              they choose a new five.
            </p>
            <p>Posted Match Day rows removed: {result.portfolios}</p>
            <p>Campaign project rows removed: {result.campaignProjects}</p>
            <p>Arsenal match campaigns removed: {result.matchCampaigns}</p>
            <p>Club-owned project rows removed: {result.clubProjects}</p>
            <p>Arsenal Goals-scored campaigns removed: {result.sponsorshipCampaigns}</p>
            <p>Local sponsor records removed: {result.sponsorsRemoved}</p>
            <p>Carbon Wallets removed: {result.walletsRemoved}</p>
            {result.remainingCampaigns > 0 && (
              <p className="text-amber-200">
                Hosted Match Day campaign still open ({result.remainingCampaigns}).
                Paste the SQL file into Supabase, then click again.
              </p>
            )}
            <div className="flex gap-4 pt-2 text-sm font-semibold">
              <Link className="text-emerald-300" href="/club/dashboard">
                Club dashboard
              </Link>
              <Link className="text-emerald-300" href="/club/sponsors">
                Our Climate Sponsors
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
