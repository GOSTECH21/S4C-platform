/** Club Sustainability Director address books for Lead and Local Business Climate Sponsors. */

import type { SponsorListing, SponsorListingKind } from "./sponsor-listings";

export const CLUB_ADDRESS_BOOK_STORAGE_PREFIX = "s4p.sd.addressBook.";
export const CLUB_ADDRESS_BOOK_EVENT = "s4p-club-address-book";

export type ClubAddressBookKind = "lead" | "local";

export type ClubAddressBookContact = {
  id: string;
  name: string;
  email: string;
  businessName: string;
  phone: string;
};

export const CLUB_ADDRESS_BOOK_1_TITLE = "Address Book 1";
export const CLUB_ADDRESS_BOOK_2_TITLE = "Address Book 2";
export const CLUB_ADDRESS_BOOK_1_SUBTITLE =
  "Preferred Lead Climate Sponsors";
export const CLUB_ADDRESS_BOOK_2_SUBTITLE =
  "Preferred Local Business Climate Sponsors";

export function clubAddressBookTitle(kind: ClubAddressBookKind): string {
  return kind === "lead" ? CLUB_ADDRESS_BOOK_1_TITLE : CLUB_ADDRESS_BOOK_2_TITLE;
}

export function clubAddressBookSubtitle(kind: ClubAddressBookKind): string {
  return kind === "lead"
    ? CLUB_ADDRESS_BOOK_1_SUBTITLE
    : CLUB_ADDRESS_BOOK_2_SUBTITLE;
}

function clean(value: string | null | undefined): string {
  return String(value ?? "").trim();
}

function storageKey(clubId: string, kind: ClubAddressBookKind): string {
  return `${CLUB_ADDRESS_BOOK_STORAGE_PREFIX}${clean(clubId)}.${kind}`;
}

function parseContacts(raw: string | null): ClubAddressBookContact[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ClubAddressBookContact[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((row) => normalizeContact(row))
      .filter((row): row is ClubAddressBookContact => Boolean(row));
  } catch {
    return [];
  }
}

export function normalizeContact(
  input: Partial<ClubAddressBookContact> | null | undefined
): ClubAddressBookContact | null {
  const name = clean(input?.name);
  const email = clean(input?.email);
  const businessName = clean(input?.businessName);
  if (!name || !email || !businessName) return null;
  return {
    id: clean(input?.id) || crypto.randomUUID(),
    name,
    email,
    businessName,
    phone: clean(input?.phone),
  };
}

export function loadClubAddressBook(
  clubId: string,
  kind: ClubAddressBookKind
): ClubAddressBookContact[] {
  if (typeof window === "undefined") return [];
  const id = clean(clubId);
  if (!id) return [];
  try {
    return parseContacts(window.localStorage.getItem(storageKey(id, kind)));
  } catch {
    return [];
  }
}

export function loadClubAddressBooks(clubId: string): {
  lead: ClubAddressBookContact[];
  local: ClubAddressBookContact[];
} {
  return {
    lead: loadClubAddressBook(clubId, "lead"),
    local: loadClubAddressBook(clubId, "local"),
  };
}

function writeClubAddressBook(
  clubId: string,
  kind: ClubAddressBookKind,
  contacts: ClubAddressBookContact[]
) {
  if (typeof window === "undefined") return;
  const id = clean(clubId);
  if (!id) return;
  window.localStorage.setItem(storageKey(id, kind), JSON.stringify(contacts));
  window.dispatchEvent(new Event(CLUB_ADDRESS_BOOK_EVENT));
}

export function saveClubAddressBookContact(
  clubId: string,
  kind: ClubAddressBookKind,
  input: Partial<ClubAddressBookContact>
): ClubAddressBookContact {
  const contact = normalizeContact(input);
  if (!contact) {
    throw new Error("Name, email and business name are required.");
  }
  const current = loadClubAddressBook(clubId, kind);
  const next = current.some((row) => row.id === contact.id)
    ? current.map((row) => (row.id === contact.id ? contact : row))
    : [...current, contact];
  writeClubAddressBook(clubId, kind, next);
  return contact;
}

export function deleteClubAddressBookContact(
  clubId: string,
  kind: ClubAddressBookKind,
  contactId: string
): void {
  const id = clean(contactId);
  writeClubAddressBook(
    clubId,
    kind,
    loadClubAddressBook(clubId, kind).filter((row) => row.id !== id)
  );
}

export function clubAddressBookListingId(
  kind: ClubAddressBookKind,
  contactId: string
): string {
  return `ab:${kind}:${contactId}`;
}

export function isClubAddressBookListingId(id: string | null | undefined): boolean {
  return clean(id).startsWith("ab:");
}

export function sponsorListingFromAddressBookContact(
  contact: ClubAddressBookContact,
  kind: ClubAddressBookKind
): SponsorListing {
  const listingKind: SponsorListingKind = kind === "lead" ? "global" : "local";
  return {
    id: clubAddressBookListingId(kind, contact.id),
    kind: listingKind,
    brandName: contact.businessName,
    contactName: contact.name,
    email: contact.email,
    createdAt: new Date().toISOString(),
    source: "registered",
  };
}

export function sponsorListingsFromAddressBooks(books: {
  lead: ClubAddressBookContact[];
  local: ClubAddressBookContact[];
}): SponsorListing[] {
  return [
    ...books.lead.map((contact) =>
      sponsorListingFromAddressBookContact(contact, "lead")
    ),
    ...books.local.map((contact) =>
      sponsorListingFromAddressBookContact(contact, "local")
    ),
  ];
}
