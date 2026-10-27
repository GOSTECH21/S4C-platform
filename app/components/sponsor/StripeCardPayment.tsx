"use client";

import { useState } from "react";
import { formatWalletGbp } from "@/app/lib/sponsor-wallet";
import {
  PAY_WITH_CARD_LABEL,
  STRIPE_CHECKOUT_HEADING,
  STRIPE_POWERED_COPY,
  STRIPE_TEST_CARD_COPY,
  formatCardExpiry,
  formatCardNumber,
  isCardCvcValid,
  isCardExpiryValid,
  isCardNumberValid,
} from "@/app/lib/sponsor-card-payment";

export function StripeCardPayment({
  amountGbp,
  clubName,
  busy = false,
  error,
  onPay,
}: {
  amountGbp: number;
  clubName: string;
  busy?: boolean;
  error?: string | null;
  onPay: () => void | Promise<void>;
}) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!isCardNumberValid(cardNumber)) {
      setLocalError("Enter a valid card number.");
      return;
    }
    if (!isCardExpiryValid(expiry)) {
      setLocalError("Enter a valid future expiry date.");
      return;
    }
    if (!isCardCvcValid(cvc)) {
      setLocalError("Enter the 3-digit CVC.");
      return;
    }
    if (!name.trim()) {
      setLocalError("Enter the name on the card.");
      return;
    }
    setLocalError(null);
    void onPay();
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 text-slate-900 shadow-2xl"
      data-testid="stripe-card-form"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#635BFF]">
        Stripe
      </p>
      <h2 className="mt-2 text-2xl font-black">{STRIPE_CHECKOUT_HEADING}</h2>
      <p className="mt-2 text-sm text-slate-600">{PAY_WITH_CARD_LABEL}</p>
      <p className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold">
        {formatWalletGbp(amountGbp)} for {clubName || "this Match Day"}
      </p>
      <label className="mt-5 block text-sm font-semibold text-slate-600">
        Card number
        <input
          value={cardNumber}
          onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="ACCT-000015"
          data-testid="stripe-card-number"
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 font-mono tracking-wider"
        />
      </label>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block text-sm font-semibold text-slate-600">
          Expiry
          <input
            value={expiry}
            onChange={(event) => setExpiry(formatCardExpiry(event.target.value))}
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM / YY"
            data-testid="stripe-card-expiry"
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 font-mono"
          />
        </label>
        <label className="block text-sm font-semibold text-slate-600">
          CVC
          <input
            value={cvc}
            onChange={(event) => setCvc(event.target.value.replace(/\D/g, "").slice(0, 4))}
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            data-testid="stripe-card-cvc"
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 font-mono"
          />
        </label>
      </div>
      <label className="mt-4 block text-sm font-semibold text-slate-600">
        Name on card
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="cc-name"
          data-testid="stripe-card-name"
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"
        />
      </label>
      {(localError || error) && (
        <p className="mt-4 text-sm font-semibold text-red-600">
          {localError || error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy || !(amountGbp > 0)}
        data-testid="pay-with-card"
        className="mt-5 w-full rounded-xl bg-[#635BFF] py-4 font-bold text-white hover:brightness-110 disabled:opacity-70"
      >
        {busy ? "Confirming payment..." : `${PAY_WITH_CARD_LABEL} · ${formatWalletGbp(amountGbp)}`}
      </button>
      <p className="mt-3 text-center text-xs text-slate-500">{STRIPE_POWERED_COPY}</p>
      <p className="mt-1 text-center text-xs text-slate-400">{STRIPE_TEST_CARD_COPY}</p>
    </form>
  );
}
