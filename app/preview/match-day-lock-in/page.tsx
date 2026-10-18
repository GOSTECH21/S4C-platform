"use client";

import { useState } from "react";
import { MatchDayLockIn } from "@/app/components/sponsor/MatchDayLockIn";
import { ClimateSponsorshipWallet } from "@/app/components/sponsor/ClimateSponsorshipWallet";
import type { MatchDayClubLock } from "@/app/lib/climate-sponsors";
import {
  SPONSOR_ANOTHER_TEAM_CLICK,
  SPONSOR_ANOTHER_TEAM_PROMPT,
} from "@/app/lib/routes";

export default function MatchDayLockInPreviewPage() {
  const [lock, setLock] = useState<MatchDayClubLock | null>(null);
  const [walletClub, setWalletClub] = useState<string | null>(null);

  if (walletClub) {
    return (
      <main className="min-h-screen p-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
              Budweiser
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Climate Sponsorship Wallet
            </h1>
            <p className="mt-3 max-w-3xl text-slate-300">
              Fans of {walletClub} take cash from this wallet and put that cash
              into a numbered Climate Project.
            </p>
            <p className="mt-4 max-w-3xl text-slate-300">
              {SPONSOR_ANOTHER_TEAM_PROMPT}{" "}
              <button
                type="button"
                onClick={() => {
                  setWalletClub(null);
                  setLock(null);
                }}
                className="font-semibold text-s4p-mint underline decoration-s4p-mark decoration-2 underline-offset-2"
              >
                {SPONSOR_ANOTHER_TEAM_CLICK}
              </button>
              .
            </p>
          </div>
          <ClimateSponsorshipWallet
            kind="lead"
            clubName={walletClub}
            wallet={null}
            onLeadDeposit={() => undefined}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
            Signed in as Budweiser
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Match Day Lock-In
          </h1>
        </div>
        <div id="match-day-lock-in" className="scroll-mt-6">
          <MatchDayLockIn
            brandName="Budweiser"
            lock={lock}
            onLockChange={setLock}
            onMatchLocked={setWalletClub}
          />
        </div>
      </div>
    </main>
  );
}
