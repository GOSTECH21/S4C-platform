"use client";
/* s4p-predict-for-planet-v6 */

import { useEffect, useMemo, useState } from "react";
import { BrandMark } from "@/app/components/club/BrandMark";
import {
  GAME_TIME_CARBON_WALLET_LABEL,
  GAME_TIME_SLOT_COUNT,
  P4P_CATEGORIES,
  P4P_CHOOSE_PROJECT_LABEL,
  FAN_CARBON_WALLET_LABEL,
  P4P_ACCURACY_GBP,
  P4P_CORRECT_TOTAL_GBP,
  P4P_FALLBACK_PROJECTS,
  P4P_FANS_ENGAGEMENT_LABEL,
  P4P_LABEL,
  P4P_LIVE_CHALLENGE_FOOTER,
  P4P_LIVE_CHALLENGE_LABEL,
  P4P_MAKE_PREDICTION_LABEL,
  P4P_MATCH_DAY_IMPACT_LABEL,
  P4P_PARTICIPATION_GBP,
  P4P_POWERED_BY_LABEL,
  P4P_PREDICTIONS_PER_WINDOW,
  P4P_SHORT,
  P4P_TAGLINE,
  alreadyPredictedWindow,
  fanCarbonWalletFromPredictions,
  firstFundedWindowIndex,
  formatP4pGbp,
  gameTimeFixtureMatches,
  gameTimeSlotShortLabel,
  gameTimeSlots,
  isWindowInGameTimeSlot,
  p4pCreditsByProject,
  p4pLiveChallenge,
  p4pPlayIntroCopy,
  p4pPredictionAmounts,
  predictionCategoryIds,
  p4pWindowCountdown,
  remainingGameTimeGbp,
  windowsForGameTimeSlot,
  pickSponsoredGameTimeMatch,
  type P4pCategoryId,
} from "@/app/lib/predict-for-planet";
import { loadBrandLogo } from "@/app/services/climate-sponsors.service";
import {
  depositGameTimeSponsorship,
  gameTimeWalletForSlot,
  awardP4pSlotEvent,
  listGameTimeWallets,
  listP4pPredictions,
  listP4pSlotEvents,
  slotEventAwarded,
  submitP4pPrediction,
} from "@/app/services/predict-for-planet.service";
import { sponsorLogoSrc } from "@/app/services/teams.service";

