"use client";

import { useEffect, useState } from "react";
import AppLayout from "../../layout/AppLayout";
import { getSponsors } from "../../services/sponsors.service";
import { getFixtures } from "../../services/fixtures.service";
import {
  createSponsorCampaign,
  getSponsorCampaigns,
} from "../../services/sponsor-campaigns.service";

type Sponsor = {
  id: string;
  name: string;
};

type Fixture = {
  id: string;
  fixture_date: string;
  home_club?: { name: string };
  away_club?: { name: string };
};

type Campaign = {
  id: string;
  campaign_name: string;
  trigger_type: string;
  funding_per_trigger: number;
  credit_name: string;
  credit_code: string;
  credit_value: number;
  max_budget: number;
  status: string;
  sponsors?: { name: string };
};

export default function SponsorCampaignsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const [sponsorId, setSponsorId] = useState("");
  const [fixtureId, setFixtureId] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [triggerType, setTriggerType] = useState("Goal");
  const [fundingPerTrigger, setFundingPerTrigger] = useState("2500");
  const [creditName, setCreditName] = useState("");
  const [creditCode, setCreditCode] = useState("");
  const [creditValue, setCreditValue] = useState("1");
  const [maxBudget, setMaxBudget] = useState("20000");

  async function loadData() {
    setSponsors((await getSponsors()) || []);
    setFixtures((await getFixtures()) || []);
    setCampaigns((await getSponsorCampaigns()) || []);
  }

  async function handleCreateCampaign() {
    if (!sponsorId || !fixtureId || !campaignName.trim()) return;

    await createSponsorCampaign({
      sponsorId,
      fixtureId,
      campaignName,
      triggerType,
      fundingPerTrigger: Number(fundingPerTrigger),
      creditName,
      creditCode,
      creditValue: Number(creditValue),
      maxBudget: Number(maxBudget),
    });

    setSponsorId("");
    setFixtureId("");
    setCampaignName("");
    setTriggerType("Goal");
    setFundingPerTrigger("2500");
    setCreditName("");
    setCreditCode("");
    setCreditValue("1");
    setMaxBudget("20000");

    await loadData();
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-5xl font-bold text-green-400">
            Sponsor Campaigns
          </h1>
          <p className="mt-3 text-slate-300">
            Configure branded climate credit campaigns for sponsored sporting moments.
          </p>
        </div>

        <div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900 p-6 md:grid-cols-3">
          <select
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            value={sponsorId}
            onChange={(e) => setSponsorId(e.target.value)}
          >
            <option value="">Select sponsor</option>
            {sponsors.map((sponsor) => (
              <option key={sponsor.id} value={sponsor.id}>
                {sponsor.name}
              </option>
            ))}
          </select>

          <select
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            value={fixtureId}
            onChange={(e) => setFixtureId(e.target.value)}
          >
            <option value="">Select fixture</option>
            {fixtures.map((fixture) => (
              <option key={fixture.id} value={fixture.id}>
                {fixture.home_club?.name} vs {fixture.away_club?.name} —{" "}
                {fixture.fixture_date}
              </option>
            ))}
          </select>

          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="Campaign name"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
          />

          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="Trigger type"
            value={triggerType}
            onChange={(e) => setTriggerType(e.target.value)}
          />

          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="Funding per trigger"
            value={fundingPerTrigger}
            onChange={(e) => setFundingPerTrigger(e.target.value)}
          />

          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="Credit name, e.g. Budweiser Climate Credit"
            value={creditName}
            onChange={(e) => setCreditName(e.target.value)}
          />

          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="Credit code, e.g. BCC"
            value={creditCode}
            onChange={(e) => setCreditCode(e.target.value)}
          />

          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="Credit value"
            value={creditValue}
            onChange={(e) => setCreditValue(e.target.value)}
          />

          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="Max budget"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
          />

          <button
            onClick={handleCreateCampaign}
            className="rounded-lg bg-green-500 px-6 py-3 font-semibold text-slate-950 md:col-span-3"
          >
            Add Campaign
          </button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-6 text-2xl font-bold">Campaigns</h2>

          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="rounded-lg border border-slate-800 bg-slate-950 p-4"
              >
                <div className="text-xl font-bold">{campaign.campaign_name}</div>
                <div className="text-slate-400">
                  Sponsor: {campaign.sponsors?.name}
                </div>
                <div className="mt-2">
                  {campaign.credit_name} ({campaign.credit_code}) — £
                  {campaign.credit_value} each
                </div>
                <div className="text-slate-400">
                  £{campaign.funding_per_trigger} per {campaign.trigger_type} ·
                  Max budget £{campaign.max_budget}
                </div>
                <div className="mt-2 text-green-400">{campaign.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}