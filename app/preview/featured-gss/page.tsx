"use client";

import { useState } from "react";
import { FeaturedGssPicker } from "@/app/components/club/FeaturedGssPicker";
import { ClubClimateSponsorTabs } from "@/app/components/club/ClubClimateSponsorTabs";
import {
  FEATURED_GSS_LOCAL,
  FEATURED_GSS_WORLD,
} from "@/app/lib/sccan-catalog";
import type { ClimateProject } from "@/app/services/votes.service";

const options: ClimateProject[] = [
  {
    id: "gss-local",
    name: FEATURED_GSS_LOCAL.name,
    description: FEATURED_GSS_LOCAL.description,
    category: FEATURED_GSS_LOCAL.category,
    country: FEATURED_GSS_LOCAL.country,
    estimated_co2: FEATURED_GSS_LOCAL.estimated_co2,
    funding_goal: FEATURED_GSS_LOCAL.funding_goal,
    image_url: null,
    status: "active",
    featured: true,
  },
  {
    id: "gss-world",
    name: FEATURED_GSS_WORLD.name,
    description: FEATURED_GSS_WORLD.description,
    category: FEATURED_GSS_WORLD.category,
    country: FEATURED_GSS_WORLD.country,
    estimated_co2: FEATURED_GSS_WORLD.estimated_co2,
    funding_goal: FEATURED_GSS_WORLD.funding_goal,
    image_url: null,
    status: "active",
    featured: true,
  },
];

export default function FeaturedGssPreview() {
  const [featuredId, setFeaturedId] = useState<string | null>(null);
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
