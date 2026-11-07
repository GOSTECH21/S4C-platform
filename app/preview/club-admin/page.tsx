"use client";

import { useEffect, useState } from "react";
import ClubNav from "@/app/components/club/ClubNav";
import ClubAdminLookbackAndCilt from "@/app/components/club/ClubAdminLookbackAndCilt";

const PREVIEW_CLUB = {
  id: "preview-rangers",
  name: "Rangers",
  country: "Scotland",
};

const PREVIEW_RECORD = {
  id: "rangers-aberdeen",
  clubId: PREVIEW_CLUB.id,
  campaignId: null,
  savedAt: "2026-11-06T15:48:37.000Z",
  matchLabel: "Rangers vs Aberdeen",
  minAmount: 1320,
  sponsorName: "Scotmid Coop",
  selected: [
    { id: "gss", name: "Global Schools Solar" },
    { id: "retrofit", name: "Edinburgh Building Retrofit Collective" },
    { id: "clean-heat", name: "Clean Heat Edinburgh" },
    { id: "gorgie-solar", name: "Gorgie Community Rooftop Solar" },
    { id: "gorgie-wildlife", name: "Gorgie River Wildlife Corridor" },
  ],
  voted: [],
};

function seedPreviewRecords() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    `s4p.sd.fileRecords.${PREVIEW_CLUB.id}`,
    JSON.stringify([PREVIEW_RECORD])
  );
}

export default function ClubAdminPreviewPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedPreviewRecords();
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center text-white">
        Loading My Admin preview...
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 text-white sm:p-10">
      <div className="mx-auto max-w-7xl">
        <ClubNav />
        <p className="mb-6 text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          My Admin
        </p>
        <h1 className="mb-8 text-4xl font-black">{PREVIEW_CLUB.name}</h1>
        <ClubAdminLookbackAndCilt club={PREVIEW_CLUB} />
      </div>
    </main>
  );
}
