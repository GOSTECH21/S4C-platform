"use client";

import ClubAddressBookPanel from "@/app/components/club/ClubAddressBookPanel";
import {
  CLUB_ADDRESS_BOOKS_ID,
  CLUB_EXISTING_SPONSORS_ID,
} from "@/app/lib/routes";
import { GO_TO_EXISTING_SPONSORS_LABEL } from "@/app/lib/sponsor-listings";
import type {
  ClubAddressBookContact,
} from "@/app/lib/club-address-book";

export default function ClubSponsorsAddressBooks({
  clubId,
  leadContacts,
  localContacts,
  onLeadChange,
  onLocalChange,
}: {
  clubId: string;
  leadContacts: ClubAddressBookContact[];
  localContacts: ClubAddressBookContact[];
  onLeadChange: (contacts: ClubAddressBookContact[]) => void;
  onLocalChange: (contacts: ClubAddressBookContact[]) => void;
}) {
  return (
    <section
      id={CLUB_ADDRESS_BOOKS_ID}
      data-club-sponsors-address-books="club-sponsors-address-books-v1"
      className="scroll-mt-24"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-3xl font-black">Register New Sponsors</h2>
        <a
          href={`#${CLUB_EXISTING_SPONSORS_ID}`}
          className="rounded-xl border border-emerald-400/40 px-4 py-2 text-center text-sm font-semibold text-emerald-200 hover:bg-emerald-500/10"
        >
          {GO_TO_EXISTING_SPONSORS_LABEL}
        </a>
      </div>
      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <ClubAddressBookPanel
          clubId={clubId}
          kind="lead"
          contacts={leadContacts}
          onChange={onLeadChange}
        />
        <ClubAddressBookPanel
          clubId={clubId}
          kind="local"
          contacts={localContacts}
          onChange={onLocalChange}
        />
      </div>
    </section>
  );
}
