"use client";
/* game-time-buy-first-v1 */
/* game-time-slot-heading-v1 */

import { useEffect, useMemo, useState } from "react";
import {
  P4pLiveChallengePreview,
  P4pPredictNextBoard,
} from "@/app/components/fan/P4pLiveChallengePreview";
import {
  ClubLeagueMenu,
  MatchFixtureMenu,
} from "@/app/components/sponsor/ClubMatchMenus";
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
} from "@/app/lib/predict-for-planet";
import { PLATFORM_FEE_LABEL } from "@/app/lib/sponsor-wallet";
import { loadClubFixtures } from "@/app/services/club-fixtures.service";

const PREVIEW_BRAND = "Budweiser Europe";
const PREVIEW_FIXTURE = "Liverpool v Arsenal";

export default function GameTimeBuyPreviewPage() {
  const slots = gameTimeSlots();
  const [clubName, setClubName] = useState("");
  const [fixture, setFixture] = useState<ClubFixture | null>(null);
  const [fixtures, setFixtures] = useState<ClubFixture[]>([]);
  const [fixturesLoading, setFixturesLoading] = useState(false);
  const [slotIndex, setSlotIndex] = useState(0);
  const [amount, setAmount] = useState("500");
  const topUp = useMemo(
    () => gameTimeSponsorshipTopUp(Number(amount) || 0),
    [amount]
  );
  const previewSlot = slots[slotIndex] ?? slots[0];

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

  return (
    <main
      className="mx-auto max-w-5xl px-6 py-10 text-slate-950"
      data-game-time-buy-first="game-time-buy-first-v1"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-800">
        {PREVIEW_BRAND}
      </p>
      <h1 className="mt-3 text-4xl font-black">{GAME_TIME_SPONSORSHIP_LABEL}</h1>
      <p className="mt-3 max-w-3xl text-slate-700">
        Buy a {GAME_TIME_SLOT_MINUTES}-minute slot of fan engagement for this
        Game. Pay this Game-Time amount plus a 5% Platform Fee via Stripe.
        Participating takes {formatP4pGbp(P4P_ENGAGEMENT_GBP)} from this{" "}
        {GAME_TIME_CARBON_WALLET_LABEL}; the right event takes another{" "}
        {formatP4pGbp(P4P_ACCURACY_GBP)}. That money is recorded in the fan&apos;s{" "}
        {FAN_CARBON_WALLET_LABEL} for their chosen Climate Project, until this
        wallet reads {formatP4pGbp(0)}. The Game lasts{" "}
        {GAME_TIME_DURATION_MINUTES} minutes.
      </p>

      <div className="mt-8 space-y-8" data-testid="p4p-game-time-buy">
        <P4pPredictNextBoard brandName={PREVIEW_BRAND} />
        <div className="space-y-5">
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
          <div>
            <p className="text-sm font-semibold text-slate-700">
              {GAME_TIME_SLOT_MINUTES}-minute Game-Time slot
            </p>
            <fieldset className="mt-2 rounded-xl border border-slate-300 bg-white p-4">
              <div className="space-y-2">
                {slots.map((slot) => (
                  <label
                    key={slot.index}
                    className="flex cursor-pointer items-center gap-3 text-sm text-slate-950"
                  >
                    <input
                      type="radio"
                      name="game-time-slot-preview"
                      className="accent-green-500"
                      checked={slotIndex === slot.index}
                      onChange={() => setSlotIndex(slot.index)}
                    />
                    {slot.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
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
            className="w-full rounded-xl bg-green-500 py-4 font-bold text-slate-950 hover:bg-green-400"
          >
            Continue to payment
          </button>
        </div>
      </div>

      <div className="mt-10" data-testid="p4p-game-time-live">
        <P4pLiveChallengePreview
          fixtureName={fixture?.fixtureName || PREVIEW_FIXTURE}
          brandName={PREVIEW_BRAND}
          slotLabel={gameTimeSlotShortLabel(previewSlot)}
          sponsorshipGbp={Number(amount) || 500}
        />
      </div>
    </main>
  );
}
