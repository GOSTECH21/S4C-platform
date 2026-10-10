"use client";

import { ClimateSponsorshipWallet } from "@/app/components/sponsor/ClimateSponsorshipWallet";
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
          Top Cellar
        </p>
        <h1 className="text-4xl font-black">Climate Sponsorship Wallet</h1>
        <p className="max-w-3xl text-slate-300">
          Put how much you are sponsoring into this Carbon Wallet. Fans take
          that cash onto local Climate Projects. Goal-scored sponsorship is only
          for Lead Climate Sponsors.
        </p>
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
