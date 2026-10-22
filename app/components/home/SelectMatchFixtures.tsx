"use client";

import { useEffect, useMemo, useState } from "react";
import { sportingCalendarClubGroups } from "@/app/lib/calendar-clubs";
import {
  formatKickoff,
  formatMatchDate,
} from "@/app/lib/upcoming-matches";

const MARK_GREEN = "#5bc662";

export type HomeUpcomingMatch = {
  id: string;
  date: string;
  kickoff: string;
  league: string;
  cup: boolean;
  homeName: string;
  awayName: string;
  venue: string;
  fixtureName: string;
};

export default function SelectMatchFixtures({
  trigger,
}: {
  trigger?: { club: string; n: number } | null;
}) {
  const groups = useMemo(
    () =>
      sportingCalendarClubGroups().filter((group) => group.sport === "Football"),
    []
  );
  const [club, setClub] = useState("Arsenal");
  const [matches, setMatches] = useState<HomeUpcomingMatch[] | null>(null);
  const [resolvedClub, setResolvedClub] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(nextClub: string) {
    const name = nextClub.trim();
    if (!name) {
      setError("Choose a club from the list to see their upcoming matches.");
      setMatches([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/home/upcoming-matches?club=${encodeURIComponent(name)}`
      );
      const payload = (await response.json()) as {
        club?: string;
        matches?: HomeUpcomingMatch[];
        error?: string;
      };
      setResolvedClub(payload.club || name);
      setMatches(payload.matches ?? []);
      setError(payload.error ?? null);
    } catch {
      setError("Could not load upcoming matches. Try again.");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!trigger?.club) return;
    setClub(trigger.club);
    void load(trigger.club);
  }, [trigger]);

  return (
    <div className="mt-6 max-w-xl">
      <label className="block text-xs font-black uppercase tracking-[0.18em]">
        Choose your club
        <select
          aria-label="Choose your club"
          value={club}
          onChange={(event) => {
            setClub(event.target.value);
            setMatches(null);
            setError(null);
          }}
          className="mt-2 w-full rounded-xl border border-emerald-400/40 bg-s4p-paper px-3 py-3 text-sm font-semibold"
        >
          {groups.map((group) => (
            <optgroup key={group.league} label={group.league}>
              {group.clubs.map((name) => (
                <option key={`${group.league}-${name}`} value={name}>
                  {name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={() => void load(club)}
        className="mt-3 inline-flex items-center rounded-full bg-s4p-mark px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-black hover:brightness-110"
      >
        See upcoming matches <span aria-hidden> →</span>
      </button>
      {loading ? (
        <p className="mt-4 text-sm font-semibold">Loading upcoming matches...</p>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm font-semibold">{error}</p>
      ) : null}
      {matches && !loading ? (
        <div className="mt-4">
          <p className="text-xs font-black uppercase tracking-[0.18em]">
            {resolvedClub}&apos;s next {matches.length} league and cup matches
          </p>
          {matches.length === 0 ? (
            <p className="mt-3 text-sm font-semibold">
              No upcoming matches found for this club yet.
            </p>
          ) : (
            <ol className="mt-3 space-y-3">
              {matches.map((match, index) => (
                <li
                  key={match.id}
                  className="rounded-2xl border border-emerald-400/30 bg-s4p-paper px-3 py-3"
                >
                  <p className="flex flex-wrap items-center gap-2 text-[0.7rem] font-black uppercase tracking-[0.16em]">
                    <span>
                      {index + 1}. {formatMatchDate(match.date)} ·{" "}
                      {formatKickoff(match.kickoff)}
                    </span>
                    {match.cup ? (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-black tracking-[0.14em] text-black"
                        style={{ backgroundColor: MARK_GREEN }}
                      >
                        Cup
                      </span>
                    ) : (
                      <span className="rounded-full border border-emerald-400/40 px-2 py-0.5 text-[10px] font-black tracking-[0.14em]">
                        League
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm font-black leading-snug">
                    {match.fixtureName}
                  </p>
                  <p className="mt-1 text-xs font-semibold leading-5">
                    {[match.venue, match.league].filter(Boolean).join(" · ")}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      ) : null}
    </div>
  );
}
