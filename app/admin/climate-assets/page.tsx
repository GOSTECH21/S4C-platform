"use client";

import { useEffect, useState } from "react";
import AppLayout from "../../layout/AppLayout";
import {
  getClimateAssets,
  createClimateAsset,
}from "../../services/climate-assets.service";
import { getImpactOpportunities } from "../../services/impact-opportunities.service";

type ImpactOpportunity = {
  id: string;
  title: string;
};

type ClimateAsset = {
  id: string;
  name: string;
  asset_type: string;
  country: string;
  city: string;
  beneficiary_name: string;
  capacity_kw: number;
  expected_annual_energy_kwh: number;
  expected_co2e_avoided_tonnes: number;
  status: string;
};

export default function ClimateAssetsPage() {
  const [assets, setAssets] = useState<ClimateAsset[]>([]);
  const [opportunities, setOpportunities] = useState<ImpactOpportunity[]>([]);

  const [impactOpportunityId, setImpactOpportunityId] = useState("");
  const [name, setName] = useState("");
  const [assetType, setAssetType] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [capacityKw, setCapacityKw] = useState("");
  const [annualEnergy, setAnnualEnergy] = useState("");
  const [co2Saved, setCo2Saved] = useState("");

  async function loadData() {
    const assetsData = await getClimateAssets();
    const oppsData = await getImpactOpportunities();

    setAssets(assetsData || []);
    setOpportunities(oppsData || []);
  }

  async function handleCreateAsset() {
    await createClimateAsset({
      impactOpportunityId,
      name,
      assetType,
      country,
      city,
      beneficiaryName,
      capacityKw: Number(capacityKw),
      expectedAnnualEnergyKwh: Number(annualEnergy),
      expectedCo2eAvoidedTonnes: Number(co2Saved),
    });

    setImpactOpportunityId("");
    setName("");
    setAssetType("");
    setCountry("");
    setCity("");
    setBeneficiaryName("");
    setCapacityKw("");
    setAnnualEnergy("");
    setCo2Saved("");

    await loadData();
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8">

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h1 className="text-5xl font-bold text-green-400">
            Climate Assets
          </h1>

          <p className="mt-3 text-slate-300">
            Manage verified climate projects funded by S4C.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3">

          <select
            value={impactOpportunityId}
            onChange={(e) => setImpactOpportunityId(e.target.value)}
            className="w-full rounded bg-slate-950 p-3"
          >
            <option value="">Select Impact Opportunity</option>

            {opportunities.map((opp) => (
              <option key={opp.id} value={opp.id}>
                {opp.title}
              </option>
            ))}
          </select>

          <input
            placeholder="Asset Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded bg-slate-950 p-3"
          />

          <input
            placeholder="Asset Type"
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
            className="w-full rounded bg-slate-950 p-3"
          />

          <input
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full rounded bg-slate-950 p-3"
          />

          <input
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded bg-slate-950 p-3"
          />

          <input
            placeholder="Beneficiary"
            value={beneficiaryName}
            onChange={(e) => setBeneficiaryName(e.target.value)}
            className="w-full rounded bg-slate-950 p-3"
          />

          <input
            placeholder="Capacity (kW)"
            value={capacityKw}
            onChange={(e) => setCapacityKw(e.target.value)}
            className="w-full rounded bg-slate-950 p-3"
          />

          <input
            placeholder="Annual Energy (kWh)"
            value={annualEnergy}
            onChange={(e) => setAnnualEnergy(e.target.value)}
            className="w-full rounded bg-slate-950 p-3"
          />

          <input
            placeholder="CO₂ Avoided (Tonnes)"
            value={co2Saved}
            onChange={(e) => setCo2Saved(e.target.value)}
            className="w-full rounded bg-slate-950 p-3"
          />

          <button
            onClick={handleCreateAsset}
            className="w-full rounded bg-green-500 p-3 font-semibold text-slate-950"
          >
            Create Climate Asset
          </button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-5 text-2xl font-bold">
            Climate Assets
          </h2>

          <div className="space-y-3">

            {assets.map((asset) => (
              <div
                key={asset.id}
                className="rounded border border-slate-800 bg-slate-950 p-4"
              >
                <div className="text-lg font-bold">
                  {asset.name}
                </div>

                <div>{asset.asset_type}</div>

                <div>
                  {asset.city}, {asset.country}
                </div>

                <div>
                  Beneficiary: {asset.beneficiary_name}
                </div>

                <div>
                  {asset.capacity_kw} kW
                </div>

                <div>
                  {asset.expected_co2e_avoided_tonnes} tonnes CO₂/year
                </div>

                <div className="text-green-400">
                  {asset.status}
                </div>
              </div>
            ))}

          </div>
        </div>

      </div>
    </AppLayout>
  );
}