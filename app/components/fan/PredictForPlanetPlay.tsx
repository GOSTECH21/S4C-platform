"use client";
/* s4p-predict-for-planet-v7 */
/* p4p-timer-complete-v1 */
/* p4p-stay-on-tab-v1 */
/* p4p-public-board-v1 */
/* p4p-fund-project-v1 */

import { useEffect, useMemo, useState } from "react";
import { BrandMark } from "@/app/components/club/BrandMark";
import {
  GAME_TIME_CARBON_WALLET_LABEL,
  GAME_TIME_SLOT_COUNT,
  GAME_TIME_SPONSOR_LABEL,
  GAME_TIME_SPONSORSHIP_LABEL,
  GAME_TIME_WALLET_LABEL,
  P4P_SHORT,
  P4P_AWAITING_NEW_SPONSORED_LABEL,
  P4P_CATEGORIES,
  P4P_CHOOSE_PROJECT_LABEL,
  FAN_CARBON_WALLET_LABEL,
  P4P_ACCURACY_GBP,
  P4P_CORRECT_TOTAL_GBP,
  P4P_ELIGIBLE_PREDICTIONS_LABEL,
  P4P_FALLBACK_PROJECTS,
  P4P_FAN_WALLET_SHORT_COPY,
  P4P_FUND_PROJECT_LABEL,
  P4P_MAKE_PREDICTION_LABEL,
  P4P_MATCH_DAY_IMPACT_LABEL,
  P4P_PARTICIPATION_GBP,
  P4P_POWERED_BY_LABEL,
  P4P_PREDICT_NEXT_LABEL,
  P4P_PREDICTIONS_PER_WINDOW,
  P4P_SLOT_COMPLETE_LABEL,
  P4P_TAGLINE,
  P4P_WINDOW_TIMER_LABEL,
  alreadyPredictedWindow,
  fanCarbonWalletFromPredictions,
  formatP4pClock,
  p4pMatchIsFullTime,
  firstFundedWindowIndex,
  formatP4pGbp,
  gameTimeFixtureMatches,
  gameTimeSlotIsComplete,
  gameTimeSlotShortLabel,
  gameTimeSlots,
  gameTimeWalletMatchesMatch,
  isWindowInGameTimeSlot,
  p4pIsAfterMatchDay,
  p4pLiveChallenge,
  p4pPredictionAmounts,
  p4pWindowCountdown,
  remainingGameTimeGbp,
  windowsForGameTimeSlot,
  pickSponsoredGameTimeMatch,
  type P4pCategoryId,
} from "@/app/lib/predict-for-planet";
import { loadBrandLogo } from "@/app/services/climate-sponsors.service";
import {
  depositGameTimeSponsorship,
  fundP4pProject,
  gameTimeWalletForSlot,
  listGameTimeWallets,
  listP4pPredictions,
  listP4pProjectAllocations,
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
  forceAwaiting = false,
}: {
  fanId: string;
  clubName?: string;
  fixtureName?: string;
  preferredClubNames?: string[];
  projects?: string[];
  seedWallet?: {
    brandName: string;
    amountGbp: number;
    kickoffAt?: string;
    slotIndex?: number;
  };
  forceAwaiting?: boolean;
}) {
  const slots = useMemo(() => gameTimeSlots(), []);
  const [windowIndex, setWindowIndex] = useState(0);
  const [categoryIds, setCategoryIds] = useState<P4pCategoryId[]>([]);
  const [projectName, setProjectName] = useState(projects[0] ?? "");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fundNotice, setFundNotice] = useState<string | null>(null);
  const [fundError, setFundError] = useState<string | null>(null);
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

  const seedKickoff = seedWallet?.kickoffAt;
  const seedSlotIndex = seedWallet?.slotIndex;

  useEffect(() => {
    if (!hydrated || !shouldSeed || !seedBrand || !clubName || !fixtureName) return;
    const kickoffAt = seedKickoff || new Date().toISOString();
    const slots =
      seedSlotIndex === undefined
        ? Array.from({ length: GAME_TIME_SLOT_COUNT }, (_, index) => index)
        : [seedSlotIndex];
    let seeded = false;
    for (const slotIndex of slots) {
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
    if (seeded) {
      setNow(new Date());
      setTick((value) => value + 1);
    }
  }, [
    clubName,
    fixtureName,
    hydrated,
    seedAmount,
    seedBrand,
    seedKickoff,
    seedSlotIndex,
    shouldSeed,
  ]);

  const wallets = hydrated ? listGameTimeWallets() : [];
  const seededWallets =
    shouldSeed && clubName && fixtureName
      ? wallets.filter((row) =>
          gameTimeWalletMatchesMatch(row, clubName, fixtureName)
        )
      : [];
  const sponsoredFromSeed =
    shouldSeed && clubName && fixtureName
      ? pickSponsoredGameTimeMatch(
          seededWallets,
          preferredClubNames.length > 0 ? preferredClubNames : [clubName],
          now
        )
      : null;
  const seedStillMatchDay =
    shouldSeed &&
    clubName &&
    fixtureName &&
    !p4pIsAfterMatchDay(seedKickoff || new Date(), now);
  const sponsored = forceAwaiting
    ? null
    : sponsoredFromSeed ??
      pickSponsoredGameTimeMatch(wallets, preferredClubNames, now) ??
      (hydrated && seedStillMatchDay
        ? {
            clubName,
            fixtureName,
            brandName: seedBrand,
            remainingGbp: seedAmount,
            slotIndex: seedSlotIndex ?? 0,
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
  const allocations = hydrated
    ? listP4pProjectAllocations().filter(
        (row) =>
          row.fanId.toLowerCase() === fanId.toLowerCase() &&
          liveFixture &&
          gameTimeFixtureMatches(row.fixtureName, liveFixture)
      )
    : [];
  const slotEvents = hydrated ? listP4pSlotEvents() : [];
  const fanWallet = fanCarbonWalletFromPredictions(
    predictions,
    fanId,
    allocations
  );
  const fullTime = Boolean(
    wallet && p4pMatchIsFullTime(wallet.kickoffAt, now)
  );
  const slotComplete = Boolean(
    wallet &&
      gameTimeSlotIsComplete({
        kickoffAt: wallet.kickoffAt,
        slotIndex,
        now,
        predictions,
        fanId,
        fixtureName: liveFixture,
      })
  );
  const alreadyInWindow = alreadyPredictedWindow(
    predictions,
    fanId,
    liveFixture,
    playWindow?.index ?? 0
  );
  const windowAllowed = isWindowInGameTimeSlot(playWindow?.index ?? -1, slotIndex);
  const countdown = wallet && playWindow
    ? p4pWindowCountdown(wallet.kickoffAt, playWindow, now)
    : null;
  const canPredict = Boolean(
    wallet &&
      remaining > 0 &&
      categoryIds.length === P4P_PREDICTIONS_PER_WINDOW &&
      projectName &&
      windowAllowed &&
      !alreadyInWindow &&
      !slotComplete &&
      countdown?.state !== "ended"
  );
  const canFundProject = Boolean(projectName) && fanWallet.totalGbp > 0;
  const challenge = wallet
    ? p4pLiveChallenge(wallet, allPredictions)
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

  useEffect(() => {
    if (fullTime) return;
    if (countdown?.state !== "ended") return;
    setCategoryIds((current) => (current.length === 0 ? current : []));
    setNotice(null);
    setError(null);
    const currentIndex = playWindow?.index;
    if (currentIndex === undefined) return;
    const next = windowsForGameTimeSlot(slotIndex).find(
      (row) => row.index === currentIndex + 1
    );
    if (next) setWindowIndex(next.index);
  }, [
    countdown?.remainingSeconds,
    countdown?.state,
    fullTime,
    playWindow?.index,
    slotIndex,
  ]);

  function predict() {
    setNotice(null);
    setError(null);
    if (!liveClub || !liveFixture) {
      setError(`P4P is played on the Match a ${GAME_TIME_SPONSOR_LABEL} has put money into their Carbon Wallet for.`);
      return;
    }
    if (!windowAllowed) {
      setError(
        `That 5-minute slot is not in this ${GAME_TIME_SPONSORSHIP_LABEL}. The ${GAME_TIME_SPONSOR_LABEL} bought ${slot?.label ?? "a different 30-minute slot"}.`
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
        `Accurate prediction. ${formatP4pGbp(amounts.totalGbp)} is in your ${FAN_CARBON_WALLET_LABEL} for ${projectName} (${formatP4pGbp(amounts.participationGbp)} participation + ${formatP4pGbp(amounts.accuracyGbp)} accuracy). ${GAME_TIME_WALLET_LABEL} now ${left}.`
      );
    } else {
      setNotice(
        `Participation. ${formatP4pGbp(amounts.participationGbp)} is in your ${FAN_CARBON_WALLET_LABEL} for ${projectName}. If one of those events is awarded in this slot, you earn another ${formatP4pGbp(P4P_ACCURACY_GBP)} (total ${formatP4pGbp(P4P_CORRECT_TOTAL_GBP)}). ${GAME_TIME_WALLET_LABEL} now ${left}.`
      );
    }
    setTick((value) => value + 1);
  }

  function fundProject() {
    setFundNotice(null);
    setFundError(null);
    if (!liveClub || !liveFixture) {
      setFundError(
        `P4P is played on the Match a ${GAME_TIME_SPONSOR_LABEL} has put money into their Carbon Wallet for.`
      );
      return;
    }
    const result = fundP4pProject({
      fanId,
      clubName: liveClub,
      fixtureName: liveFixture,
      projectName,
    });
    if (!result.ok) {
      setFundError(result.error);
      return;
    }
    setFundNotice(
      `${formatP4pGbp(result.allocation.amountGbp)} from your ${FAN_CARBON_WALLET_LABEL} is now funding ${projectName}. ${FAN_CARBON_WALLET_LABEL} now ${formatP4pGbp(0)}.`
    );
    setTick((value) => value + 1);
  }

  const awardedThisSlot = P4P_CATEGORIES.filter((category) =>
    slotEventAwarded(
      slotEvents,
      liveFixture,
      playWindow?.index ?? 0,
      category.id
    )
  );

  if (!hydrated) {
    return null;
  }

  if (!sponsored) {
    return (
      <section
        data-testid="p4p-awaiting-sponsored"
        data-p4p-awaiting="p4p-timer-complete-v1"
        className="rounded-2xl border border-emerald-700/30 bg-white p-6 text-center text-slate-950"
      >
        <h2 className="text-3xl font-black">{P4P_AWAITING_NEW_SPONSORED_LABEL}</h2>
      </section>
    );
  }

  return (
    <section
      data-testid="p4p-match"
      data-wallet-count={wallets.length}
      className="space-y-8 text-slate-950"
    >
      <div data-testid="p4p-make-prediction">
        {liveFixture ? (
          <div className="mb-5">
            <h2
              data-testid="p4p-sponsored-game"
              className="text-3xl font-black"
            >
              {liveFixture}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {GAME_TIME_SPONSOR_LABEL} · {gameTimeSlotShortLabel(slot)}
              {slotComplete ? (
                <span
                  data-testid="p4p-slot-complete"
                  className="ml-2 inline-flex items-center rounded-full bg-s4p-mark px-2 py-0.5 text-xs font-black tracking-[0.12em] text-black"
                >
                  {P4P_SLOT_COMPLETE_LABEL}
                </span>
              ) : null}
            </p>
          </div>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h3 className="text-xl font-black">{P4P_MAKE_PREDICTION_LABEL}</h3>
          <p className="text-sm font-black uppercase tracking-[0.12em] text-emerald-800">
            {P4P_TAGLINE}
          </p>
        </div>
        {countdown ? (
          <div
            data-p4p-slot-timer="p4p-timer-complete-v1"
            data-testid="p4p-slot-timer"
            data-p4p-timer-state={countdown.state}
            data-p4p-remaining={String(countdown.remainingSeconds)}
            aria-live="polite"
            className={`mt-4 rounded-2xl border-2 px-4 py-4 ${
              countdown.state === "live"
                ? "border-emerald-700 bg-emerald-50"
                : countdown.state === "upcoming"
                  ? "border-slate-300 bg-white"
                  : "border-slate-300 bg-slate-100"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-800">
                  {P4P_WINDOW_TIMER_LABEL}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {playWindow?.label}
                  {slotComplete ? ` · ${P4P_SLOT_COMPLETE_LABEL}` : ""}
                </p>
              </div>
              <p className="shrink-0 text-5xl font-black tabular-nums leading-none text-emerald-900">
                {formatP4pClock(countdown.remainingSeconds)}
              </p>
            </div>
            <p
              data-testid="p4p-slot-countdown"
              className="mt-3 text-sm font-black text-slate-800"
            >
              {slotComplete ? P4P_SLOT_COMPLETE_LABEL : countdown.label}
            </p>
          </div>
        ) : null}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block min-w-0 flex-1 text-sm font-semibold text-slate-700">
            5-minute slot
            {slotComplete ? ` · ${P4P_SLOT_COMPLETE_LABEL}` : ""}
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
                    {row.label} · {P4P_SHORT} {slot?.label}
                    {predicted ? " · predicted" : ""}
                    {slotComplete ? ` · ${P4P_SLOT_COMPLETE_LABEL}` : ""}
                  </option>
                );
              })}
            </select>
          </label>
        </div>
        <div className="mt-3">
          <p className="text-sm font-black uppercase tracking-[0.14em] text-slate-700">
            {P4P_PREDICT_NEXT_LABEL} · {categoryIds.length}/{P4P_PREDICTIONS_PER_WINDOW} of 7
          </p>
          <aside
            data-testid="p4p-powered-by"
            className="mt-3 rounded-2xl border border-slate-300 bg-white p-5 text-center"
          >
            <p className="text-sm font-black uppercase tracking-[0.14em] text-slate-700">
              {P4P_POWERED_BY_LABEL}
            </p>
            <BrandMark
              name={sponsorBrand}
              logoUrl={sponsorLogo}
              large
              className="mx-auto mt-3 h-28 w-28 text-3xl"
            />
            <p className="mt-3 text-xl font-black text-slate-950">{sponsorBrand}</p>
          </aside>
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
                  className={`rounded-xl border px-4 py-4 text-left text-base font-black ${
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
        <button
          type="button"
          onClick={predict}
          disabled={!canPredict}
          className="mt-5 w-full rounded-xl border border-transparent bg-green-500 py-4 font-bold text-slate-950 hover:bg-green-400 disabled:cursor-not-allowed disabled:border-slate-400 disabled:bg-slate-200 disabled:text-slate-800"
        >
          {slotComplete
            ? `This ${P4P_SHORT} slot is ${P4P_SLOT_COMPLETE_LABEL}`
            : alreadyInWindow
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

      {awardedThisSlot.length > 0 ? (
        <div data-testid="p4p-awarded-slot">
          <p className="text-sm font-black uppercase tracking-[0.14em] text-slate-700">
            Awarded in this 5-minute slot
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {awardedThisSlot.map((category) => (
              <li
                key={`award-${category.id}`}
                className="rounded-xl border border-emerald-700 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900"
              >
                {category.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div data-testid="p4p-match-day-impact">
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
              : `No ${GAME_TIME_SPONSOR_LABEL} has bought the ${slot?.label} slot yet.`}
          </p>
        </div>

        <div
          data-testid="p4p-eligible-predictions"
          className="mt-4 rounded-2xl border border-emerald-700/30 bg-white p-5"
        >
          <p className="text-sm text-slate-600">
            {P4P_ELIGIBLE_PREDICTIONS_LABEL}
          </p>
          <p className="mt-1 text-3xl font-black tabular-nums">
            {(challenge?.eligiblePredictions ?? 0).toLocaleString("en-GB")}
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
            {P4P_FAN_WALLET_SHORT_COPY}
          </p>
        </div>

        <label className="mt-5 block text-sm font-semibold text-slate-700">
          {P4P_CHOOSE_PROJECT_LABEL}
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
          data-testid="p4p-fund-project"
          onClick={fundProject}
          disabled={!canFundProject}
          className="mt-5 w-full rounded-xl border border-transparent bg-green-500 py-4 font-bold text-slate-950 hover:bg-green-400 disabled:cursor-not-allowed disabled:border-slate-400 disabled:bg-slate-200 disabled:text-slate-800"
        >
          {canFundProject
            ? `${P4P_FUND_PROJECT_LABEL} · ${formatP4pGbp(fanWallet.totalGbp)}`
            : P4P_FUND_PROJECT_LABEL}
        </button>
        {fundError ? (
          <p
            role="alert"
            className="mt-3 rounded-xl border border-red-600 bg-red-50 p-3 text-sm font-semibold text-red-800"
          >
            {fundError}
          </p>
        ) : null}
        {fundNotice ? (
          <p
            role="status"
            data-testid="p4p-fund-project-status"
            className="mt-3 rounded-xl border border-emerald-700 bg-emerald-50 p-3 text-sm font-semibold text-emerald-900"
          >
            {fundNotice}
          </p>
        ) : null}
      </div>
    </section>
  );
}
