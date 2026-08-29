"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import {
  getAvailableClimateCredits,
} from "../../services/sponsor-climate-credits.service";
import {
  claimSponsorCredit,
  getSupporterClaims,
} from "@/app/services/supporter-claims.service";
import DashboardHeader from "./components/DashboardHeader";
import DashboardSummary from "./components/DashboardSummary";
import AvailableClimateCredits from "./components/AvailableClimateCredits";
import MyClimateCredits from "./components/MyClimateCredits";
type ClimateCredit = {
  id: string;
  credit_name: string;
  credits_issued: number;
  credits_claimed: number;
  total_value: number;
  status: string;
};

export default function SupporterDashboardPage() {
  const [credits, setCredits] = useState<ClimateCredit[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    try {
      const availableCredits = await getAvailableClimateCredits();

      setCredits(
        (availableCredits ?? []).filter(
          (credit) => credit.status === "available"
        )
      );
      const {
  data: { user },
} = await supabase.auth.getUser();

if (user?.email) {
  const { data: supporter } = await supabase
    .from("supporters")
    .select("id")
    .eq("email", user.email)
    .single();

  if (supporter) {
    const supporterClaims = await getSupporterClaims(
      supporter.id
    );

    setClaims(supporterClaims);
  }
}
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
    
  }
  
async function handleClaim(sponsorCreditId: string) {
  try {
    // TODO: Replace these with the logged-in supporter values
    const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  alert("Please sign in first.");
  return;
  
}
const { data: supporter, error: supporterError } = await supabase
  .from("supporters")
  .select("id, favourite_club_id")
  .eq("email", user.email)
  .single();

if (supporterError || !supporter) {
  console.error("Supporter lookup failed:", supporterError);
  alert("Supporter profile not found.");
  return;
}

const supporterId = supporter.id;
const clubId = supporter.favourite_club_id;

const result = await claimSponsorCredit({
  supporterId,
  sponsorCreditId,
  clubId,
});

    alert(result.message);

    await loadDashboard();
    await loadClaims()
  } catch (error: any) {
    console.error(error);

    alert(
        error?.message ||
        JSON.stringify(error, null, 2) ||
        "Unknown error"
    );

    throw error;
}
}
  useEffect(() => {
    loadDashboard();
    loadClaims();
  }, []);
async function loadClaims() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: supporter } = await supabase
    .from("supporters")
    .select("id")
    .eq("email", user.email)
    .single();

  if (!supporter) return;

  const supporterClaims = await getSupporterClaims(supporter.id);
console.log("Supporter Claims:", supporterClaims);
  setClaims(supporterClaims);
}
  const totalCreditsClaimed = credits.reduce(
    (sum, credit) => sum + (credit.credits_claimed ?? 0),
    0
  );

  const totalFunding = credits.reduce(
    (sum, credit) => sum + (credit.total_value ?? 0),
    0
  );

  const totalProjects = credits.length;

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">

      <div className="mx-auto max-w-7xl">

        <DashboardHeader
  title="Supporter Dashboard"
  subtitle="Celebrate sporting moments, claim climate credits and track your positive impact on the planet."
/>
        <DashboardSummary
  totalCreditsClaimed={totalCreditsClaimed}
  totalFunding={totalFunding}
  availableCredits={credits.length}
  totalProjects={totalProjects}
/>
<AvailableClimateCredits
  credits={credits}
  loading={loading}
  onClaim={handleClaim}
/>
         
<MyClimateCredits
  loading={loading}
  claims={claims}
/>
</div>
  </main>

  );

}
