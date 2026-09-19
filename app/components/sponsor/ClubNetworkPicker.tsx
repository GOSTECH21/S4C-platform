"use client";

import { useMemo, useState } from "react";
import { CURRENT_SEASON_LEAGUES } from "@/app/lib/current-season";

export function ClubNetworkPicker({
  selected,
  onChange,
  compact = false,
  matchDayClub,
  onChooseMatchDayClub,
}: {
  selected: string[];
  onChange: (clubs: string[]) => void;
  compact?: boolean;
  matchDayClub?: string;
  onChooseMatchDayClub?: (club: string) => void;
}) {
  const [query, setQuery] = useState("");
  const selectedSet = new Set(selected.map((name) => name.toLowerCase()));

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return Object.entries(CURRENT_SEASON_LEAGUES)
      .map(([league, clubs]) => ({
        league,
        clubs: clubs.filter((club) =>
          needle ? club.toLowerCase().includes(needle) : true
        ),
      }))
      .filter((group) => group.clubs.length > 0);
  }, [query]);

  function toggle(club: string) {
    if (selectedSet.has(club.toLowerCase())) {
      if (onChooseMatchDayClub) {
        onChooseMatchDayClub(club);
        return;
      }
      onChange(selected.filter((name) => name.toLowerCase() !== club.toLowerCase()));
      return;
    }
    onChange([...selected, club]);
    onChooseMatchDayClub?.(club);
  }

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search clubs or type Arsenal, Hibernian..."
        className="w-full rounded-lg bg-slate-800 p-3 text-white"
      />
      {selected.length > 0 && (
        <p className="mt-3 text-sm text-slate-300">
          Goal Sponsorship Network: {selected.join(", ")}
        </p>
      )}
      <div className={`mt-4 space-y-3 ${compact ? "max-h-72 overflow-y-auto pr-1" : ""}`}>
        {groups.map((group) => (
          <details
            key={group.league}
            open={Boolean(query) || group.league === "Premier League" || group.league === "Scottish Premiership"}
            className="rounded-xl border border-slate-800 bg-slate-950 p-4"
          >
            <summary className="cursor-pointer font-semibold">
              {group.league}
              <span className="ml-2 text-sm font-normal text-slate-400">
                {group.clubs.length} clubs
              </span>
            </summary>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {group.clubs.map((club) => {
                const on = selectedSet.has(club.toLowerCase());
                const locked =
                  Boolean(matchDayClub) &&
                  matchDayClub?.toLowerCase() === club.toLowerCase();
                return (
                  <button
                    key={club}
                    type="button"
                    onClick={() => toggle(club)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm font-semibold ${
                      locked
                        ? "border-amber-400 bg-amber-400 text-slate-950"
                        : on
                          ? "border-green-400 bg-green-400 text-slate-950"
                          : "border-slate-700 bg-slate-900 text-white"
                    }`}
                  >
                    {locked ? "Match Day · " : on ? "✓ " : ""}
                    {club}
                  </button>
                );
              })}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
