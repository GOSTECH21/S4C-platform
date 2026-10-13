"use client";

import { ClubClimateSponsorTabs } from "@/app/components/club/ClubClimateSponsorTabs";
import {
  MATCH_DAY_CARBON_OFFSET_LABEL,
  MATCH_DAY_GOALS_SCORED_COPY,
  MATCH_DAY_PROJECTS_RECORD_COPY,
  MATCH_DAY_PROJECTS_RECORD_LABEL,
} from "@/app/lib/match-day-carbon-offset";

export default function MatchDayCarbonOffsetPreview() {
  return (
    <div className="min-h-screen space-y-10 bg-slate-950 p-8 text-white">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
          {MATCH_DAY_CARBON_OFFSET_LABEL}
        </p>
        <h1 className="mt-2 text-4xl font-black">
          Sponsors fund the Club&apos;s Match Day carbon footprint offset
        </h1>
        <ol className="mt-6 max-w-3xl list-decimal space-y-2 pl-6 text-slate-300">
          <li>Choose the Club</li>
          <li>Choose the Match they wish to sponsor</li>
          <li>
            Open the Climate Sponsorship Wallet and add Commitment Fees and
            Sponsorship/Goal-scored
          </li>
          <li>Sign off their sponsorship</li>
        </ol>
        <p className="mt-4 max-w-3xl text-slate-400">
          The five Climate Projects are a record for the sponsor and the FUND-IT
          list for fans — not a gate before sign-off.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
          Folder
        </p>
        <h2 className="mt-2 text-3xl font-black">Signed sponsorships</h2>
        <p className="mt-3 max-w-3xl text-slate-400">
          Once you sign off the Club&apos;s Match Day carbon footprint offset,
          it is lodged here. Climate Projects the Sustainability Director later
          chooses for that Match Day are added as your record.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
          Match Day record
        </p>
        <h2 className="mt-2 text-3xl font-black">
          {MATCH_DAY_PROJECTS_RECORD_LABEL}
        </h2>
        <p className="mt-3 max-w-3xl text-slate-300">
          {MATCH_DAY_GOALS_SCORED_COPY} {MATCH_DAY_PROJECTS_RECORD_COPY}
        </p>
      </section>

      <ClubClimateSponsorTabs
        clubName="Arsenal"
        leadSponsors={[
          {
            brandKey: "pepsi cola",
            brandName: "Pepsi Cola",
            email: null,
            matches: ["Manchester City v Arsenal"],
            lockedAt: "2026-10-12T12:00:00.000Z",
            inNetwork: true,
          },
        ]}
        localSponsors={[
          {
            brandName: "Islington Cycles",
            email: "",
            clubName: "Arsenal",
            pledgeGbp: 750,
            createdAt: "2026-10-12T12:00:00.000Z",
            submittedAt: "2026-10-12T12:00:00.000Z",
            acceptedTerms: true,
            signerName: "Sam Local",
            signedAt: "2026-10-12T12:00:00.000Z",
            source: "registered",
          },
        ]}
        initialTab="lead"
      />
    </div>
  );
}
