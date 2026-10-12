"use client";

import { SignedSponsorHome } from "@/app/components/sponsor/SignedSponsorHome";
import type { SignedSponsorship } from "@/app/lib/sponsor-dashboard";

const signed: SignedSponsorship[] = [
  {
    offer: {
      id: "amex-hearts-aberdeen",
      clubId: "hearts-demo",
      clubName: "Hearts",
      headline:
        "5 Climate Projects Sponsorship for Goals scored by Hearts players during Hearts v Aberdeen on 31st October 2026",
      matchTitle: "Hearts v Aberdeen",
      matchDate: "2026-10-31",
      projectIds: ["gss", "lauriston", "spoke", "cargo", "remakery"],
      projects: [
        { id: "gss", name: "Global Schools Solar", fundedGbp: 2300 },
        { id: "lauriston", name: "Lauriston Agroecology Farm", fundedGbp: 0 },
        { id: "spoke", name: "Wee Spoke Hub", fundedGbp: 0.2 },
        { id: "cargo", name: "Cargo Bike Movement", fundedGbp: 0 },
        { id: "remakery", name: "Edinburgh Remakery", fundedGbp: 0 },
      ],
      postedAt: "2026-10-12T12:00:00.000Z",
      sponsorshipAmountGbp: 2300,
      gbpPerGoal: 4000,
      maxAmount: 7500,
    },
    signature: {
      id: "sig-amex",
      offerId: "amex-hearts-aberdeen",
      sponsorId: "amex",
      signerName: "American Express",
      brandName: "American Express",
      acceptedTerms: true,
      signedAt: "2026-10-12T17:36:00.000Z",
    },
  },
];

export default function SignedSponsorHomePreview() {
  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <SignedSponsorHome
        brand="American Express"
        logoUrl={null}
        signed={signed}
        votedByClub={{
          "hearts-demo": [
            { id: "gss", fundedGbp: 2300 },
            { id: "spoke", fundedGbp: 0.2 },
          ],
        }}
        committedGbp={2300}
        onNewSponsorship={() => undefined}
      />
    </div>
  );
}
