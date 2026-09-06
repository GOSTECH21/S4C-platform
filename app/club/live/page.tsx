"use client";

import { supabase } from "@/app/lib/supabase";
import { useEffect, useState } from "react";

type MatchEvent = {
  id: string;
  minute: number;
  team: string;
  scorer: string;
};
export default function LiveMatchPage() {
    const [events, setEvents] = useState<MatchEvent[]>([]);

async function loadEvents() {
  const { data } = await supabase
    .from("match_events")
    .select("*")
    .eq(
      "match_id",
      "0789cae3-52ef-4219-8dd4-a2dc6269dc6c"
    )
    .order("minute", { ascending: false });

  if (data) {
    setEvents(data);
  }
}

useEffect(() => {
  loadEvents();

  const timer = setInterval(loadEvents, 3000);

  return () => clearInterval(timer);
}, []);
      return (
    
    <main className="min-h-screen bg-[#060B1F] text-white py-12">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}

        <h1 className="text-5xl font-extrabold">
          Arsenal vs Chelsea
        </h1>

        <div className="flex items-center gap-3 mt-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>

          <span className="text-green-400 font-semibold">
            LIVE • 67'
          </span>
        </div>

        <p className="text-gray-400 mt-3">
          Sponsor funding increases every goal scored.
        </p>

        {/* Statistics */}

        <div className="grid grid-cols-4 gap-6 mt-10">

          <div className="bg-slate-800 rounded-xl p-6 text-center">
            <div className="text-4xl font-black text-green-400">
              2 - 1
            </div>

            <div className="text-gray-400 mt-2">
              Score
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 text-center">
            <div className="text-4xl font-black text-green-400">
              £30k
            </div>

            <div className="text-gray-400 mt-2">
              Sponsor Funding
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 text-center">
            <div className="text-4xl font-black text-green-400">
              3
            </div>

            <div className="text-gray-400 mt-2">
              Goals
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 text-center">
            <div className="text-4xl font-black text-green-400">
              LIVE
            </div>

            <div className="text-gray-400 mt-2">
              Match Status
            </div>
          </div>

        </div>

        {/* Two Column Layout */}

        <div className="grid lg:grid-cols-2 gap-8 mt-10">

          {/* Goal Feed */}

          <div className="bg-slate-800 rounded-xl p-8">

            <h2 className="text-2xl font-bold text-green-400 mb-6">
              ⚽ Goal Feed
            </h2>

            <div className="space-y-5">
  {events.map((event) => (
    <div
      key={event.id}
      className="border-b border-slate-700 pb-4 last:border-0"
    >
      <div className="text-xl font-bold">
        {event.minute}' {event.scorer}
      </div>

      <div className="text-gray-400">
        {event.team}
      </div>
    </div>
  ))}

            </div>

          </div>

          {/* Funding */}

          <div className="bg-slate-800 rounded-xl p-8">

            <h2 className="text-2xl font-bold text-green-400 mb-6">
              🌍 Funding Progress
            </h2>

            <div className="space-y-5">

              <div className="flex justify-between">
                <span>Total Goals</span>
                <span className="font-bold text-green-400">3</span>
              </div>

              <div className="flex justify-between">
                <span>Funding Per Goal</span>
                <span className="font-bold text-green-400">
                  £10,000
                </span>
              </div>

              <div className="flex justify-between text-2xl font-bold border-t border-slate-700 pt-5">
                <span>Total Raised</span>

                <span className="text-green-400">
                  £30,000
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}