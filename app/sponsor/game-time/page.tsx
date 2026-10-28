"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClubLeagueMenu,
  MatchFixtureMenu,
} from "@/app/components/sponsor/ClubMatchMenus";
import type { ClubFixture } from "@/app/lib/club-fixtures";
import {
  GAME_TIME_CARBON_WALLET_LABEL,
  GAME_TIME_DURATION_MINUTES,
  GAME_TIME_SLOT_MINUTES,
  GAME_TIME_SPONSORSHIP_LABEL,
  P4P_ENGAGEMENT_GBP,
  formatP4pGbp,
  gameTimeSlots,
  gameTimeSponsorshipTopUp,
  isPaidGameTimeWallet,
  remainingGameTimeGbp,
} from "@/app/lib/predict-for-planet";
import { PLATFORM_FEE_LABEL } from "@/app/lib/sponsor-wallet";
import {
  SPONSOR_GAME_TIME_PAY_PATH,
  SPONSOR_LOGIN_PATH,
} from "@/app/lib/routes";
import { loadClubFixtures } from "@/app/services/club-fixtures.service";
import {
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
  const topUp = useMemo(
    () => gameTimeSponsorshipTopUp(Number(amount) || 0),
    [amount]
  );

  useEffect(() => {
    async function load() {
      try {
        const brandName = await resolveGameTimeSponsorBrand();
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
    saveGameTimeCheckout({
      clubName: clubName.trim(),
      brandName: brand,
      fixtureName,
      slotIndex,
      sponsorshipGbp,
      kickoffAt: new Date().toISOString(),
    });
    router.push(SPONSOR_GAME_TIME_PAY_PATH);
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
      <h1 className="mt-3 text-4xl font-black">{GAME_TIME_SPONSORSHIP_LABEL}</h1>
      <p className="mt-3 max-w-3xl text-slate-700">
        Buy a {GAME_TIME_SLOT_MINUTES}-minute slot of fan engagement for this
        Game. Pay this Game-Time amount plus a 5% Platform Fee via Stripe.
        Predict-For Planet then takes {formatP4pGbp(P4P_ENGAGEMENT_GBP)} from this{" "}
        {GAME_TIME_CARBON_WALLET_LABEL} for every prediction until it reads{" "}
        {formatP4pGbp(0)}. The Game lasts {GAME_TIME_DURATION_MINUTES} minutes.
      </p>

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
