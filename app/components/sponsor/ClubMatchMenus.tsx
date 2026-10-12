"use client";

import { useEffect, useRef, useState } from "react";
import { CURRENT_SEASON_LEAGUES } from "@/app/lib/current-season";
import type { ClubFixture } from "@/app/lib/club-fixtures";

function useDismiss(open: boolean, onClose: () => void) {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onDoc(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, onClose]);
  return rootRef;
}

export function ClubLeagueMenu({
  value,
  onChange,
}: {
  value: string;
  onChange: (club: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useDismiss(open, () => setOpen(false));
  const groups = Object.entries(CURRENT_SEASON_LEAGUES);
  const extra =
    value &&
    !groups.some(([, clubs]) =>
      clubs.some((club) => club.toLowerCase() === value.toLowerCase())
    )
      ? value
      : "";

  return (
    <div ref={rootRef} className="relative">
      <p className="text-sm text-slate-400">Club</p>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select a club"
        onClick={() => setOpen((current) => !current)}
        className="mt-2 flex w-full items-center justify-between rounded-lg border border-slate-600 bg-white p-3 text-left font-semibold text-slate-950"
      >
        <span>{value || "Select a club"}</span>
        <span aria-hidden="true">▾</span>
      </button>
      {open ? (
        <div
          role="listbox"
          aria-label="Premier League and Scottish Premiership clubs"
          className="absolute z-40 mt-2 w-full min-w-[16rem] rounded-xl border border-slate-300 bg-white p-3 shadow-lg"
        >
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
                      onClick={() => {
                        onChange(club);
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
  const disabled = !clubName || loading;

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
                    onClick={() => {
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
