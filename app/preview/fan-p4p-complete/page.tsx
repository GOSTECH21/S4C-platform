"use client";

import HowS4pPredictForPlanet from "@/app/components/home/HowS4pPredictForPlanet";
import { PredictForPlanetPlay } from "@/app/components/fan/PredictForPlanetPlay";
import { P4P_FALLBACK_PROJECTS } from "@/app/lib/predict-for-planet";

const CLUB = "Newcastle United";
const FIXTURE = "Newcastle United v Fulham";
const BRAND = "American Express";
const COMPLETE_KICKOFF = new Date(Date.now() - 31 * 60 * 1000).toISOString();

export default function FanP4pCompletePreviewPage() {
  return (
    <main
      className="mx-auto max-w-6xl px-6 pb-16 pt-8"
      data-p4p-timer-complete="p4p-timer-complete-v1"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-800">
        Fan P4P · COMPLETE slot
      </p>
      <p className="mt-2 text-sm text-slate-700">
        After all six 5-minute predictions in a 30-minute P4P slot have
        been played, that slot is marked COMPLETE.
      </p>
      <div className="mt-8">
        <HowS4pPredictForPlanet
          initialClub={CLUB}
          clubOptions={[CLUB]}
          showPhone={false}
        >
          <PredictForPlanetPlay
            fanId="preview-fan-complete"
            clubName={CLUB}
            fixtureName={FIXTURE}
            preferredClubNames={[CLUB]}
            projects={P4P_FALLBACK_PROJECTS}
            seedWallet={{
              brandName: BRAND,
              amountGbp: 2500,
              kickoffAt: COMPLETE_KICKOFF,
              slotIndex: 0,
            }}
          />
        </HowS4pPredictForPlanet>
      </div>
    </main>
  );
}
