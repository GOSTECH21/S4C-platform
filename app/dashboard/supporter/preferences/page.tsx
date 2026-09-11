"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import FanNav from "../components/FanNav";
import TeamPicker from "@/app/components/fan/TeamPicker";
import {
  getSupportedTeams,
  getTeamCatalog,
  saveSupportedTeams,
  type TeamGroup,
  type TeamOption,
} from "@/app/services/teams.service";
import { getOrCreateSupporter } from "@/app/services/votes.service";
import { FAN_LOGIN_PATH, SUPPORTER_CAMPAIGN_PATH } from "@/app/lib/routes";

export default function SupporterPreferencesPage() {
  const [catalog, setCatalog] = useState<TeamGroup[]>([]);
  const [selected, setSelected] = useState<TeamOption[]>([]);
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
          getTeamCatalog(),
          getSupportedTeams(supporter),
        ]);
        setCatalog(groups);
        setSelected(teams);
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
      window.location.href = SUPPORTER_CAMPAIGN_PATH;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your teams.");
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-5xl">
        <FanNav />

        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          My Teams & Sports
        </p>
        <h1 className="mt-3 text-4xl font-black">Choose the teams you follow</h1>
        <p className="mt-3 text-slate-300">
          My S4P only shows matches for the teams you support. When that team
          is playing, you receive the five climate projects their sustainability
          director selected for the match.
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <p className="mt-8 text-slate-400">Loading teams...</p>
        ) : (
          <div className="mt-8">
            <TeamPicker catalog={catalog} selected={selected} onChange={setSelected} />
          </div>
        )}

        <button
          onClick={save}
          disabled={busy || selected.length === 0}
          className="mt-8 w-full rounded-lg bg-green-400 py-4 font-bold text-slate-950 disabled:opacity-40"
        >
          {busy ? "Saving..." : "Save My Teams"}
        </button>
      </div>
    </main>
  );
}
