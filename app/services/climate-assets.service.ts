import { supabase } from "../lib/supabase";

export async function getClimateAssets() {
  const { data, error } = await supabase
    .from("climate_assets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function createClimateAsset({
  impactOpportunityId,
  name,
  assetType,
  country,
  city,
  beneficiaryName,
  capacityKw,
  expectedAnnualEnergyKwh,
  expectedCo2eAvoidedTonnes,
}: {
  impactOpportunityId: string;
  name: string;
  assetType: string;
  country: string;
  city: string;
  beneficiaryName: string;
  capacityKw: number;
  expectedAnnualEnergyKwh: number;
  expectedCo2eAvoidedTonnes: number;
}) {
  const { data, error } = await supabase
    .from("climate_assets")
    .insert([
      {
        impact_opportunity_id: impactOpportunityId || null,
        name,
        asset_type: assetType,
        country,
        city,
        beneficiary_name: beneficiaryName,
        capacity_kw: capacityKw,
        expected_annual_energy_kwh: expectedAnnualEnergyKwh,
        expected_co2e_avoided_tonnes: expectedCo2eAvoidedTonnes,
        status: "planned",
      },
    ])
    .select();

  if (error) throw error;

  return data;
}