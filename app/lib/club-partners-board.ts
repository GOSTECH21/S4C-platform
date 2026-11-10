/** Club Climate Partners — Sustainability Director working board on My Admin. */

import { CURRENT_SEASON } from "./current-season";
import { isLeadMatchDaySponsorBrand } from "./climate-sponsors";
import type { ClubAddressBookContact } from "./club-address-book";
import type { ClubClimateSponsor } from "./climate-sponsors";
import type { LocalSponsorRecord } from "./local-sponsor";

export const CLUB_PARTNERS_BOARD_NAME = "Club Climate Partners";
export const CLUB_PARTNERS_BOARD_STAMP = "club-partners-board-v1";
export const CLUB_PARTNERS_BOARD_EVENT = "s4p-club-partners-board";
export const CLUB_PARTNERS_BOARD_NOTE =
  "The Sustainability Director's working board for Lead Climate Sponsors, Local Business Climate Sponsors and chosen Climate Project Partners. Remove a name here if they should no longer sit on this Club.";
export const CLUB_PARTNERS_BOARD_SETTINGS =
  "Remove a Lead Climate Sponsor or a Local Business Climate Sponsor from this Club without starting the Club afresh. Chosen Climate Project Partners are the Match Day projects you sent to sponsors.";

export type ClubPartnersTabId = "lead" | "local" | "partners";

export const CLUB_PARTNERS_TABS: Array<{
  id: ClubPartnersTabId;
  label: string;
}> = [
  { id: "lead", label: "Lead Climate Sponsors" },
  { id: "local", label: "Local Business" },
  { id: "partners", label: "Climate Project Partners" },
];

export type ClubPartnersRow = {
  id: string;
  tab: ClubPartnersTabId;
  name: string;
  contact: string;
  email: string;
  hint: string;
  addressBookId?: string;
  rosterId?: string;
  removable: boolean;
};

export type ClubPartnersPartnerInput = {
  id: string;
  name: string;
  category?: string | null;
  country?: string | null;
  featured?: boolean;
};

export type ClubPartnersSignedInput = {
  brandName: string;
  contactName?: string | null;
  fixture?: string | null;
};

function clean(value: string | null | undefined): string {
  return String(value ?? "").trim();
}

