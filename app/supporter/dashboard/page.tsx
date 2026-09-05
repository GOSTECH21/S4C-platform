"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

export default function SupporterDashboardPage() {

    const router = useRouter();

    const [campaign, setCampaign] = useState<any>(null);

    const [projects, setProjects] = useState<any[]>([]);

    const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

    const [loading, setLoading] = useState(true);
        async function loadCampaign() {
    const { data, error } = await supabase
        .from("match_campaigns")
        .select("*")
        .eq("status", "open")
        .single();

    console.log("CAMPAIGN DATA:", data);
    console.log("CAMPAIGN ERROR:", error);

    if (error) {
        setLoading(false);
        return;
    }

    setCampaign(data);

    await loadProjects(data.id);

    setLoading(false);
}

    async function loadProjects(campaignId: string) {
    const { data, error } = await supabase
        .from("campaign_projects")
        .select(`
            *,
            climate_projects (
                id,
                name,
                description
            )
        `)
        .eq("campaign_id", campaignId)
        .order("display_order");

    console.log("PROJECTS:", data);
    console.log("ERROR:", error);

    setProjects(data || []);
}
        useEffect(() => {
        loadCampaign();
    }, []);
    function toggleProject(projectId: string) {

    const exists = selectedProjects.includes(projectId);

    if (exists) {
        setSelectedProjects(
            selectedProjects.filter(id => id !== projectId)
        );
        return;
    }

    if (selectedProjects.length >= 3) {
        alert("You can only vote for THREE projects.");
        return;
    }

    setSelectedProjects([
        ...selectedProjects,
        projectId
    ]);
}

async function submitVotes() {

    if (!campaign) return;

    if (selectedProjects.length !== 3) {
        alert("Please choose exactly THREE projects.");
        return;
    }

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
        router.push("/supporter/login");
        return;
    }

    const { data: supporter } = await supabase
        .from("supporters")
        .select("id")
        .eq("email", user.email)
        .single();

    if (!supporter) {
        alert("Supporter account not found.");
        return;
    }

    const votes = selectedProjects.map((projectId, index) => ({
        campaign_id: campaign.id,
        supporter_id: supporter.id,
        project_id: projectId
    }));

    const { error } = await supabase
        .from("campaign_votes")
        .insert(votes);

    if (error) {
    console.log("VOTE ERROR:", error);
    alert(JSON.stringify(error));
    return;
}

    alert("✅ Thank you! Your votes have been recorded.");

    router.refresh();
}

if (loading) {
    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
            Loading Match Campaign...
        </main>
    );
}
return (
  <main className="min-h-screen bg-slate-950 text-white">

    <div className="mx-auto max-w-7xl p-10">

      <div className="mb-12">

        <h1 className="text-5xl font-black">
          {campaign?.title}
        </h1>

        <p className="mt-4 text-xl text-slate-400">
          Vote for the THREE climate projects you want funded if your club scores.
        </p>

        <div className="mt-6 inline-flex rounded-xl bg-green-600 px-6 py-3 text-xl font-bold text-white">
          Sponsor Commitment:
          <span className="ml-3">
            £{Number(campaign?.sponsorship_per_goal || 0).toLocaleString()}
          </span>
          <span className="ml-2">per Goal</span>
        </div>

      </div>

      <div className="grid gap-8 lg:grid-cols-2">

        {projects.map((item: any) => {

          const project = item.climate_projects;

          const selected = selectedProjects.includes(project.id);

          return (

            <div
              key={project.id}
              className={`rounded-2xl border-2 p-8 transition ${
                selected
                  ? "border-green-500 bg-green-900/20"
                  : "border-slate-700 bg-slate-900"
              }`}
            >

              <h2 className="text-3xl font-bold">
                {project.name}
              </h2>

              <p className="mt-5 leading-8 text-slate-300">
                {project.description}
              </p>

              <button
                onClick={() => toggleProject(project.id)}
                className={`mt-8 w-full rounded-xl py-4 text-lg font-bold ${
                  selected
                    ? "bg-green-500 text-black"
                    : "bg-slate-700 text-white hover:bg-slate-600"
                }`}
              >
                {selected
                  ? "✓ Selected"
                  : "Select Project"}
              </button>

            </div>

          );

        })}

      </div>

      <div className="mt-12 rounded-2xl bg-slate-900 p-8">

        <div className="flex items-center justify-between">

          <div>

            <h3 className="text-2xl font-bold">
              Your Vote
            </h3>

            <p className="mt-2 text-slate-400">
              {selectedProjects.length} of 3 projects selected
            </p>

          </div>

          <button
            onClick={submitVotes}
            disabled={selectedProjects.length !== 3}
            className={`rounded-xl px-10 py-4 text-lg font-bold ${
              selectedProjects.length === 3
                ? "bg-green-500 text-black hover:bg-green-400"
                : "cursor-not-allowed bg-slate-700 text-slate-400"
            }`}
          >
            Submit My Votes
          </button>

        </div>

      </div>

    </div>

  </main>
);

}