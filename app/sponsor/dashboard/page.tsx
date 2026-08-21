"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getSponsorCampaigns } from "@/app/services/sponsor-campaigns.service";

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
            Launch Campaign
          </Link>

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
          title="Supporters Reached"
          value="0"
        />

        <StatCard
          title="Climate Funding"
          value={
            loading
              ? "..."
              : `£${totalBudget.toLocaleString()}`
          }
        />

        <StatCard
          title="Schools Funded"
          value="0"
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
            title="Goals-Scored Sponsorship launched"
            description="Arsenal v Chelsea • Premier League"
            time="Just now"
          />

          <ActivityItem
            title="Climate funding committed"
            description="£3 will be unlocked for every Arsenal goal."
            time="Just now"
          />

          <ActivityItem
            title="Campaign is now Active"
            description="Waiting for first qualifying sporting event."
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
            Launch Sponsorship
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

            <table className="w-full">

              <thead>

                <tr className="border-b text-left">

                  <th className="pb-4">Campaign</th>
                  <th className="pb-4">Competition</th>
                  <th className="pb-4">Budget</th>
                  <th className="pb-4">Status</th>

                </tr>

              </thead>

              <tbody>

                {campaigns.map((campaign) => (

                  <tr
                    key={campaign.id}
                    className="border-b"
                  >

                    <td className="py-4">

                      {campaign.campaign_name}

                    </td>

                    <td>

                      {campaign.competition}

                    </td>

                    <td>

                      £{Number(campaign.marketing_budget || 0).toLocaleString()}

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