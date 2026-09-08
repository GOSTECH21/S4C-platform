"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

type Result = {
  id: string;
  project: string;
  votes: number;
};

const CAMPAIGN_ID = "a05b2f53-b57f-4364-8eb4-ec33909e70d7";

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);

  async function loadResults() {
    const { data: projects } = await supabase
      .from("campaign_projects")
      .select(`
        id,
        climate_project_id,
        climate_projects (
          name
        )
      `)
      .eq("campaign_id", CAMPAIGN_ID);

    if (!projects) return;

    const output: Result[] = [];

    for (const project of projects) {

      const { count } = await supabase
        .from("campaign_votes")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("campaign_id", CAMPAIGN_ID)
        .eq("project_id", project.climate_project_id);

      output.push({
        id: project.id,
        project: (project.climate_projects as any).name,
        votes: count ?? 0,
      });

    }

    output.sort((a, b) => {

      if (b.votes !== a.votes) {
        return b.votes - a.votes;
      }

      return a.project.localeCompare(b.project);

    });

    setResults(output);
  }

  useEffect(() => {

    loadResults();

    const timer = setInterval(loadResults, 3000);

    return () => clearInterval(timer);

  }, []);

 return (
  <main className="min-h-screen bg-[#060B1F] text-white py-12">
    <div className="max-w-5xl mx-auto px-6">

      <h1 className="text-5xl font-extrabold">
        Arsenal vs Chelsea
      </h1>

      <h2 className="text-2xl text-green-400 mt-2">
        🔴 Live Climate Voting Results
      </h2>

      <p className="text-gray-400 mt-3">
        Top three projects will receive sponsor funding.
      </p>

      {/* Statistics */}

      <div className="grid grid-cols-4 gap-4 mt-10">

        <div className="bg-slate-800 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-green-400">
            {Math.ceil(results.reduce((a, b) => a + b.votes, 0) / 3)}
          </div>

          <div className="text-gray-400 mt-2">
            👥 Supporters
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-green-400">
            {results.length}
          </div>

          <div className="text-gray-400 mt-2">
            Projects
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-green-400">
            3
          </div>

          <div className="text-gray-400 mt-2">
            Winners
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-green-400">
            £10k
          </div>

          <div className="text-gray-400 mt-2">
            Per Goal
          </div>
        </div>

      </div>

      {/* Leaderboard */}

      <div className="mt-8 grid gap-6">

        {results.map((project, index) => (

          <div
            key={project.id}
            className={`rounded-xl p-6 shadow-lg transition-all duration-300 ${
              index < 3
                ? "bg-slate-800 border-2 border-green-500"
                : "bg-slate-800 border border-slate-700"
            }`}
          >

            <div className="flex justify-between items-center">

              <div className="flex-1">

                <div className="text-xl font-bold">

                  {index === 0 && "🥇 "}
                  {index === 1 && "🥈 "}
                  {index === 2 && "🥉 "}
                  {index > 2 && `#${index + 1} `}

                  {project.project}

                </div>

                <div className="text-gray-400 mt-2">
                  {project.votes} Vote{project.votes !== 1 ? "s" : ""}
                </div>

                <div className="mt-4 h-3 bg-slate-700 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{
                      width: `${Math.max(
                        5,
                        results.length
                          ? (project.votes /
                              Math.max(...results.map(r => r.votes), 1)) *
                              100
                          : 0
                      )}%`,
                    }}
                  />

                </div>

              </div>

              <div className="text-5xl font-black text-green-400 ml-8">
                {project.votes}
              </div>

            </div>

          </div>

        ))}
      </div>

      {/* Currently Qualifying */}

      <div className="mt-10 bg-slate-800 rounded-xl p-8">

        <h2 className="text-2xl font-bold text-green-400 mb-6">
          🏆 Projects Currently Qualifying for Funding in Today's Match
        </h2>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

          {results.slice(0, 3).map((project, index) => (

            <div 
              key={project.id}
              className="flex justify-between items-center border-b border-slate-700 pb-3"
            >

              <div className="font-semibold">

                {index === 0 && "🥇 "}
                {index === 1 && "🥈 "}
                {index === 2 && "🥉 "}

                {project.project}

              </div>

              <div className="font-bold text-green-400">
                {project.votes} Vote{project.votes !== 1 ? "s" : ""}
              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  </main>
);
}
      