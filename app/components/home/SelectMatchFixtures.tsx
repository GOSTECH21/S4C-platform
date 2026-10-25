"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import { sportingCalendarClubGroups } from "@/app/lib/calendar-clubs";
import { hardNavigateOnClick } from "@/app/lib/hard-navigate";
import {
  savePendingSponsorMatch,
  sponsorFromMatchPath,
} from "@/app/lib/pending-sponsor-match";
import {
  formatKickoff,
  formatMatchDate,
} from "@/app/lib/upcoming-matches";

const MARK_GREEN = "#5bc662";
const MINT = "#0c5c2c";

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

type SelectMatchState = {
  groups: ReturnType<typeof sportingCalendarClubGroups>;
  club: string;
  setClub: (club: string) => void;
  matches: HomeUpcomingMatch[] | null;
  selectedMatch: HomeUpcomingMatch | null;
  setSelectedMatch: (match: HomeUpcomingMatch) => void;
  resolvedClub: string | null;
  loading: boolean;
  error: string | null;
  load: (nextClub: string) => Promise<void>;
};

const SelectMatchContext = createContext<SelectMatchState | null>(null);

function clubPossessive(club: string) {
  if (!club) return "This club's";
  return club.endsWith("s") ? `${club}'` : `${club}'s`;
}

