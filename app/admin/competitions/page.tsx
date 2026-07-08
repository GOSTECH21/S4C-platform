"use client";

import { useEffect, useState } from "react";
import AppLayout from "../../layout/AppLayout";
import { getSports } from "../../services/sports.service";
import {
  createCompetition,
  getCompetitions,
} from "../../services/competitions.service";

type Sport = {
  id: string;
  name: string;
};

type Competition = {
  id: string;
  name: string;
  country: string;
  season: string;
  sports?: {
    name: string;
  };
};

export default function CompetitionsAdminPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);

  const [sportId, setSportId] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [season, setSeason] = useState("");

  async function loadData() {
    const sportsData = await getSports();
    const competitionsData = await getCompetitions();

    setSports(sportsData || []);
    setCompetitions(competitionsData || []);
  }

  async function handleCreateCompetition() {
    if (!sportId || !name.trim()) return;

    await createCompetition({
      sportId,
      name: name.trim(),
      country: country.trim(),
      season: season.trim(),
    });

    setSportId("");
    setName("");
    setCountry("");
    setSeason("");

    await loadData();
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-5xl font-bold text-green-400">
            Competitions Admin
          </h1>

          <p className="mt-3 text-slate-300">
            Create and manage competitions supported by Score for Climate.
          </p>
        </div>

        <div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900 p-6 md:grid-cols-4">
          <select
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            value={sportId}
            onChange={(event) => setSportId(event.target.value)}
          >
            <option value="">Select sport</option>
            {sports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>

          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="Competition name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="Country"
            value={country}
            onChange={(event) => setCountry(event.target.value)}
          />

          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="Season, e.g. 2026/27"
            value={season}
            onChange={(event) => setSeason(event.target.value)}
          />

          <button
            onClick={handleCreateCompetition}
            className="rounded-lg bg-green-500 px-6 py-3 font-semibold text-slate-950 md:col-span-4"
          >
            Add Competition
          </button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-6 text-2xl font-bold">Competitions</h2>

          <div className="space-y-3">
            {competitions.map((competition) => (
              <div
                key={competition.id}
                className="grid gap-3 rounded-lg border border-slate-800 bg-slate-950 p-4 md:grid-cols-4"
              >
                <div>{competition.name}</div>
                <div className="text-slate-400">
                  {competition.sports?.name}
                </div>
                <div className="text-slate-400">{competition.country}</div>
                <div className="text-slate-400">{competition.season}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}