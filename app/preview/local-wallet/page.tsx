"use client";

import { ClimateSponsorshipWallet } from "@/app/components/sponsor/ClimateSponsorshipWallet";
import { SeeMatchDetails } from "@/app/components/sponsor/SeeMatchDetails";
import { localLockCopy } from "@/app/lib/climate-sponsors";
import {
  LOCAL_FIVE_RECORD_COPY,
  MATCH_DAY_PROJECTS_RECORD_LABEL,
} from "@/app/lib/match-day-carbon-offset";
import {
  createLocalWallet,
  remainingGbp,
  type ClimateWallet,
} from "@/app/lib/sponsor-wallet";
import { useState } from "react";

export default function LocalWalletPreviewPage() {
  const [wallet, setWallet] = useState<ClimateWallet | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <main className="min-h-screen p-8 text-white">
      <div className="mx-auto max-w-4xl space-y-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          Local Business Climate Sponsor
        </p>
        <h1 className="text-4xl font-black">New Sponsorship</h1>
        <p className="mt-1 text-sm font-semibold text-slate-400">Top Cellar</p>

        <section
          id="match-day-lock-in"
          className="rounded-3xl border border-green-500/30 bg-slate-900 p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
            Match Day lock-in
          </p>
          <h2 className="mt-2 text-3xl font-black">Select a Club</h2>
          <p className="mt-3 max-w-3xl text-slate-300">{localLockCopy()}</p>
          <div className="mt-6 rounded-2xl border border-green-500/40 bg-green-500/10 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-green-300">
              Locked in
            </p>
            <p className="mt-4 text-2xl font-black">
              Hibernian · Hibernian v Motherwell
            </p>
            <SeeMatchDetails
              defaultOpen
              date="2026-10-18"
              venue="Easter Road"
              kickoff="15:00"
            />
            <button
              type="button"
              className="mt-4 rounded-xl border border-slate-600 px-4 py-2 text-sm"
            >
              Unlock
            </button>
          </div>
        </section>

        <ClimateSponsorshipWallet
          kind="local"
          wallet={wallet}
          clubName="Hibernian"
          notice={notice}
          onLeadDeposit={() => undefined}
          onLocalDeposit={({ sponsorshipGbp }) => {
            const next = createLocalWallet({
              clubName: "Hibernian",
              brandName: "Top Cellar",
              sponsorshipGbp,
            });
            setWallet(next);
            setNotice(
              `${next.sponsorshipGbp} in Carbon Wallet; ${remainingGbp(next)} remaining.`
            );
          }}
        />

        <section className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
            Match Day record
          </p>
          <h2 className="mt-3 text-2xl font-black">
            {MATCH_DAY_PROJECTS_RECORD_LABEL}
          </h2>
          <p className="mt-3 max-w-3xl text-slate-300">{LOCAL_FIVE_RECORD_COPY}</p>
          <p className="mt-5 inline-flex rounded-xl bg-green-500 px-5 py-3 font-bold text-slate-950">
            Waiting for the club to choose Climate Projects
          </p>
        </section>
      </div>
    </main>
  );
}
