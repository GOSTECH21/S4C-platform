"use client";

import { useEffect, useState } from "react";
import AppLayout from "../../layout/AppLayout";
import { getClubs } from "../../services/clubs.service";
import {
  createSupporter,
  getSupporters,
} from "../../services/supporters.service";

type Club = {
  id: string;
  name: string;
};

type Supporter = {
  id: string;
  full_name: string;
  email: string;
  country: string;
  city: string;
  notification_enabled: boolean;
  clubs?: {
    name: string;
  };
};

export default function SupportersPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [supporters, setSupporters] = useState<Supporter[]>([]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [favouriteClubId, setFavouriteClubId] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  async function loadData() {
    setClubs((await getClubs()) || []);
    setSupporters((await getSupporters()) || []);
  }

  async function handleCreateSupporter() {
    if (!fullName.trim() || !favouriteClubId) return;

    await createSupporter({
      fullName,
      email,
      favouriteClubId,
      country,
      city,
    });

    setFullName("");
    setEmail("");
    setFavouriteClubId("");
    setCountry("");
    setCity("");

    await loadData();
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-5xl font-bold text-green-400">Supporters</h1>
          <p className="mt-3 text-slate-300">
            Manage supporters who can claim sponsor climate credits.
          </p>
        </div>

        <div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900 p-6 md:grid-cols-3">
          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <select
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            value={favouriteClubId}
            onChange={(e) => setFavouriteClubId(e.target.value)}
          >
            <option value="">Select favourite club</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>

          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />

          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <button
            onClick={handleCreateSupporter}
            className="rounded-lg bg-green-500 px-6 py-3 font-semibold text-slate-950 md:col-span-3"
          >
            Add Supporter
          </button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-6 text-2xl font-bold">Supporters</h2>

          <div className="space-y-3">
            {supporters.map((supporter) => (
              <div
                key={supporter.id}
                className="grid gap-3 rounded-lg border border-slate-800 bg-slate-950 p-4 md:grid-cols-5"
              >
                <div>{supporter.full_name}</div>
                <div className="text-slate-400">{supporter.email}</div>
                <div className="text-slate-400">{supporter.clubs?.name}</div>
                <div className="text-slate-400">{supporter.city}</div>
                <div className="text-slate-400">{supporter.country}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}