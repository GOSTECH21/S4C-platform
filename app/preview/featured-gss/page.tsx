"use client";

import { useState } from "react";
import { FeaturedGssPicker } from "@/app/components/club/FeaturedGssPicker";
import { ClubClimateSponsorTabs } from "@/app/components/club/ClubClimateSponsorTabs";
import { FEATURED_GLOBAL_SCHOOLS_SOLAR } from "@/app/lib/sccan-catalog";
import type { ClimateProject } from "@/app/services/votes.service";

const options: ClimateProject[] = [
  {
    id: "gss",
    name: FEATURED_GLOBAL_SCHOOLS_SOLAR.name,
    description: FEATURED_GLOBAL_SCHOOLS_SOLAR.description,
    category: FEATURED_GLOBAL_SCHOOLS_SOLAR.category,
    country: FEATURED_GLOBAL_SCHOOLS_SOLAR.country,
    estimated_co2: FEATURED_GLOBAL_SCHOOLS_SOLAR.estimated_co2,
    funding_goal: FEATURED_GLOBAL_SCHOOLS_SOLAR.funding_goal,
    image_url: null,
    status: "active",
    featured: true,
  },
];

export default function FeaturedGssPreview() {
  const [featuredId, setFeaturedId] = useState<string | null>(options[0].id);
  return (
    <div className="min-h-screen p-8 text-white">
      <ClubClimateSponsorTabs
        clubName="Arsenal FC"
        leadSponsors={[
          {
            brandKey: "puma",
            brandName: "Puma",
            email: null,
            lockedAt: null,
            logoUrl: null,
            inNetwork: true,
            matches: [],
          },
        ]}
        localSponsors={[]}
      />
      <section className="mt-12 rounded-3xl border border-slate-700 bg-slate-900 p-10">
        <h1 className="text-3xl font-black">This Match Day — Selected Climate Projects</h1>
        <div className="mt-6">
          <FeaturedGssPicker
            options={options}
            chosenId={featuredId}
            onChoose={setFeaturedId}
            clubName="Arsenal FC"
            clubCountry="England"
          />
        </div>
      </section>
    </div>
  );
}
