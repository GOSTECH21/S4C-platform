"use client";

import { useEffect, useState } from "react";
import AppLayout from "../../layout/AppLayout";
import { getMatchCentreFixtures } from "../../services/match-centre.service";
import { getGoalTimeline } from "../../services/goal-timeline.service";
import { getSupporters } from "../../services/supporters.service";
import { claimSponsorCredit } from "../../services/supporter-claims.service";
import { getReleasedCredits } from "../../services/released-credits.service";

export default function MatchCentrePage() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [supporters, setSupporters] = useState<any[]>([]);
const [selectedSupporterId, setSelectedSupporterId] = useState("");
const [releasedCredits, setReleasedCredits] = useState<any[]>([]);

  async function loadFixtures() {
    const data = await getMatchCentreFixtures();
    setFixtures(data || []);
    if (data?.length) {
  const goals = await getGoalTimeline(data[0].id);
  setTimeline(goals || []);
  const supportersData = await getSupporters();
setSupporters(supportersData || []);
const releasedCreditsData = await getReleasedCredits();
setReleasedCredits(releasedCreditsData || []);
}
  }

  useEffect(() => {
    loadFixtures();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-5xl font-bold text-green-400">Match Centre</h1>
          <p className="mt-3 text-slate-300">
            Live sponsored match moments and climate credit campaigns.
          </p>
        </div>

        <div className="space-y-6">
          {fixtures.map((fixture) => (
            <div
              key={fixture.id}
              className="rounded-xl border border-slate-800 bg-slate-900 p-6"
            >
              <p className="text-slate-400">{fixture.competitions?.name}</p>

              <div className="mt-4 grid items-center gap-4 md:grid-cols-3">
                <div className="text-2xl font-bold">
                  {fixture.home_club?.name}
                </div>

                <div className="text-center text-4xl font-bold text-green-400">
                  {fixture.home_score} - {fixture.away_score}
                </div>

                <div className="text-right text-2xl font-bold">
                  {fixture.away_club?.name}
                </div>
              </div>

              <p className="mt-3 text-slate-400">
                {fixture.fixture_date} · {fixture.kickoff_time} · {fixture.venue}
              </p>
<div className="mt-6">
    <h3 className="text-lg font-bold text-green-400 mb-3">
        Goal Timeline
    </h3>

    {timeline
        .filter(goal => goal.fixture_id === fixture.id)
        .map((goal, index) => (
            <div
                key={index}
                className="mb-3 rounded-lg border border-slate-700 bg-slate-800 p-3"
            >
                <div className="flex justify-between">

                    <span className="font-bold">
                        ⚽ {goal.minute}'
                    </span>

                    <span>{goal.scorer}</span>

                </div>

                <div className="text-sm text-slate-400">
                    Club ID: {goal.club_id}
                </div>

                <div className="mt-2 text-green-400 text-sm">
                Sponsored goal
                </div>

            </div>
        ))}
</div>
              <div className="mt-6">
                <h2 className="mb-3 text-xl font-bold">Goal Sponsors</h2>

                <div className="grid gap-4 md:grid-cols-2">
                  {fixture.sponsor_campaigns?.map((campaign: any) => (
                    <div
                      key={campaign.id}
                      className="rounded-lg border border-slate-800 bg-slate-950 p-4"
                    >
                      <div className="text-xl font-bold">
                        {campaign.sponsors?.name}
                      </div>

                      <div className="mt-2 text-slate-400">
                        {campaign.credit_name} ({campaign.credit_code})
                      </div>

                      <div className="mt-3 text-green-400">
                        £{campaign.funding_per_trigger} per {campaign.trigger_type}
                      </div>

                      <div className="text-slate-400">
                        Max budget: £{campaign.max_budget}
                      </div>

                      <div className="mt-4 flex gap-3">
  <select
    value={selectedSupporterId}
    onChange={(e) => setSelectedSupporterId(e.target.value)}
    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
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

  const releasedCredit = releasedCredits.find(
    (credit) => credit.sponsor_campaign_id === campaign.id
  );

  if (!releasedCredit) {
    alert("No credits have been unlocked for this sponsor yet.");
    return;
  }

  await claimSponsorCredit({
    supporterId: selectedSupporterId,
    sponsorCreditId: releasedCredit.id,
    clubId: releasedCredit.clubs?.id || "",
  });

  await loadFixtures();

  alert("Credit claimed successfully.");
    }}
    className="rounded-lg bg-green-500 px-5 py-2 font-semibold text-slate-950"
  >
    Claim Credit
  </button>
</div>
                        
                      
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}