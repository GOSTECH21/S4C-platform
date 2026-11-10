"use client";

import { useEffect, useState } from "react";
import ClubNav from "@/app/components/club/ClubNav";
import ClubAdminClubDetails from "@/app/components/club/ClubAdminClubDetails";
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
  window.localStorage.setItem(
    `s4p.sd.addressBook.${PREVIEW_CLUB.id}.lead`,
    JSON.stringify([
      {
        id: "amex",
        name: "Alex Brand",
        email: "amex@example.com",
        businessName: "American Express",
        phone: "02079460000",
      },
    ])
  );
  window.localStorage.setItem(
    `s4p.sd.addressBook.${PREVIEW_CLUB.id}.local`,
    JSON.stringify([
      {
        id: "scotmid",
        name: "Jo Local",
        email: "jo@scotmid.test",
        businessName: "Scotmid Coop",
        phone: "01412220000",
      },
      {
        id: "ibrox-cafe",
        name: "Pat Cafe",
        email: "pat@ibroxcafe.test",
        businessName: "Ibrox Cafe",
        phone: "01413330000",
      },
    ])
  );
}

export default function ClubAdminPreviewPage() {
  const [ready, setReady] = useState(false);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    seedPreviewRecords();
    setApproved(
      new URLSearchParams(window.location.search).get("status") === "approved"
    );
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
        <ClubAdminClubDetails
          club={PREVIEW_CLUB}
          account={{
            id: "preview-rangers-account",
            club_id: PREVIEW_CLUB.id,
            first_name: "Alex",
            last_name: "Rangersfc",
            job_title: "Sustainability Director",
            email: "alexrangersfc@gmail.com",
            phone: "07856362245",
            status: approved ? "approved" : "pending",
            supporter_base: "5,000 - 50,000",
            average_attendance: "51000",
          }}
        />
        <ClubAdminLookbackAndCilt club={PREVIEW_CLUB} />
      </div>
    </main>
  );
}
