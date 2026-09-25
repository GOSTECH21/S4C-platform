"use client";

import FanNav from "@/app/dashboard/supporter/components/FanNav";
import { SponsorLeaderboard } from "@/app/components/fan/SponsorLeaderboard";
import { rankSponsorDonations } from "@/app/lib/sponsor-leaderboard";
import {
  LEAD_CLIMATE_SPONSOR_LABEL,
  LOCAL_BUSINESS_SPONSOR_LABEL,
} from "@/app/lib/dual-sponsor";

const ROWS = rankSponsorDonations([
  {
    brandName: "American Express",
    donationGbp: 50000,
    clubName: "Hibernian",
    kind: LEAD_CLIMATE_SPONSOR_LABEL,
  },
  {
    brandName: "Top Cellar",
    donationGbp: 1500,
    clubName: "Hibernian",
    kind: LOCAL_BUSINESS_SPONSOR_LABEL,
  },
  {
    brandName: "Kokobean Cafe",
    donationGbp: 1000,
    clubName: "Hibernian",
    kind: LOCAL_BUSINESS_SPONSOR_LABEL,
  },
  {
    brandName: "Mash Tun",
    donationGbp: 750,
    clubName: "Hibernian",
    kind: LOCAL_BUSINESS_SPONSOR_LABEL,
  },
  {
    brandName: "Interval",
    donationGbp: 500,
    clubName: "Hibernian",
    kind: LOCAL_BUSINESS_SPONSOR_LABEL,
  },
  {
    brandName: "Tax Assist",
    donationGbp: 500,
    clubName: "Hibernian",
    kind: LOCAL_BUSINESS_SPONSOR_LABEL,
  },
]);

export default function SponsorLeaderboardPreviewPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <FanNav />
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
          Sponsor
        </p>
        <h1 className="mt-2 text-4xl font-black">Sponsor Leaderboard</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Climate Sponsors ranked by donation, from the largest gift to the
          smallest.
        </p>
        <div className="mt-8">
          <SponsorLeaderboard rows={ROWS} />
        </div>
      </div>
    </main>
  );
}
