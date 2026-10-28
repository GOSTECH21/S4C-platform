"use client";

import { useEffect, useState } from "react";
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
  remainingGameTimeGbp,
} from "@/app/lib/predict-for-planet";
import { SPONSOR_LOGIN_PATH } from "@/app/lib/routes";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import { loadClubFixtures } from "@/app/services/club-fixtures.service";
import {
  depositGameTimeSponsorship,
  listGameTimeWallets,
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
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState(listGameTimeWallets());

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
      } catch {
        try {
          const raw = window.localStorage.getItem("s4p.sponsor.profile");
          const parsed = raw
            ? (JSON.parse(raw) as { companyName?: string })
            : null;
          const brandName = parsed?.companyName?.trim() ?? "";
          if (!brandName) {
            router.replace(SPONSOR_LOGIN_PATH);
            return;
          }
          setBrand(brandName);
        } catch {
          router.replace(SPONSOR_LOGIN_PATH);
          return;
        }
      } finally {
        setLoading(false);
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

  function deposit() {
    setError(null);
    setNotice(null);
    const sponsorshipGbp = Math.max(0, Number(amount) || 0);
    if (!clubName.trim()) {
      setError("Select a club.");
      return;
    }
    const fixtureName =
      fixture?.fixtureName || `${clubName.trim()} vs Chelsea`;
    if (sponsorshipGbp <= 0) {
      setError("Enter how much you are putting on the Game-Time Carbon Wallet.");
      return;
    }
    const wallet = depositGameTimeSponsorship({
      clubName: clubName.trim(),
      brandName: brand,
      fixtureName,
      slotIndex,
      sponsorshipGbp,
      kickoffAt: new Date().toISOString(),
    });
    setWallets(listGameTimeWallets());
    setNotice(
      `${formatP4pGbp(sponsorshipGbp)} is now in the ${GAME_TIME_CARBON_WALLET_LABEL} for the ${slots[slotIndex]?.label} slot. Remaining ${formatP4pGbp(remainingGameTimeGbp(wallet))}.`
    );
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl py-10 text-white">
        Loading Game-Time Sponsorship...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl py-10 text-white">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
        {brand}
      </p>
      <h1 className="mt-3 text-4xl font-black">{GAME_TIME_SPONSORSHIP_LABEL}</h1>
      <p className="mt-3 max-w-3xl text-slate-300">
        Buy a {GAME_TIME_SLOT_MINUTES}-minute slot of fan engagement for this
        Game. Predict-For Planet takes {formatP4pGbp(P4P_ENGAGEMENT_GBP)} from this{" "}
        {GAME_TIME_CARBON_WALLET_LABEL} for every prediction until it reads{" "}
        {formatP4pGbp(0)}. The Game lasts {GAME_TIME_DURATION_MINUTES} minutes.
      </p>

      <div className="mt-8 space-y-5">
        <ClubLeagueMenu value={clubName} onChange={setClubName} />
        <MatchFixtureMenu
          clubName={clubName}
          value={fixture?.id || fixture?.fixtureName || ""}
          fixtures={fixtures}
          loading={fixturesLoading}
          onChange={setFixture}
        />
        <fieldset className="rounded-xl border border-slate-700 p-4">
          <legend className="px-1 text-sm text-slate-400">
            30-minute Game-Time slot
          </legend>
          {slots.map((slot) => (
            <label
              key={slot.index}
              className="mt-2 flex cursor-pointer items-center gap-3 text-sm text-slate-200"
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
        <label className="block text-sm text-slate-400">
          Amount on the {GAME_TIME_CARBON_WALLET_LABEL} (£)
          <input
            type="number"
            min={1}
            step={1}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
          />
        </label>
        <button
          type="button"
          onClick={deposit}
          className="w-full rounded-xl bg-green-500 py-4 font-bold text-slate-950 hover:bg-green-400"
        >
          Put this amount on the {GAME_TIME_CARBON_WALLET_LABEL}
        </button>
        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300"
          >
            {error}
          </p>
        ) : null}
        {notice ? (
          <p
            role="status"
            className="rounded-xl border border-green-500/40 bg-green-500/10 p-3 text-sm text-green-300"
          >
            {notice}
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
                  className="rounded-xl border border-slate-700 bg-slate-900 p-4"
                >
                  <p className="font-bold">
                    {row.fixtureName} · {slots[row.slotIndex]?.label}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Remaining {formatP4pGbp(remainingGameTimeGbp(row))} of{" "}
                    {formatP4pGbp(row.sponsorshipGbp)}
                  </p>
                </li>
              ))}
          </ul>
        </div>
      ) : null}
    </main>
  );
}
