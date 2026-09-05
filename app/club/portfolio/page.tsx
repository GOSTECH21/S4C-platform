"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

const CAMPAIGN_ID = "a05b2f53-b57f-4364-8eb4-ec33909e70d7";

export default function PortfolioPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    const { data } = await supabase
      .from("climate_projects")
      .select("*")
      .eq("status", "active")
      .order("name");

    setProjects(data || []);
  }

  function toggleProject(id: string) {
    if (selected.includes(id)) {
      setSelected(selected.filter((x) => x !== id));
      return;
    }

    if (selected.length >= 5) {
      alert("You can only choose FIVE projects.");
      return;
    }

    setSelected([...selected, id]);
  }

  async function publishPortfolio() {
    if (selected.length !== 5) {
      alert("Please select exactly FIVE projects.");
      return;
    }

    setSaving(true);

    await supabase
      .from("campaign_projects")
      .delete()
      .eq("campaign_id", CAMPAIGN_ID);

    const rows = selected.map((id, index) => ({
      campaign_id: CAMPAIGN_ID,
      climate_project_id: id,
      display_order: index + 1,
    }));

    const { error } = await supabase
      .from("campaign_projects")
      .insert(rows);

    setSaving(false);

    if (error) {
      alert(JSON.stringify(error));
console.error(error);
      alert("Couldn't publish portfolio.");
      return;
    }

    alert("✅ Match Portfolio Published");

    router.push("/supporter/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">

      <div className="mx-auto max-w-7xl">

        <h1 className="text-5xl font-black">
          Arsenal Match Portfolio
        </h1>

        <p className="mt-4 text-slate-400">
          Select exactly FIVE projects for Arsenal supporters.
        </p>

        <p className="mt-6 text-green-400 font-bold text-xl">
          Selected {selected.length} of 5
        </p>

        <div className="grid gap-6 mt-10 md:grid-cols-2">

          {projects.map((project) => {

            const active = selected.includes(project.id);

            return (

              <div
                key={project.id}
                className={`rounded-2xl border p-6 ${
                  active
                    ? "border-green-500 bg-green-900/20"
                    : "border-slate-700 bg-slate-800"
                }`}
              >

                <h2 className="text-2xl font-bold">
                  {project.name}
                </h2>

                <p className="mt-4 text-slate-300">
                  {project.description}
                </p>

                <button
                  onClick={() => toggleProject(project.id)}
                  className={`mt-6 w-full rounded-xl py-3 font-bold ${
                    active
                      ? "bg-green-500 text-black"
                      : "bg-slate-700 hover:bg-slate-600"
                  }`}
                >
                  {active ? "✓ Selected" : "Select Project"}
                </button>

              </div>

            );

          })}

        </div>

        <button
                    onClick={publishPortfolio}
          className={`mt-10 w-full rounded-xl py-5 text-xl font-bold ${
            selected.length === 5
              ? "bg-green-500 text-black hover:bg-green-400"
              : "bg-slate-700 text-slate-400"
          }`}
        >
          {saving ? "Publishing..." : "Publish Match Portfolio"}
        </button>

      </div>

    </main>
  );
}