function brandKey(name: string): string {
  return clean(name).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function mergeSponsorRow(
  byKey: Map<string, ClubPartnersRow>,
  row: ClubPartnersRow
) {
  const key = brandKey(row.name) || row.id;
  const current = byKey.get(key);
  if (!current) {
    byKey.set(key, row);
    return;
  }
  byKey.set(key, {
    ...current,
    contact: current.contact || row.contact,
    email: current.email || row.email,
    hint: current.hint || row.hint,
    addressBookId: current.addressBookId || row.addressBookId,
    rosterId: current.rosterId || row.rosterId,
    removable: current.removable || row.removable,
  });
}

export function clubPartnersRows({
  leadContacts = [],
  localContacts = [],
  rosterSponsors = [],
  localRecords = [],
  signed = [],
  partners = [],
}: {
  leadContacts?: ClubAddressBookContact[];
  localContacts?: ClubAddressBookContact[];
  rosterSponsors?: ClubClimateSponsor[];
  localRecords?: LocalSponsorRecord[];
  signed?: ClubPartnersSignedInput[];
  partners?: ClubPartnersPartnerInput[];
}): Record<ClubPartnersTabId, ClubPartnersRow[]> {
  const lead = new Map<string, ClubPartnersRow>();
  const local = new Map<string, ClubPartnersRow>();

  for (const contact of leadContacts) {
    mergeSponsorRow(lead, {
      id: `ab:lead:${contact.id}`,
      tab: "lead",
      name: contact.businessName,
      contact: contact.name,
      email: contact.email,
      hint: contact.phone || "Address Book 1",
      addressBookId: contact.id,
      removable: true,
    });
  }
  for (const contact of localContacts) {
    mergeSponsorRow(local, {
      id: `ab:local:${contact.id}`,
      tab: "local",
      name: contact.businessName,
      contact: contact.name,
      email: contact.email,
      hint: contact.phone || "Address Book 2",
      addressBookId: contact.id,
      removable: true,
    });
  }
  for (const sponsor of rosterSponsors) {
    const tab: ClubPartnersTabId = isLeadMatchDaySponsorBrand(sponsor.brandName)
      ? "lead"
      : "local";
    mergeSponsorRow(tab === "lead" ? lead : local, {
      id: `roster:${sponsor.id}`,
      tab,
      name: sponsor.brandName,
      contact: sponsor.contactName,
      email: sponsor.email,
      hint: sponsor.jobTitle || "On this Club",
      rosterId: sponsor.id,
      removable: true,
    });
  }
  for (const record of localRecords) {
    mergeSponsorRow(local, {
      id: `local:${brandKey(record.brandName)}`,
      tab: "local",
      name: record.brandName,
      contact: record.signerName || "",
      email: record.email,
      hint: record.sponsoredProjectName || "Local Business Climate Sponsor",
      removable: true,
    });
  }
  for (const row of signed) {
    const name = clean(row.brandName);
    if (!name) continue;
    const tab: ClubPartnersTabId = isLeadMatchDaySponsorBrand(name)
      ? "lead"
      : "local";
    mergeSponsorRow(tab === "lead" ? lead : local, {
      id: `signed:${brandKey(name)}`,
      tab,
      name,
      contact: clean(row.contactName),
      email: "",
      hint: clean(row.fixture) || "Signed Match-Sponsorship",
      removable: true,
    });
  }

  const partnerRows: ClubPartnersRow[] = partners
    .filter((project) => clean(project.id) || clean(project.name))
    .map((project) => ({
      id: clean(project.id) || brandKey(project.name),
      tab: "partners" as const,
      name: project.name,
      contact: clean(project.category),
      email: "",
      hint: project.featured
        ? "Featured Climate Project"
        : clean(project.country) || "Chosen Climate Project Partner",
      removable: true,
    }));

  const sortRows = (rows: ClubPartnersRow[]) =>
    [...rows].sort((left, right) => left.name.localeCompare(right.name));

  return {
    lead: sortRows([...lead.values()]),
    local: sortRows([...local.values()]),
    partners: partnerRows,
  };
}

export function clubPartnersCounts(
  rows: Record<ClubPartnersTabId, ClubPartnersRow[]>
): {
  lead: number;
  local: number;
  partners: number;
  total: number;
} {
  const lead = rows.lead.length;
  const local = rows.local.length;
  const partners = rows.partners.length;
  return { lead, local, partners, total: lead + local + partners };
}

export function clubPartnersSeasonLabel(clubName: string): string {
  return `${clubName.trim() || "Club"} · ${CURRENT_SEASON} Season`;
}

export function clubPartnersRemovePrompt(
  name: string,
  clubName: string,
  tab: ClubPartnersTabId
): string {
  if (tab === "partners") {
    return `Remove ${name} from ${clubName}'s chosen Climate Project Partners?`;
  }
  if (tab === "lead") {
    return `Remove Lead Climate Sponsor ${name} from ${clubName}?`;
  }
  return `Remove Local Business Climate Sponsor ${name} from ${clubName}?`;
}

export function notifyClubPartnersBoard() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CLUB_PARTNERS_BOARD_EVENT));
}

export function removeClubChosenPartner(clubId: string, projectId: string): void {
  if (typeof window === "undefined") return;
  const id = clean(clubId);
  const project = clean(projectId);
  if (!id || !project) return;
  try {
    const matchKey = `s4p.sd.matchDay.${id}`;
    const rawMatch = window.localStorage.getItem(matchKey);
    if (rawMatch) {
      const parsed = JSON.parse(rawMatch) as {
        projectIds?: string[];
        featuredProjectId?: string | null;
      };
      const projectIds = (parsed.projectIds ?? []).filter(
        (row) => String(row) !== project
      );
      window.localStorage.setItem(
        matchKey,
        JSON.stringify({
          ...parsed,
          projectIds,
          featuredProjectId:
            parsed.featuredProjectId === project
              ? projectIds[0] ?? null
              : parsed.featuredProjectId,
        })
      );
    }
    const recordKey = `s4p.sd.fileRecords.${id}`;
    const rawRecords = window.localStorage.getItem(recordKey);
    if (rawRecords) {
      const parsed = JSON.parse(rawRecords) as Array<{
        selected?: Array<{ id?: string }>;
      }>;
      if (Array.isArray(parsed)) {
        window.localStorage.setItem(
          recordKey,
          JSON.stringify(
            parsed.map((record) => ({
              ...record,
              selected: (record.selected ?? []).filter(
                (row) => String(row.id ?? "") !== project
              ),
            }))
          )
        );
      }
    }
  } catch {
    // Keep the board usable if one local store is malformed.
  }
  notifyClubPartnersBoard();
}
