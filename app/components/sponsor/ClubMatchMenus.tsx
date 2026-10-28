"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { sportingCalendarClubGroups } from "@/app/lib/calendar-clubs";
import { CURRENT_SEASON_LEAGUES } from "@/app/lib/current-season";
import type { ClubFixture } from "@/app/lib/club-fixtures";
import {
  clubsOnSportingCalendar,
  resolveSportingCalendarClub,
} from "@/app/lib/sporting-calendar";

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
  const groups = (
    fromRegister
      ? [["Registered clubs", registered] as [string, string[]]]
      : allPlatformClubs
        ? sportingCalendarClubGroups().map(
            (group) => [group.league, group.clubs] as [string, string[]]
          )
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
  const extra =
    value &&
    !groups.some(([, list]) =>
      list.some((club) => club.toLowerCase() === value.toLowerCase())
    )
      ? value
      : "";
  const readOnly = fromRegister && registered.length <= 1;

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
          className={`absolute z-40 mt-2 w-full min-w-[16rem] rounded-xl border border-slate-300 bg-white p-3 shadow-lg ${
            allPlatformClubs ? "max-h-[24rem] overflow-y-auto" : ""
          }`}
        >
          {allPlatformClubs ? (
            <input
              type="search"
              aria-label="Search clubs"
              placeholder="Search clubs"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="mb-3 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-950"
            />
          ) : null}
          {groups.map(([league, clubs]) => (
            <div key={league} className="mb-3 last:mb-0">
              <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {league}
                <span className="ml-2 font-normal normal-case tracking-normal">
                  {clubs.length} {clubs.length === 1 ? "club" : "clubs"}
                </span>
              </p>
              <div className="grid gap-2">
                {clubs.map((club) => {
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
                        onChange(club);
                        setQuery("");
                        setOpen(false);
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
          ))}
          {extra ? (
            <button
              type="button"
              role="option"
              aria-selected
              onClick={() => setOpen(false)}
              className="mt-1 w-full rounded-lg border border-s4p-mark bg-s4p-mark px-3 py-2 text-left text-sm font-semibold text-slate-950"
            >
              {extra}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function MatchFixtureMenu({
  clubName,
  value,
  fixtures,
  loading,
  onChange,
}: {
  clubName: string;
  value: string;
  fixtures: ClubFixture[];
  loading: boolean;
  onChange: (fixture: ClubFixture) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useDismiss(open, () => setOpen(false));
  const selected =
    fixtures.find(
      (row) => row.id === value || row.fixtureName === value
    ) ?? null;
  const disabled = !clubName;

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
          className="absolute z-40 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-slate-300 bg-white p-3 shadow-lg"
        >
          {fixtures.length === 0 ? (
            <p className="px-1 py-2 text-sm text-slate-500">
              No published Matches for {clubName} yet.
            </p>
          ) : (
            <div className="grid gap-2">
              {fixtures.map((fixture) => {
                const on =
                  selected?.id === fixture.id ||
                  selected?.fixtureName === fixture.fixtureName;
                return (
                  <button
                    key={fixture.id}
                    type="button"
                    role="option"
                    aria-selected={on}
                    onPointerDown={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onChange(fixture);
                      setOpen(false);
                    }}
                    className={`rounded-lg border px-3 py-2 text-left text-sm font-semibold ${
                      on
                        ? "border-s4p-mark bg-s4p-mark text-slate-950"
                        : "border-slate-300 bg-white text-slate-950 hover:border-s4p-mark"
                    }`}
                  >
                    <span className="block">{fixture.fixtureName}</span>
                    <span className="mt-1 block text-xs font-normal text-slate-500">
                      {fixture.competition}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
