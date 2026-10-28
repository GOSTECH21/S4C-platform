"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StripeCardPayment } from "@/app/components/sponsor/StripeCardPayment";
import {
  GAME_TIME_CARBON_WALLET_LABEL,
  GAME_TIME_SPONSORSHIP_LABEL,
  formatP4pGbp,
  gameTimeSlots,
  gameTimeSponsorshipTopUp,
  remainingGameTimeGbp,
  type GameTimeCheckout,
  type GameTimeWallet,
} from "@/app/lib/predict-for-planet";
import {
  CARD_PAYMENT_CONFIRMED_COPY,
  PAY_WITH_CARD_LABEL,
} from "@/app/lib/sponsor-card-payment";
import { PLATFORM_FEE_LABEL } from "@/app/lib/sponsor-wallet";
import {
  SPONSOR_GAME_TIME_PATH,
  SPONSOR_LOGIN_PATH,
} from "@/app/lib/routes";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import {
  confirmGameTimeCardPayment,
  readGameTimeCheckout,
} from "@/app/services/predict-for-planet.service";

export default function GameTimeCardPaymentPage() {
  const router = useRouter();
  const slots = gameTimeSlots();
  const [brand, setBrand] = useState("");
  const [checkout, setCheckout] = useState<GameTimeCheckout | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<GameTimeWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const topUp = useMemo(
    () => gameTimeSponsorshipTopUp(checkout?.sponsorshipGbp ?? 0),
    [checkout?.sponsorshipGbp]
  );

  useEffect(() => {
    async function load() {
      try {
        const sponsor = await getCurrentSponsor();
        const brandName = String(sponsor.name ?? "").trim();
        if (!brandName) {
          router.replace(SPONSOR_LOGIN_PATH);
          return;
        }
        setBrand(brandName);
        const pending = readGameTimeCheckout();
        if (!pending) {
          router.replace(SPONSOR_GAME_TIME_PATH);
          return;
        }
        setCheckout(pending);
      } catch {
        router.replace(SPONSOR_LOGIN_PATH);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [router]);

  async function pay() {
    const pending = checkout ?? readGameTimeCheckout();
    if (!pending) {
      setError("Choose the Match and Game-Time amount first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      setWallet(confirmGameTimeCardPayment(pending));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not confirm payment.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl py-10">
        Opening Game-Time payment...
      </main>
    );
  }

  const paid = Boolean(wallet);
  const heading = paid ? CARD_PAYMENT_CONFIRMED_COPY : PAY_WITH_CARD_LABEL;
  const fixtureName = wallet?.fixtureName || checkout?.fixtureName || "";
  const slotLabel = slots[(wallet?.slotIndex ?? checkout?.slotIndex) || 0]?.label;

  return (
    <main className="mx-auto max-w-3xl py-10 text-slate-950">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-800">
        {brand}
      </p>
      <h1 className="mt-3 text-4xl font-black">{heading}</h1>
      <p className="mt-3 max-w-3xl text-slate-700">
        {GAME_TIME_SPONSORSHIP_LABEL}
        {fixtureName ? ` · ${fixtureName}` : ""}
        {slotLabel ? ` · ${slotLabel}` : ""}
      </p>
      <p className="mt-2 max-w-3xl text-sm text-slate-600">
        Stripe takes {formatP4pGbp(topUp.paidGbp)} ({formatP4pGbp(topUp.sponsorshipGbp)}{" "}
        on the {GAME_TIME_CARBON_WALLET_LABEL} + {formatP4pGbp(topUp.platformFeeGbp)}{" "}
        {PLATFORM_FEE_LABEL}). Fans can take £0.10 only after this payment is
        confirmed.
      </p>

      {paid && wallet ? (
        <div className="mt-8 rounded-3xl border border-emerald-700/40 bg-emerald-50 p-8">
          <p className="text-lg font-semibold text-emerald-900">
            {formatP4pGbp(wallet.sponsorshipGbp)} is now in the{" "}
            {GAME_TIME_CARBON_WALLET_LABEL}. Remaining{" "}
            {formatP4pGbp(remainingGameTimeGbp(wallet))}.
          </p>
          <Link
            href={SPONSOR_GAME_TIME_PATH}
            className="mt-5 inline-flex rounded-xl bg-s4p-mark px-5 py-3 font-bold text-slate-950"
          >
            Back to Game-Time
          </Link>
        </div>
      ) : (
        <div className="mt-8">
          <StripeCardPayment
            amountGbp={topUp.paidGbp}
            clubName={fixtureName || checkout?.clubName || ""}
            busy={busy}
            error={error}
            onPay={pay}
          />
          <Link
            href={SPONSOR_GAME_TIME_PATH}
            className="mt-5 inline-flex rounded-xl border border-slate-300 px-5 py-3 font-semibold"
          >
            Back to Game-Time
          </Link>
        </div>
      )}
    </main>
  );
}
