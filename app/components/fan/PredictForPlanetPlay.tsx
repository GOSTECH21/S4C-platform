"use client";

import { useEffect, useMemo, useState } from "react";
import { BrandMark } from "@/app/components/club/BrandMark";
import {
  GAME_TIME_CARBON_WALLET_LABEL,
  GAME_TIME_SLOT_COUNT,
  P4P_CATEGORIES,
  P4P_ENGAGEMENT_GBP,
  P4P_FALLBACK_PROJECTS,
  P4P_LABEL,
  P4P_SHORT,
  P4P_WINDOW_MINUTES,
  SPONSORED_BY_LABEL,
  firstFundedWindowIndex,
  formatP4pGbp,
  gameTimeFixtureMatches,
  gameTimeSlots,
  p4pCreditsByProject,
  p4pWindows,
  pickSponsoredGameTimeMatch,
  remainingGameTimeGbp,
  type P4pCategoryId,
} from "@/app/lib/predict-for-planet";
import { loadBrandLogo } from "@/app/services/climate-sponsors.service";
import {
  depositGameTimeSponsorship,
  gameTimeWalletForSlot,
  listGameTimeWallets,
  listP4pPredictions,
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
  const windows = useMemo(() => p4pWindows(), []);
  const slots = useMemo(() => gameTimeSlots(), []);
  const [windowIndex, setWindowIndex] = useState(0);
  const [categoryId, setCategoryId] = useState<P4pCategoryId | "">("");
  const [projectName, setProjectName] = useState(projects[0] ?? "");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const seedBrand = seedWallet?.brandName ?? "";
  const seedAmount = seedWallet?.amountGbp ?? 0;
  const shouldSeed = Boolean(seedWallet);

  useEffect(() => {
    setHydrated(true);
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
  const window = windows[windowIndex] ?? windows[0];
  const slot = slots[window?.slotIndex ?? 0];
  const wallet =
    liveClub && liveFixture
      ? gameTimeWalletForSlot({
          clubName: liveClub,
          fixtureName: liveFixture,
          slotIndex: window?.slotIndex ?? 0,
        })
      : null;
  const remaining = wallet ? remainingGameTimeGbp(wallet) : 0;
  const sponsorBrand = wallet?.brandName || sponsored?.brandName || "";
  const sponsorLogo =
    loadBrandLogo(sponsorBrand) || sponsorLogoSrc(sponsorBrand, null);
  const canPredict = Boolean(wallet && remaining > 0 && categoryId && projectName);
  const predictions = listP4pPredictions().filter(
    (row) =>
      row.fanId.toLowerCase() === fanId.toLowerCase() &&
      liveFixture &&
      gameTimeFixtureMatches(row.fixtureName, liveFixture)
  );
  const credits = p4pCreditsByProject(
    listP4pPredictions().filter(
      (row) => liveFixture && gameTimeFixtureMatches(row.fixtureName, liveFixture)
    )
  );
  void tick;

  useEffect(() => {
    if (!liveClub || !liveFixture) return;
    setWindowIndex(firstFundedWindowIndex(listGameTimeWallets(), liveClub, liveFixture));
  }, [liveClub, liveFixture]);

  function predict() {
    setNotice(null);
    setError(null);
    if (!liveClub || !liveFixture) {
      setError("P4P is played on the Match a Game-Time Sponsor has put money into their Carbon Wallet for.");
      return;
    }
    const result = submitP4pPrediction({
      fanId,
      clubName: liveClub,
      fixtureName: liveFixture,
      windowIndex,
      categoryId,
      projectName,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const taken = formatP4pGbp(result.takenGbp);
    const left = result.wallet
      ? formatP4pGbp(remainingGameTimeGbp(result.wallet))
      : formatP4pGbp(0);
    setNotice(
      `Engagement. ${taken} left the ${GAME_TIME_CARBON_WALLET_LABEL} into ${projectName}. Wallet now ${left}.`
    );
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
    <section className="space-y-6 text-slate-950">
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
        <p className="mt-3 max-w-3xl text-slate-700">
          Predict what is likely to happen in the next {P4P_WINDOW_MINUTES}-minute
          slot. One prediction per slot — right or wrong, it is an Engagement of{" "}
          {formatP4pGbp(P4P_ENGAGEMENT_GBP)} from the {GAME_TIME_CARBON_WALLET_LABEL}{" "}
          into your chosen Climate Project.
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-700/30 bg-white p-5">
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

      <label className="block text-sm font-semibold text-slate-700">
        5-minute slot
        <select
          value={windowIndex}
          onChange={(event) => setWindowIndex(Number(event.target.value))}
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-950"
        >
          {windows.map((row) => (
            <option key={row.index} value={row.index}>
              {row.label} · Game-Time {slots[row.slotIndex]?.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-semibold text-slate-700">
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black uppercase tracking-[0.14em] text-slate-700">
            What happens next?
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {P4P_CATEGORIES.map((category) => {
              const selected = categoryId === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setCategoryId(category.id)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm font-bold ${
                    selected
                      ? "border-s4p-mark bg-s4p-mark text-black"
                      : "border-slate-300 bg-white text-slate-950 hover:border-s4p-mark"
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>
        <aside className="w-full shrink-0 sm:w-44">
          <p className="text-sm font-black uppercase tracking-[0.14em] text-slate-700">
            {SPONSORED_BY_LABEL}
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

      <button
        type="button"
        onClick={predict}
        disabled={!canPredict}
        className="w-full rounded-xl bg-green-500 py-4 font-bold text-slate-950 hover:bg-green-400 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
      >
        Predict · {formatP4pGbp(P4P_ENGAGEMENT_GBP)} Engagement
      </button>

      {error ? (
        <p role="alert" className="rounded-xl border border-red-600 bg-red-50 p-3 text-sm font-semibold text-red-800">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="rounded-xl border border-emerald-700 bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">
          {notice}
        </p>
      ) : null}

      {predictions.length > 0 ? (
        <div>
          <h2 className="text-xl font-black">Your predictions this Game</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {predictions.map((row) => (
              <li key={row.id}>
                {windows[row.windowIndex]?.label}:{" "}
                {P4P_CATEGORIES.find((item) => item.id === row.categoryId)?.label}{" "}
                → {row.projectName} ({formatP4pGbp(row.engagementGbp)})
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {credits.length > 0 ? (
        <div>
          <h2 className="text-xl font-black">Taken into Climate Projects</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {credits.map((row) => (
              <li key={row.projectName}>
                {row.projectName}: {formatP4pGbp(row.amountGbp)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
