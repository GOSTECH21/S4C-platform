"use client";

import { useMemo, useState } from "react";
import { CALENDAR_WEEKDAY_CLASS } from "@/app/components/calendar/CalendarMonthNav";
import {
  WEEKDAY_LABELS,
  monthCells,
  monthLabel,
} from "@/app/lib/sponsor-signed-home";
import {
  CLUB_MATCH_CALENDAR_COUNT,
  clubFixtureFromCalendarMatch,
  monthsCoveringMatches,
  type CalendarMatch,
} from "@/app/lib/sporting-calendar";
import type { ClubFixture } from "@/app/lib/club-fixtures";
import { formatMatchDate } from "@/app/lib/upcoming-matches";

export function ClubMatchCalendar({
  clubName,
  value,
  matches,
  onChange,
}: {
  clubName: string;
  value: string;
  matches: CalendarMatch[];
  onChange: (fixture: ClubFixture) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const selected =
    matches.find(
      (row) => row.id === value || row.fixtureName === value
    ) ?? null;
  const disabled = !clubName;
  const dates = useMemo(
    () => new Set(matches.map((row) => row.date)),
    [matches]
  );
  const months = useMemo(() => monthsCoveringMatches(matches), [matches]);
  const onDate = pickedDate
    ? matches.filter((row) => row.date === pickedDate)
    : [];

  function pickMatch(match: CalendarMatch) {
    onChange(clubFixtureFromCalendarMatch(match));
    setPickedDate(match.date);
    setOpen(false);
  }

  function pickDate(date: string) {
    const rows = matches.filter((row) => row.date === date);
    setPickedDate(date);
    if (rows.length === 1) pickMatch(rows[0]);
  }

  return (
    <div className="contents">
      <div>
        <p className="text-sm text-slate-400">Match</p>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label="Select the Match"
          onClick={() => {
            if (disabled) return;
            setOpen((current) => !current);
          }}
          className={`mt-2 flex w-full items-center justify-between rounded-lg border border-slate-600 bg-white p-3 text-left font-semibold text-slate-950 ${
            disabled ? "opacity-50" : ""
          }`}
        >
          <span>{selected?.fixtureName || "Select the Match"}</span>
          <span aria-hidden="true">▾</span>
        </button>
      </div>
      {open && !disabled ? (
        <div
          role="dialog"
          aria-label={`${clubName}'s next ${CLUB_MATCH_CALENDAR_COUNT} League and Cup Matches`}
          className="mt-4 rounded-2xl border border-s4p-mark/50 bg-white p-4 text-slate-950 md:col-span-2"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Next {CLUB_MATCH_CALENDAR_COUNT} Matches
          </p>
          <h3 className="mt-1 text-lg font-black">
            {clubName} · League and Cup Dates
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Lime dates are the next {CLUB_MATCH_CALENDAR_COUNT} League and Cup
            Matches {clubName} will play. Nothing else is on this calendar.
          </p>
          {matches.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No upcoming League or Cup Matches for {clubName}.
            </p>
          ) : (
            <div className="mt-4 space-y-6">
              {months.map((month) => {
                const cells = monthCells(month.year, month.month);
                return (
                  <div key={`${month.year}-${month.month}`}>
                    <h4 className="mb-2 text-base font-black">
                      {monthLabel(month.year, month.month)}
                    </h4>
                    <div className={CALENDAR_WEEKDAY_CLASS}>
                      {WEEKDAY_LABELS.map((label) => (
                        <div key={label} className="min-w-0 py-1">
                          {label}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {cells.map((cell) => {
                        const clubMatch = Boolean(
                          cell.date && dates.has(cell.date)
                        );
                        const selectedDay = cell.date === pickedDate;
                        return (
                          <button
                            key={cell.key}
                            type="button"
                            disabled={!clubMatch}
                            onClick={() => cell.date && pickDate(cell.date)}
                            className={`min-h-12 rounded-xl p-1.5 text-sm font-semibold ${
                              !cell.inMonth
                                ? "cursor-default text-transparent"
                                : clubMatch
                                  ? selectedDay
                                    ? "bg-s4p-mark text-slate-950"
                                    : "bg-s4p-mark/80 text-slate-950 ring-1 ring-s4p-mark"
                                  : "cursor-default bg-white text-slate-300"
                            }`}
                            aria-pressed={selectedDay}
                            aria-label={
                              cell.date
                                ? clubMatch
                                  ? `${clubName} Match on ${cell.date}`
                                  : cell.date
                                : undefined
                            }
                          >
                            {cell.day ?? ""}
                            {clubMatch ? (
                              <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-current mx-auto" />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {onDate.length > 1 ? (
            <div className="mt-4 grid gap-2">
              <p className="text-sm font-semibold text-slate-700">
                {formatMatchDate(pickedDate)} · choose the Match
              </p>
              {onDate.map((match) => (
                <button
                  key={match.id}
                  type="button"
                  onClick={() => pickMatch(match)}
                  className="rounded-lg border border-s4p-mark bg-s4p-mark/15 px-3 py-2 text-left text-sm font-semibold text-slate-950"
                >
                  <span className="block">{match.fixtureName}</span>
                  <span className="mt-1 block text-xs font-normal text-slate-500">
                    {match.league}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
