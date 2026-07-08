"use client";

import { getSupporters } from "../../services/supporters.service";
import { claimSponsorCredit } from "../../services/supporter-claims.service";
import { useEffect, useState } from "react";
import AppLayout from "../../layout/AppLayout";
import { getSponsorClimateCredits } from "../../services/sponsor-climate-credits.service";

type SponsorCredit = {
  id: string;
  credit_name: string;
  credit_code: string;
  credits_issued: number;
  credits_claimed: number;
  total_value: number;
  status: string;
  created_at: string;
  clubs?: {
  id: string;
  name: string;
};
  sponsor_campaigns?: {
    campaign_name: string;
    sponsors?: { name: string };
  };
  fixtures?: {
    fixture_date: string;
    home_club?: { name: string };
    away_club?: { name: string };
  };
};

export default function SponsorCreditsPage() {
  const [credits, setCredits] = useState<SponsorCredit[]>([]);
const [supporters, setSupporters] = useState<any[]>([]);
const [selectedSupporterId, setSelectedSupporterId] = useState("");
  
async function loadCredits() {
  const creditsData = await getSponsorClimateCredits();
  const supportersData = await getSupporters();

  setCredits(creditsData || []);
  setSupporters(supportersData || []);
}

  useEffect(() => {
    loadCredits();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-5xl font-bold text-green-400">
            Sponsor Climate Credits
          </h1>

          <p className="mt-3 text-slate-300">
            Track branded climate credits unlocked by sponsored goals.
          </p>
        </div>

        <div className="space-y-4">
          {credits.map((credit) => {
            const remaining = credit.credits_issued - credit.credits_claimed;

            return (
              <div
                key={credit.id}
                className="rounded-xl border border-slate-800 bg-slate-900 p-6"
              >
                <h2 className="text-2xl font-bold">
                  {credit.credit_name} ({credit.credit_code})
                </h2>

                <p className="mt-2 text-slate-400">
                  Sponsor: {credit.sponsor_campaigns?.sponsors?.name}
                </p>

                <p className="text-slate-400">
                  Campaign: {credit.sponsor_campaigns?.campaign_name}
                </p>

                <p className="text-slate-400">
                  Fixture: {credit.fixtures?.home_club?.name} vs{" "}
                  {credit.fixtures?.away_club?.name}
                </p>
<div className="mt-5 flex gap-3">
  <select
    value={selectedSupporterId}
    onChange={(e) => setSelectedSupporterId(e.target.value)}
    className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-white"
  >
    <option value="">Select supporter</option>

    {supporters.map((supporter) => (
      <option key={supporter.id} value={supporter.id}>
        {supporter.full_name}
      </option>
    ))}
  </select>

  <button
    onClick={async () => {
      if (!selectedSupporterId) {
        alert("Select a supporter first");
        return;
      }

      await claimSponsorCredit({
        supporterId: selectedSupporterId,
        sponsorCreditId: credit.id,
    clubId: credit.clubs?.id || "",
      });

      await loadCredits();
    }}
    className="rounded-lg bg-green-500 px-5 py-2 font-semibold text-slate-950"
  >
    Claim Credit
  </button>
</div>
                <p className="text-slate-400">
                  Reserved for: {credit.clubs?.name} supporters
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-4">
                  <div className="rounded-lg bg-slate-950 p-4">
                    <p className="text-sm text-slate-400">Issued</p>
                    <p className="text-3xl font-bold text-white">
                      {credit.credits_issued}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-950 p-4">
                    <p className="text-sm text-slate-400">Claimed</p>
                    <p className="text-3xl font-bold text-white">
                      {credit.credits_claimed}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-950 p-4">
                    <p className="text-sm text-slate-400">Remaining</p>
                    <p className="text-3xl font-bold text-white">
                      {remaining}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-950 p-4">
                    <p className="text-sm text-slate-400">Value</p>
                    <p className="text-3xl font-bold text-green-400">
                      £{credit.total_value}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <span className="rounded-full bg-green-500 px-3 py-1 text-sm font-semibold text-slate-950">
                    {credit.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}