"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";

const options = {
  Football: ["Arsenal", "Chelsea", "Liverpool", "Manchester City", "Manchester United"],
  Rugby: ["Scotland", "England", "Ireland", "Wales"],
  Cricket: ["England", "India", "Australia", "South Africa"],
};

export default function SupporterPreferencesPage() {
  const [selected, setSelected] = useState<{ sport: string; club: string }[]>([]);

  function toggleClub(sport: string, club: string) {
    const exists = selected.some(
      (item) => item.sport === sport && item.club === club
    );

    if (exists) {
      setSelected(selected.filter((item) => !(item.sport === sport && item.club === club)));
    } else {
      setSelected([...selected, { sport, club }]);
    }
  }

  async function savePreferences() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in first.");
      return;
    }

    await supabase
      .from("supporter_preferences")
      .delete()
      .eq("user_id", user.id);

    const { error } = await supabase.from("supporter_preferences").insert(
      selected.map((item) => ({
        user_id: user.id,
        sport: item.sport,
        club: item.club,
      }))
    );

    if (error) {
      alert(error.message);
      return;
    }

    alert("Preferences saved.");
    window.location.href="/dashboard/supporter/calendar"
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          My Teams & Sports
        </p>

        <h1 className="mt-3 text-4xl font-black">
          Choose the teams you follow
        </h1>

        <p className="mt-3 text-slate-300">
          Select one or more teams. Your calendar will use these choices.
        </p>

        <div className="mt-10 grid gap-6">
          {Object.entries(options).map(([sport, clubs]) => (
            <section
              key={sport}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <h2 className="text-2xl font-bold text-green-400">{sport}</h2>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {clubs.map((club) => {
                  const active = selected.some(
                    (item) => item.sport === sport && item.club === club
                  );

                  return (
                    <button
                      key={club}
                      onClick={() => toggleClub(sport, club)}
                      className={`rounded-xl border p-4 text-left font-semibold ${
                        active
                          ? "border-green-400 bg-green-400 text-slate-950"
                          : "border-slate-700 bg-slate-950 text-white"
                      }`}
                    >
                      {active ? "✓ " : ""}{club}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <button
          onClick={savePreferences}
          disabled={selected.length === 0}
          className="mt-8 w-full rounded-lg bg-green-400 py-4 font-bold text-slate-950 disabled:opacity-40"
        >
          Save My Preferences
        </button>
      </div>
    </main>
  );
}