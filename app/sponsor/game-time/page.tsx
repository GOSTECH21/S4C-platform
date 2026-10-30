"use client";
/* s4p-predict-for-planet-v5 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { P4pLiveChallengePreview } from "@/app/components/fan/P4pLiveChallengePreview";
import {
  ClubLeagueMenu,
  MatchFixtureMenu,
} from "@/app/components/sponsor/ClubMatchMenus";
import { StripeCardPayment } from "@/app/components/sponsor/StripeCardPayment";
import type { ClubFixture } from "@/app/lib/club-fixtures";
import {
  FAN_CARBON_WALLET_LABEL,
  GAME_TIME_CARBON_WALLET_LABEL,
  GAME_TIME_DURATION_MINUTES,
  GAME_TIME_SLOT_MINUTES,
  GAME_TIME_SPONSORSHIP_LABEL,
  P4P_ACCURACY_GBP,
  P4P_ENGAGEMENT_GBP,
  formatP4pGbp,
  gameTimeSlotShortLabel,
  gameTimeSlots,
  gameTimeSponsorshipTopUp,
  isPaidGameTimeWallet,
  remainingGameTimeGbp,
  type GameTimeCheckout,
  type GameTimeWallet,
} from "@/app/lib/predict-for-planet";
import { PAY_WITH_CARD_LABEL } from "@/app/lib/sponsor-card-payment";
import { PLATFORM_FEE_LABEL } from "@/app/lib/sponsor-wallet";
import { SPONSOR_LOGIN_PATH } from "@/app/lib/routes";
import { loadClubFixtures } from "@/app/services/club-fixtures.service";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import {
  confirmGameTimeCardPayment,
  listGameTimeWallets,
  resolveGameTimeSponsorBrand,
  saveGameTimeCheckout,
} from "@/app/services/predict-for-planet.service";

export default function GameTimeSponsorshipPage() {
  const router = useRouter();
  const slots = gameTimeSlots();
  const [brand, setBrand] = useState("");
  const [clubName, setClubName] = useState("");
  const [fixture, setFixture] = useState<ClubFixture | null>(null);
  const [fixtures, setFixtures] = useState<ClubFixture[]>([]);
  const [fixturesLoading, setFixturesLoading] = useState(false);
  const [slotIndex, setSlotIndex] = useState(0);
  const [amount, setAmount] = useState("500");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState(listGameTimeWallets());
  const [checkout, setCheckout] = useState<GameTimeCheckout | null>(null);
  const [paidWallet, setPaidWallet] = useState<GameTimeWallet | null>(null);
  const [busy, setBusy] = useState(false);
  const topUp = useMemo(
    () =>
      gameTimeSponsorshipTopUp(
        checkout?.sponsorshipGbp ?? (Number(amount) || 0)
      ),
    [amount, checkout?.sponsorshipGbp]
  );
  const brandWallets = useMemo(
    () =>
      wallets.filter(
        (row) => row.brandName.toLowerCase() === brand.toLowerCase()
      ),
    [brand, wallets]
  );
  const previewFixture =
    paidWallet?.fixtureName ||
    checkout?.fixtureName ||
    fixture?.fixtureName ||
    brandWallets[0]?.fixtureName ||
    "Your Match";
  const previewSlotIndex =
    paidWallet?.slotIndex ??
    checkout?.slotIndex ??
    (fixture ? slotIndex : (brandWallets[0]?.slotIndex ?? slotIndex));
  const previewSlot = slots[previewSlotIndex] ?? slots[0];
  const previewAmount =
    paidWallet?.sponsorshipGbp ??
    checkout?.sponsorshipGbp ??
    (Number(amount) || brandWallets[0]?.sponsorshipGbp || 0);
  const previewAllocated =
    paidWallet?.allocatedGbp ?? brandWallets[0]?.allocatedGbp ?? 0;

  useEffect(() => {
    async function load() {
      try {
        const brandName = await resolveGameTimeSponsorBrand(getCurrentSponsor);
        if (!brandName) {
          router.replace(SPONSOR_LOGIN_PATH);
          return;
        }
        setBrand(brandName);
      } finally {
        setLoading(false);
        setWallets(listGameTimeWallets());
      }
    }
    void load();
  }, [router]);

  useEffect(() => {
    if (!clubName) {
      setFixtures([]);
      setFixture(null);
      return;
    }
    let cancelled = false;
    setFixturesLoading(true);
    void loadClubFixtures(clubName)
      .then((rows) => {
        if (!cancelled) setFixtures(rows);
      })
      .catch(() => {
        if (!cancelled) setFixtures([]);
      })
      .finally(() => {
        if (!cancelled) setFixturesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [clubName]);

  function continueToPayment() {
    setError(null);
    const sponsorshipGbp = Math.max(0, Number(amount) || 0);
    if (!clubName.trim()) {
      setError("Select a club.");
      return;
    }
    const fixtureName = fixture?.fixtureName?.trim() ?? "";
    if (!fixtureName) {
      setError("Select the Match you are buying Game-Time for.");
      return;
    }
    if (sponsorshipGbp <= 0) {
      setError("Enter how much you are putting on the Game-Time Carbon Wallet.");
      return;
    }
    const pending = saveGameTimeCheckout({
      clubName: clubName.trim(),
      brandName: brand,
      fixtureName,
      slotIndex,
      sponsorshipGbp,
      kickoffAt: new Date().toISOString(),
    });
    setPaidWallet(null);
    setCheckout(pending);
  }

  async function pay() {
    const pending = checkout;
    if (!pending) {
      setError("Choose the Match and Game-Time amount first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const wallet = confirmGameTimeCardPayment(pending);
      setPaidWallet(wallet);
      setWallets(listGameTimeWallets());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not confirm payment.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl py-10">
        Loading Game-Time Sponsorship...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl py-10 text-slate-950">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-800">
        {brand}
      </p>
      <h1 className="mt-3 text-4xl font-black">
        {paidWallet
          ? "Payment confirmed"
          : checkout
            ? PAY_WITH_CARD_LABEL
            : GAME_TIME_SPONSORSHIP_LABEL}
      </h1>
      <p className="mt-3 max-w-3xl text-slate-700">
        Buy a {GAME_TIME_SLOT_MINUTES}-minute slot of fan engagement for this
        Game. Pay this Game-Time amount plus a 5% Platform Fee via Stripe.
        Participating takes {formatP4pGbp(P4P_ENGAGEMENT_GBP)} from this{" "}
        {GAME_TIME_CARBON_WALLET_LABEL}; the right event takes another{" "}
        {formatP4pGbp(P4P_ACCURACY_GBP)}. That money is recorded in the fan&apos;s{" "}
        {FAN_CARBON_WALLET_LABEL} for their chosen Climate Project, until this wallet reads{" "}
        {formatP4pGbp(0)}. The Game lasts {GAME_TIME_DURATION_MINUTES} minutes.
      </p>

      {brand ? (
        <div className="mt-8">
          <P4pLiveChallengePreview
            fixtureName={previewFixture}
            brandName={brand}
            slotLabel={gameTimeSlotShortLabel(previewSlot)}
            sponsorshipGbp={previewAmount}
            allocatedGbp={previewAllocated}
            badge={paidWallet ? "Live" : "Preview"}
          />
        </div>
      ) : null}

      {paidWallet ? (
        <div className="mt-8 rounded-3xl border border-emerald-700/40 bg-emerald-50 p-8">
          <p className="text-lg font-semibold text-emerald-900">
            {formatP4pGbp(paidWallet.sponsorshipGbp)} is now in the{" "}
            {GAME_TIME_CARBON_WALLET_LABEL} for {paidWallet.fixtureName} ·{" "}
            {slots[paidWallet.slotIndex]?.label}. Remaining{" "}
            {formatP4pGbp(remainingGameTimeGbp(paidWallet))}. Fans can now take
            £0.10.
          </p>
          <button
            type="button"
            onClick={() => {
              setCheckout(null);
              setPaidWallet(null);
            }}
            className="mt-5 inline-flex rounded-xl bg-s4p-mark px-5 py-3 font-bold text-slate-950"
          >
            Buy another Game-Time slot
          </button>
        </div>
      ) : checkout ? (
        <div className="mt-8">
          <p className="text-sm text-slate-600">
            Stripe takes {formatP4pGbp(topUp.paidGbp)} (
            {formatP4pGbp(topUp.sponsorshipGbp)} on the{" "}
            {GAME_TIME_CARBON_WALLET_LABEL} + {formatP4pGbp(topUp.platformFeeGbp)}{" "}
            {PLATFORM_FEE_LABEL}) for {checkout.fixtureName} ·{" "}
            {slots[checkout.slotIndex]?.label}. Fans can take £0.10 only after
            this payment is confirmed.
          </p>
          <div className="mt-6">
            <StripeCardPayment
              amountGbp={topUp.paidGbp}
              clubName={checkout.fixtureName || checkout.clubName}
              busy={busy}
              error={error}
              onPay={pay}
            />
          </div>
          <button
            type="button"
            onClick={() => setCheckout(null)}
            className="mt-5 inline-flex rounded-xl border border-slate-300 px-5 py-3 font-semibold"
          >
            Back to Game-Time
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-5">
        <ClubLeagueMenu
          value={clubName}
          allPlatformClubs
          onChange={(club) => {
            setClubName(club);
            setFixture(null);
          }}
        />
        <MatchFixtureMenu
          clubName={clubName}
          value={fixture?.id || fixture?.fixtureName || ""}
          fixtures={fixtures}
          loading={fixturesLoading}
          onChange={setFixture}
        />
        <fieldset className="rounded-xl border border-slate-300 bg-white p-4">
          <legend className="px-1 text-sm font-semibold text-slate-700">
            30-minute Game-Time slot
          </legend>
          {slots.map((slot) => (
            <label
              key={slot.index}
              className="mt-2 flex cursor-pointer items-center gap-3 text-sm text-slate-950"
            >
              <input
                type="radio"
                name="game-time-slot"
                className="accent-green-500"
                checked={slotIndex === slot.index}
                onChange={() => setSlotIndex(slot.index)}
              />
              {slot.label}
            </label>
          ))}
        </fieldset>
        <label className="block text-sm font-semibold text-slate-700">
          Amount on the {GAME_TIME_CARBON_WALLET_LABEL} (£)
          <input
            type="number"
            min={1}
            step={1}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-950"
          />
        </label>
        <p className="text-sm text-slate-600">
          A {PLATFORM_FEE_LABEL} is added on top. You pay{" "}
          {formatP4pGbp(topUp.paidGbp)} ({formatP4pGbp(topUp.sponsorshipGbp)}{" "}
          Game-Time + {formatP4pGbp(topUp.platformFeeGbp)} fee).
        </p>
        <button
          type="button"
          onClick={continueToPayment}
          className="w-full rounded-xl bg-green-500 py-4 font-bold text-slate-950 hover:bg-green-400"
        >
          Continue to payment
        </button>
        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-red-600 bg-red-50 p-3 text-sm font-semibold text-red-800"
          >
            {error}
          </p>
        ) : null}
      </div>
      )}

      {wallets.length > 0 ? (
        <div className="mt-10">
          <h2 className="text-2xl font-black">Your Game-Time wallets</h2>
          <ul className="mt-4 space-y-3">
            {wallets
              .filter((row) => row.brandName.toLowerCase() === brand.toLowerCase())
              .map((row) => (
                <li
                  key={row.id}
                  className="rounded-xl border border-slate-300 bg-white p-4"
                >
                  <p className="font-bold">
                    {row.fixtureName} · {slots[row.slotIndex]?.label}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {isPaidGameTimeWallet(row)
                      ? `Remaining ${formatP4pGbp(remainingGameTimeGbp(row))} of ${formatP4pGbp(row.sponsorshipGbp)}`
                      : "Awaiting payment. Fans cannot take £0.10 until Stripe confirms this Game-Time Sponsorship."}
                  </p>
                </li>
              ))}
          </ul>
        </div>
      ) : null}
    </main>
  );
}
