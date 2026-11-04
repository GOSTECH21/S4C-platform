"use client";

import HowS4pPredictForPlanet from "@/app/components/home/HowS4pPredictForPlanet";
import { PredictForPlanetPlay } from "@/app/components/fan/PredictForPlanetPlay";
import { P4P_FALLBACK_PROJECTS } from "@/app/lib/predict-for-planet";

const CLUB = "Newcastle United";

export default function FanP4pAwaitingPreviewPage() {
  return (
    <main
      className="mx-auto max-w-6xl px-6 pb-16 pt-8"
      data-p4p-awaiting-preview="p4p-timer-complete-v1"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-800">
        Fan P4P · next day
      </p>
      <p className="mt-2 text-sm text-slate-700">
        When Match Day has passed, P4P shows Awaiting New Sponsored P4P.
      </p>
      <div className="mt-8">
        <HowS4pPredictForPlanet
          initialClub={CLUB}
          clubOptions={[CLUB]}
          showPhone={false}
        >
          <PredictForPlanetPlay
            fanId="preview-fan-awaiting"
            preferredClubNames={[CLUB]}
            projects={P4P_FALLBACK_PROJECTS}
            forceAwaiting
          />
        </HowS4pPredictForPlanet>
      </div>
    </main>
  );
}
