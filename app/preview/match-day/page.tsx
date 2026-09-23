"use client";

import { useState } from "react";
import { MatchDayProjectCard } from "@/app/components/fan/MatchDayProjectCard";
import { TodaysClimateSponsors } from "@/app/components/fan/TodaysClimateSponsors";
import {
  assignLocalSponsorsToProjects,
  exampleLocalSponsorsForClub,
} from "@/app/lib/match-day-local-sponsors";

const PROJECTS = [
  {
    id: "gss",
    name: "Global Schools Solar",
    description:
      "Install solar panels on schools across Edinburgh and the Lothians, cutting emissions and reducing energy costs for future generations.",
    category: "Solar Energy",
  },
  {
    id: "wood",
    name: "Scottish Woodland Restoration",
    description:
      "Restore native woodlands in Scotland, creating wildlife habitats, capturing carbon and supporting rural communities.",
    category: "Biodiversity",
  },
  {
    id: "coast",
    name: "Cleaner Coasts Campaign",
    description:
      "Support the removal of plastic pollution from Scotland's beaches and coastlines, protecting marine life and coastal communities.",
    category: "Ocean Cleanup",
  },
  {
    id: "peat",
    name: "Peatland Recovery",
    description:
      "Rewet and restore degraded peatlands, one of the most effective natural solutions for tackling climate change.",
    category: "Resilience",
  },
  {
    id: "trees",
    name: "Urban Tree Planting in Edinburgh",
    description:
      "Plant trees in urban communities to improve air quality, increase green space and create healthier, more resilient neighbourhoods.",
    category: "Biodiversity",
  },
];

export default function MatchDayPreviewPage() {
  const locals = exampleLocalSponsorsForClub("Heart of Midlothian");
  const placements = assignLocalSponsorsToProjects(PROJECTS, locals);
  const ranked = placements
    .map((row) => row.local)
    .filter((row): row is NonNullable<typeof row> => Boolean(row));
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(projectId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else if (next.size < 3) next.add(projectId);
      return next;
    });
  }

  return (
    <main className="min-h-screen bg-[#04140f] py-8 text-white">
      <div className="mx-auto max-w-[90rem] px-4 md:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
          Heart of Midlothian fans power climate action
        </p>
        <h1 className="mt-2 text-center text-4xl font-black md:text-5xl">
          Hearts Match-Day Climate Campaign
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-center text-slate-300">
          Choose 3 Climate Projects. The Lead Climate Sponsor occupies 65% of
          each card. Five Local Business Climate Sponsors appear 1-each, ranked
          and sized by pledge — £1,500 is 3× £500.
        </p>
        <div className="mt-8">
          <TodaysClimateSponsors
            leadName="American Express"
            locals={ranked}
          />
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {placements.map((row) => (
            <MatchDayProjectCard
              key={row.project.id}
              project={row.project}
              cardIndex={row.cardIndex}
              clubName="Heart of Midlothian"
              leadName="American Express"
              local={row.local}
              localScale={row.scale}
              selected={selected.has(row.project.id)}
              disabled={!selected.has(row.project.id) && selected.size >= 3}
              showVote
              onToggle={() => toggle(row.project.id)}
            />
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-3xl text-center text-xs text-slate-500">
          Layout preview of the fan post compiled by the Sustainability Director.
          My S4P shows this five after the club posts Match Day Climate Projects.
        </p>
      </div>
    </main>
  );
}
