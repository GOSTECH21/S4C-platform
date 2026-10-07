"use client";

import { useEffect, useState } from "react";
import { ClubClimateSponsorTabs } from "@/app/components/club/ClubClimateSponsorTabs";
import type { LeadClubSponsorRow } from "@/app/lib/climate-sponsors";
import {
  leadClimateSponsorsForClub,
  recordSignedLeadClimateSponsor,
} from "@/app/services/climate-sponsors.service";

const NETWORK_KEY = "s4p.sponsor.goalNetwork";
const LOCK_KEY = "s4p.sponsor.matchLock";

export default function LeadSignoffPreviewPage() {
  const [before, setBefore] = useState<LeadClubSponsorRow[]>([]);
  const [leads, setLeads] = useState<LeadClubSponsorRow[]>([]);
  const [notice, setNotice] = useState("Signing off American Express…");

  useEffect(() => {
    try {
      window.localStorage.removeItem(NETWORK_KEY);
      window.localStorage.removeItem(LOCK_KEY);
      const prior = leadClimateSponsorsForClub("Hibernian");
      setBefore(prior);
      const signed = recordSignedLeadClimateSponsor({
        brandName: "American Express",
        clubName: "Hibernian",
        clubId: "hibs-demo",
        fixtureName: "Hibernian v Celtic",
        fixtureDate: "2026-10-10",
        competition: "Scottish Premiership Match",
      });
      const next = leadClimateSponsorsForClub("Hibernian");
      setLeads(next);
      setNotice(
        signed
          ? `Activated: ${signed.brandName} · ${signed.matches.join(", ") || "match pending"}`
          : "Sign-off did not activate a Lead Climate Sponsor."
      );
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : "Could not activate the Lead tab."
      );
    }
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
          Preview
        </p>
        <h1 className="mt-2 text-4xl font-black">
          Lead Climate Sponsor after sign-off
        </h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          American Express has signed off Hibernian v Celtic. Our Lead Climate
          Sponsor is activated so the club Sustainability Director can click
          the brand.
        </p>
        <p className="mt-4 text-sm text-slate-500">
          Before sign-off:{" "}
          {before.length === 0
            ? "No Lead Climate Sponsor"
            : before.map((row) => row.brandName).join(", ")}
        </p>
        <p className="mt-2 text-sm font-semibold text-amber-300">{notice}</p>
        <ClubClimateSponsorTabs
          clubName="Hibernian"
          leadSponsors={leads}
          localSponsors={[]}
          initialTab="lead"
        />
      </div>
    </main>
  );
}
