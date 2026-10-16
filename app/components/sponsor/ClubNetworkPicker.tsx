"use client";

import { useMemo, useState } from "react";
import { sportingCalendarClubGroups } from "@/app/lib/calendar-clubs";
import { clubNetworkLeagueId } from "@/app/lib/climate-sponsors";

export function ClubNetworkPicker({
  selected,
  onChange,
  compact = false,
  single = false,
  matchDayClub,
  onChooseMatchDayClub,
  highlightLeague = null,
}: {
  selected: string[];
  onChange: (clubs: string[]) => void;
  compact?: boolean;
  single?: boolean;
  matchDayClub?: string;
  onChooseMatchDayClub?: (club: string) => void;
  highlightLeague?: string | null;
}) {
  const [query, setQuery] = useState("");
  const selectedSet = new Set(selected.map((name) => name.toLowerCase()));

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return sportingCalendarClubGroups()
      .map((group) => {
        const leagueHit =
          Boolean(needle) &&
          (group.league.toLowerCase().includes(needle) ||
            group.sport.toLowerCase().includes(needle) ||
            group.country.toLowerCase().includes(needle));
        return {
          ...group,
          clubs: leagueHit
            ? group.clubs
            : group.clubs.filter((club) =>
                needle ? club.toLowerCase().includes(needle) : true
              ),
        };
      })
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
    onChange(single ? [club] : [...selected, club]);
    onChooseMatchDayClub?.(club);
  }

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search clubs or type Arsenal, Barcelona, Patriots…"
        className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-950"
      />
      {selected.length > 0 && (
        <p className="mt-3 text-sm text-slate-600">
          Goal Sponsorship Network: {selected.join(", ")}
        </p>
      )}
      <div className={`mt-4 space-y-3 ${compact ? "max-h-96 overflow-y-auto pr-1" : ""}`}>
        {groups.map((group) => {
          const hasSelected = group.clubs.some((club) =>
            selectedSet.has(club.toLowerCase())
          );
          return (
            <details
              key={group.league}
              id={clubNetworkLeagueId(group.league)}
              open={
                Boolean(query) ||
                group.league === highlightLeague ||
                group.league === "Premier League" ||
                group.league === "Scottish Premiership" ||
                hasSelected
              }
              className="scroll-mt-6 rounded-xl border border-slate-300 bg-white p-4"
            >
              <summary className="cursor-pointer font-semibold text-slate-950">
                {group.league}
                <span className="ml-2 text-sm font-normal text-slate-500">
                  {group.sport} · {group.country} · {group.clubs.length} clubs
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
                        locked || on
                          ? "border-s4p-mark bg-s4p-mark text-slate-950"
                          : "border-slate-300 bg-white text-slate-950"
                      }`}
                    >
                      {locked ? "Match Day · " : on ? "✓ " : ""}
                      {club}
                    </button>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
