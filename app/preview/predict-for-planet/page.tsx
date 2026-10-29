"use client";

import HowS4pPredictForPlanet from "@/app/components/home/HowS4pPredictForPlanet";
import { PredictForPlanetPlay } from "@/app/components/fan/PredictForPlanetPlay";
import {
  GAME_TIME_CARBON_WALLET_LABEL,
  P4P_ACCURACY_GBP,
  P4P_ENGAGEMENT_GBP,
  P4P_FALLBACK_PROJECTS,
  formatP4pGbp,
} from "@/app/lib/predict-for-planet";

const CLUB = "Arsenal";
const FIXTURE = "Arsenal vs Chelsea";
const BRAND = "EA Sports";

export default function PredictForPlanetPreviewPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-800">
        Preview
      </p>
      <p className="mt-2 text-sm text-slate-700">
        {BRAND} put {formatP4pGbp(2)} on each 30-minute {GAME_TIME_CARBON_WALLET_LABEL}{" "}
        for {FIXTURE}. Participating takes {formatP4pGbp(P4P_ENGAGEMENT_GBP)}; the
        right event takes another {formatP4pGbp(P4P_ACCURACY_GBP)}.
      </p>
      <div className="mt-8">
        <HowS4pPredictForPlanet
          initialClub={CLUB}
          clubOptions={[CLUB]}
          fixtureName={FIXTURE}
        >
          <PredictForPlanetPlay
            fanId="preview-fan"
            clubName={CLUB}
            fixtureName={FIXTURE}
            projects={P4P_FALLBACK_PROJECTS}
            seedWallet={{ brandName: BRAND, amountGbp: 2 }}
          />
        </HowS4pPredictForPlanet>
      </div>
    </main>
  );
}
