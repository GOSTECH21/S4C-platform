"use client";

import { useEffect, useState } from "react";
import ClubNav from "@/app/components/club/ClubNav";
import ClubAdminLookbackAndCilt from "@/app/components/club/ClubAdminLookbackAndCilt";
import ClubAddressBookPanel from "@/app/components/club/ClubAddressBookPanel";
import { CLUB_ADMIN_ADDRESS_BOOKS_ID } from "@/app/lib/routes";
import type { ClubAddressBookContact } from "@/app/lib/club-address-book";

const PREVIEW_CLUB = {
  id: "preview-hearts",
  name: "Hearts",
  country: "Scotland",
};

const PREVIEW_RECORD = {
  id: "dundee-hearts",
  clubId: PREVIEW_CLUB.id,
  campaignId: null,
  savedAt: "2026-10-26T16:16:43.000Z",
  matchLabel: "Dundee vs Hearts",
  minAmount: 1000,
  selected: [
    { id: "gss-local", name: "Local Global Schools Solar" },
    { id: "retrofit", name: "Edinburgh Building Retrofit Collective" },
    { id: "clean-heat", name: "Clean Heat Edinburgh" },
    { id: "gorgie-solar", name: "Gorgie Community Rooftop Solar" },
    { id: "gorgie-wildlife", name: "Gorgie River Wildlife Corridor" },
  ],
  voted: [],
};

export default function ClubAdminPreviewPage() {
  const [ready, setReady] = useState(false);
  const [leadContacts, setLeadContacts] = useState<ClubAddressBookContact[]>([]);
  const [localContacts, setLocalContacts] = useState<ClubAddressBookContact[]>(
    []
  );

  useEffect(() => {
    window.localStorage.setItem(
      `s4p.sd.fileRecords.${PREVIEW_CLUB.id}`,
      JSON.stringify([PREVIEW_RECORD])
    );
    setReady(true);
    if (window.location.hash === `#${CLUB_ADMIN_ADDRESS_BOOKS_ID}`) {
      window.setTimeout(() => {
        document
          .getElementById(CLUB_ADMIN_ADDRESS_BOOKS_ID)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
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
        <div
          id={CLUB_ADMIN_ADDRESS_BOOKS_ID}
          className="mt-10 scroll-mt-24 grid gap-8 xl:grid-cols-2"
        >
          <ClubAddressBookPanel
            clubId={PREVIEW_CLUB.id}
            kind="lead"
            contacts={leadContacts}
            onChange={setLeadContacts}
          />
          <ClubAddressBookPanel
            clubId={PREVIEW_CLUB.id}
            kind="local"
            contacts={localContacts}
            onChange={setLocalContacts}
          />
        </div>
      </div>
    </main>
  );
}
