"use client";

import HowS4pPredictForPlanet from "@/app/components/home/HowS4pPredictForPlanet";
import { PredictForPlanetPlay } from "@/app/components/fan/PredictForPlanetPlay";
import { P4P_FALLBACK_PROJECTS } from "@/app/lib/predict-for-planet";

const CLUB = "Newcastle United";
const FIXTURE = "Newcastle United v Everton";
const BRAND = "American Express";

export default function FanP4pPreviewPage() {
  return (
    <main
      className="mx-auto max-w-6xl px-6 pb-16 pt-8"
      data-p4p-fan-drop-overlay="p4p-fan-drop-overlay-v1"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-800">
        Fan P4P
      </p>
      <p className="mt-2 text-sm text-slate-700">
        Logged-in Predict-For Planet: intro copy and the live challenge only.
      </p>
      <div className="mt-8">
        <HowS4pPredictForPlanet
          initialClub={CLUB}
          clubOptions={[CLUB]}
          donateOnFullTime
          showPhone={false}
        >
          <PredictForPlanetPlay
            fanId="preview-fan"
            clubName={CLUB}
            fixtureName={FIXTURE}
            preferredClubNames={[CLUB]}
            projects={P4P_FALLBACK_PROJECTS}
            seedWallet={{ brandName: BRAND, amountGbp: 2500 }}
          />
        </HowS4pPredictForPlanet>
      </div>
    </main>
  );
}
