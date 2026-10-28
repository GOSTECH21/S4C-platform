"use client";
/* s4p-predict-for-planet-v4 */

import { useMemo, useState } from "react";
import Image from "next/image";
import { useSelectMatch } from "@/app/components/home/SelectMatchFixtures";
import {
  P4P_ACCURACY_GBP,
  P4P_CATEGORIES,
  P4P_ENGAGEMENT_GBP,
  P4P_LABEL,
  P4P_POWERED_BY_LABEL,
  P4P_SHORT,
  P4P_WINDOW_MINUTES,
  formatP4pGbp,
  gameTimeSlots,
  p4pWindows,
  type P4pCategoryId,
} from "@/app/lib/predict-for-planet";

const MARK_GREEN = "#5bc662";
const MINT = "#0c5c2c";
const STEP_TAB_CLASS =
  "inline-flex items-center rounded-full bg-s4p-mark px-3 py-1 text-sm font-black text-black";

function stopCarouselSwipe(event: React.PointerEvent) {
  event.stopPropagation();
}

export function PredictForPlanetPhone({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const { selectedMatch } = useSelectMatch();
  const fixture = selectedMatch
    ? `${selectedMatch.homeName} vs ${selectedMatch.awayName}`
    : "Arsenal vs Chelsea";
  const window = p4pWindows()[3];
  const [picked, setPicked] = useState<P4pCategoryId | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function predict(id: P4pCategoryId) {
    if (picked) return;
    setPicked(id);
    const category = P4P_CATEGORIES.find((row) => row.id === id);
    setNotice(
      `Participation ${formatP4pGbp(P4P_ENGAGEMENT_GBP)}. Right event +${formatP4pGbp(P4P_ACCURACY_GBP)}.`
    );
    return category;
  }

  return (
    <>
      <Image
        src={src}
        alt={alt}
        width={244}
        height={581}
        className="h-auto w-full"
        unoptimized
      />
      <div
        className="absolute z-20 overflow-hidden [pointer-events:auto]"
        onPointerDown={stopCarouselSwipe}
        style={{
          top: "8.2%",
          left: "6.4%",
          right: "6%",
          bottom: "5.6%",
          backgroundColor: "#fffdf8",
          borderRadius: "0 0 1.35rem 1.35rem",
          color: "#000000",
        }}
        aria-label={`${P4P_LABEL}. ${fixture}. ${window.label} slot.`}
      >
        <div className="flex h-full flex-col px-3 pt-2.5 pb-2">
          <p
            className="text-[9px] font-black uppercase tracking-[0.18em]"
            style={{ color: MINT }}
          >
            {P4P_SHORT} · {P4P_LABEL}
          </p>
          <p className="mt-1 text-[12px] font-black leading-tight">{fixture}</p>
          <p className="mt-0.5 text-[9px] font-semibold text-slate-700">
            {window.label} · 1 prediction this slot
          </p>
          <div
            className="mt-2 rounded-xl px-2 py-1.5 text-center text-[10px] font-black text-black"
            style={{ backgroundColor: MARK_GREEN }}
          >
            Game-Time Wallet {formatP4pGbp(12.4)}
          </div>
          <div className="mt-2 flex items-start gap-2">
            <p className="min-w-0 flex-1 text-[9px] font-black uppercase tracking-[0.14em] text-slate-700">
              What happens next?
            </p>
            <aside className="w-[4.6rem] shrink-0 text-center">
              <p className="text-[6px] font-black uppercase leading-3 tracking-[0.08em] text-slate-700">
                {P4P_POWERED_BY_LABEL}
              </p>
              <div
                className="mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-md text-[8px] font-black text-black"
                style={{ backgroundColor: MARK_GREEN }}
              >
                ES
              </div>
              <p className="mt-0.5 text-[7px] font-black">EA Sports</p>
            </aside>
          </div>
          <div className="mt-1.5 min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain [touch-action:pan-y]">
            {P4P_CATEGORIES.map((category) => {
              const selected = picked === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  disabled={Boolean(picked) && !selected}
                  onPointerDown={stopCarouselSwipe}
                  onClick={() => predict(category.id)}
                  className={`flex w-full items-center justify-between rounded-lg border px-2 py-1.5 text-left text-[10px] font-bold [touch-action:manipulation] ${
                    selected
                      ? "border-s4p-mark bg-s4p-mark text-black"
                      : "border-slate-300 bg-white text-slate-950"
                  } disabled:opacity-50`}
                >
                  <span>{category.label}</span>
                  {selected ? <span>1/{P4P_WINDOW_MINUTES} min</span> : null}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-[9px] font-semibold leading-4 text-slate-700">
            {notice ||
              `Participating earns ${formatP4pGbp(P4P_ENGAGEMENT_GBP)}. The right event earns another ${formatP4pGbp(P4P_ACCURACY_GBP)}.`}
          </p>
        </div>
      </div>
    </>
  );
}

export function PredictForPlanetPanel({
  badge,
  title,
  number,
  caption,
  points,
}: {
  badge: string;
  title: string;
  number: string;
  caption: string;
  points: string[];
}) {
  const slots = useMemo(() => gameTimeSlots(), []);
  return (
    <div className="min-w-0 flex-1">
      <p className={STEP_TAB_CLASS}>{badge}</p>
      <h3 className="mt-2 text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl md:text-5xl">
        {number.replace(/^0/, "")}. {title}
      </h3>
      <p className="mt-4 max-w-xl text-base font-semibold leading-7 sm:text-lg sm:leading-8">
        {caption}
      </p>
      <ul className="mt-5 space-y-3">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-3">
            <span
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-sm font-black text-black"
              style={{ backgroundColor: MARK_GREEN }}
              aria-hidden
            >
              ✓
            </span>
            <span className="text-sm font-semibold leading-6 sm:text-base">
              {point}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-6 max-w-xl rounded-[1.4rem] border border-emerald-400/30 bg-s4p-paper px-5 py-5">
        <p
          className="text-xs font-black uppercase tracking-[0.18em]"
          style={{ color: MINT }}
        >
          Eight {P4P_SHORT} prediction categories
        </p>
        <ol className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {P4P_CATEGORIES.map((category, index) => (
            <li key={category.id} className="text-sm font-semibold">
              {index + 1}. {category.label}
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm font-semibold leading-6">
          Global Brands buy a 30-minute Game-Time slot
          {slots.map((slot) => ` (${slot.label})`).join("")}. That is fan
          engagement, not a 5-day Match-Sponsorship.
        </p>
      </div>
    </div>
  );
}