export function PredictForPlanetPlay({
  fanId,
  clubName,
  fixtureName,
  preferredClubNames = [],
  projects = P4P_FALLBACK_PROJECTS,
  seedWallet,
}: {
  fanId: string;
  clubName?: string;
  fixtureName?: string;
  preferredClubNames?: string[];
  projects?: string[];
  seedWallet?: { brandName: string; amountGbp: number };
}) {
  const slots = useMemo(() => gameTimeSlots(), []);
  const [windowIndex, setWindowIndex] = useState(0);
  const [categoryIds, setCategoryIds] = useState<P4pCategoryId[]>([]);
  const [projectName, setProjectName] = useState(projects[0] ?? "");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const seedBrand = seedWallet?.brandName ?? "";
  const seedAmount = seedWallet?.amountGbp ?? 0;
  const shouldSeed = Boolean(seedWallet);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!hydrated || !shouldSeed || !seedBrand || !clubName || !fixtureName) return;
    const kickoffAt = new Date().toISOString();
    let seeded = false;
    for (let slotIndex = 0; slotIndex < GAME_TIME_SLOT_COUNT; slotIndex += 1) {
      const existing = gameTimeWalletForSlot({
        clubName,
        fixtureName,
        slotIndex,
      });
      if (existing) continue;
      depositGameTimeSponsorship({
        clubName,
        brandName: seedBrand,
        fixtureName,
        slotIndex,
        sponsorshipGbp: seedAmount,
        kickoffAt,
      });
      seeded = true;
    }
    if (seeded) setTick((value) => value + 1);
  }, [clubName, fixtureName, hydrated, seedAmount, seedBrand, shouldSeed]);

  const wallets = hydrated ? listGameTimeWallets() : [];
  const sponsored =
    pickSponsoredGameTimeMatch(wallets, preferredClubNames) ??
    (hydrated && shouldSeed && clubName && fixtureName
      ? {
          clubName,
          fixtureName,
          brandName: seedBrand,
          remainingGbp: seedAmount,
          slotIndex: 0,
        }
      : null);
  const liveClub = sponsored?.clubName ?? "";
  const liveFixture = sponsored?.fixtureName ?? "";
  const slotIndex = sponsored?.slotIndex ?? 0;
  const playableWindows = windowsForGameTimeSlot(slotIndex);
  const slot = slots[slotIndex];
  const playWindow =
    playableWindows.find((row) => row.index === windowIndex) ??
    playableWindows[0];
  const wallet =
    liveClub && liveFixture
      ? gameTimeWalletForSlot({
          clubName: liveClub,
          fixtureName: liveFixture,
          slotIndex,
        })
      : null;
  const remaining = wallet ? remainingGameTimeGbp(wallet) : 0;
  const sponsorBrand = wallet?.brandName || sponsored?.brandName || "";
  const sponsorLogo =
    loadBrandLogo(sponsorBrand) || sponsorLogoSrc(sponsorBrand, null);
  const allPredictions = hydrated
    ? listP4pPredictions().filter(
        (row) => liveFixture && gameTimeFixtureMatches(row.fixtureName, liveFixture)
      )
    : [];
  const predictions = allPredictions.filter(
    (row) => row.fanId.toLowerCase() === fanId.toLowerCase()
  );
  const slotEvents = hydrated ? listP4pSlotEvents() : [];
  const fanWallet = fanCarbonWalletFromPredictions(predictions, fanId);
  const alreadyInWindow = alreadyPredictedWindow(
    predictions,
    fanId,
    liveFixture,
    playWindow?.index ?? 0
  );
  const windowAllowed = isWindowInGameTimeSlot(playWindow?.index ?? -1, slotIndex);
  const canPredict = Boolean(
    wallet &&
      remaining > 0 &&
      categoryIds.length === P4P_PREDICTIONS_PER_WINDOW &&
      projectName &&
      windowAllowed &&
      !alreadyInWindow
  );
  const credits = p4pCreditsByProject(allPredictions);
  const challenge = wallet
    ? p4pLiveChallenge(wallet, allPredictions)
    : null;
  const countdown = wallet && playWindow
    ? p4pWindowCountdown(wallet.kickoffAt, playWindow, now)
    : null;
  void tick;

  useEffect(() => {
    if (!liveClub || !liveFixture) return;
    const next = firstFundedWindowIndex(
      listGameTimeWallets(),
      liveClub,
      liveFixture
    );
    setWindowIndex(next);
  }, [liveClub, liveFixture]);

  useEffect(() => {
    const playable = windowsForGameTimeSlot(slotIndex);
    if (!playable.some((row) => row.index === windowIndex)) {
      const fallback = playable[0]?.index;
      if (fallback !== undefined) setWindowIndex(fallback);
    }
  }, [slotIndex, windowIndex]);

  function predict() {
    setNotice(null);
    setError(null);
    if (!liveClub || !liveFixture) {
      setError("P4P is played on the Match a Game-Time Sponsor has put money into their Carbon Wallet for.");
      return;
    }
    if (!windowAllowed) {
      setError(
        `That 5-minute slot is not in this Game-Time Sponsorship. The Game-Time Sponsor bought ${slot?.label ?? "a different 30-minute slot"}.`
      );
      return;
    }
    if (alreadyInWindow) {
      setError("You have already chosen 3 events in this 5-minute slot.");
      return;
    }
    if (categoryIds.length !== P4P_PREDICTIONS_PER_WINDOW) {
      setError("Choose 3 of the seven Predict-For Planet events.");
      return;
    }
    const result = submitP4pPrediction({
      fanId,
      clubName: liveClub,
      fixtureName: liveFixture,
      windowIndex: playWindow?.index ?? 0,
      categoryIds,
      projectName,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const amounts = p4pPredictionAmounts(result.prediction);
    const left = result.wallet
      ? formatP4pGbp(remainingGameTimeGbp(result.wallet))
      : formatP4pGbp(0);
    if (amounts.correct) {
      setNotice(
        `Accurate prediction. ${formatP4pGbp(amounts.totalGbp)} is in your ${FAN_CARBON_WALLET_LABEL} for ${projectName} (${formatP4pGbp(amounts.participationGbp)} participation + ${formatP4pGbp(amounts.accuracyGbp)} accuracy). Game-Time wallet now ${left}.`
      );
    } else {
      setNotice(
        `Participation. ${formatP4pGbp(amounts.participationGbp)} is in your ${FAN_CARBON_WALLET_LABEL} for ${projectName}. If one of those events is awarded in this slot, you earn another ${formatP4pGbp(P4P_ACCURACY_GBP)} (total ${formatP4pGbp(P4P_CORRECT_TOTAL_GBP)}). Game-Time wallet now ${left}.`
      );
    }
    setTick((value) => value + 1);
  }

  function awardEvent(id: P4pCategoryId) {
    setNotice(null);
    setError(null);
    if (!liveClub || !liveFixture) return;
    const result = awardP4pSlotEvent({
      clubName: liveClub,
      fixtureName: liveFixture,
      windowIndex: playWindow?.index ?? 0,
      categoryId: id,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const mine = result.predictions.find(
      (row) =>
        row.fanId.toLowerCase() === fanId.toLowerCase() &&
        row.windowIndex === (playWindow?.index ?? 0)
    );
    const amounts = mine ? p4pPredictionAmounts(mine) : null;
    const eventLabel =
      P4P_CATEGORIES.find((item) => item.id === id)?.label ?? id;
    if (amounts?.correct) {
      setNotice(
        `${eventLabel} was awarded. Accurate prediction: another ${formatP4pGbp(amounts.accuracyGbp)} is in your ${FAN_CARBON_WALLET_LABEL} for ${mine?.projectName ?? projectName}. Total ${formatP4pGbp(amounts.totalGbp)}.`
      );
    } else {
      setNotice(
        `${eventLabel} was awarded in this 5-minute slot. Matching predictions earn ${formatP4pGbp(P4P_ACCURACY_GBP)} more.`
      );
    }
    setTick((value) => value + 1);
  }

  if (!hydrated) {
    return (
      <section className="space-y-6 text-slate-950">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-800">
          {P4P_SHORT} · {P4P_LABEL}
        </p>
        <h1 className="mt-2 text-4xl font-black">{P4P_LABEL}</h1>
      </section>
    );
  }

  if (!sponsored) {
    return (
      <section className="space-y-6 text-slate-950">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-800">
            {P4P_SHORT} · {P4P_LABEL}
          </p>
          <h1 className="mt-2 text-4xl font-black">{P4P_LABEL}</h1>
          <p className="mt-3 max-w-3xl text-slate-700">
            Predict-For Planet is played on the Match a Game-Time Sponsor has put
            money into their Carbon Wallet for. No Game-Time Sponsor has funded a Match yet.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8 text-slate-950">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-800">
          {P4P_SHORT} · {P4P_LABEL}
        </p>
        <h1
          data-testid="p4p-match"
          data-wallet-count={wallets.length}
          className="mt-2 text-4xl font-black"
        >
          {liveFixture}
        </h1>
        <p className="mt-3 max-w-3xl text-slate-700">{p4pPlayIntroCopy()}</p>
      </div>

      {challenge && wallet ? (
        <article
          data-testid="p4p-live-challenge"
          className="rounded-3xl border border-emerald-700/30 bg-white p-6 text-slate-950"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-800">
                {P4P_LIVE_CHALLENGE_LABEL}
              </p>
              <h2 className="mt-2 text-3xl font-black">{liveFixture}</h2>
              <p className="mt-1 text-sm text-slate-600">
                Game-Time Sponsor · {gameTimeSlotShortLabel(slot)}
              </p>
            </div>
            {shouldSeed ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                Demo
              </span>
            ) : (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                Live
              </span>
            )}
          </div>

          <div className="mt-6">
            <div className="flex items-end justify-between gap-3">
              <p className="text-lg font-black">{P4P_FANS_ENGAGEMENT_LABEL}</p>
              <p className="text-lg font-black tabular-nums">
                {challenge.eligiblePredictions.toLocaleString("en-GB")} /{" "}
                {challenge.engagementTarget.toLocaleString("en-GB")}
              </p>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-emerald-100">
              <div
                className="h-full rounded-full bg-emerald-600"
                style={{ width: `${challenge.progressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-emerald-800">
              {challenge.progressPercent}% of engagement target achieved
            </p>
          </div>

          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-700/20 bg-[var(--s4p-canvas)] p-4">
              <dt className="text-sm text-slate-600">Unique fans participating</dt>
              <dd className="mt-1 text-2xl font-black tabular-nums">
                {challenge.uniqueFans.toLocaleString("en-GB")}
              </dd>
            </div>
            <div className="rounded-2xl border border-emerald-700/20 bg-[var(--s4p-canvas)] p-4">
              <dt className="text-sm text-slate-600">
                Total eligible predictions submitted
              </dt>
              <dd className="mt-1 text-2xl font-black tabular-nums">
                {challenge.eligiblePredictions.toLocaleString("en-GB")}
              </dd>
            </div>
            <div className="rounded-2xl border border-emerald-700/20 bg-[var(--s4p-canvas)] p-4">
              <dt className="text-sm text-slate-600">Climate funding unlocked</dt>
              <dd className="mt-1 text-3xl font-black text-emerald-800">
                {formatP4pGbp(challenge.fundingUnlockedGbp)}
              </dd>
            </div>
            <div className="rounded-2xl border border-emerald-700/20 bg-[var(--s4p-canvas)] p-4">
              <dt className="text-sm text-slate-600">Sponsor commitment</dt>
              <dd className="mt-1 text-3xl font-black">
                {formatP4pGbp(challenge.sponsorCommitmentGbp)}
              </dd>
            </div>
          </dl>
          <p className="mt-5 text-sm text-slate-600">{P4P_LIVE_CHALLENGE_FOOTER}</p>
        </article>
      ) : null}

      <div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-xl font-black">{P4P_MAKE_PREDICTION_LABEL}</h2>
          <p className="text-sm font-black uppercase tracking-[0.12em] text-emerald-800">
            {P4P_TAGLINE}
          </p>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block min-w-0 flex-1 text-sm font-semibold text-slate-700">
            5-minute slot
            <select
              value={playWindow?.index ?? 0}
              onChange={(event) => setWindowIndex(Number(event.target.value))}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-950"
            >
              {playableWindows.map((row) => {
                const predicted = alreadyPredictedWindow(
                  predictions,
                  fanId,
                  liveFixture,
                  row.index
                );
                return (
                  <option key={row.index} value={row.index}>
                    {row.label} · Game-Time {slot?.label}
                    {predicted ? " · predicted" : ""}
                  </option>
                );
              })}
            </select>
          </label>
          {countdown ? (
            <p
              data-testid="p4p-slot-countdown"
              className={`rounded-2xl border px-4 py-3 text-center text-sm font-black tabular-nums ${
                countdown.state === "live"
                  ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                  : countdown.state === "upcoming"
                    ? "border-slate-300 bg-white text-slate-800"
                    : "border-slate-300 bg-slate-100 text-slate-600"
              }`}
            >
              {countdown.label}
            </p>
          ) : null}
        </div>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black uppercase tracking-[0.14em] text-slate-700">
              What happens next? · {categoryIds.length}/{P4P_PREDICTIONS_PER_WINDOW} of 7
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {P4P_CATEGORIES.map((category) => {
                const selectedIndex = categoryIds.indexOf(category.id);
                const selected = selectedIndex >= 0;
                const full = categoryIds.length >= P4P_PREDICTIONS_PER_WINDOW;
                return (
                  <button
                    key={category.id}
                    type="button"
                    disabled={alreadyInWindow || (full && !selected)}
                    onClick={() =>
                      setCategoryIds((current) => {
                        if (current.includes(category.id)) {
                          return current.filter((id) => id !== category.id);
                        }
                        if (current.length >= P4P_PREDICTIONS_PER_WINDOW) {
                          return current;
                        }
                        return [...current, category.id];
                      })
                    }
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-bold ${
                      selected
                        ? "border-s4p-mark bg-s4p-mark text-black"
                        : "border-slate-300 bg-white text-slate-950 hover:border-s4p-mark"
                    } disabled:opacity-50`}
                  >
                    {category.label}
                    {selected ? ` · ${selectedIndex + 1}/${P4P_PREDICTIONS_PER_WINDOW}` : ""}
                  </button>
                );
              })}
            </div>
          </div>
          <aside
            data-testid="p4p-powered-by"
            className="w-full shrink-0 sm:w-44"
          >
            <p className="text-sm font-black uppercase tracking-[0.14em] text-slate-700">
              {P4P_POWERED_BY_LABEL}
            </p>
            <div className="mt-3 rounded-2xl border border-slate-300 bg-white p-4 text-center">
              <BrandMark
                name={sponsorBrand}
                logoUrl={sponsorLogo}
                large
                className="mx-auto h-20 w-20 text-xl"
              />
              <p className="mt-3 text-sm font-black text-slate-950">{sponsorBrand}</p>
            </div>
          </aside>
        </div>
        {countdown && countdown.state !== "upcoming" ? (
          <div className="mt-5">
            <p className="text-sm font-black uppercase tracking-[0.14em] text-slate-700">
              Awarded in this 5-minute slot
            </p>
            <p className="mt-1 text-sm text-slate-600">
              If one of the 3 chosen events is awarded in the match, that
              prediction earns another {formatP4pGbp(P4P_ACCURACY_GBP)}.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {P4P_CATEGORIES.map((category) => {
                const awarded = slotEventAwarded(
                  slotEvents,
                  liveFixture,
                  playWindow?.index ?? 0,
                  category.id
                );
                return (
                  <button
                    key={`award-${category.id}`}
                    type="button"
                    onClick={() => awardEvent(category.id)}
                    disabled={awarded}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-bold ${
                      awarded
                        ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                        : "border-slate-300 bg-white text-slate-950 hover:border-s4p-mark"
                    }`}
                  >
                    {awarded ? `${category.label} · awarded` : category.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div>
        <h2 className="text-xl font-black">{P4P_CHOOSE_PROJECT_LABEL}</h2>
        <label className="mt-3 block text-sm font-semibold text-slate-700">
          Climate Project
          <select
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-950"
          >
            {projects.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={predict}
          disabled={!canPredict}
          className="mt-5 w-full rounded-xl border border-transparent bg-green-500 py-4 font-bold text-slate-950 hover:bg-green-400 disabled:cursor-not-allowed disabled:border-slate-400 disabled:bg-slate-200 disabled:text-slate-800"
        >
          {alreadyInWindow
            ? "Already chosen 3 events this 5-minute slot"
            : `Predict 3 events · ${formatP4pGbp(P4P_PARTICIPATION_GBP)} participation`}
        </button>
        {error ? (
          <p role="alert" className="mt-3 rounded-xl border border-red-600 bg-red-50 p-3 text-sm font-semibold text-red-800">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p role="status" className="mt-3 rounded-xl border border-emerald-700 bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">
            {notice}
          </p>
        ) : null}
      </div>

      <div>
        <h2 className="text-xl font-black">{P4P_MATCH_DAY_IMPACT_LABEL}</h2>
        <div className="mt-4 rounded-2xl border border-emerald-700/30 bg-white p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800">
            {GAME_TIME_CARBON_WALLET_LABEL}
          </p>
          <p className="mt-2 text-3xl font-black text-emerald-800">
            {formatP4pGbp(remaining)}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {wallet
              ? `${wallet.brandName} bought the ${slot?.label} slot.`
              : `No Game-Time Sponsor has bought the ${slot?.label} slot yet.`}
          </p>
        </div>

        <div className="mt-4 rounded-2xl border border-emerald-700/30 bg-white p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800">
            {FAN_CARBON_WALLET_LABEL}
          </p>
          <p className="mt-2 text-3xl font-black text-emerald-800">
            {formatP4pGbp(fanWallet.totalGbp)}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            These amounts go to your chosen Climate Projects. Participating
            earns {formatP4pGbp(P4P_PARTICIPATION_GBP)}; if one of your 3 events
            is awarded you earn another {formatP4pGbp(P4P_ACCURACY_GBP)}.
          </p>
        </div>

        {predictions.length > 0 ? (
          <div className="mt-5">
            <h3 className="text-lg font-black">Your predictions this Game</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {predictions.map((row) => {
                const amounts = p4pPredictionAmounts(row);
                const status = amounts.correct
                  ? `accurate ${formatP4pGbp(amounts.totalGbp)}`
                  : `participation ${formatP4pGbp(amounts.participationGbp)}`;
                return (
                  <li key={row.id}>
                    {playableWindows.find((item) => item.index === row.windowIndex)?.label ||
                      `${row.windowIndex}`}:{" "}
                    {predictionCategoryIds(row)
                      .map(
                        (id) =>
                          P4P_CATEGORIES.find((item) => item.id === id)?.label ??
                          id
                      )
                      .join(", ")}{" "}
                    → {row.projectName} ({status})
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {credits.length > 0 ? (
          <div className="mt-5">
            <h3 className="text-lg font-black">Taken into Climate Projects</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {credits.map((row) => (
                <li key={row.projectName}>
                  {row.projectName}: {formatP4pGbp(row.amountGbp)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
