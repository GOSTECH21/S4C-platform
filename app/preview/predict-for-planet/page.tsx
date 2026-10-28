"use client";

import { PredictForPlanetPlay } from "@/app/components/fan/PredictForPlanetPlay";
import {
  GAME_TIME_CARBON_WALLET_LABEL,
  P4P_ENGAGEMENT_GBP,
  P4P_FALLBACK_PROJECTS,
  P4P_LABEL,
  formatP4pGbp,
} from "@/app/lib/predict-for-planet";

const CLUB = "Arsenal";
const FIXTURE = "Arsenal vs Chelsea";
const BRAND = "EA Sports";

export default function PredictForPlanetPreviewPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-white">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
        Preview
      </p>
      <p className="mt-2 text-sm text-slate-400">
        {BRAND} put {formatP4pGbp(2)} on each 30-minute {GAME_TIME_CARBON_WALLET_LABEL}{" "}
        for {FIXTURE}. Each {P4P_LABEL} prediction takes{" "}
        {formatP4pGbp(P4P_ENGAGEMENT_GBP)}.
      </p>
      <div className="mt-8">
        <PredictForPlanetPlay
          fanId="preview-fan"
          clubName={CLUB}
          fixtureName={FIXTURE}
          projects={P4P_FALLBACK_PROJECTS}
          seedWallet={{ brandName: BRAND, amountGbp: 2 }}
        />
      </div>
    </main>
  );
}
