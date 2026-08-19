"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Campaign,
  getSponsorCampaigns,
} from "@/app/services/sponsor-campaigns.service";

export default function SponsorDashboardPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const data = await getSponsorCampaigns();
        setCampaigns(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadCampaigns();
  }, []);

  const activeCampaigns = campaigns.filter(
    (c) => c.status === "active"
  ).length;

  const totalBudget = campaigns.reduce(
    (sum, c) => sum + c.max_budget,
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
          Every sporting moment improves our planet.
          Launch sponsorship campaigns that reward supporters while
          funding our Global Schools Solar (GSS) Programmes.
        </p>

        <div className="mt-8">
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
          value={loading ? "..." : activeCampaigns.toString()}
        />

        <StatCard
          title="Supporters Reached"
          value="0"
        />

        <StatCard
          title="Climate Funding"
          value={loading ? "..." : `£${totalBudget}`}
        />

        <StatCard
          title="GSS Schools"
          value="0"
        />

      </section>

      {/* Campaigns */}

      <section className="rounded-2xl border bg-white p-10 shadow-sm">

        <div className="flex items-center justify-between">

          <h2 className="text-2xl font-bold">
            Your Campaigns
          </h2>

          <Link
            href="/sponsor/campaigns/new"
            className="rounded-lg bg-emerald-600 px-5 py-2 text-white hover:bg-emerald-700"
          >
            New Campaign
          </Link>

        </div>

        {loading ? (

          <div className="py-20 text-center text-slate-500">
            Loading campaigns...
          </div>

        ) : campaigns.length === 0 ? (

          <div className="mt-10 rounded-xl border-2 border-dashed border-slate-200 py-20 text-center">

            <h3 className="text-2xl font-semibold">
              No campaigns yet
            </h3>

            <p className="mx-auto mt-4 max-w-xl text-slate-600">
              Launch your first sponsorship campaign to begin rewarding
              supporters and funding Global Schools Solar (GSS) Programmes.
            </p>

          </div>

        ) : (

          <div className="mt-8 overflow-hidden rounded-xl border">

            <table className="min-w-full">

              <thead className="bg-slate-100">

                <tr>

                  <th className="px-6 py-4 text-left">
                    Campaign
                  </th>

                  <th className="px-6 py-4 text-left">
                    Trigger
                  </th>

                  <th className="px-6 py-4 text-left">
                    Budget
                  </th>

                  <th className="px-6 py-4 text-left">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {campaigns.map((campaign) => (

                  <tr
                    key={campaign.id}
                    className="border-t"
                  >

                    <td className="px-6 py-4">
                      {campaign.campaign_name}
                    </td>

                    <td className="px-6 py-4">
                      {campaign.trigger_type}
                    </td>

                    <td className="px-6 py-4">
                      £{campaign.max_budget}
                    </td>

                    <td className="px-6 py-4 capitalize">
                      {campaign.status}
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

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">

      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
        {title}
      </p>

      <h3 className="mt-4 text-4xl font-bold text-slate-900">
        {value}
      </h3>

    </div>
  );
}