"use client";

import { useEffect, useState } from "react";
import AppLayout from "../../layout/AppLayout";
import { createSponsor, getSponsors } from "../../services/sponsors.service";

type Sponsor = {
  id: string;
  name: string;
  industry: string;
  website: string;
};

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");

  async function loadSponsors() {
    const data = await getSponsors();
    setSponsors(data || []);
  }

  async function handleCreateSponsor() {
    if (!name.trim()) return;

    await createSponsor({
      name,
      industry,
      website,
    });

    setName("");
    setIndustry("");
    setWebsite("");

    await loadSponsors();
  }

  useEffect(() => {
    loadSponsors();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-5xl font-bold text-green-400">Sponsors</h1>
          <p className="mt-3 text-slate-300">
            Manage brands funding sponsor climate credits.
          </p>
        </div>

        <div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900 p-6 md:grid-cols-3">
          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="Sponsor name, e.g. Budweiser"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="Industry, e.g. Beverage"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />

          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="Website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />

          <button
            onClick={handleCreateSponsor}
            className="rounded-lg bg-green-500 px-6 py-3 font-semibold text-slate-950 md:col-span-3"
          >
            Add Sponsor
          </button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-6 text-2xl font-bold">Sponsors</h2>

          <div className="space-y-3">
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="grid gap-3 rounded-lg border border-slate-800 bg-slate-950 p-4 md:grid-cols-3"
              >
                <div>{sponsor.name}</div>
                <div className="text-slate-400">{sponsor.industry}</div>
                <div className="text-slate-400">{sponsor.website}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}