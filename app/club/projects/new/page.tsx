"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function NewClimateProjectPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [fundingGoal, setFundingGoal] = useState("");
  
  const [estimatedCO2, setEstimatedCO2] = useState("");
  async function createProject() {
  setSaving(true);

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/club/login");
      return;
    }

    const { data: account, error: accountError } = await supabase
      .from("club_accounts")
      .select("club_id")
      .eq("auth_user_id", user.id)
      .single();

    if (accountError || !account) {
      alert("Club account not found.");
      return;
    }

    const { error } = await supabase
      .from("climate_projects")
      .insert({
        club_id: account.club_id,
        name,
        description,
        category,
        country,
        funding_goal: Number(fundingGoal),
        estimated_co2: Number(estimatedCO2),
        featured: false,
        verified: false,
        status: "active",
      });

    if (error) {
      console.error(error);
      alert("Couldn't create project.");
      return;
    }

    alert("✅ Climate Project Created!");

    router.push("/club/dashboard");
  } finally {
    setSaving(false);
  }
}

  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">

      <div className="mx-auto max-w-4xl rounded-2xl bg-slate-900 p-10">

        <h1 className="text-4xl font-black">
          Create Climate Project
        </h1>

        <div className="mt-10 space-y-6">

          <input
            placeholder="Project Name"
            value={name}
            onChange={(e)=>setName(e.target.value)}
            className="w-full rounded-lg bg-slate-800 p-4"
          />

          <textarea
            placeholder="Project Description"
            value={description}
            onChange={(e)=>setDescription(e.target.value)}
            className="w-full rounded-lg bg-slate-800 p-4 h-40"
          />

          <select
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  className="w-full rounded-lg bg-slate-800 p-4"
>
  <option value="">Select Category</option>
  <option value="Solar Energy">Solar Energy</option>
  <option value="Tree Planting">Tree Planting</option>
  <option value="Ocean Cleanup">Ocean Cleanup</option>
  <option value="Biodiversity">Biodiversity</option>
  <option value="Water Conservation">Water Conservation</option>
  <option value="Recycling">Recycling</option>
  <option value="Education">Education</option>
  <option value="Other">Other</option>
</select>

          <input
            placeholder="Country"
            value={country}
            onChange={(e)=>setCountry(e.target.value)}
            className="w-full rounded-lg bg-slate-800 p-4"
          />

          <input
            placeholder="Funding Goal (£)"
            value={fundingGoal}
            onChange={(e)=>setFundingGoal(e.target.value)}
            className="w-full rounded-lg bg-slate-800 p-4"
          />

          <input
  type="number"
  placeholder="Estimated CO₂ Reduction (tonnes)"
  value={estimatedCO2}
  onChange={(e) => setEstimatedCO2(e.target.value)}
  className="w-full rounded-lg bg-slate-800 p-4"
/>

          <button
            onClick={createProject}
            disabled={saving}
            className="w-full rounded-xl bg-green-600 py-4 text-xl font-bold"
          >
            {saving ? "Creating..." : "Create Climate Project"}
          </button>

        </div>

      </div>

    </main>
  );
}