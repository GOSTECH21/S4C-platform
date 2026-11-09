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
    {
      id: "gss",
      name: "Global Schools Solar",
      description:
        "Install rooftop solar systems in schools around the world so classrooms can run on clean energy.",
      category: "Solar",
      country: "Global",
    },
    {
      id: "south-seeds",
      name: "South Seeds",
      description:
        "Community climate action on Glasgow's Southside, helping neighbours cut energy use.",
      category: "Community",
      country: "Scotland",
    },
    {
      id: "ibrox-river",
      name: "Ibrox River Wildlife Corridor",
      description:
        "Restore river and canal banks so wildlife can move and carbon stays in the soil.",
      category: "Nature",
      country: "Scotland",
    },
    {
      id: "ibrox-energy",
      name: "Ibrox Local Community Energy",
      description:
        "Local community energy so homes and clubs around Ibrox run cleaner.",
      category: "Energy",
      country: "Scotland",
    },
    {
      id: "ibrox-air",
      name: "Ibrox School Streets Clean Air",
      description:
        "School streets, monitors and planting so children near the ground breathe cleaner air.",
      category: "Clean air",
      country: "Scotland",
    },
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
