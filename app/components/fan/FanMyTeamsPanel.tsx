"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/app/lib/supabase";
import TeamPicker from "@/app/components/fan/TeamPicker";

const HowS4pSelectMatch = dynamic(
  () => import("@/app/components/home/HowS4pSelectMatch"),
  { ssr: false }
);
import {
  getSupportedTeams,
  loadFanRegisterCatalog,
  saveSupportedTeams,
  writeLocalSupportedClubs,
  type TeamGroup,
  type TeamOption,
} from "@/app/services/teams.service";
import { getOrCreateSupporter } from "@/app/services/fan-session.service";
import { FAN_LOGIN_PATH } from "@/app/lib/routes";
import { CURRENT_SEASON } from "@/app/lib/current-season";
import {
  FAN_REGISTER_TEAMS_COPY,
  FAN_REGISTER_TEAMS_INTRO,
} from "@/app/lib/fan-register-copy";

export default function FanMyTeamsPanel() {
  const [catalog, setCatalog] = useState<TeamGroup[]>([]);
  const [selected, setSelected] = useState<TeamOption[]>([]);
  const [editing, setEditing] = useState(true);
  const [savedOpen, setSavedOpen] = useState(true);
  const [hasSavedTeams, setHasSavedTeams] = useState(false);
  const [loading, setLoading] = useState(true);
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
        if (teams.length > 0) {
          setHasSavedTeams(true);
          setSavedOpen(false);
          setEditing(false);
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
      setHasSavedTeams(true);
      setSavedOpen(false);
      setEditing(true);
      setBusy(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your teams.");
      setBusy(false);
    }
  }

  const clubNames = useMemo(
    () => selected.map((team) => team.name),
    [selected]
  );

  const picker = (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-black">
            {editing ? "Add or change teams" : "My teams"}
          </h2>
          <p className="mt-3 max-w-2xl text-slate-300">
            {editing
              ? FAN_REGISTER_TEAMS_COPY
              : `Showing only the clubs you selected from the current ${CURRENT_SEASON} season. Choose a club to see its next 10 league and cup matches.`}
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
              catalogAccordion
            />
          ) : (
            <HowS4pSelectMatch
              audience="fan"
              initialClub={selected[0]?.name}
              clubOptions={clubNames}
            />
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
    </>
  );

  return (
    <section id="my-teams" className="scroll-mt-28 px-6 pb-8 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          My Teams
        </p>

        {hasSavedTeams ? (
          <div
            data-saved-teams-accordion="saved-teams-accordion-v1"
            className="mt-3 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950"
          >
            <h3>
              <button
                type="button"
                aria-expanded={savedOpen}
                aria-controls="saved-teams-picker"
                onClick={() => setSavedOpen((open) => !open)}
                className="flex w-full items-center justify-between gap-3 p-4 text-left sm:p-5"
              >
                <span className="text-base font-semibold text-slate-200 sm:text-lg">
                  {FAN_REGISTER_TEAMS_INTRO}
                </span>
                <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                  {savedOpen ? "Hide" : "Change teams"}
                </span>
              </button>
            </h3>
            {savedOpen ? (
              <div id="saved-teams-picker" className="px-4 pb-5 sm:px-5">
                {picker}
              </div>
            ) : (
              <p className="sr-only">{FAN_REGISTER_TEAMS_COPY}</p>
            )}
          </div>
        ) : (
          <div className="mt-3">{picker}</div>
        )}
      </div>
    </section>
  );
}
