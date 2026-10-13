"use client";

import { ClimateSponsorshipWallet } from "@/app/components/sponsor/ClimateSponsorshipWallet";
import { localLockCopy } from "@/app/lib/climate-sponsors";
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
      <div className="mx-auto max-w-4xl space-y-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          Local Business Climate Sponsor
        </p>
        <h1 className="text-4xl font-black">Climate Sponsorship Wallet</h1>
        <p className="mt-1 text-sm font-semibold text-slate-400">Top Cellar</p>
        <section className="rounded-3xl border border-green-500/30 bg-slate-900 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
            Match Day lock-in
          </p>
          <h2 className="mt-2 text-3xl font-black">Select a Club</h2>
          <p className="mt-3 max-w-3xl text-slate-300">{localLockCopy()}</p>
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
      </div>
    </main>
  );
}
