"use client";

import { useState } from "react";
import {
  DEFAULT_WALLET_VOTE_GBP,
  formatWalletGbp,
  localWalletTopUp,
  remainingGbp,
  type ClimateWallet,
  type SponsorWalletKind,
} from "@/app/lib/sponsor-wallet";
import { LOCAL_SPONSOR_MIN_GBP } from "@/app/lib/local-sponsor";

export function ClimateSponsorshipWallet({
  kind,
  wallet,
  clubName,
  onLocalTopUp,
  onLeadDeposit,
  busy = false,
  notice,
  error,
}: {
  kind: SponsorWalletKind;
  wallet: ClimateWallet | null;
  clubName: string;
  onLocalTopUp: (sponsorshipGbp: number) => void;
  onLeadDeposit: (input: {
    commitmentFeeGbp: number;
    gbpPerGoal: number;
    goalsScored: number;
  }) => void;
  busy?: boolean;
  notice?: string | null;
  error?: string | null;
}) {
  const [sponsorship, setSponsorship] = useState("750");
  const [commitmentFee, setCommitmentFee] = useState("1000");
  const [gbpPerGoal, setGbpPerGoal] = useState("3000");
  const [goalsScored, setGoalsScored] = useState("0");
  const preview = localWalletTopUp(Number(sponsorship) || 0);

  return (
    <div className="rounded-3xl border border-emerald-400/30 bg-slate-900 p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
        Climate Sponsorship Wallet
      </p>
      <h2 className="mt-2 text-3xl font-black">Climate Sponsorship Wallet</h2>
      <p className="mt-3 max-w-3xl text-slate-300">
        {kind === "lead"
          ? `A Lead Climate Project Sponsor deposits a Commitment Fee on Day 1, well before kick-off, and agrees Goals-scored Sponsorship Cash for every goal ${clubName || "the sponsored team"} players score.`
          : `Pay the sponsorship amount you want fans of ${clubName || "your club"} to take from this wallet. A 10% management fee is added on top (for example £750 + 10% = ${formatWalletGbp(preview.paidGbp)} paid; the wallet then shows ${formatWalletGbp(preview.sponsorshipGbp)}).`}
      </p>

      {wallet && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <WalletStat
            label="Remaining"
            value={`${formatWalletGbp(remainingGbp(wallet))} Remaining`}
          />
          <WalletStat
            label={kind === "lead" ? "Commitment Fee" : "Sponsorship in wallet"}
            value={formatWalletGbp(
              kind === "lead" ? wallet.commitmentFeeGbp : wallet.sponsorshipGbp
            )}
          />
          <WalletStat
            label={kind === "lead" ? "Goals-scored rate" : "Management fee paid"}
            value={
              kind === "lead"
                ? `${formatWalletGbp(wallet.gbpPerGoal)} / Goal`
                : formatWalletGbp(wallet.managementFeeGbp)
            }
          />
        </div>
      )}

      {kind === "local" ? (
        <form
          className="mt-8 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onLocalTopUp(Number(sponsorship));
          }}
        >
          <label className="block text-sm text-slate-400">
            Sponsorship amount (from £{LOCAL_SPONSOR_MIN_GBP})
            <input
              type="number"
              min={LOCAL_SPONSOR_MIN_GBP}
              step={50}
              value={sponsorship}
              onChange={(event) => setSponsorship(event.target.value)}
              className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
            />
          </label>
          <p className="text-sm text-green-300">
            You pay {formatWalletGbp(preview.paidGbp)} ({formatWalletGbp(preview.sponsorshipGbp)}{" "}
            + 10% management fee). Fans then take {formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)}{" "}
            per vote from the {formatWalletGbp(preview.sponsorshipGbp)} remaining.
          </p>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-green-500 py-4 font-bold text-slate-950 hover:bg-green-400 disabled:opacity-70"
          >
            {busy ? "Paying in..." : "Pay into Climate Sponsorship Wallet"}
          </button>
        </form>
      ) : (
        <form
          className="mt-8 grid gap-4 md:grid-cols-3"
          onSubmit={(event) => {
            event.preventDefault();
            onLeadDeposit({
              commitmentFeeGbp: Number(commitmentFee) || 0,
              gbpPerGoal: Number(gbpPerGoal) || 0,
              goalsScored: Number(goalsScored) || 0,
            });
          }}
        >
          <label className="block text-sm text-slate-400">
            Commitment Fee (Day 1)
            <input
              type="number"
              min={0}
              step={50}
              value={commitmentFee}
              onChange={(event) => setCommitmentFee(event.target.value)}
              className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
            />
          </label>
          <label className="block text-sm text-slate-400">
            Goals-scored Sponsorship Cash
            <input
              type="number"
              min={0}
              step={50}
              value={gbpPerGoal}
              onChange={(event) => setGbpPerGoal(event.target.value)}
              className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
            />
          </label>
          <label className="block text-sm text-slate-400">
            Goals scored so far
            <input
              type="number"
              min={0}
              step={1}
              value={goalsScored}
              onChange={(event) => setGoalsScored(event.target.value)}
              className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="md:col-span-3 rounded-xl bg-green-500 py-4 font-bold text-slate-950 hover:bg-green-400 disabled:opacity-70"
          >
            {busy ? "Saving..." : "Deposit into Climate Sponsorship Wallet"}
          </button>
        </form>
      )}

      {error && (
        <p className="mt-4 text-sm font-semibold text-red-400">{error}</p>
      )}
      {notice && !error && (
        <p className="mt-4 text-sm font-semibold text-green-300">{notice}</p>
      )}
    </div>
  );
}

function WalletStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-black text-green-400">{value}</p>
    </div>
  );
}
