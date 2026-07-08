"use client";

import { useEffect, useState } from "react";
import AppLayout from "../../layout/AppLayout";
import { getCompetitions } from "../../services/competitions.service";
import { createClub, getClubs } from "../../services/clubs.service";

type Competition = {
  id: string;
  name: string;
};

type Club = {
  id: string;
  name: string;
  short_name: string;
  country: string;
  city: string;
  stadium: string;
  competitions?: {
    name: string;
  };
};

export default function ClubsAdminPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);

  const [competitionId, setCompetitionId] = useState("");
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [stadium, setStadium] = useState("");

  async function loadData() {
    const competitionsData = await getCompetitions();
    const clubsData = await getClubs();

    setCompetitions(competitionsData || []);
    setClubs(clubsData || []);
  }

  async function handleCreateClub() {
    if (!competitionId || !name.trim()) return;

    await createClub({
      competitionId,
      name: name.trim(),
      shortName: shortName.trim(),
      country: country.trim(),
      city: city.trim(),
      stadium: stadium.trim(),
    });

    setCompetitionId("");
    setName("");
    setShortName("");
    setCountry("");
    setCity("");
    setStadium("");

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
            Clubs Admin
          </h1>

          <p className="mt-3 text-slate-300">
            Create and manage clubs participating in Score for Climate.
          </p>
        </div>

        <div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900 p-6 md:grid-cols-3">
          <select
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            value={competitionId}
            onChange={(event) => setCompetitionId(event.target.value)}
          >
            <option value="">Select competition</option>
            {competitions.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.name}
              </option>
            ))}
          </select>

          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="Club name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="Short name, e.g. LIV"
            value={shortName}
            onChange={(event) => setShortName(event.target.value)}
          />

          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="Country"
            value={country}
            onChange={(event) => setCountry(event.target.value)}
          />

          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="City"
            value={city}
            onChange={(event) => setCity(event.target.value)}
          />

          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="Stadium"
            value={stadium}
            onChange={(event) => setStadium(event.target.value)}
          />

          <button
            onClick={handleCreateClub}
            className="rounded-lg bg-green-500 px-6 py-3 font-semibold text-slate-950 md:col-span-3"
          >
            Add Club
          </button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-6 text-2xl font-bold">Clubs</h2>

          <div className="space-y-3">
            {clubs.map((club) => (
              <div
                key={club.id}
                className="grid gap-3 rounded-lg border border-slate-800 bg-slate-950 p-4 md:grid-cols-6"
              >
                <div>{club.name}</div>
                <div className="text-slate-400">{club.short_name}</div>
                <div className="text-slate-400">
                  {club.competitions?.name}
                </div>
                <div className="text-slate-400">{club.country}</div>
                <div className="text-slate-400">{club.city}</div>
                <div className="text-slate-400">{club.stadium}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}