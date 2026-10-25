"use client";

import { LeadSponsorHome } from "@/app/components/sponsor/LeadSponsorHome";
import type { MatchDayClubLock } from "@/app/lib/climate-sponsors";
import type { FolderOffer, SignedSponsorship } from "@/app/lib/sponsor-dashboard";

const awaitingOffer: FolderOffer = {
  id: "mfc-craig-upload",
  clubId: "middlesbrough-demo",
  clubName: "Middlesbrough",
  headline:
    "5 Climate Projects Sponsorship for Goals scored by Middlesbrough players during Middlesbrough v West Bromwich Albion",
  matchTitle: "Middlesbrough v West Bromwich Albion",
  matchDate: "2026-11-07",
  projectIds: ["gss-mfc", "cookstoves", "mangrove", "kenya-solar", "amazon"],
  projects: [
    {
      id: "gss-mfc",
      name: "Global Schools Solar",
      country: "International",
      estimated_co2: 120,
    },
    {
      id: "cookstoves",
      name: "Clean Cookstoves Kenya",
      country: "Kenya",
      estimated_co2: 80,
    },
    {
      id: "mangrove",
      name: "Mangrove Restore Sundarbans",
      country: "Bangladesh",
      estimated_co2: 95,
    },
    {
      id: "kenya-solar",
      name: "Solar Irrigation Sudan",
      country: "Sudan",
      estimated_co2: 60,
    },
    {
      id: "amazon",
      name: "Amazon Community Reforestation",
      country: "Brazil",
      estimated_co2: 140,
    },
  ],
  postedAt: "2026-10-25T14:00:00.000Z",
  sponsorshipAmountGbp: 2300,
  gbpPerGoal: 4000,
  maxAmount: 7500,
};

const approved: SignedSponsorship[] = [
  {
    offer: {
      id: "amex-hearts-aberdeen",
      clubId: "hearts-demo",
      clubName: "Hearts",
      headline:
        "5 Climate Projects Sponsorship for Goals scored by Hearts players during Hearts v Aberdeen on 31st October 2026",
      matchTitle: "Hearts v Aberdeen",
      matchDate: "2026-10-31",
      projectIds: ["lauriston", "spoke", "cargo", "remakery", "gss-hearts"],
      projects: [
        { id: "lauriston", name: "Lauriston Agroecology Farm", country: "Scotland" },
        { id: "spoke", name: "Wee Spoke Hub", country: "Scotland" },
        { id: "cargo", name: "Cargo Bike Movement", country: "Scotland" },
        { id: "remakery", name: "Edinburgh Remakery", country: "Scotland" },
        { id: "gss-hearts", name: "Global Schools Solar", country: "International" },
      ],
      postedAt: "2026-10-12T12:00:00.000Z",
      sponsorshipAmountGbp: 2300,
      gbpPerGoal: 4000,
      maxAmount: 7500,
    },
    signature: {
      id: "sig-hearts",
      offerId: "amex-hearts-aberdeen",
      sponsorId: "amex",
      signerName: "American Express",
      brandName: "American Express",
      acceptedTerms: true,
      signedAt: "2026-10-12T17:36:00.000Z",
    },
  },
];

const paid: SignedSponsorship[] = [
  {
    offer: {
      id: "amex-arsenal-city",
      clubId: "arsenal-demo",
      clubName: "Arsenal",
      headline:
        "5 Climate Projects Sponsorship for Goals scored by Arsenal players during Manchester City v Arsenal",
      matchTitle: "Manchester City v Arsenal",
      matchDate: "2026-11-21",
      projectIds: ["gss", "islington", "emirates", "cycle", "holloway"],
      projects: [
        {
          id: "gss",
          name: "Global Schools Solar",
          country: "International",
          fundedGbp: 2300,
        },
        {
          id: "islington",
          name: "Islington Tree Canopy",
          country: "England",
          fundedGbp: 0.2,
        },
        {
          id: "emirates",
          name: "Emirates Community Garden",
          country: "England",
          fundedGbp: 0.2,
        },
        { id: "cycle", name: "North London Cycle Hub", country: "England" },
        { id: "holloway", name: "Holloway School Solar", country: "England" },
      ],
      postedAt: "2026-10-12T12:00:00.000Z",
      sponsorshipAmountGbp: 2300,
      gbpPerGoal: 4000,
      maxAmount: 7500,
    },
    signature: {
      id: "sig-arsenal",
      offerId: "amex-arsenal-city",
      sponsorId: "amex",
      signerName: "American Express",
      brandName: "American Express",
      acceptedTerms: true,
      signedAt: "2026-10-12T18:10:00.000Z",
    },
  },
];

const arsenalLock: MatchDayClubLock = {
  brandKey: "american express",
  clubName: "Arsenal",
  matchLabel: "Premier League Match",
  fixtureName: "Manchester City v Arsenal",
  competition: "Premier League",
  fixtureDate: "2026-11-21",
  kickoff: "15:00",
  venue: "Etihad Stadium",
  lockedAt: "2026-10-12T12:00:00.000Z",
  fundingLockedAt: "2026-10-12T12:30:00.000Z",
  commitmentFeeGbp: 2300,
  gbpPerGoal: 4000,
  maximumSponsorshipGbp: 7500,
};

export default function LeadSponsorDashboardPreview() {
  return (
    <div className="min-h-screen p-8">
      <LeadSponsorHome
        brand="American Express"
        logoUrl="/sponsors/amex.svg"
        pending={[awaitingOffer]}
        signed={[...approved, ...paid]}
        votedByClub={{
          "arsenal-demo": [
            { id: "gss", fundedGbp: 2300 },
            { id: "islington", fundedGbp: 0.2 },
            { id: "emirates", fundedGbp: 0.2 },
          ],
        }}
        committedGbp={2300}
        lock={arsenalLock}
      />
    </div>
  );
}
