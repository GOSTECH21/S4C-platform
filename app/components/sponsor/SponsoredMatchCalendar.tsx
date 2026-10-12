"use client";

import { useMemo, useState } from "react";
import {
  WEEKDAY_LABELS,
  defaultCalendarMonth,
  matchesOnDate,
  monthCells,
  monthLabel,
  shiftMonth,
  sponsoredDates,
  type SponsoredMatchListing,
} from "@/app/lib/sponsor-signed-home";

export function SponsoredMatchCalendar({
  matches,
}: {
  matches: SponsoredMatchListing[];
}) {
  const initial = defaultCalendarMonth(matches);
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [selectedDate, setSelectedDate] = useState(
    matches[matches.length - 1]?.date ?? null
  );
  const dates = useMemo(() => sponsoredDates(matches), [matches]);
  const cells = monthCells(year, month);
  const selectedMatches = matchesOnDate(matches, selectedDate);

  function go(delta: number) {
    const next = shiftMonth(year, month, delta);
    setYear(next.year);
    setMonth(next.month);
  }

  return (
    <section className="rounded-3xl border border-green-500/30 bg-slate-900 p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
        Sponsored Match Days
      </p>
      <h2 className="mt-2 text-3xl font-black">Your calendar</h2>
      <p className="mt-3 max-w-3xl text-slate-300">
        Spotlighted days are Match Days you have signed as Goal Sponsor. Click a
        highlighted day to see the Match or Matches you sponsored.
      </p>
      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => go(-1)}
          className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold"
        >
          Previous
        </button>
        <h3 className="text-xl font-black">{monthLabel(year, month)}</h3>
        <button
          type="button"
          onClick={() => go(1)}
          className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold"
        >
          Next
        </button>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-2">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const sponsored = Boolean(cell.date && dates.has(cell.date));
          const selected = cell.date === selectedDate;
          return (
            <button
              key={cell.key}
              type="button"
              disabled={!sponsored}
              onClick={() => cell.date && setSelectedDate(cell.date)}
              className={`min-h-14 rounded-xl p-2 text-sm font-semibold ${
                !cell.inMonth
                  ? "cursor-default text-transparent"
                  : selected
                    ? "bg-green-500 text-slate-950"
                    : sponsored
                      ? "bg-green-500/20 text-green-200 ring-1 ring-green-400"
                      : "cursor-default bg-slate-950 text-slate-300"
              }`}
              aria-pressed={selected}
              aria-label={
                cell.date
                  ? sponsored
                    ? `Sponsored Match Day ${cell.date}`
                    : cell.date
                  : undefined
              }
            >
              {cell.day ?? ""}
              {sponsored ? (
                <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-current mx-auto" />
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950 p-5">
        {selectedMatches.length === 0 ? (
          <p className="text-slate-400">
            {selectedDate
              ? "No sponsored Match on this day."
              : "Click a highlighted Match Day to see the Match you sponsored."}
          </p>
        ) : (
          <ul className="space-y-3">
            {selectedMatches.map((match) => (
              <li key={`${match.offerId}-${match.fixtureName}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-400">
                  {match.clubName}
                </p>
                <p className="mt-1 text-lg font-bold">{match.fixtureName}</p>
                <p className="mt-1 text-sm text-slate-400">{match.headline}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
