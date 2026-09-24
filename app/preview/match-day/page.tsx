"use client";

import { useState } from "react";
import { MatchDayProjectCard } from "@/app/components/fan/MatchDayProjectCard";
import { TodaysClimateSponsors } from "@/app/components/fan/TodaysClimateSponsors";
import { resolveMatchDayBranding } from "@/app/lib/match-day-branding";
import { emptySponsor } from "@/app/lib/climate-sponsors";

const PROJECTS = [
  {
    id: "gss",
    name: "Global Schools Solar",
    description:
      "Install rooftop solar systems in schools around the world so classrooms can run on clean energy.",
    category: "Solar Energy",
  },
  {
    id: "wee",
    name: "Wee Spoke Hub",
    description:
      "A community bike workshop that teaches repair skills so more people can cycle, run by Shrub Coop in Edinburgh.",
    category: "Active Travel",
  },
  {
    id: "retrofit",
    name: "Edinburgh Building Retrofit Collective",
    description:
      "Impartial retrofit advice and bulk-buy home improvements so neighbours can warm homes and cut emissions together.",
    category: "Renewable Energy",
  },
  {
    id: "porty",
    name: "Porty Community Energy",
    description:
      "Portobello neighbours cutting carbon through low-carbon heat, bike storage and active-travel projects people actually want to join.",
    category: "Renewable Energy",
  },
  {
    id: "craigshill",
    name: "Growing Together Craigshill",
    description:
      "Intergenerational community growing in West Lothian, connecting all ages with soil, food and neighbourhood climate action.",
    category: "Sustainable Agriculture",
  },
];

export default function MatchDayPreviewPage() {
  const amex = emptySponsor({
    brandName: "American Express",
    jobTitle: "Sponsorship Manager",
    spentGbp: 50000,
  });
  const topCellar = emptySponsor({
    brandName: "Top Cellar",
    jobTitle: "Sponsorship Manager",
    spentGbp: 500,
  });
  const mashTun = emptySponsor({
    brandName: "Mash Tun",
    jobTitle: "Local Business Climate Sponsor",
    spentGbp: 500,
  });
  const kokobean = emptySponsor({
    brandName: "Kokobean Cafe",
    jobTitle: "Local Business Climate Sponsor",
    spentGbp: 500,
  });
  const interval = emptySponsor({
    brandName: "Interval",
    jobTitle: "Local Business Climate Sponsor",
    spentGbp: 500,
  });
  const taxAssist = emptySponsor({
    brandName: "Tax Assist",
    jobTitle: "Local Business Climate Sponsor",
    spentGbp: 500,
  });
  const branding = resolveMatchDayBranding({
    clubName: "Hibernian",
    projects: PROJECTS,
    rosterSponsors: [topCellar, amex, mashTun, kokobean, interval, taxAssist],
    selected: [topCellar, amex, mashTun],
    lockedBrandName: "Top Cellar",
    storedLeadName: "Top Cellar",
    campaignSponsorName: "Top Cellar",
    storedLocals: [
      { projectId: "gss", cardIndex: 1, brandName: "Braidview Garage", pledgeGbp: 1500 },
      { projectId: "wee", cardIndex: 2, brandName: "Mash Tun", pledgeGbp: 500 },
      { projectId: "retrofit", cardIndex: 3, brandName: "Thistle Energy", pledgeGbp: 1250 },
      { projectId: "porty", cardIndex: 4, brandName: "Capital Homes Edinburgh", pledgeGbp: 1000 },
      { projectId: "craigshill", cardIndex: 5, brandName: "McLeod & Sons Solicitors", pledgeGbp: 750 },
    ],
  });
  const placements = branding.placements;
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
          Hibernian fans power climate action
        </p>
        <h1 className="mt-2 text-center text-4xl font-black md:text-5xl">
          Hibs Match-Day Climate Campaign
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-center text-slate-300">
          Choose 3 Climate Projects. The Lead Climate Sponsor (American Express)
          occupies 65% of each card and appears on all five. Five Local Business
          Climate Sponsors occupy the remaining 35% — one each.
        </p>
        <div className="mt-8">
          <TodaysClimateSponsors
            leadName={branding.lead.name}
            leadLogoUrl={branding.lead.logoUrl}
            locals={ranked}
          />
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {placements.map((row) => (
            <MatchDayProjectCard
              key={row.project.id}
              project={row.project}
              cardIndex={row.cardIndex}
              clubName="Hibernian"
              leadName={branding.lead.name}
              leadLogoUrl={branding.lead.logoUrl}
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
