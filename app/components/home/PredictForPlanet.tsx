"use client";
/* s4p-predict-for-planet-v7 */
/* p4p-slot-timer-v1 */
/* p4p-slot-wipe-v1 */

import { useEffect, useState } from "react";
import { BrandMark } from "@/app/components/club/BrandMark";
import { PhoneFrame } from "@/app/components/home/PhoneFrame";
import { useOptionalSelectMatch } from "@/app/components/home/SelectMatchFixtures";
import { clubInitials, clubLogoSrc } from "@/app/lib/club-logos";
import { fixtureSides } from "@/app/lib/club-fixtures";
import {
  P4P_ACCURACY_GBP,
  P4P_CATEGORIES,
  P4P_ENGAGEMENT_GBP,
  P4P_LABEL,
  P4P_POWERED_BY_LABEL,
  P4P_PREDICT_NEXT_LABEL,
  P4P_PREDICTIONS_PER_WINDOW,
  P4P_SHORT,
  P4P_WINDOW_MINUTES,
  formatP4pClock,
  formatP4pGbp,
  p4pAdvanceSlotBoard,
  p4pBankSlotIfComplete,
  p4pCyclingWindowClock,
  p4pEmptySlotBoard,
  p4pWindows,
  type P4pCategoryId,
} from "@/app/lib/predict-for-planet";
import { loadBrandLogo } from "@/app/services/climate-sponsors.service";
import { sponsorLogoSrc } from "@/app/services/teams.service";

const MARK_GREEN = "#5bc662";
const MINT = "#0c5c2c";
const STEP_TAB_CLASS =
  "inline-flex items-center rounded-full bg-s4p-mark px-3 py-1 text-sm font-black text-black";
const DEMO_BRAND = "EA Sports";

function stopCarouselSwipe(event: React.PointerEvent) {
  event.stopPropagation();
}

