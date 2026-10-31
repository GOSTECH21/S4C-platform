"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CALENDAR_WEEKDAY_CLASS,
  CalendarMonthNav,
} from "@/app/components/calendar/CalendarMonthNav";
import {
  WEEKDAY_LABELS,
  monthCells,
  monthLabel,
  shiftMonth,
} from "@/app/lib/sponsor-signed-home";
import {
  GLOBAL_MATCH_DAY_EXAMPLE_DATE,
  SPORTING_CALENDAR_LEAGUE_ORDER,
  calendarDatesInMonth,
  calendarLeagueDomId,
  clubsOnSportingCalendar,
  cupCalendarHints,
  isUpcomingCalendarDate,
  matchesForClub,
  monthFromIsoDate,
  matchesByLeagueOnDate,
  rugbyCalendarHints,
  type CalendarMatch,
} from "@/app/lib/sporting-calendar";
import {
  GLOBAL_MATCH_DAY_INTRO,
  GLOBAL_MATCH_DAY_STEPS,
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
import {
  fixtureAccordionHint,
  fixtureListIsCollapsible,
  visibleAccordionItems,
} from "@/app/lib/fixture-accordion";
import { BrandMark } from "@/app/components/club/BrandMark";
import Link from "next/link";

const EXAMPLE_MONTH = { year: 2026, month: 9 };

export function SportingCalendarBoard({
  brandName,
  logoUrl = null,
  initialPicks = [],
  notice = null,
  onLockPicks,
  onUnlockPick,
  onChosenMatch,
  titleAs = "h1",
}: {
  brandName: string;
  logoUrl?: string | null;
  initialPicks?: GlobalMatchPick[];
  notice?: string | null;
  onLockPicks?: (picks: GlobalMatchPick[]) => void;
  onUnlockPick?: (pick: GlobalMatchPick) => void;
  onChosenMatch?: (pick: GlobalMatchPick) => void;
  showExampleButton?: boolean;
  titleAs?: "h1" | "h2";
}) {
  const Title = titleAs;
  const [year, setYear] = useState(EXAMPLE_MONTH.year);
  const [month, setMonth] = useState(EXAMPLE_MONTH.month);
  const [selectedDate, setSelectedDate] = useState(GLOBAL_MATCH_DAY_EXAMPLE_DATE);
  const [basket, setBasket] = useState<GlobalMatchPick[]>(initialPicks);
  const [openLeagues, setOpenLeagues] = useState<Set<string>>(new Set());
  const [pendingScrollLeague, setPendingScrollLeague] = useState<string | null>(
    null
  );
  const [clubQuery, setClubQuery] = useState("");
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  useEffect(() => {
    if (initialPicks.length === 0) return;
    setBasket((current) => (current.length > 0 ? current : initialPicks));
  }, [initialPicks]);
  const dates = useMemo(() => calendarDatesInMonth(year, month), [year, month]);
  const cells = monthCells(year, month);
  const groups = useMemo(
    () =>
      isUpcomingCalendarDate(selectedDate)
        ? matchesByLeagueOnDate(selectedDate)
        : [],
    [selectedDate]
  );
  const longDate = formatLongMatchDate(selectedDate) || selectedDate;
  const leagueCounts = countPicksByLeague(basket);
  const calendarClubs = useMemo(() => clubsOnSportingCalendar(), []);
  const clubSuggestions = useMemo(() => {
    const needle = clubQuery.trim().toLowerCase();
    if (needle.length < 2) return [];
    return calendarClubs
      .filter((name) => name.toLowerCase().includes(needle))
      .sort((left, right) => {
        const a = left.toLowerCase();
        const b = right.toLowerCase();
        const aStart = a.startsWith(needle) ? 0 : 1;
        const bStart = b.startsWith(needle) ? 0 : 1;
        if (aStart !== bStart) return aStart - bStart;
        return a.localeCompare(b);
      })
      .slice(0, 12);
  }, [calendarClubs, clubQuery]);
  const clubMatches = useMemo(
    () => (selectedClub ? matchesForClub(selectedClub) : []),
    [selectedClub]
  );
  const clubMatchesByLeague = useMemo(() => {
    const leftover = [
      ...new Set(
        clubMatches
          .map((row) => row.league)
          .filter((league) => !SPORTING_CALENDAR_LEAGUE_ORDER.includes(league))
      ),
    ];
    return [...SPORTING_CALENDAR_LEAGUE_ORDER, ...leftover].flatMap((league) => {
      const matches = clubMatches.filter((row) => row.league === league);
      return matches.length ? [{ league, matches }] : [];
    });
  }, [clubMatches]);
  useEffect(() => {
    if (!pendingScrollLeague) return;
    const id =
      pendingScrollLeague === "club-cups"
        ? "calendar-club-cups"
        : calendarLeagueDomId(pendingScrollLeague);
    const node = document.getElementById(id);
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "start" });
    setPendingScrollLeague(null);
  }, [groups, pendingScrollLeague, clubMatches]);

  function go(delta: number) {
    const next = shiftMonth(year, month, delta);
    setYear(next.year);
    setMonth(next.month);
  }

  function toggle(match: CalendarMatch, clubName?: string) {
    const wasPicked = isMatchPicked(basket, match);
    const next = toggleGlobalPick(basket, match, brandName, clubName);
    setBasket(next);
    if (wasPicked) return;
    const added = next.find(
      (row) => row.date === match.date && row.fixtureName === match.fixtureName
    );
    if (!added) return;
    if (onChosenMatch) {
      onChosenMatch(added);
      return;
    }
    onLockPicks?.(next);
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

  function selectDate(date: string, openLeague?: string) {
    setSelectedDate(date);
    setOpenLeagues(openLeague ? new Set([openLeague]) : new Set());
  }

  function selectClub(clubName: string) {
    setSelectedClub(clubName);
    setClubQuery(clubName);
    const matches = matchesForClub(clubName);
    const first = matches[0];
    if (!first) {
      setPendingScrollLeague("club-cups");
      return;
    }
    const month = monthFromIsoDate(first.date);
    if (month) {
      setYear(month.year);
      setMonth(month.month);
    }
    selectDate(first.date, first.league);
    setOpenLeagues(new Set(matches.map((row) => row.league)));
    setPendingScrollLeague("club-cups");
  }

  function jumpToLeague(league: string) {
    setOpenLeagues(new Set([league]));
    setPendingScrollLeague(league);
  }

  function toggleLeague(league: string) {
    setOpenLeagues((current) => {
      const next = new Set(current);
      if (next.has(league)) next.delete(league);
      else next.add(league);
      return next;
    });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-green-500/30 bg-slate-900 p-8">
        <div className="flex items-center gap-4">
          <BrandMark name={brandName} logoUrl={logoUrl} large />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
              Signed in as {brandName}
            </p>
            <Title className="mt-2 text-4xl font-black tracking-tight">
              {brandName} · 2026/27 Sporting Calendar
            </Title>
          </div>
        </div>
        <p className="mt-3 text-2xl font-black tracking-tight">
          Matches on a given day
        </p>
        <ol
          className="mt-3 max-w-4xl list-decimal space-y-1 pl-6 text-slate-300"
          aria-label={GLOBAL_MATCH_DAY_INTRO}
        >
          {GLOBAL_MATCH_DAY_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <div
          id="calendar-club-cups"
          className="mt-6 rounded-2xl border border-slate-300 bg-white p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Sponsor any Club of your choice
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Type-in their Name and see all their League and Cup Matches
          </h2>
          <label className="mt-4 block text-sm font-semibold text-slate-950">
            Club you wish to sponsor
            <input
              type="search"
              value={clubQuery}
              onChange={(event) => {
                setClubQuery(event.target.value);
                if (selectedClub && event.target.value !== selectedClub) {
                  setSelectedClub(null);
                }
              }}
              placeholder="Arsenal, Bayern Munich, Barcelona…"
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-950"
            />
          </label>
          {clubSuggestions.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {clubSuggestions.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => selectClub(name)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
                    selectedClub === name
                      ? "border-s4p-mark bg-s4p-mark text-slate-950"
                      : "border-slate-300 bg-white text-slate-950"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          ) : clubQuery.trim().length >= 2 ? (
            <p className="mt-3 text-sm text-slate-500">
              No club matches that search.
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              Type at least two letters to find a club.
            </p>
          )}
          {selectedClub ? (
            <div className="mt-5">
              <h3 className="text-xl font-black text-slate-950">
                {selectedClub} · League and Cup Matches
              </h3>
              {clubMatches.length === 0 ? (
                <p className="mt-2 text-sm text-slate-600">
                  No upcoming Matches for {selectedClub}.
                </p>
              ) : (
                <div className="mt-3 space-y-4">
                  {clubMatchesByLeague.map((group) => (
                    <div
                      key={group.league}
                      className="rounded-2xl border border-slate-300 bg-white p-4"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {group.league}
                      </p>
                      <ul className="mt-3 grid gap-2">
                        {group.matches.map((match) => (
                          <CalendarMatchRow
                            key={match.id}
                            match={match}
                            brandName={brandName}
                            basket={basket}
                            showDate
                            onToggle={() => toggle(match, selectedClub)}
                            onLeadClub={setLeadClub}
                            onSelectClub={selectClub}
                          />
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
        <CalendarMonthNav
          label={monthLabel(year, month)}
          onPrev={() => go(-1)}
          onNext={() => go(1)}
        />
        <div className={`mt-4 ${CALENDAR_WEEKDAY_CLASS}`}>
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="min-w-0 py-2">
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell) => {
            const upcoming = Boolean(
              cell.date && isUpcomingCalendarDate(cell.date)
            );
            const hasMatches = Boolean(upcoming && cell.date && dates.has(cell.date));
            const selected = cell.date === selectedDate;
            return (
              <button
                key={cell.key}
                type="button"
                disabled={!cell.inMonth || !upcoming}
                onClick={() => cell.date && selectDate(cell.date)}
                className={`min-h-14 rounded-xl p-2 text-sm font-semibold ${
                  !cell.inMonth
                    ? "cursor-default text-transparent"
                    : !upcoming
                      ? "cursor-default bg-white text-slate-400"
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
            ? isUpcomingCalendarDate(selectedDate)
              ? "No scheduled Matches on this day in the 2026/27 Sporting Calendar."
              : "This day has already been played. Choose an upcoming Match to sponsor."
            : `${groups.length} ${
                groups.length === 1 ? "competition" : "competitions"
              } have Matches this day. Tick named Matches to sponsor them together as ${brandName}.`}
        </p>
        <p className="mt-2 text-sm text-slate-400">
          {groups.some((row) => row.league === "NFL")
            ? "NFL is in the competition row. Click NFL to open the collapsible fixture list."
            : "NFL fixtures are on Sundays (and some Thursday/Monday nights), not this date."}
        </p>
        {cupCalendarHints(groups.map((row) => row.league)).map((hint) => (
          <p key={hint} className="mt-2 text-sm text-slate-400">
            {hint}
          </p>
        ))}
        {rugbyCalendarHints(groups.map((row) => row.league)).map((hint) => (
          <p key={hint} className="mt-2 text-sm text-slate-400">
            {hint}
          </p>
        ))}
        {groups.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {groups.map((group) => (
              <button
                key={group.league}
                type="button"
                onClick={() => jumpToLeague(group.league)}
                className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
                  openLeagues.has(group.league)
                    ? "border-s4p-mark bg-s4p-mark text-slate-950"
                    : "border-slate-300 bg-white text-slate-950"
                }`}
              >
                {group.league} {group.matches.length}
              </button>
            ))}
          </div>
        ) : null}
        <div className="mt-6 space-y-6">
          {groups.map((group) => {
            const expanded = openLeagues.has(group.league);
            const visible = visibleAccordionItems(
              group.matches,
              expanded,
              (match) => isMatchPicked(basket, match)
            );
            const collapsible = fixtureListIsCollapsible(group.matches.length);
            const hint = fixtureAccordionHint(
              group.matches.length,
              visible.length,
              expanded
            );
            return (
              <div
                key={group.league}
                id={calendarLeagueDomId(group.league)}
                className="scroll-mt-6 rounded-2xl border border-slate-300 bg-white p-5"
              >
                {collapsible ? (
                  <button
                    type="button"
                    onClick={() => toggleLeague(group.league)}
                    aria-expanded={expanded}
                    className="w-full text-left"
                  >
                    <LeagueHeading
                      sport={group.sport}
                      country={group.country}
                      league={group.league}
                      count={group.matches.length}
                      hint={hint}
                    />
                  </button>
                ) : (
                  <LeagueHeading
                    sport={group.sport}
                    country={group.country}
                    league={group.league}
                    count={group.matches.length}
                    hint={null}
                  />
                )}
                <ul className="mt-4 grid gap-2">
                  {visible.map((match) => (
                    <CalendarMatchRow
                      key={match.id}
                      match={match}
                      brandName={brandName}
                      basket={basket}
                      onToggle={toggle}
                      onLeadClub={setLeadClub}
                      onSelectClub={selectClub}
                    />
                  ))}
                </ul>
              </div>
            );
          })}
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

function LeagueHeading({
  sport,
  country,
  league,
  count,
  hint,
}: {
  sport: string;
  country: string;
  league: string;
  count: number;
  hint: string | null;
}) {
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {sport} · {country}
      </p>
      <h3 className="mt-1 text-2xl font-black text-slate-950">
        {league}{" "}
        <span className="text-sm font-semibold text-slate-500">
          {count} {count === 1 ? "Match" : "Matches"}
          {hint ? ` · ${hint}` : ""}
        </span>
      </h3>
    </>
  );
}

function CalendarMatchRow({
  match,
  brandName,
  basket,
  onToggle,
  onLeadClub,
  onSelectClub,
  showDate = false,
}: {
  match: CalendarMatch;
  brandName: string;
  basket: GlobalMatchPick[];
  onToggle: (match: CalendarMatch, clubName?: string) => void;
  onLeadClub: (match: CalendarMatch, clubName: string) => void;
  onSelectClub?: (clubName: string) => void;
  showDate?: boolean;
}) {
  const picked = isMatchPicked(basket, match);
  const homeBlocked = isSponsorBlockedFromClub(brandName, match.homeName);
  const awayBlocked = isSponsorBlockedFromClub(brandName, match.awayName);
  const current = basket.find(
    (row) => row.date === match.date && row.fixtureName === match.fixtureName
  );
  return (
    <li
      className={`rounded-xl border px-4 py-3 ${
        picked
          ? "border-s4p-mark bg-s4p-mark/15"
          : "border-slate-300 bg-white"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="text-left">
          <p className="font-bold text-slate-950">
            <ClubNameButton
              clubName={match.homeName}
              onSelectClub={onSelectClub}
            />
            <span> v </span>
            <ClubNameButton
              clubName={match.awayName}
              onSelectClub={onSelectClub}
            />
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {showDate ? `${formatMatchDate(match.date)} · ` : ""}
            {formatKickoff(match.kickoff)} · {match.venue || "TBC"}
          </p>
        </div>
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
          <input
            type="checkbox"
            checked={picked}
            onChange={() => onToggle(match)}
          />
          Sponsor
        </label>
      </div>
      {picked ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <LeadClubButton
            clubName={match.homeName}
            selected={!current || current.clubName === match.homeName}
            disabled={homeBlocked}
            onClick={() => onLeadClub(match, match.homeName)}
          />
          <LeadClubButton
            clubName={match.awayName}
            selected={current?.clubName === match.awayName}
            disabled={awayBlocked}
            onClick={() => onLeadClub(match, match.awayName)}
          />
        </div>
      ) : null}
    </li>
  );
}

function ClubNameButton({
  clubName,
  onSelectClub,
}: {
  clubName: string;
  onSelectClub?: (clubName: string) => void;
}) {
  if (!onSelectClub) return <>{clubName}</>;
  return (
    <button
      type="button"
      onClick={() => onSelectClub(clubName)}
      className="underline decoration-s4p-mark decoration-2 underline-offset-2"
    >
      {clubName}
    </button>
  );
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
