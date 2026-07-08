"use client";

import { useEffect, useState } from "react";
import AppLayout from "../../layout/AppLayout";
import { getMyClimateCredits } from "../../services/my-climate-credits.service";
import { getClimateAssets } from "../../services/climate-assets.service";
import { allocateCredit } from "../../services/credit-allocations.service";

type Credit = {
  id: string;
  claim_status: string;
  sponsor_climate_credits: {
    credit_name: string;
    credit_code: string;
    total_value: number;
    sponsor_campaigns?: {
      campaign_name: string;
      sponsors?: {
        name: string;
      };
    };
    fixtures?: {
      home_club?: {
        name: string;
      };
      away_club?: {
        name: string;
      };
    };
  };
};

export default function MyClimateCreditsPage() {
    const [assets, setAssets] = useState<any[]>([]);
  const [credits, setCredits] = useState<Credit[]>([]);

  async function loadCredits() {
    // Temporary supporter ID until login is added
    const supporterId = "2f1039c7-dea5-4146-8ced-1822716a5723";

    const creditsData = await getMyClimateCredits(supporterId);
const assetsData = await getClimateAssets();

setCredits(creditsData || []);
setAssets(assetsData || []);
  }

  useEffect(() => {
    loadCredits();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-5xl font-bold text-green-400">
            My Climate Credits
          </h1>

          <p className="mt-2 text-slate-300">
            Credits you have claimed and can allocate to climate projects.
          </p>
        </div>

        {credits.map((credit) => (
          <div
            key={credit.id}
            className="rounded-xl border border-slate-800 bg-slate-900 p-6"
          >
            <h2 className="text-2xl font-bold">
              {credit.sponsor_climate_credits?.credit_name}
            </h2>

            <p className="mt-2">
              Sponsor:{" "}
              {credit.sponsor_climate_credits.sponsor_campaigns?.sponsors?.name}
            </p>

            <p>
              Campaign:{" "}
              {credit.sponsor_climate_credits.sponsor_campaigns?.campaign_name}
            </p>

            <p>
              Fixture:{" "}
              {credit.sponsor_climate_credits.fixtures?.home_club?.name}
              {" vs "}
              {credit.sponsor_climate_credits.fixtures?.away_club?.name}
            </p>

            <p>
              Status:{" "}
              <span className="text-green-400">
                {credit.claim_status}
              </span>
            </p>

            <div className="mt-5 space-y-3">
  <p className="font-semibold text-white">
    Choose a climate asset to receive your £1 credit:
  </p>

  {assets.map((asset) => (
    <button
      key={asset.id}
      onClick={async () => {
        await allocateCredit({
          supporterClaimId: credit.id,
          climateAssetId: asset.id,
          amount: 1,
        });

        await loadCredits();
      }}
      className="block w-full rounded-lg border border-slate-700 bg-slate-950 p-4 text-left hover:border-green-400"
    >
      <div className="font-bold text-white">
        {asset.asset_name || asset.name}
      </div>

      <div className="text-sm text-slate-400">
        {asset.city}, {asset.country}
      </div>

      <div className="text-green-400">
        £{asset.amount_funded || 0} funded
      </div>
    </button>
  ))}
</div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}