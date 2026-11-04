"use client";

import ClubAddressBookPanel from "@/app/components/club/ClubAddressBookPanel";
import {
  CLUB_ADDRESS_BOOKS_ID,
  CLUB_EXISTING_SPONSORS_ID,
} from "@/app/lib/routes";
import { EXISTING_SPONSORS_HEADING } from "@/app/lib/sponsor-listings";
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
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
            Address Books
          </p>
          <h2 className="mt-2 text-3xl font-black">Register new sponsors</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Add Lead Climate Sponsors to Address Book 1 and Local Business
            Climate Sponsors to Address Book 2. Then go to {EXISTING_SPONSORS_HEADING}{" "}
            to select who to invite for this Match.
          </p>
        </div>
        <a
          href={`#${CLUB_EXISTING_SPONSORS_ID}`}
          className="rounded-xl border border-emerald-400/40 px-4 py-2 text-center text-sm font-semibold text-emerald-200 hover:bg-emerald-500/10"
        >
          Go to {EXISTING_SPONSORS_HEADING}
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
