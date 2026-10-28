"use client";

import { useEffect, useMemo, useState } from "react";
import {
  GAME_TIME_CARBON_WALLET_LABEL,
  GAME_TIME_SLOT_COUNT,
  P4P_CATEGORIES,
  P4P_ENGAGEMENT_GBP,
  P4P_FALLBACK_PROJECTS,
  P4P_LABEL,
  P4P_SHORT,
  P4P_WINDOW_MINUTES,
  formatP4pGbp,
  gameTimeSlots,
  p4pCreditsByProject,
  p4pWindows,
  remainingGameTimeGbp,
  type P4pCategoryId,
} from "@/app/lib/predict-for-planet";
import {
  depositGameTimeSponsorship,
  gameTimeWalletForSlot,
  listP4pPredictions,
  submitP4pPrediction,
} from "@/app/services/predict-for-planet.service";

export function PredictForPlanetPlay({
  fanId,
  clubName,
  fixtureName,
  projects = P4P_FALLBACK_PROJECTS,
  seedWallet,
}: {
  fanId: string;
  clubName: string;
  fixtureName: string;
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
  const seedBrand = seedWallet?.brandName ?? "";
  const seedAmount = seedWallet?.amountGbp ?? 0;
  const shouldSeed = Boolean(seedWallet);

  useEffect(() => {
    if (!shouldSeed || !seedBrand) return;
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
  }, [clubName, fixtureName, seedAmount, seedBrand, shouldSeed]);

  const window = windows[windowIndex] ?? windows[0];
  const slot = slots[window?.slotIndex ?? 0];
  const wallet = gameTimeWalletForSlot({
    clubName,
    fixtureName,
    slotIndex: window?.slotIndex ?? 0,
  });
  const remaining = wallet ? remainingGameTimeGbp(wallet) : 0;
  const predictions = listP4pPredictions().filter(
    (row) =>
      row.fanId.toLowerCase() === fanId.toLowerCase() &&
      row.fixtureName.toLowerCase() === fixtureName.toLowerCase()
  );
  const credits = p4pCreditsByProject(listP4pPredictions());
  void tick;

  function predict() {
    setNotice(null);
    setError(null);
    const result = submitP4pPrediction({
      fanId,
      clubName,
      fixtureName,
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
      result.takenGbp > 0
        ? `Engagement. ${taken} left the ${GAME_TIME_CARBON_WALLET_LABEL} into ${projectName}. Wallet now ${left}.`
        : `Prediction recorded. The ${GAME_TIME_CARBON_WALLET_LABEL} is ${formatP4pGbp(0)}.`
    );
    setCategoryId("");
    setTick((value) => value + 1);
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          {P4P_SHORT} · {P4P_LABEL}
        </p>
        <h1 className="mt-2 text-4xl font-black">{fixtureName}</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Predict what is likely to happen in the next {P4P_WINDOW_MINUTES}-minute
          slot. One prediction per slot — right or wrong, it is an Engagement of{" "}
          {formatP4pGbp(P4P_ENGAGEMENT_GBP)} from the {GAME_TIME_CARBON_WALLET_LABEL}{" "}
          into your chosen Climate Project.
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-400/30 bg-slate-950/70 p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
          {GAME_TIME_CARBON_WALLET_LABEL}
        </p>
        <p className="mt-2 text-3xl font-black text-s4p-mark">
          {formatP4pGbp(remaining)}
        </p>
        <p className="mt-1 text-sm text-slate-400">
          {wallet
            ? `${wallet.brandName} bought the ${slot?.label} slot.`
            : `No Game-Time Sponsor has bought the ${slot?.label} slot yet.`}
        </p>
      </div>

      <label className="block text-sm text-slate-400">
        5-minute slot
        <select
          value={windowIndex}
          onChange={(event) => setWindowIndex(Number(event.target.value))}
          className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
        >
          {windows.map((row) => (
            <option key={row.index} value={row.index}>
              {row.label} · Game-Time {slots[row.slotIndex]?.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm text-slate-400">
        Climate Project
        <select
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
          className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
        >
          {projects.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>

      <div>
        <p className="text-sm font-black uppercase tracking-[0.14em] text-slate-400">
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
                    ? "border-s4p-mark bg-s4p-mark text-slate-950"
                    : "border-slate-700 bg-slate-900 text-slate-100 hover:border-s4p-mark"
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={predict}
        className="w-full rounded-xl bg-green-500 py-4 font-bold text-slate-950 hover:bg-green-400"
      >
        Predict · {formatP4pGbp(P4P_ENGAGEMENT_GBP)} Engagement
      </button>

      {error ? (
        <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="rounded-xl border border-green-500/40 bg-green-500/10 p-3 text-sm text-green-300">
          {notice}
        </p>
      ) : null}

      {predictions.length > 0 ? (
        <div>
          <h2 className="text-xl font-black">Your predictions this Game</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
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
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
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
