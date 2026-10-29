"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import TeamPicker from "@/app/components/fan/TeamPicker";
import MyTeamsList from "@/app/components/fan/MyTeamsList";
import UpcomingMatches from "@/app/components/fan/UpcomingMatches";
import HowS4pSelectMatch from "@/app/components/home/HowS4pSelectMatch";
import {
  getSupportedTeams,
  loadFanRegisterCatalog,
  saveSupportedTeams,
  writeLocalSupportedClubs,
  type TeamGroup,
  type TeamOption,
} from "@/app/services/teams.service";
import { getOrCreateSupporter } from "@/app/services/votes.service";
import { FAN_LOGIN_PATH } from "@/app/lib/routes";
import {
  isCupCompetition,
  matchSortKey,
  type UpcomingMatch,
} from "@/app/lib/upcoming-matches";
import { CURRENT_SEASON } from "@/app/lib/current-season";
import { FAN_REGISTER_TEAMS_COPY } from "@/app/lib/fan-register-copy";
import { calendarMatchesAsUpcoming } from "@/app/lib/sporting-calendar";

async function loadFixtures(teams: TeamOption[]) {
  const response = await fetch("/api/fan/next-fixtures", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      teams: teams.map((team) => ({
        id: team.id,
        name: team.name,
        displayName: team.displayName,
        sport: team.sport,
      })),
    }),
  });
  if (!response.ok) {
    throw new Error("Could not load upcoming matches.");
  }
  const payload = (await response.json()) as {
    fixtures?: Record<string, UpcomingMatch[]>;
  };
  return fixturesWithCalendar(teams, payload.fixtures ?? {});
}

function fixturesWithCalendar(
  teams: TeamOption[],
  loaded: Record<string, UpcomingMatch[]>
): Record<string, UpcomingMatch[]> {
  const next = { ...loaded };
  for (const team of teams) {
    if ((next[team.id] ?? []).length > 0) continue;
    const fromCalendar = calendarMatchesAsUpcoming(team.name);
    if (fromCalendar.length > 0) next[team.id] = fromCalendar;
  }
  return next;
}

export default function FanMyTeamsPanel() {
  const [catalog, setCatalog] = useState<TeamGroup[]>([]);
  const [selected, setSelected] = useState<TeamOption[]>([]);
  const [fixtures, setFixtures] = useState<Record<string, UpcomingMatch[]>>({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingFixtures, setLoadingFixtures] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const supporter = await getOrCreateSupporter();
        if (!supporter) {
          window.location.href = FAN_LOGIN_PATH;
          return;
        }
        const [groups, teams] = await Promise.all([
          loadFanRegisterCatalog(),
          getSupportedTeams(supporter),
        ]);
        setCatalog(groups);
        setSelected(teams);
        setEditing(teams.length === 0);
        if (teams.length > 0) {
          setLoadingFixtures(true);
          try {
            setFixtures(await loadFixtures(teams));
          } catch (err) {
            setError(
              err instanceof Error
                ? err.message
                : "Could not load upcoming matches."
            );
          } finally {
            setLoadingFixtures(false);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load teams.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function save() {
    if (busy) return;
    setError(null);
    if (selected.length === 0) {
      setError("Select at least one team you want to support.");
      return;
    }
    setBusy(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const supporter = await getOrCreateSupporter();
      if (!user || !supporter) {
        window.location.href = FAN_LOGIN_PATH;
        return;
      }
      await saveSupportedTeams(user.id, supporter.id, selected);
      setEditing(false);
      setBusy(false);
      setLoadingFixtures(true);
      try {
        setFixtures(await loadFixtures(selected));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not load upcoming matches."
        );
      } finally {
        setLoadingFixtures(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your teams.");
      setBusy(false);
    }
  }

  const upcoming = selected
    .flatMap((team) => {
      const next = fixtures[team.id]?.[0];
      return next
        ? [{ clubId: team.id, clubName: team.displayName, match: next }]
        : [];
    })
    .sort((a, b) => matchSortKey(a.match).localeCompare(matchSortKey(b.match)));

  const cups = selected
    .flatMap((team) =>
      (fixtures[team.id] ?? [])
        .filter((match) => isCupCompetition(match.competition))
        .map((match) => ({
          clubId: team.id,
          clubName: team.displayName,
          match,
        }))
    )
    .sort((a, b) => matchSortKey(a.match).localeCompare(matchSortKey(b.match)));

  return (
    <section id="my-teams" className="scroll-mt-28 px-6 pb-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
              My Teams
            </p>
            <h2 className="mt-3 text-3xl font-black">
              {editing ? "Add or change teams" : "My teams"}
            </h2>
            <p className="mt-3 max-w-2xl text-slate-300">
              {editing
                ? FAN_REGISTER_TEAMS_COPY
                : `Showing only the clubs you selected from the current ${CURRENT_SEASON} season. Click a league to see your teams, next matches, and cup ties.`}
            </p>
          </div>

          {!loading && selected.length > 0 && (
            <button
              type="button"
              onClick={() => setEditing((value) => !value)}
              className="rounded-lg border border-green-500/40 px-5 py-3 font-bold text-green-300 hover:bg-green-500/10"
            >
              {editing ? "Show my teams" : "Add or change teams"}
            </button>
          )}
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <p className="mt-8 text-slate-400">Loading teams...</p>
        ) : (
          <div className="mt-8 space-y-8">
            {editing ? (
              <TeamPicker
                catalog={catalog}
                selected={selected}
                onChange={(teams) => {
                  setSelected(teams);
                  void supabase.auth.getUser().then(({ data: { user } }) => {
                    if (user) {
                      writeLocalSupportedClubs(
                        user.id,
                        teams.map((team) => team.name)
                      );
                    }
                  });
                }}
                showScorePrice={false}
                openCompetitions={new Set()}
              />
            ) : (
              <>
                <HowS4pSelectMatch
                  audience="fan"
                  initialClub={selected[0]?.name}
                  clubOptions={selected.map((team) => team.name)}
                />
                <UpcomingMatches
                  items={upcoming}
                  cups={cups}
                  loading={loadingFixtures}
                />
                <MyTeamsList teams={selected} fixtures={fixtures} />
              </>
            )}
          </div>
        )}

        {editing && (
          <button
            onClick={save}
            disabled={busy || selected.length === 0}
            className="mt-8 w-full rounded-lg bg-green-400 py-4 font-bold text-slate-950 disabled:opacity-40"
          >
            {busy ? "Saving..." : "Save My Teams"}
          </button>
        )}
      </div>
    </section>
  );
}
