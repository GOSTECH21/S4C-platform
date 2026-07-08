"use client";
import AppLayout from "../../layout/AppLayout";
import { useEffect, useState } from "react";
import { createSport, getSports } from "../../services/sports.service";

type Sport = {
  id: string;
  name: string;
};

export default function SportsAdminPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [name, setName] = useState("");

  async function loadSports() {
    const data = await getSports();
    setSports(data || []);
  }

  async function handleCreateSport() {
    if (!name.trim()) return;

    await createSport(name.trim());
    setName("");
    await loadSports();
  }

  useEffect(() => {
    loadSports();
  }, []);

  return (
     <AppLayout>
          <h1 className="text-4xl font-bold text-green-400">Sports Admin</h1>

      <p className="mt-3 text-slate-300">
        Create and manage the sports supported by Score for Climate.
      </p>

      <div className="mt-8 flex gap-3">
        <input
          className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white"
          placeholder="Enter sport name, e.g. Football"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <button
          onClick={handleCreateSport}
          className="rounded-lg bg-green-500 px-6 py-3 font-semibold text-slate-950"
        >
          Add Sport
        </button>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold">Sports</h2>

        <div className="mt-4 space-y-3">
          {sports.map((sport) => (
            <div
              key={sport.id}
              className="rounded-lg border border-slate-800 bg-slate-900 p-4"
            >
              {sport.name}
            </div>
          ))}
        </div>
      </div>
    
  </AppLayout>
)
}