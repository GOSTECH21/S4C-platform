"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { sportingCalendarClubsBySport } from "@/app/lib/calendar-clubs";
import { CURRENT_SEASON_LEAGUES } from "@/app/lib/current-season";
import {
  fixtureKindLabel,
  fixturePickerDate,
  matchDetailsLines,
  type ClubFixture,
} from "@/app/lib/club-fixtures";
import {
  clubsOnSportingCalendar,
  resolveSportingCalendarClub,
} from "@/app/lib/sporting-calendar";
import { sportCategory } from "@/app/lib/sports";

const DEFAULT_OPEN_LEAGUES = new Set([
  "Premier League",
  "Scottish Premiership",
]);

function useDismiss(open: boolean, onClose: () => void) {
  const rootRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    function onDoc(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) onCloseRef.current();
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  return rootRef;
}

export function ClubTypeInMenu({
  value,
  onChange,
}: {
  value: string;
  onChange: (club: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const rootRef = useDismiss(open, () => setOpen(false));
  useEffect(() => {
    setQuery(value);
  }, [value]);
  const calendarClubs = useMemo(() => clubsOnSportingCalendar(), []);
  const suggestions = useMemo(() => {
    const needle = query.trim().toLowerCase();
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
  }, [calendarClubs, query]);

  function commit(raw: string) {
    const typed = raw.trim();
    const resolved = resolveSportingCalendarClub(typed) || typed;
    setQuery(resolved);
    setOpen(false);
    onChange(resolved);
  }

  return (
    <div ref={rootRef} className="relative">
      <p className="text-sm text-slate-400">Club</p>
      <input
        type="search"
        aria-label="Club"
        autoComplete="off"
        value={query}
        placeholder="Club"
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          const next = event.target.value;
          setQuery(next);
          setOpen(true);
          if (!next.trim()) {
            if (value) onChange("");
            return;
          }
          const resolved = resolveSportingCalendarClub(next);
          if (
            resolved &&
            resolved !== value &&
            resolved.trim().toLowerCase() === next.trim().toLowerCase()
          ) {
            onChange(resolved);
          }
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          commit(query);
        }}
        onBlur={() => {
          if (!query.trim()) {
            if (value) onChange("");
            return;
          }
          const resolved = resolveSportingCalendarClub(query);
          if (resolved && resolved !== value) onChange(resolved);
        }}
        className="mt-2 w-full rounded-lg border border-slate-600 bg-white p-3 text-left font-semibold text-slate-950"
      />
      {open && suggestions.length > 0 ? (
        <div
          role="listbox"
          aria-label="Clubs you can sponsor"
          className="absolute z-40 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-slate-300 bg-white p-3 shadow-lg"
        >
          <div className="grid gap-2">
            {suggestions.map((club) => {
              const selected = value.toLowerCase() === club.toLowerCase();
              return (
                <button
                  key={club}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    commit(club);
                  }}
                  className={`rounded-lg border px-3 py-2 text-left text-sm font-semibold ${
                    selected
                      ? "border-s4p-mark bg-s4p-mark text-slate-950"
                      : "border-slate-300 bg-white text-slate-950 hover:border-s4p-mark"
                  }`}
                >
                  {club}
                </button>
              );
            })}
          </div>
        </div>
      ) : open && query.trim().length >= 2 ? (
        <p className="mt-2 text-sm text-slate-500">
          No club matches that search.
        </p>
      ) : null}
    </div>
  );
}

function pickClubClass(selected: boolean) {
  return `rounded-lg border px-3 py-3 text-left text-base font-semibold ${
    selected
      ? "border-s4p-mark bg-s4p-mark text-slate-950"
      : "border-slate-300 bg-white text-slate-950 hover:border-s4p-mark"
  }`;
}

