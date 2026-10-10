"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_WALLET_VOTE_GBP,
  formatLeadSponsorshipGbp,
  formatWalletGbp,
  leadCarbonWalletGbp,
  leadSponsorshipFromGoalsGbp,
  liveGoalsScored,
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
  onLeadDeposit,
  onLocalDeposit,
  busy = false,
  notice,
  error,
}: {
  kind: SponsorWalletKind;
  wallet: ClimateWallet | null;
  clubName: string;
  onLeadDeposit: (input: {
    commitmentFeeGbp: number;
    gbpPerGoal: number;
    maximumSponsorshipGbp: number;
  }) => void;
  onLocalDeposit?: (input: { sponsorshipGbp: number }) => void;
  busy?: boolean;
  notice?: string | null;
  error?: string | null;
}) {
  const [commitmentFee, setCommitmentFee] = useState("1000");
  const [gbpPerGoal, setGbpPerGoal] = useState("3000");
  const [maximumSponsorship, setMaximumSponsorship] = useState("0");
  const [localAmount, setLocalAmount] = useState(String(LOCAL_SPONSOR_MIN_GBP));
  const liveGoals = wallet ? liveGoalsScored(wallet) : 0;
  const localTopUp = localWalletTopUp(Number(localAmount) || 0);

  useEffect(() => {
    if (!wallet || kind !== "lead") return;
    setCommitmentFee(String(wallet.commitmentFeeGbp));
    setGbpPerGoal(String(wallet.gbpPerGoal));
    setMaximumSponsorship(String(wallet.maximumSponsorshipGbp ?? 0));
  }, [wallet, kind]);

  return (
    <div className="rounded-3xl border border-emerald-400/30 bg-slate-900 p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
        Climate Sponsorship Wallet
      </p>
      <h2 className="mt-2 text-3xl font-black">Climate Sponsorship Wallet</h2>
      <p className="mt-3 max-w-3xl text-slate-300">
        {kind === "lead"
          ? "As a Lead Climate Project Sponsor, you deposit a Commitment Fee on Day 1 (in case Match ends as 0 - 0), well before kick-off, and agrees to pay Goals-scored Sponsorship Cash for every goal the sponsored Team players score"
          : `As a Local Business Climate Sponsor, put the amount you are sponsoring into this Carbon Wallet. Fans of ${clubName || "your club"} take ${formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)} per FUND-IT from it onto local Climate Projects. Goal-scored sponsorship is only for Lead Climate Sponsors.`}
      </p>

      {wallet && kind === "lead" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <WalletStat
            label="Commitment Fee"
            value={formatWalletGbp(wallet.commitmentFeeGbp)}
          />
          <WalletStat
            label="Sponsorship/Goal-Scored"
            value={formatLeadSponsorshipGbp(leadSponsorshipFromGoalsGbp(wallet))}
          />
          <WalletStat label="Goals-Scored" value={String(liveGoals)} />
          <WalletStat
            label="Maximum Sponsorship Amount"
            value={formatWalletGbp(wallet.maximumSponsorshipGbp ?? 0)}
          />
          <WalletStat
            label="Amount in CARBON WALLET"
            value={formatWalletGbp(leadCarbonWalletGbp(wallet))}
          />
        </div>
      ) : null}

      {wallet && kind === "local" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <WalletStat
            label="Remaining"
            value={`${formatWalletGbp(remainingGbp(wallet))} Remaining`}
          />
          <WalletStat
            label="Sponsorship in wallet"
            value={formatWalletGbp(wallet.sponsorshipGbp)}
          />
          <WalletStat
            label="Management fee paid"
            value={formatWalletGbp(wallet.managementFeeGbp)}
          />
        </div>
      ) : null}

      {kind === "local" ? (
        <form
          className="mt-8 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onLocalDeposit?.({
              sponsorshipGbp: Number(localAmount) || 0,
            });
          }}
        >
          <label className="block max-w-md text-sm text-slate-400">
            Amount in Carbon Wallet
            <input
              type="number"
              min={0}
              step={50}
              value={localAmount}
              onChange={(event) => setLocalAmount(event.target.value)}
              className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
              data-testid="local-wallet-amount"
            />
          </label>
          <p className="max-w-2xl text-sm text-slate-400">
            A 10% management fee is added on top. You pay{" "}
            {formatWalletGbp(localTopUp.paidGbp)};{" "}
            {formatWalletGbp(localTopUp.sponsorshipGbp)} goes into the Carbon
            Wallet.
          </p>
          {wallet ? (
            <p className="text-sm text-green-300">
              Fans take {formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)} per FUND-IT
              from the {formatWalletGbp(remainingGbp(wallet))} remaining.
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-green-500 py-4 font-bold text-slate-950 hover:bg-green-400 disabled:opacity-70"
          >
            {busy ? "Saving..." : "Put into Carbon Wallet"}
          </button>
        </form>
      ) : (
        <form
          className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            onLeadDeposit({
              commitmentFeeGbp: Number(commitmentFee) || 0,
              gbpPerGoal: Number(gbpPerGoal) || 0,
              maximumSponsorshipGbp: Number(maximumSponsorship) || 0,
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
            Sponsorship/Goal-Scored
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
            Goals-Scored
            <input
              type="number"
              min={0}
              step={1}
              value={liveGoals}
              readOnly
              aria-readonly="true"
              className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white opacity-90"
            />
            <span className="mt-1 block text-xs text-slate-500">
              Stays at 0 until a live broadcast goal is received.
            </span>
          </label>
          <label className="block text-sm text-slate-400">
            Maximum Sponsorship Amount
            <input
              type="number"
              min={0}
              step={50}
              value={maximumSponsorship}
              onChange={(event) => setMaximumSponsorship(event.target.value)}
              className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="xl:col-span-4 md:col-span-2 rounded-xl bg-green-500 py-4 font-bold text-slate-950 hover:bg-green-400 disabled:opacity-70"
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
