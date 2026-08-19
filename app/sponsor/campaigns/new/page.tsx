"use client";
import { useRouter } from "next/navigation";
import { createDashboardCampaign } from "@/app/services/sponsor-campaigns.service";
import { useState } from "react";

export default function NewCampaignPage() {

  const [campaignName, setCampaignName] = useState("");
  const [sport, setSport] = useState("Football");
  const [competition, setCompetition] = useState("");
  const [trigger, setTrigger] = useState("Goal");
  const [reward, setReward] = useState("");
  const [contribution, setContribution] = useState("");
  const [budget, setBudget] = useState("");
const router = useRouter();

const [loading, setLoading] = useState(false);
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  setLoading(true);
const competitions: Record<string, string[]> = {
  Football: [
    "Premier League",
    "Championship",
    "FA Cup",
    "Champions League",
    "Europa League",
    "Women's Super League",
  ],

  Rugby: [
    "Six Nations",
    "Premiership Rugby",
    "United Rugby Championship",
    "Rugby Championship",
    "Rugby World Cup",
  ],

  "NFL (American Football)": [
    "NFL Regular Season",
    "NFL Playoffs",
    "Super Bowl",
  ],

  Basketball: [
    "NBA",
    "EuroLeague",
    "NCAA",
  ],

  Hockey: [
    "NHL",
    "IIHF World Championship",
  ],

  Golf: [
    "PGA Tour",
    "DP World Tour",
    "Masters",
    "The Open",
    "Ryder Cup",
  ],
};
  try {
    await createDashboardCampaign({
      campaignName,
      triggerEvent: trigger,
      supporterReward: reward,
      contribution: Number(contribution),
      budget: Number(budget),
    });

    alert("Campaign created successfully!");

    router.push("/sponsor/dashboard");

  } catch (err: any) {
    alert(err.message);
  } finally {
    setLoading(false);
  }
  }
  return (

    <div className="mx-auto max-w-3xl py-16">

      <h1 className="text-4xl font-bold">
        Create Sponsorship Campaign
      </h1>

      <p className="mt-3 text-gray-600">
        Configure how your sponsorship will reward supporters and fund Global Schools Solar (GSS) Programmes.
      </p>

      <form
  onSubmit={handleSubmit}
  className="mt-10 space-y-6"
>      
        <div>

  <label className="mb-2 block font-medium">
    Sport
  </label>

  <select
    value={sport}
    onChange={(e) => setSport(e.target.value)}
    className="w-full rounded-lg border p-3"
  >
    <option>Football</option>
    <option>Rugby</option>
    <option>NFL (American Football)</option>
    <option>Basketball</option>
    <option>Hockey</option>
    <option>Golf</option>
  </select>

</div>
        <div>

  <label className="mb-2 block font-medium">
    Competition
  </label>

  <select
    value={competition}
    onChange={(e) => setCompetition(e.target.value)}
    className="w-full rounded-lg border p-3"
  >

    <option value="">
      Select Competition
    </option>

    {(competitions[sport] || []).map((competition) => (

      <option
        key={competition}
        value={competition}
      >
        {competition}
      </option>

    ))}

  </select>

</div>
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
                  
  type="submit"
  className="rounded-lg bg-emerald-600 px-8 py-4 font-semibold text-white hover:bg-emerald-700"
>
  {loading ? "Launching..." : "Launch Campaign"}
</button>

      </form>

    </div>

  );

}