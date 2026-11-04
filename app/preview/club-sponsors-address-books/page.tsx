"use client";

import { useEffect, useMemo, useState } from "react";
import ClubNav from "@/app/components/club/ClubNav";
import ClubSponsorsAddressBooks from "@/app/components/club/ClubSponsorsAddressBooks";
import { ClubSponsorsListings } from "@/app/components/club/ClubSponsorsListings";
import {
  CLUB_ADDRESS_BOOKS_ID,
  CLUB_EXISTING_SPONSORS_ID,
} from "@/app/lib/routes";
import type { ClubAddressBookContact } from "@/app/lib/club-address-book";
import {
  EXISTING_SPONSORS_HEADING,
  GLOBAL_BRAND_INVITE_COUNT,
  LOCAL_BUSINESS_INVITE_COUNT,
  listingsOfKind,
  seededSponsorListings,
  type SponsorListingKind,
} from "@/app/lib/sponsor-listings";

export default function ClubSponsorsAddressBooksPreviewPage() {
  const listings = useMemo(() => seededSponsorListings(), []);
  const globals = listingsOfKind(listings, "global");
  const locals = listingsOfKind(listings, "local");
  const [leadContacts, setLeadContacts] = useState<ClubAddressBookContact[]>(
    []
  );
  const [localContacts, setLocalContacts] = useState<ClubAddressBookContact[]>(
    []
  );
  const [selectedGlobalIds, setSelectedGlobalIds] = useState<string[]>(
    globals.slice(0, GLOBAL_BRAND_INVITE_COUNT).map((row) => row.id)
  );
  const [selectedLocalIds, setSelectedLocalIds] = useState<string[]>(
    locals.slice(0, LOCAL_BUSINESS_INVITE_COUNT).map((row) => row.id)
  );

  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    if (id !== CLUB_ADDRESS_BOOKS_ID && id !== CLUB_EXISTING_SPONSORS_ID) {
      return;
    }
    window.setTimeout(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, []);

  function toggle(listing: { id: string; kind: SponsorListingKind }) {
    if (listing.kind === "global") {
      setSelectedGlobalIds((current) =>
        current.includes(listing.id) ? [] : [listing.id]
      );
      return;
    }
    setSelectedLocalIds((current) =>
      current.includes(listing.id)
        ? current.filter((id) => id !== listing.id)
        : current.length >= LOCAL_BUSINESS_INVITE_COUNT
          ? current
          : [...current, listing.id]
    );
  }

  return (
    <main className="min-h-screen p-4 text-white sm:p-8">
      <div className="mx-auto max-w-6xl">
        <ClubNav />
        <ClubSponsorsListings
          clubName="Fulham"
          matchLabel="Fulham v Chelsea"
          projectNames={[
            "Global Schools Solar",
            "Clean Water Uganda",
          ]}
          projectCount={5}
          listings={listings}
          round={null}
          selectedGlobalIds={selectedGlobalIds}
          selectedLocalIds={selectedLocalIds}
          onToggle={toggle}
          onInvite={() => undefined}
        >
          <ClubSponsorsAddressBooks
            clubId="preview-fulham"
            leadContacts={leadContacts}
            localContacts={localContacts}
            onLeadChange={setLeadContacts}
            onLocalChange={setLocalContacts}
          />
        </ClubSponsorsListings>
        <p className="mt-6 text-sm text-slate-400">
          {EXISTING_SPONSORS_HEADING} is on this Sponsors page, under the Address
          Books.
        </p>
      </div>
    </main>
  );
}