function AccordionBlock({
  startOpen,
  forceOpen = false,
  summary,
  children,
  className,
  summaryClassName,
  ...data
}: {
  startOpen: boolean;
  forceOpen?: boolean;
  summary: ReactNode;
  children: ReactNode;
  className?: string;
  summaryClassName?: string;
  "data-club-sport-accordion"?: string;
  "data-club-league-accordion"?: string;
  "data-sport-name"?: string;
}) {
  const [open, setOpen] = useState(startOpen);
  return (
    <details
      open={forceOpen || open}
      onToggle={(event) => {
        if (forceOpen) return;
        setOpen(event.currentTarget.open);
      }}
      className={className}
      data-club-sport-accordion={data["data-club-sport-accordion"]}
      data-club-league-accordion={data["data-club-league-accordion"]}
      data-sport-name={data["data-sport-name"]}
    >
      <summary className={summaryClassName}>{summary}</summary>
      {children}
    </details>
  );
}

export function ClubLeagueMenu({
  value,
  onChange,
  clubs,
  allPlatformClubs = false,
}: {
  value: string;
  onChange: (club: string) => void;
  clubs?: string[];
  allPlatformClubs?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useDismiss(open, () => setOpen(false));
  const fromRegister = clubs !== undefined;
  const registered = (clubs ?? []).map((name) => name.trim()).filter(Boolean);
  const needle = query.trim().toLowerCase();
  const sportRows =
    allPlatformClubs && !fromRegister
      ? sportingCalendarClubsBySport()
          .map((row) => ({
            sport: row.sport,
            leagues: row.leagues
              .map((group) => ({
                league: group.league,
                clubs: group.clubs.filter(
                  (club) =>
                    !needle ||
                    club.toLowerCase().includes(needle) ||
                    group.league.toLowerCase().includes(needle) ||
                    row.sport.toLowerCase().includes(needle)
                ),
              }))
              .filter((group) => group.clubs.length > 0),
          }))
          .filter((row) => row.leagues.length > 0)
      : null;
  const groups = (
    fromRegister
      ? [["Registered clubs", registered] as [string, string[]]]
      : sportRows
        ? []
        : Object.entries(CURRENT_SEASON_LEAGUES)
  )
    .map(([league, list]) => {
      const filtered = needle
        ? list.filter(
            (club) =>
              club.toLowerCase().includes(needle) ||
              league.toLowerCase().includes(needle)
          )
        : list;
      return [league, filtered] as [string, string[]];
    })
    .filter(([, list]) => list.length > 0);
  const listedClubs = sportRows
    ? sportRows.flatMap((row) =>
        row.leagues.flatMap((league) => league.clubs)
      )
    : groups.flatMap(([, list]) => list);
  const extra =
    value &&
    !listedClubs.some((club) => club.toLowerCase() === value.toLowerCase())
      ? value
      : "";
  const readOnly = fromRegister && registered.length <= 1;

  function chooseClub(club: string) {
    onChange(club);
    setQuery("");
    setOpen(false);
  }

  if (readOnly) {
    return (
      <div>
        <p className="text-sm text-slate-400">Club</p>
        <div
          aria-label="Club"
          className="mt-2 w-full rounded-lg border border-slate-600 bg-white p-3 text-left font-semibold text-slate-950"
        >
          {value || registered[0] || "Club"}
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <p className="text-sm text-slate-400">Club</p>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Club"
        onClick={() => setOpen((current) => !current)}
        className="mt-2 flex w-full items-center justify-between rounded-lg border border-slate-600 bg-white p-3 text-left font-semibold text-slate-950"
      >
        <span>{value || registered[0] || extra || "Club"}</span>
        <span aria-hidden="true">▾</span>
      </button>
      {open ? (
        <div
          role="listbox"
          aria-label={
            registered.length > 0
              ? "Registered clubs"
              : allPlatformClubs
                ? "All clubs on the platform"
                : "Premier League and Scottish Premiership clubs"
          }
          className={`absolute z-40 mt-2 w-full min-w-[18rem] rounded-xl border border-slate-300 bg-white p-3 shadow-lg ${
            allPlatformClubs ? "max-h-[70vh] overflow-y-auto" : ""
          }`}
        >
          {allPlatformClubs ? (
            <div className="sticky top-0 z-10 bg-white pb-3">
              <input
                type="search"
                aria-label="Search clubs"
                placeholder="Search clubs"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-3 text-base text-slate-950"
              />
            </div>
          ) : null}
          {sportRows
            ? sportRows.map((row) => {
                const icon = sportCategory(row.sport)?.icon ?? "";
                const leagueCount = row.leagues.length;
                const clubCount = row.leagues.reduce(
                  (total, league) => total + league.clubs.length,
                  0
                );
                return (
                  <AccordionBlock
                    key={row.sport}
                    startOpen={row.sport === "Football"}
                    forceOpen={Boolean(needle)}
                    data-club-sport-accordion="sport-league-accordion-v1"
                    data-sport-name={row.sport}
                    className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-2 last:mb-0"
                    summaryClassName="flex cursor-pointer list-none items-center justify-between gap-3 px-2 py-2 font-black text-slate-950 [&::-webkit-details-marker]:hidden"
                    summary={
                      <>
                        <span>
                          {icon ? `${icon} ` : ""}
                          {row.sport}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          {leagueCount}{" "}
                          {leagueCount === 1 ? "league" : "leagues"} ·{" "}
                          {clubCount} {clubCount === 1 ? "club" : "clubs"}
                        </span>
                      </>
                    }
                  >
                    <div className="mt-2 grid gap-2">
                      {row.leagues.map((league) => (
                        <AccordionBlock
                          key={league.league}
                          startOpen={DEFAULT_OPEN_LEAGUES.has(league.league)}
                          forceOpen={Boolean(needle)}
                          data-club-league-accordion="sport-league-accordion-v1"
                          className="rounded-lg border border-slate-200 bg-white p-2"
                          summaryClassName="flex cursor-pointer list-none items-center justify-between gap-2 px-1 py-2 text-sm font-black uppercase tracking-[0.12em] text-slate-700 [&::-webkit-details-marker]:hidden"
                          summary={
                            <>
                              <span>{league.league}</span>
                              <span className="font-semibold normal-case tracking-normal text-slate-500">
                                {league.clubs.length}{" "}
                                {league.clubs.length === 1 ? "club" : "clubs"}
                              </span>
                            </>
                          }
                        >
                          <div className="mt-2 grid gap-2">
                            {league.clubs.map((club) => {
                              const selected =
                                value.toLowerCase() === club.toLowerCase();
                              return (
                                <button
                                  key={club}
                                  type="button"
                                  role="option"
                                  aria-selected={selected}
                                  onPointerDown={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    chooseClub(club);
                                  }}
                                  className={pickClubClass(selected)}
                                >
                                  {club}
                                </button>
                              );
                            })}
                          </div>
                        </AccordionBlock>
                      ))}
                    </div>
                  </AccordionBlock>
                );
              })
            : groups.map(([league, clubs]) => (
                <div key={league} className="mb-3 last:mb-0">
                  <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {league}
                    <span className="ml-2 font-normal normal-case tracking-normal">
                      {clubs.length} {clubs.length === 1 ? "club" : "clubs"}
                    </span>
                  </p>
                  <div className="grid gap-2">
                    {clubs.map((club) => {
                      const selected =
                        value.toLowerCase() === club.toLowerCase();
                      return (
                        <button
                          key={club}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onPointerDown={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            chooseClub(club);
                          }}
                          className={pickClubClass(selected)}
                        >
                          {club}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
          {extra ? (
            <button
              type="button"
              role="option"
              aria-selected
              onClick={() => setOpen(false)}
              className="mt-1 w-full rounded-lg border border-s4p-mark bg-s4p-mark px-3 py-3 text-left text-base font-semibold text-slate-950"
            >
              {extra}
            </button>
          ) : null}
          {allPlatformClubs && sportRows && sportRows.length === 0 ? (
            <p className="px-1 py-2 text-sm text-slate-500">
              No club matches that search.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function FixtureChoiceButton({
  fixture,
  selected,
  onPick,
}: {
  fixture: ClubFixture;
  selected: boolean;
  onPick: (fixture: ClubFixture) => void;
}) {
  const details = matchDetailsLines(fixture);
  const kind = fixtureKindLabel(fixture.competition);
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      data-fixture-kind={kind}
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onPick(fixture);
      }}
      className={`rounded-xl border px-3 py-3 text-left ${
        selected
          ? "border-s4p-mark bg-s4p-mark/80 text-slate-950"
          : "border-slate-300 bg-white text-slate-950 hover:border-s4p-mark"
      }`}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="block text-base font-black">{fixture.fixtureName}</span>
        <span className="shrink-0 rounded-full border border-emerald-700 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-800">
          {kind}
        </span>
      </span>
      <span className="mt-1 block text-sm font-semibold text-slate-700">
        {fixturePickerDate(fixture.date)} · {details.kickoff}
      </span>
      <span className="mt-0.5 block text-sm font-normal text-slate-600">
        {details.venue}
      </span>
    </button>
  );
}

export function MatchFixtureMenu({
  clubName,
  value,
  fixtures,
  loading,
  onChange,
  layout = "dropdown",
}: {
  clubName: string;
  value: string;
  fixtures: ClubFixture[];
  loading: boolean;
  onChange: (fixture: ClubFixture) => void;
  layout?: "dropdown" | "list";
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useDismiss(open, () => setOpen(false));
  const selected =
    fixtures.find(
      (row) => row.id === value || row.fixtureName === value
    ) ?? null;
  const disabled = !clubName;
  const list = layout === "list";

  const choices =
    loading ? (
      <p className="px-1 py-2 text-sm text-slate-500">
        Loading published fixtures...
      </p>
    ) : fixtures.length === 0 ? (
      <p className="px-1 py-2 text-sm text-slate-500">
        No published Matches for {clubName} yet.
      </p>
    ) : (
      <div className="grid gap-2">
        {fixtures.map((fixture) => (
          <FixtureChoiceButton
            key={fixture.id}
            fixture={fixture}
            selected={
              selected?.id === fixture.id ||
              selected?.fixtureName === fixture.fixtureName
            }
            onPick={(row) => {
              onChange(row);
              setOpen(false);
            }}
          />
        ))}
      </div>
    );

  if (list) {
    return (
      <div>
        <p className="text-sm text-slate-400">Match</p>
        {disabled ? (
          <div
            aria-label="Select the Match"
            className="mt-2 w-full rounded-lg border border-slate-600 bg-white p-3 text-left font-semibold text-slate-950 opacity-50"
          >
            Select the Match
          </div>
        ) : (
          <div
            role="listbox"
            aria-label="Published matches"
            className="mt-2 max-h-[28rem] overflow-y-auto rounded-xl border border-slate-300 bg-white p-3"
          >
            {choices}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <p className="text-sm text-slate-400">Match</p>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select the Match"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen((current) => !current);
        }}
        className="mt-2 flex w-full items-center justify-between rounded-lg border border-slate-600 bg-white p-3 text-left font-semibold text-slate-950 disabled:opacity-50"
      >
        <span>
          {loading
            ? "Loading published fixtures..."
            : selected?.fixtureName || "Select the Match"}
        </span>
        <span aria-hidden="true">▾</span>
      </button>
      {open && !disabled ? (
        <div
          role="listbox"
          aria-label="Published matches"
          className="absolute z-40 mt-2 max-h-[28rem] w-full overflow-y-auto rounded-xl border border-slate-300 bg-white p-3 shadow-lg"
        >
          {choices}
        </div>
      ) : null}
    </div>
  );
}
