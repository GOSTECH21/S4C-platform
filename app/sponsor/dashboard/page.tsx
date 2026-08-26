"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { processSportingEvent } from "@/app/services/sponsor-trigger-engine.service";
import { getSponsorCampaigns } from "@/app/services/sponsorship-campaigns.service";
console.log("processSportingEvent =", processSportingEvent);
export default function SponsorDashboardPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    try {
      const data = await getSponsorCampaigns();
      setCampaigns(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const activeCampaigns = campaigns.filter(
    (c) => c.status === "Active"
  ).length;

  const totalBudget = campaigns.reduce(
    (sum, c) => sum + Number(c.marketing_budget || 0),
    0
  );
  const latestCampaign = campaigns[0];
const simulatedTeam =
  latestCampaign?.sport === "Rugby"
    ? (latestCampaign?.sponsored_event ?? "")
        .replace(" TRY Scored", "")
        .replace(" TRY", "")
    : (latestCampaign?.sponsored_event ?? "")
        .replace(" Goal Scored", "")
        .replace(" Goals Scored", "");
   const simulationLabel =
    latestCampaign?.sport === "Rugby"
        ? "TRY"
        : "Goal"; 
  return (
    <div className="space-y-10">

      {/* Hero */}

      <section className="rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-500 p-10 text-white shadow-lg">

        <p className="text-sm uppercase tracking-widest text-emerald-100">
          Score-For-Our-Planet (S4P)
        </p>

        <h1 className="mt-3 text-5xl font-bold">
          Welcome back 👋
        </h1>

        <p className="mt-5 max-w-3xl text-lg leading-8 text-emerald-50">
          Every sporting moment turns your marketing budget into
          verified climate action while rewarding supporters.
          Track campaigns, climate funding and impact from one place.
        </p>

        <div className="mt-8 flex gap-4">

          <Link
            href="/sponsor/campaigns/new"
            className="inline-flex rounded-xl bg-white px-8 py-4 font-semibold text-emerald-700 shadow hover:bg-emerald-50"
          >
            Create Sponsorship Campaign
          </Link>
<button
  onClick={async () => {
    console.log("========== SIMULATING GOAL ==========");
console.log("Campaign:", latestCampaign);
console.log("Sport:", latestCampaign?.sport);
console.log("Competition:", latestCampaign?.competition);
console.log("Fixture:", latestCampaign?.fixture);
console.log("Sponsored Event:", latestCampaign?.sponsored_event);
console.log("Team:", simulatedTeam);

alert("Button clicked");

try {
  console.log("Calling processSportingEvent...");

  const result = await processSportingEvent({
    sport: latestCampaign?.sport,
    competition: latestCampaign?.competition,
    fixture: latestCampaign?.fixture,
    team: simulatedTeam,
    event:
      latestCampaign?.sport === "Rugby"
        ? "TRY"
        : "Goal",
    minute: 64,
  });

  console.log("Returned:", result);

} catch (err) {
  console.error("ERROR:", err);
}

console.log("Finished");
  }}
  
  className="rounded-xl border border-white px-6 py-3 text-white hover:bg-white hover:text-emerald-700"
>
     {`Simulate ${simulationLabel}`}
</button>
        </div>

      </section>

      {/* Statistics */}

      <section className="grid gap-6 md:grid-cols-4">

        <StatCard
          title="Active Campaigns"
          value={
            loading
              ? "..."
              : activeCampaigns.toString()
          }
        />

        <StatCard
  title="Monthly Commitment"
  value={
    loading
      ? "..."
      : `£${totalBudget.toLocaleString()}`
  }
/>

        <StatCard
  title="Climate Credits Issued"
  value="125,000"
/>

        <StatCard
  title="Supporters Rewarded"
  value="2,143"
/>

      </section>
            {/* Recent Activity */}

      <section className="rounded-2xl border bg-white p-8 shadow-sm">

        <div className="flex items-center justify-between">

          <h2 className="text-2xl font-bold">
            Recent Activity
          </h2>

          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
            Live
          </span>

        </div>

        <div className="mt-8 space-y-5">

          <ActivityItem
    title={`${latestCampaign?.campaign_name ?? "Campaign"} launched`}
    description={`${latestCampaign?.fixture ?? "-"} • ${latestCampaign?.competition ?? "-"}`}
    time="Just now"
/>

          <ActivityItem
    title="Climate funding committed"
    description={`£${latestCampaign?.amount_per_goal ?? 0} will be unlocked for every ${latestCampaign?.sponsored_event ?? "goal"}.`}
    time="Just now"
/>

          <ActivityItem
    title="Campaign is now Active"
    description={latestCampaign?.campaign_name ?? "Waiting for first qualifying sporting event."}
    time="Just now"
/>

        </div>

      </section>
            {/* Campaigns */}

      <section className="rounded-2xl border bg-white p-10 shadow-sm">

        <div className="mb-8 flex items-center justify-between">

          <div>

            <h2 className="text-3xl font-bold">
              My Sponsorship Portfolio
            </h2>

            <p className="mt-2 text-slate-500">
              Manage your active sponsorships.
            </p>

          </div>

          <Link
            href="/sponsor/campaigns/new"
            className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            Create Sponsorship Campaign
          </Link>

        </div>

        {loading ? (

          <p className="text-slate-500">
            Loading sponsorships...
          </p>

        ) : campaigns.length === 0 ? (

          <p className="text-slate-500">
            No sponsorships found.
          </p>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full table-fixed">

              <thead>

<tr className="border-b text-left">

<th className="w-[34%]">Campaign</th>

<th className="w-[18%]">Fixture</th>

<th className="w-[18%]">Sponsor Event</th>

<th className="w-[8%] text-center">Package</th>

<th className="w-[12%] text-center">£ / Score</th>

<th className="w-[5%] text-center">Scores</th>

<th className="w-[5%] text-center">Status</th>

</tr>

</thead>

              <tbody>

                {campaigns.map((campaign) => (

                  <tr
                    key={campaign.id}
                    className="border-b"
                  >

                    <td className="py-4 font-medium">
  {campaign.campaign_name}
</td>

<td>
  {campaign.fixture || "-"}
</td>
<td>

    <span className="font-medium">

        {campaign.sponsored_event || "-"}

    </span>

</td>

<td className="text-center pr-2">
  {campaign.package}
</td>

<td className="text-center pl-2">
  £{Number(campaign.amount_per_goal).toLocaleString()}
</td>

<td className="text-center w-14">
  {campaign.goals_triggered ?? 0}
</td>
<td>
  <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
    {campaign.status}
  </span>
</td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>

  );

}
type StatCardProps = {
  title: string;
  value: string;
};

function StatCard({
  title,
  value,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">

      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-4xl font-bold text-emerald-700">
        {value}
      </p>

    </div>
  );
}

type ActivityItemProps = {
  title: string;
  description: string;
  time: string;
};

function ActivityItem({
  title,
  description,
  time,
}: ActivityItemProps) {
  return (
    <div className="flex items-start gap-4 rounded-xl border p-5">

      <div className="mt-1 h-3 w-3 rounded-full bg-emerald-500" />

      <div className="flex-1">

        <h4 className="font-semibold">
          {title}
        </h4>

        <p className="mt-1 text-slate-500">
          {description}
        </p>

      </div>

      <span className="text-sm text-slate-400">
        {time}
      </span>

    </div>
  );
}