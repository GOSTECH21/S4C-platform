"use client";

import FanNav from "@/app/dashboard/supporter/components/FanNav";
import HowS4pPredictForPlanet from "@/app/components/home/HowS4pPredictForPlanet";
import {
  P4P_DONATE_FUNDING_MESSAGE,
  P4P_FALLBACK_PROJECTS,
  formatP4pGbp,
} from "@/app/lib/predict-for-planet";

export default function P4pDonatePreviewPage() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl space-y-8">
        <FanNav />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-800">
            Climate Projects
          </p>
          <h1 className="mt-2 text-4xl font-black">Climate Projects</h1>
          <p
            data-p4p-donate-funding="p4p-donate-funding-v1"
            className="mt-3 max-w-2xl text-base font-black text-emerald-800"
          >
            Here are Climate Projects to donate your funding · Game-Time Wallet{" "}
            {formatP4pGbp(0.2)}
          </p>
        </div>
        <HowS4pPredictForPlanet
          initialClub="Real Madrid"
          clubOptions={["Real Madrid"]}
          fixtureName="Racing Santander vs Real Madrid"
          forceFullTime
          initialWalletGbp={0.2}
        />
        <ol
          data-p4p-donate-project-list="p4p-donate-project-list-v1"
          className="space-y-3"
        >
          {P4P_FALLBACK_PROJECTS.map((name, index) => (
            <li
              key={name}
              className="rounded-2xl border border-emerald-700/30 bg-white p-5"
            >
              <p className="text-lg font-black">
                {index + 1}. {name}
              </p>
            </li>
          ))}
        </ol>
        <p className="text-sm text-slate-600">{P4P_DONATE_FUNDING_MESSAGE}</p>
      </div>
    </main>
  );
}
