"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

export default function MatchCampaignsPage() {
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/club/login");
      return;
    }

    const { data: account } = await supabase
      .from("club_accounts")
      .select("club_id")
      .eq("auth_user_id", user.id)
      .single();

    if (!account) {
      router.push("/club/login");
      return;
    }

    const { data, error } = await supabase
      .from("match_campaigns")
      .select("*")
      .eq("club_id", account.club_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("Couldn't load campaigns.");
    }

    setCampaigns(data || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading Match Campaigns...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto max-w-6xl p-10">

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-5xl font-black">
              Match Campaigns
            </h1>

            <p className="mt-3 text-slate-400">
              Manage your club's Match Campaigns.
            </p>

          </div>

          <button
            onClick={() => router.push("/club/campaigns/new")}
            className="rounded-xl bg-green-500 px-6 py-4 text-lg font-bold text-black hover:bg-green-400"
          >
            + New Match Campaign
          </button>

        </div>

        <div className="mt-10 space-y-6">

          {campaigns.length === 0 && (
            <div className="rounded-2xl bg-slate-800 p-8 text-center">

              <h2 className="text-2xl font-bold">
                No Match Campaigns Yet
              </h2>

              <p className="mt-4 text-slate-400">
                Create your first Match Campaign to start supporter voting.
              </p>

            </div>
          )}

          {campaigns.map((campaign) => (

            <div
              key={campaign.id}
              className="rounded-2xl border border-slate-700 bg-slate-800 p-8"
            >

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="text-3xl font-bold">
                    {campaign.title}
                  </h2>

                  <p className="mt-3 text-slate-400">
                    Sponsor Commitment
                  </p>

                  <p className="text-xl font-bold text-green-400">
                    £{Number(campaign.sponsorship_per_goal).toLocaleString()} per Goal
                  </p>

                  <p className="mt-3">
                    Status:
                    <span className="ml-2 rounded-full bg-blue-600 px-3 py-1 text-sm">
                      {campaign.status}
                    </span>
                  </p>

                </div>

                <button
                  onClick={() =>
                    router.push(`/club/campaigns/${campaign.id}/portfolio`)
                  }
                  className="rounded-xl bg-blue-600 px-6 py-4 text-lg font-bold hover:bg-blue-500"
                >
                  Build Match Portfolio
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </main>
  );
}