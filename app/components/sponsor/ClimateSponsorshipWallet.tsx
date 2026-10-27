"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_WALLET_VOTE_GBP,
  PLATFORM_FEE_LABEL,
  formatWalletGbp,
  leadCarbonWalletGbp,
  localWalletTopUp,
  matchSponsorshipTopUp,
  remainingGbp,
  type ClimateWallet,
  type SponsorWalletKind,
} from "@/app/lib/sponsor-wallet";
import { MATCH_SPONSORSHIP_LABEL } from "@/app/lib/sponsor-listings";
import { LOCAL_SPONSOR_MIN_GBP } from "@/app/lib/local-sponsor";
import {
  TOP_UP_CASH_HEADING,
  climateWalletHeading,
} from "@/app/lib/match-day-carbon-offset";
import {
  CLIMATE_WALLET_CONFIRMATION_COPY,
  LOCAL_WALLET_CONFIRMATION_COPY,
} from "@/app/lib/sponsor-card-payment";

export function ClimateSponsorshipWallet({
  kind,
  wallet,
  clubName,
  heading,
  onLeadDeposit,
  onLocalDeposit,
  busy = false,
  notice,
  error,
}: {
  kind: SponsorWalletKind;
  wallet: ClimateWallet | null;
  clubName: string;
  heading?: string;
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
  const [localAmount, setLocalAmount] = useState(String(LOCAL_SPONSOR_MIN_GBP));
  const localTopUp = localWalletTopUp(Number(localAmount) || 0);
  const leadTopUp = matchSponsorshipTopUp(Number(commitmentFee) || 0);

  useEffect(() => {
    if (!wallet || kind !== "lead") return;
    setCommitmentFee(String(wallet.commitmentFeeGbp));
  }, [wallet, kind]);

  return (
    <div className="rounded-3xl border border-emerald-400/30 bg-slate-900 p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
        Climate Sponsorship Wallet
      </p>
      <h2 className="mt-2 text-3xl font-black">
        {kind === "local" ? TOP_UP_CASH_HEADING : heading || climateWalletHeading({ clubName })}
      </h2>
      <p className="mt-3 max-w-3xl text-slate-300">
        {kind === "lead"
          ? CLIMATE_WALLET_CONFIRMATION_COPY
          : LOCAL_WALLET_CONFIRMATION_COPY}
      </p>
      <p className="mt-3 max-w-3xl text-slate-400">
        {kind === "lead"
          ? `As a Lead Climate Sponsor you pay one ${MATCH_SPONSORSHIP_LABEL} for this Match, plus a 5% Platform Fee, via Stripe.`
          : `As a Local Business Climate Sponsor, put the amount you are sponsoring into this Carbon Wallet. Fans of ${clubName || "your club"} take ${formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)} per FUND-IT from it onto local Climate Projects.`}
      </p>

      {wallet && kind === "lead" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <WalletStat
            label={MATCH_SPONSORSHIP_LABEL}
            value={formatWalletGbp(wallet.commitmentFeeGbp)}
          />
          <WalletStat
            label={PLATFORM_FEE_LABEL}
            value={formatWalletGbp(
              matchSponsorshipTopUp(wallet.commitmentFeeGbp).platformFeeGbp
            )}
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
            {busy ? "Opening payment..." : "Put into Carbon Wallet"}
          </button>
        </form>
      ) : (
        <form
          className="mt-8 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const amount = Number(commitmentFee) || 0;
            onLeadDeposit({
              commitmentFeeGbp: amount,
              gbpPerGoal: 0,
              maximumSponsorshipGbp: amount,
            });
          }}
        >
          <label className="block max-w-md text-sm text-slate-400">
            {MATCH_SPONSORSHIP_LABEL} (£)
            <input
              type="number"
              min={0}
              step={50}
              value={commitmentFee}
              onChange={(event) => setCommitmentFee(event.target.value)}
              className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
            />
          </label>
          <p className="max-w-2xl text-sm text-slate-400">
            A 5% Platform Fee is added on top. You pay{" "}
            {formatWalletGbp(leadTopUp.paidGbp)} ({formatWalletGbp(leadTopUp.matchSponsorshipGbp)}{" "}
            {MATCH_SPONSORSHIP_LABEL} + {formatWalletGbp(leadTopUp.platformFeeGbp)} fee).
          </p>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-green-500 py-4 font-bold text-slate-950 hover:bg-green-400 disabled:opacity-70"
          >
            {busy ? "Opening payment..." : "Deposit into Climate Sponsorship Wallet"}
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
