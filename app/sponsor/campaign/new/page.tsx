"use client";

import { useState } from "react";

export default function NewCampaignPage() {

  const [campaignName, setCampaignName] = useState("");
  const [sport, setSport] = useState("Football");
  const [competition, setCompetition] = useState("");
  const [trigger, setTrigger] = useState("Goal");
  const [reward, setReward] = useState("");
  const [contribution, setContribution] = useState("");
  const [budget, setBudget] = useState("");

  return (

    <div className="mx-auto max-w-3xl py-16">

      <h1 className="text-4xl font-bold">
        Create Sponsorship Campaign
      </h1>

      <p className="mt-3 text-gray-600">
        Configure how your sponsorship will reward supporters and fund Global Schools Solar (GSS) Programmes.
      </p>

      <form className="mt-10 space-y-6">

        <div>

          <label className="mb-2 block font-medium">
            Campaign Name
          </label>

          <input
            value={campaignName}
            onChange={(e)=>setCampaignName(e.target.value)}
            className="w-full rounded-lg border p-3"
          />

        </div>

        <div>

          <label className="mb-2 block font-medium">
            Sport
          </label>

          <select
            value={sport}
            onChange={(e)=>setSport(e.target.value)}
            className="w-full rounded-lg border p-3"
          >
            <option>Football</option>
            <option>Rugby</option>
            <option>Cricket</option>
            <option>Basketball</option>
            <option>Tennis</option>
            <option>Formula 1</option>
            <option>Golf</option>
            <option>Athletics</option>
          </select>

        </div>

        <div>

          <label className="mb-2 block font-medium">
            Competition
          </label>

          <input
            value={competition}
            onChange={(e)=>setCompetition(e.target.value)}
            className="w-full rounded-lg border p-3"
          />

        </div>

        <div>

          <label className="mb-2 block font-medium">
            Trigger Event
          </label>

          <select
            value={trigger}
            onChange={(e)=>setTrigger(e.target.value)}
            className="w-full rounded-lg border p-3"
          >
            <option>Goal</option>
            <option>Try</option>
            <option>Touchdown</option>
            <option>Wicket</option>
            <option>Birdie</option>
            <option>Ace</option>
            <option>Win</option>
          </select>

        </div>

        <div>

          <label className="mb-2 block font-medium">
            Supporter Reward
          </label>

          <input
            value={reward}
            onChange={(e)=>setReward(e.target.value)}
            placeholder="£5 Voucher"
            className="w-full rounded-lg border p-3"
          />

        </div>

        <div>

          <label className="mb-2 block font-medium">
            Sponsor Contribution (£)
          </label>

          <input
            value={contribution}
            onChange={(e)=>setContribution(e.target.value)}
            className="w-full rounded-lg border p-3"
          />

        </div>

        <div>

          <label className="mb-2 block font-medium">
            Campaign Budget (£)
          </label>

          <input
            value={budget}
            onChange={(e)=>setBudget(e.target.value)}
            className="w-full rounded-lg border p-3"
          />

        </div>

        <button
          className="rounded-lg bg-emerald-600 px-8 py-4 font-semibold text-white hover:bg-emerald-700"
        >
          Launch Campaign
        </button>

      </form>

    </div>

  );

}