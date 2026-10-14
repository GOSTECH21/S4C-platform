"use client";

import { useEffect, useMemo, useState } from "react";
import {
  WEEKDAY_LABELS,
  monthCells,
  monthLabel,
  shiftMonth,
} from "@/app/lib/sponsor-signed-home";
import {
  GLOBAL_MATCH_DAY_EXAMPLE_DATE,
  calendarDatesInMonth,
  matchesByLeagueOnDate,
  type CalendarMatch,
} from "@/app/lib/sporting-calendar";
import {
  GLOBAL_MATCH_DAY_INTRO,
  budweiserExamplePicks,
  countPicksByLeague,
  describeGlobalPicks,
  isMatchPicked,
  pickFromCalendarMatch,
  toggleGlobalPick,
  type GlobalMatchPick,
} from "@/app/lib/global-match-day";
import { formatKickoff, formatMatchDate } from "@/app/lib/upcoming-matches";
import { formatLongMatchDate } from "@/app/lib/s4p-climate-projects";
import { isSponsorBlockedFromClub } from "@/app/lib/climate-sponsors";
import { sponsorWalletPath } from "@/app/lib/routes";
import Link from "next/link";

const EXAMPLE_MONTH = { year: 2026, month: 9 };

export function SportingCalendarBoard({
  brandName,
  initialPicks = [],
  notice = null,
  onLockPicks,
  onUnlockPick,
  showExampleButton = false,
}: {
  brandName: string;
  initialPicks?: GlobalMatchPick[];
  notice?: string | null;
  onLockPicks?: (picks: GlobalMatchPick[]) => void;
  onUnlockPick?: (pick: GlobalMatchPick) => void;
  showExampleButton?: boolean;
}) {
  const [year, setYear] = useState(EXAMPLE_MONTH.year);
  const [month, setMonth] = useState(EXAMPLE_MONTH.month);
  const [selectedDate, setSelectedDate] = useState(GLOBAL_MATCH_DAY_EXAMPLE_DATE);
  const [basket, setBasket] = useState<GlobalMatchPick[]>(initialPicks);
  useEffect(() => {
    if (initialPicks.length === 0) return;
    setBasket((current) => (current.length > 0 ? current : initialPicks));
  }, [initialPicks]);
  const dates = useMemo(() => calendarDatesInMonth(year, month), [year, month]);
  const cells = monthCells(year, month);
  const groups = matchesByLeagueOnDate(selectedDate);
  const longDate = formatLongMatchDate(selectedDate) || selectedDate;
  const leagueCounts = countPicksByLeague(basket);

  function go(delta: number) {
    const next = shiftMonth(year, month, delta);
    setYear(next.year);
    setMonth(next.month);
  }

  function toggle(match: CalendarMatch, clubName?: string) {
    setBasket((current) => toggleGlobalPick(current, match, brandName, clubName));
  }

  function setLeadClub(match: CalendarMatch, clubName: string) {
    const next = pickFromCalendarMatch(match, brandName, clubName);
    if (!next) return;
    setBasket((rows) => [
      ...rows.filter(
        (row) =>
          !(row.date === match.date && row.fixtureName === match.fixtureName)
      ),
      next,
    ]);
  }

  function loadExample() {
    setSelectedDate(GLOBAL_MATCH_DAY_EXAMPLE_DATE);
    setYear(EXAMPLE_MONTH.year);
    setMonth(EXAMPLE_MONTH.month);
    setBasket(budweiserExamplePicks());
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-green-500/30 bg-slate-900 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
          2026/27 Sporting Calendar
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">
          Matches on a given day
        </h1>
        <p className="mt-3 max-w-4xl text-slate-300">{GLOBAL_MATCH_DAY_INTRO}</p>
        {showExampleButton ? (
          <button
            type="button"
            onClick={loadExample}
            className="mt-5 rounded-xl bg-s4p-mark px-5 py-3 font-bold text-slate-950"
          >
            Load Budweiser Saturday 31 October
          </button>
        ) : null}
        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold"
          >
            Previous
          </button>
          <h2 className="text-xl font-black">{monthLabel(year, month)}</h2>
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
            const hasMatches = Boolean(cell.date && dates.has(cell.date));
            const selected = cell.date === selectedDate;
            return (
              <button
                key={cell.key}
                type="button"
                disabled={!cell.inMonth}
                onClick={() => cell.date && setSelectedDate(cell.date)}
                className={`min-h-14 rounded-xl p-2 text-sm font-semibold ${
                  !cell.inMonth
                    ? "cursor-default text-transparent"
                    : selected
                      ? "bg-s4p-mark text-slate-950"
                      : hasMatches
                        ? "bg-s4p-mark/15 text-s4p-mint ring-1 ring-s4p-mark"
                        : "bg-white text-slate-950"
                }`}
                aria-pressed={selected}
                aria-label={
                  cell.date
                    ? hasMatches
                      ? `Matches on ${cell.date}`
                      : cell.date
                    : undefined
                }
              >
                {cell.day ?? ""}
                {hasMatches ? (
                  <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-current mx-auto" />
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-green-500/30 bg-slate-900 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
          {formatMatchDate(selectedDate)}
        </p>
        <h2 className="mt-2 text-3xl font-black">{longDate}</h2>
        <p className="mt-3 text-slate-300">
          {groups.length === 0
            ? "No scheduled Matches on this day in the 2026/27 Sporting Calendar."
            : `${groups.length} ${
                groups.length === 1 ? "competition" : "competitions"
              } have Matches this day. Tick named Matches to sponsor them together as ${brandName}.`}
        </p>
        <div className="mt-6 space-y-6">
          {groups.map((group) => (
            <div
              key={group.league}
              className="rounded-2xl border border-slate-300 bg-white p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {group.sport} · {group.country}
              </p>
              <h3 className="mt-1 text-2xl font-black text-slate-950">
                {group.league}{" "}
                <span className="text-sm font-semibold text-slate-500">
                  {group.matches.length}{" "}
                  {group.matches.length === 1 ? "Match" : "Matches"}
                </span>
              </h3>
              <ul className="mt-4 grid gap-2">
                {group.matches.map((match) => {
                  const picked = isMatchPicked(basket, match);
                  const homeBlocked = isSponsorBlockedFromClub(
                    brandName,
                    match.homeName
                  );
                  const awayBlocked = isSponsorBlockedFromClub(
                    brandName,
                    match.awayName
                  );
                  const current = basket.find(
                    (row) =>
                      row.date === match.date &&
                      row.fixtureName === match.fixtureName
                  );
                  return (
                    <li
                      key={match.id}
                      className={`rounded-xl border px-4 py-3 ${
                        picked
                          ? "border-s4p-mark bg-s4p-mark/15"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => toggle(match)}
                          aria-pressed={picked}
                          className="text-left"
                        >
                          <p className="font-bold text-slate-950">
                            {match.fixtureName}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatKickoff(match.kickoff)} · {match.venue}
                          </p>
                        </button>
                        <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
                          <input
                            type="checkbox"
                            checked={picked}
                            onChange={() => toggle(match)}
                          />
                          Sponsor
                        </label>
                      </div>
                      {picked ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <LeadClubButton
                            clubName={match.homeName}
                            selected={
                              !current ||
                              current.clubName === match.homeName
                            }
                            disabled={homeBlocked}
                            onClick={() => setLeadClub(match, match.homeName)}
                          />
                          <LeadClubButton
                            clubName={match.awayName}
                            selected={current?.clubName === match.awayName}
                            disabled={awayBlocked}
                            onClick={() => setLeadClub(match, match.awayName)}
                          />
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-400/40 bg-slate-900 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
          Global Brand Match Day
        </p>
        <h2 className="mt-2 text-3xl font-black">
          {brandName} · {describeGlobalPicks(basket)}
        </h2>
        <p className="mt-3 max-w-3xl text-slate-300">
          One Lead Climate Sponsor per club per named Match. The same Global
          Brand can lock several Matches on this day, then open the Climate
          Sponsorship Wallet for each locked club.
        </p>
        {notice ? (
          <p className="mt-4 text-sm font-semibold text-amber-300">{notice}</p>
        ) : null}
        {basket.length === 0 ? (
          <p className="mt-4 text-slate-400">
            Tick Matches above to build a same-day sponsorship slate.
          </p>
        ) : (
          <ul className="mt-5 space-y-2">
            {leagueCounts.map((row) => (
              <li key={row.league} className="text-sm font-semibold">
                {row.count} {row.league}{" "}
                {row.count === 1 ? "Match" : "Matches"}
              </li>
            ))}
          </ul>
        )}
        <ul className="mt-5 space-y-3">
          {basket.map((pick) => (
            <li
              key={globalPickListKey(pick)}
              className="rounded-2xl border border-slate-300 bg-white p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {pick.league}
              </p>
              <p className="mt-1 font-bold text-slate-950">{pick.fixtureName}</p>
              <p className="mt-1 text-sm text-slate-500">
                Lead club {pick.clubName} · {formatKickoff(pick.kickoff)} ·{" "}
                {pick.venue}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={sponsorWalletPath(pick.clubName)}
                  className="rounded-xl bg-s4p-mark px-4 py-2 text-sm font-bold text-slate-950"
                >
                  Open wallet for {pick.clubName}
                </Link>
                {onUnlockPick ? (
                  <button
                    type="button"
                    onClick={() => {
                      setBasket((rows) =>
                        rows.filter(
                          (row) =>
                            !(
                              row.date === pick.date &&
                              row.fixtureName === pick.fixtureName &&
                              row.clubName === pick.clubName
                            )
                        )
                      );
                      onUnlockPick(pick);
                    }}
                    className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold"
                  >
                    Unlock
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setBasket((rows) =>
                        rows.filter(
                          (row) =>
                            !(
                              row.date === pick.date &&
                              row.fixtureName === pick.fixtureName &&
                              row.clubName === pick.clubName
                            )
                        )
                      )
                    }
                    className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold"
                  >
                    Remove
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
        {onLockPicks ? (
          <button
            type="button"
            disabled={basket.length === 0}
            onClick={() => onLockPicks(basket)}
            className="mt-6 rounded-xl bg-s4p-mark px-5 py-3 font-bold text-slate-950 disabled:opacity-40"
          >
            Lock these Matches as Goal Sponsor
          </button>
        ) : null}
      </section>
    </div>
  );
}

function globalPickListKey(pick: GlobalMatchPick): string {
  return `${pick.date}|${pick.fixtureName}|${pick.clubName}`;
}

function LeadClubButton({
  clubName,
  selected,
  disabled,
  onClick,
}: {
  clubName: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
        disabled
          ? "cursor-not-allowed border-slate-200 text-slate-400"
          : selected
            ? "border-s4p-mark bg-s4p-mark text-slate-950"
            : "border-slate-300 bg-white text-slate-950"
      }`}
    >
      Lead {clubName}
    </button>
  );
}
