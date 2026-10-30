"use client";
/* s4p-predict-for-planet-v7 */

import { useMemo, useState } from "react";
import { PhoneFrame } from "@/app/components/home/PhoneFrame";
import { useOptionalSelectMatch } from "@/app/components/home/SelectMatchFixtures";
import {
  P4P_ACCURACY_GBP,
  P4P_CATEGORIES,
  P4P_ENGAGEMENT_GBP,
  P4P_LABEL,
  P4P_PARTICIPATION_GBP,
  P4P_POWERED_BY_LABEL,
  P4P_PREDICTIONS_PER_WINDOW,
  P4P_SHORT,
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
  fixtureName,
}: {
  src: string;
  alt: string;
  fixtureName?: string;
}) {
  const selectedMatch = useOptionalSelectMatch()?.selectedMatch ?? null;
  const fixture =
    fixtureName ||
    (selectedMatch
      ? `${selectedMatch.homeName} vs ${selectedMatch.awayName}`
      : null) ||
    "Game-Time Match";
  const window = p4pWindows()[3];
  const [picked, setPicked] = useState<P4pCategoryId[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const earnedGbp =
    picked.length === P4P_PREDICTIONS_PER_WINDOW ? P4P_PARTICIPATION_GBP : 0;

  function toggle(id: P4pCategoryId) {
    setPicked((current) => {
      if (current.includes(id)) {
        setNotice(null);
        return current.filter((row) => row !== id);
      }
      if (current.length >= P4P_PREDICTIONS_PER_WINDOW) return current;
      const next = [...current, id];
      if (next.length === P4P_PREDICTIONS_PER_WINDOW) {
        setNotice(
          `Participation ${formatP4pGbp(P4P_ENGAGEMENT_GBP)}. Right event +${formatP4pGbp(P4P_ACCURACY_GBP)}.`
        );
      }
      return next;
    });
  }

  return (
    <PhoneFrame
      src={src}
      alt={alt}
      width={244}
      height={581}
      screenClassName="[pointer-events:auto] max-md:min-h-[28rem] text-black md:rounded-[0_0_1.35rem_1.35rem]"
      screenStyle={{
        top: "8.2%",
        left: "6.4%",
        right: "6%",
        bottom: "5.6%",
        backgroundColor: "#fffdf8",
      }}
    >
      <div
        className="flex h-full flex-col px-3 pt-2.5 pb-2"
        onPointerDown={stopCarouselSwipe}
        aria-label={`${P4P_LABEL}. ${fixture}. ${window.label} slot.`}
      >
          <p
            className="text-[9px] font-black uppercase tracking-[0.18em]"
            style={{ color: MINT }}
          >
            {P4P_SHORT} · {P4P_LABEL}
          </p>
          <p className="mt-1 text-[12px] font-black leading-tight">{fixture}</p>
          <p className="mt-0.5 text-[9px] font-semibold text-slate-700">
            {window.label} · 3 of 7 this slot
          </p>
          <div
            className="mt-2 rounded-xl px-2 py-1.5 text-center text-[10px] font-black text-black"
            style={{ backgroundColor: MARK_GREEN }}
          >
            Game-Time Wallet {formatP4pGbp(earnedGbp)}
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
              const selectedIndex = picked.indexOf(category.id);
              const selected = selectedIndex >= 0;
              const full = picked.length >= P4P_PREDICTIONS_PER_WINDOW;
              return (
                <button
                  key={category.id}
                  type="button"
                  disabled={full && !selected}
                  onPointerDown={stopCarouselSwipe}
                  onClick={() => toggle(category.id)}
                  className={`flex w-full items-center justify-between rounded-lg border px-2 py-1.5 text-left text-[10px] font-bold [touch-action:manipulation] ${
                    selected
                      ? "border-s4p-mark bg-s4p-mark text-black"
                      : "border-slate-300 bg-white text-slate-950"
                  } disabled:opacity-50`}
                >
                  <span>{category.label}</span>
                  {selected ? (
                    <span>
                      {selectedIndex + 1}/{P4P_PREDICTIONS_PER_WINDOW}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-[9px] font-semibold leading-4 text-slate-700">
            {notice ||
              `Participating earns ${formatP4pGbp(P4P_ENGAGEMENT_GBP)}. The right event earns another ${formatP4pGbp(P4P_ACCURACY_GBP)}.`}
          </p>
      </div>
    </PhoneFrame>
  );
}

export function PredictForPlanetPanel({
  badge,
  title,
  number,
  caption,
  points,
}: {
  badge?: string;
  title: string;
  number?: string;
  caption: string;
  points: string[];
}) {
  const slots = useMemo(() => gameTimeSlots(), []);
  const step = String(number ?? "").replace(/^0/, "");
  return (
    <div className="min-w-0 flex-1">
      {badge ? <p className={STEP_TAB_CLASS}>{badge}</p> : null}
      <h3 className="mt-2 text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl md:text-5xl">
        {step ? `${step}. ` : null}
        {title}
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
        <p className="text-sm font-semibold leading-6">
          Global Brands buy a 30-minute Game-Time slot
          {slots.map((slot) => ` (${slot.label})`).join("")}. That is fan
          engagement, not a 5-day Match-Sponsorship.
        </p>
      </div>
    </div>
  );
}