function formatMatchDateYear(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return formatMatchDate(date);
  return parsed.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function clubInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "FC";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function useSelectMatch() {
  const ctx = useContext(SelectMatchContext);
  if (!ctx) {
    throw new Error("SelectMatchProvider is required");
  }
  return ctx;
}

export function SelectMatchProvider({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  const groups = useMemo(
    () =>
      sportingCalendarClubGroups().filter((group) => group.sport === "Football"),
    []
  );
  const [club, setClub] = useState("Arsenal");
  const [matches, setMatches] = useState<HomeUpcomingMatch[] | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<HomeUpcomingMatch | null>(
    null
  );
  const [resolvedClub, setResolvedClub] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const load = useCallback(async (nextClub: string) => {
    const name = nextClub.trim();
    const id = ++requestId.current;
    if (!name) {
      setError("Choose a club from the list to see their upcoming matches.");
      setMatches([]);
      setSelectedMatch(null);
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
      if (id !== requestId.current) return;
      setResolvedClub(payload.club || name);
      const nextMatches = payload.matches ?? [];
      setMatches(nextMatches);
      setSelectedMatch((current) => {
        if (current && nextMatches.some((row) => row.id === current.id)) {
          return current;
        }
        return nextMatches[0] ?? null;
      });
      setError(payload.error ?? null);
    } catch {
      if (id !== requestId.current) return;
      setError("Could not load upcoming matches. Try again.");
      setMatches([]);
      setSelectedMatch(null);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    if (matches !== null) return;
    void load(club);
  }, [active, club, matches, load]);

  const value = useMemo(
    () => ({
      groups,
      club,
      setClub,
      matches,
      selectedMatch,
      setSelectedMatch,
      resolvedClub,
      loading,
      error,
      load,
    }),
    [
      groups,
      club,
      matches,
      selectedMatch,
      resolvedClub,
      loading,
      error,
      load,
    ]
  );

  return (
    <SelectMatchContext.Provider value={value}>
      {children}
    </SelectMatchContext.Provider>
  );
}

export function SelectMatchPhone({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const {
    club,
    resolvedClub,
    matches,
    selectedMatch,
    setSelectedMatch,
    loading,
    error,
  } = useSelectMatch();
  const shown = resolvedClub || club;

  return (
    <>
      <Image
        src={src}
        alt={alt}
        width={247}
        height={589}
        className="h-auto w-full"
        unoptimized
      />
      <div
        className="absolute z-20 overflow-hidden [pointer-events:auto]"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
        style={{
          top: "14.9%",
          left: "6.2%",
          right: "5.8%",
          bottom: "11.2%",
          backgroundColor: "#ffffff",
          borderRadius: "0 0 1.35rem 1.35rem",
        }}
        aria-live="polite"
        aria-label={`${clubPossessive(shown)} next ${
          matches?.length ?? 10
        } league and cup matches`}
      >
        <div className="flex h-full flex-col px-3 pt-2.5">
          <p
            className="flex items-center gap-1.5 text-[11px] font-black"
            style={{ color: MINT }}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill={MINT}
              aria-hidden
            >
              <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.4 0-8 1.7-8 5v1.5h16V19c0-3.3-4.6-5-8-5Z" />
            </svg>
            My Club
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-black"
              style={{ backgroundColor: MARK_GREEN }}
              aria-hidden
            >
              {clubInitials(shown)}
            </span>
            <p className="text-lg font-black leading-none">{shown}</p>
          </div>
          <div className="mt-3 flex gap-4 border-b border-emerald-400/30 text-[10px] font-black uppercase tracking-[0.16em]">
            <span
              className="border-b-2 pb-1.5"
              style={{ borderColor: MARK_GREEN, color: MARK_GREEN }}
            >
              Fixtures
            </span>
            <span className="pb-1.5 opacity-40">Results</span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2 pt-2 [touch-action:pan-y]">
            {loading ? (
              <p className="text-xs font-semibold">Loading upcoming matches...</p>
            ) : null}
            {error ? (
              <p className="text-xs font-semibold">{error}</p>
            ) : null}
            {matches && !loading ? (
              matches.length === 0 ? (
                <p className="text-xs font-semibold">
                  No upcoming matches found for this club yet.
                </p>
              ) : (
                <ol className="space-y-2">
                  {matches.map((match) => {
                    const pending = {
                      club: shown,
                      fixtureName: match.fixtureName,
                      league: match.league,
                      date: match.date,
                      kickoff: match.kickoff,
                      venue: match.venue,
                      matchId: match.id,
                    };
                    const href = sponsorFromMatchPath(pending);
                    const label = match.fixtureName.replace(" v ", " vs ");
                    const selected = selectedMatch?.id === match.id;
                    return (
                      <li key={match.id}>
                        <a
                          href={href}
                          data-phone-match-sponsor="true"
                          aria-current={selected ? "true" : undefined}
                          aria-label={`Sponsor ${label} — complete this sponsorship and sign it off`}
                          onPointerDown={(event) => event.stopPropagation()}
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedMatch(match);
                            savePendingSponsorMatch(pending);
                            hardNavigateOnClick(href, event);
                          }}
                          className={`block cursor-pointer rounded-2xl px-2.5 py-2 hover:brightness-[0.98] ${
                            selected ? "ring-2 ring-[#5bc662]" : ""
                          }`}
                          style={{ backgroundColor: "#f3f5f8" }}
                        >
                          <p className="flex flex-wrap items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.12em]">
                            <span>
                              {formatMatchDateYear(match.date)} ·{" "}
                              {formatKickoff(match.kickoff)}
                            </span>
                            {match.cup ? (
                              <span
                                className="rounded-full px-1.5 py-0.5 text-[8px] font-black tracking-[0.12em] text-black"
                                style={{ backgroundColor: MARK_GREEN }}
                              >
                                Cup
                              </span>
                            ) : (
                              <span className="rounded-full border border-emerald-400/50 px-1.5 py-0.5 text-[8px] font-black tracking-[0.12em]">
                                League
                              </span>
                            )}
                          </p>
                          <p className="mt-0.5 text-[11px] font-black leading-snug">
                            {label}
                          </p>
                          <p className="mt-0.5 text-[9px] font-semibold leading-4">
                            {[match.venue, match.league]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                          <span
                            className="mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-black"
                            style={{ backgroundColor: MARK_GREEN }}
                          >
                            Sponsor · Sign off
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ol>
              )
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

export default function SelectMatchFixtures() {
  const {
    groups,
    club,
    setClub,
    matches,
    resolvedClub,
    loading,
    error,
    load,
  } = useSelectMatch();
  const shown = resolvedClub || club;

  return (
    <div className="mt-6 max-w-xl">
      <label className="block text-xs font-black uppercase tracking-[0.18em]">
        Choose your club
        <select
          aria-label="Choose your club"
          value={club}
          onChange={(event) => {
            const next = event.target.value;
            setClub(next);
            void load(next);
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
        <p className="mt-4 text-sm font-semibold leading-6">
          {clubPossessive(shown)} next {matches.length} league and cup matches
          are on the phone. Tap a match to lock it in, complete your
          sponsorship and sign it off.
        </p>
      ) : null}
    </div>
  );
}