function P4pClubCrest({ name }: { name: string }) {
  const [failed, setFailed] = useState(false);
  const src = clubLogoSrc(name);
  const initials = clubInitials(name || "FC");

  return (
    <span
      data-p4p-club-logo={name || undefined}
      className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm"
      aria-hidden
    >
      <span
        className="flex h-full w-full items-center justify-center text-[8px] font-black text-black"
        style={{ backgroundColor: MARK_GREEN }}
      >
        {initials}
      </span>
      {src && name && !failed ? (
        // Native img: crest URL is a same-origin API lookup, not a static asset.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={32}
          height={32}
          className="absolute inset-0 h-full w-full bg-white object-contain p-[2px]"
          onError={() => setFailed(true)}
        />
      ) : null}
    </span>
  );
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
  const sides =
    fixtureSides(fixture) ??
    (selectedMatch ? [selectedMatch.homeName, selectedMatch.awayName] : null);
  const homeName = sides?.[0] ?? "";
  const awayName = sides?.[1] ?? "";
  const fallbackWindow = p4pWindows()[3];
  const [board, setBoard] = useState(() => p4pEmptySlotBoard());
  const [notice, setNotice] = useState<string | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const clock = now
    ? p4pCyclingWindowClock(now)
    : {
        window: fallbackWindow,
        remainingSeconds: P4P_WINDOW_MINUTES * 60,
        label: formatP4pClock(P4P_WINDOW_MINUTES * 60),
      };
  const picked = board.picked;
  const earnedGbp = board.walletGbp;
  const sponsorLogo =
    loadBrandLogo(DEMO_BRAND) || sponsorLogoSrc(DEMO_BRAND, null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const nextIndex = clock.window.index;
    setBoard((current) => {
      const next = p4pAdvanceSlotBoard(current, nextIndex);
      if (current.windowIndex >= 0 && current.windowIndex !== next.windowIndex) {
        setNotice(null);
      }
      return next;
    });
  }, [clock.window.index]);

  function toggle(id: P4pCategoryId) {
    setBoard((current) => {
      let pickedNext = current.picked;
      if (pickedNext.includes(id)) {
        setNotice(null);
        pickedNext = pickedNext.filter((row) => row !== id);
      } else if (pickedNext.length < P4P_PREDICTIONS_PER_WINDOW) {
        pickedNext = [...pickedNext, id];
        if (pickedNext.length === P4P_PREDICTIONS_PER_WINDOW) {
          setNotice(
            `Participation ${formatP4pGbp(P4P_ENGAGEMENT_GBP)}. Right event +${formatP4pGbp(P4P_ACCURACY_GBP)}.`
          );
        }
      }
      return p4pBankSlotIfComplete({ ...current, picked: pickedNext });
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
        aria-label={`${P4P_LABEL}. ${fixture}. ${clock.window.label} slot.`}
      >
          <p
            className="text-[9px] font-black uppercase tracking-[0.18em]"
            style={{ color: MINT }}
          >
            {P4P_SHORT} · {P4P_LABEL}
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            {homeName ? <P4pClubCrest name={homeName} /> : null}
            <p className="min-w-0 flex-1 text-center text-[12px] font-black leading-tight">
              {fixture}
            </p>
            {awayName ? <P4pClubCrest name={awayName} /> : null}
          </div>
          <div
            data-p4p-slot-timer="p4p-slot-timer-v1"
            data-p4p-window-label={clock.window.label}
            data-p4p-remaining={String(clock.remainingSeconds)}
            aria-live="polite"
            className="mt-1.5 flex items-center justify-between gap-2 rounded-xl border-2 border-emerald-700 bg-white px-2 py-1"
          >
            <p className="min-w-0 text-[8px] font-black uppercase leading-3 tracking-[0.08em] text-emerald-800">
              {clock.window.label}
              <span className="mt-0.5 block font-semibold normal-case tracking-normal text-slate-700">
                3 of 7 this slot
              </span>
            </p>
            <p className="shrink-0 text-[20px] font-black tabular-nums leading-none text-emerald-900">
              {clock.label}
            </p>
          </div>
          <div
            data-p4p-slot-wipe="p4p-slot-wipe-v1"
            data-p4p-wallet={formatP4pGbp(earnedGbp)}
            className="mt-1.5 rounded-xl px-2 py-1.5 text-center text-[10px] font-black text-black"
            style={{ backgroundColor: MARK_GREEN }}
          >
            Game-Time Wallet {formatP4pGbp(earnedGbp)}
          </div>
          <p className="mt-1.5 text-[11px] font-black uppercase leading-4 tracking-[0.08em] text-black">
            {P4P_PREDICT_NEXT_LABEL}
          </p>
          <aside
            data-testid="p4p-powered-by"
            className="mt-1 shrink-0 rounded-xl border border-slate-300 bg-white px-2 py-2 text-center"
          >
            <p className="text-[8px] font-black uppercase leading-3 tracking-[0.08em] text-slate-700">
              {P4P_POWERED_BY_LABEL}
            </p>
            <BrandMark
              name={DEMO_BRAND}
              logoUrl={sponsorLogo}
              large
              className="mx-auto mt-1 h-12 w-12 text-base"
            />
            <p className="mt-1 text-[12px] font-black">{DEMO_BRAND}</p>
          </aside>
          <p
            data-p4p-participating="p4p-participating-v1"
            className="mt-1.5 shrink-0 text-[12px] font-black leading-4 text-black"
          >
            {notice ||
              `Participating earns ${formatP4pGbp(P4P_ENGAGEMENT_GBP)}. The right event earns another ${formatP4pGbp(P4P_ACCURACY_GBP)}.`}
          </p>
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
                  className={`flex w-full items-center justify-between rounded-lg border px-2.5 py-[0.4rem] text-left text-[13px] font-black leading-tight [touch-action:manipulation] ${
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
    </div>
  );
}
