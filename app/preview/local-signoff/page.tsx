"use client";

import { useEffect, useState } from "react";
import { OfferSignOffForm } from "@/app/sponsor/offers/OfferSignOff";
import { depositLocalClimateWallet } from "@/app/services/sponsor-wallet.service";
import type { SponsorMatchOffer } from "@/app/services/sponsor-offers.service";

const leftoverLeadOffer: SponsorMatchOffer = {
  id: "preview-local-signoff",
  clubId: "hibs-demo",
  clubName: "Hibernian",
  clubEmail: null,
  matchTitle: "Hibernian v Motherwell",
  matchDate: "2026-10-18",
  scoreLabel: "",
  projectIds: [],
  projects: [],
  postedAt: "2026-10-13T12:00:00.000Z",
  headline:
    "Match Day carbon footprint offset for Hibernian during Hibernian v Motherwell",
  sponsorshipAmountGbp: 2000,
  gbpPerGoal: 3000,
  maxAmount: 9000,
};

export default function LocalSignoffPreviewPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    depositLocalClimateWallet({
      clubName: "Hibernian",
      brandName: "Kokobean Cafe",
      sponsorshipGbp: 750,
    });
    setReady(true);
  }, []);

  return (
    <main className="min-h-screen p-8 text-white">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          Local Business Climate Sponsor
        </p>
        <h1 className="mt-2 text-4xl font-black">
          {leftoverLeadOffer.headline}
        </h1>
        <p className="mt-4 text-slate-300">
          Kokobean Cafe puts £750 into this Hibernian Match. Sign-off must not
          use leftover Lead Goals copy.
        </p>
        {ready ? (
          <OfferSignOffForm
            offer={leftoverLeadOffer}
            brandDefault="Kokobean Cafe"
          />
        ) : (
          <p className="mt-8 text-slate-400">Loading sign-off...</p>
        )}
      </div>
    </main>
  );
}
