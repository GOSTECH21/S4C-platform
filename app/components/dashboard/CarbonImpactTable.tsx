"use client";

import { useEffect, useState } from "react";
import { getCarbonImpactTable } from "../../services/carbon-impact.service";

type ClubImpact = {
  id: string;
  club_name: string;
  impact_score: number;
  climate_assets: number;
  co2e_avoided: string;
  renewable_energy: string;
};

export default function CarbonImpactTable() {
  const [clubs, setClubs] = useState<ClubImpact[]>([]);

  async function loadTable() {
    const data = await getCarbonImpactTable();
    setClubs(data || []);
  }

  useEffect(() => {
    loadTable();
  }, []);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-6 text-2xl font-bold">Carbon Impact Table</h2>

      <table className="w-full">
        <thead className="text-left text-slate-400">
          <tr>
            <th>Rank</th>
            <th>Club</th>
            <th>Impact Score</th>
            <th>Assets</th>
            <th>CO₂e</th>
            <th>Energy</th>
          </tr>
        </thead>

        <tbody>
          {clubs.map((club, index) => (
            <tr key={club.id} className="border-t border-slate-800">
              <td className="py-4">{index + 1}</td>
              <td>{club.club_name}</td>
              <td>{club.impact_score}</td>
              <td>{club.climate_assets}</td>
              <td>{club.co2e_avoided}</td>
              <td>{club.renewable_energy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}