/** Club-facing store of philanthropists registered on the platform. */

import catalogFile from "../data/philanthropist-directory.json";
import { brandsMatch } from "./climate-sponsors";

export const PHILANTHROPIST_DIRECTORY_STORAGE = "s4p.philanthropist.directory";
export const PHILANTHROPIST_INVITES_STORAGE = "s4p.philanthropist.invites";
export const PHILANTHROPIST_DIRECTORY_PATH = "app/data/philanthropist-directory.json";

export type PhilanthropistDirectoryEntry = {
  id: string;
  organisation: string;
  contactName: string;
  email: string;
  clubName: string;
  giftGbp: number;
  createdAt: string;
  source: "catalog" | "registered";
};

type CatalogRow = {
  organisation: string;
  contactName: string;
  email: string;
  clubName: string;
  giftGbp: number;
};

type StoredInvite = {
  clubName: string;
  ids: string[];
  sentAt: string;
};

function directoryId(email: string, organisation: string): string {
  const key = (email || organisation).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `philanthropist:${key.replace(/^-|-$/g, "") || "sponsor"}`;
}

function fromCatalog(row: CatalogRow, createdAt: string): PhilanthropistDirectoryEntry {
  return {
    id: directoryId(row.email, row.organisation),
    organisation: row.organisation.trim(),
    contactName: row.contactName.trim(),
    email: row.email.trim(),
    clubName: row.clubName.trim(),
    giftGbp: Math.max(0, Number(row.giftGbp) || 0),
    createdAt,
    source: "catalog",
  };
}

export function catalogPhilanthropists(
  createdAt = "2026-08-01T09:00:00.000Z"
): PhilanthropistDirectoryEntry[] {
  return (catalogFile as CatalogRow[]).map((row) => fromCatalog(row, createdAt));
}

function readStored(): PhilanthropistDirectoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PHILANTHROPIST_DIRECTORY_STORAGE);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PhilanthropistDirectoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStored(rows: PhilanthropistDirectoryEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    PHILANTHROPIST_DIRECTORY_STORAGE,
    JSON.stringify(rows)
  );
}

function samePhilanthropist(
  left: PhilanthropistDirectoryEntry,
  right: Pick<PhilanthropistDirectoryEntry, "email" | "organisation">
): boolean {
  const mail = right.email.trim().toLowerCase();
  if (mail && left.email.trim().toLowerCase() === mail) return true;
  return brandsMatch(left.organisation, right.organisation);
}

export function mergePhilanthropistDirectory(
  extra: PhilanthropistDirectoryEntry[] = []
): PhilanthropistDirectoryEntry[] {
  const rows = [...catalogPhilanthropists()];
  for (const row of [...readStored(), ...extra]) {
    if (!row.organisation.trim()) continue;
    const index = rows.findIndex((current) => samePhilanthropist(current, row));
    if (index < 0) {
      rows.push(row);
      continue;
    }
    if (row.source === "registered") rows[index] = { ...rows[index], ...row };
  }
  return rows.sort((left, right) =>
    left.organisation.localeCompare(right.organisation)
  );
}

export function loadPhilanthropistDirectory(): PhilanthropistDirectoryEntry[] {
  return mergePhilanthropistDirectory();
}

export function rememberRegisteredPhilanthropist(input: {
  organisation: string;
  contactName: string;
  email: string;
  clubName?: string;
  giftGbp?: number;
  createdAt?: string;
}): PhilanthropistDirectoryEntry | null {
  const organisation = input.organisation.trim();
  if (!organisation || typeof window === "undefined") return null;
  const next: PhilanthropistDirectoryEntry = {
    id: directoryId(input.email, organisation),
    organisation,
    contactName: input.contactName.trim() || organisation,
    email: input.email.trim(),
    clubName: String(input.clubName ?? "").trim(),
    giftGbp: Math.max(0, Number(input.giftGbp) || 0),
    createdAt: input.createdAt || new Date().toISOString(),
    source: "registered",
  };
  const stored = readStored().filter((row) => !samePhilanthropist(row, next));
  writeStored([next, ...stored]);
  return next;
}

function readInvites(): StoredInvite[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PHILANTHROPIST_INVITES_STORAGE);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredInvite[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function philanthropistInviteIds(clubName: string): string[] {
  const key = clubName.trim().toLowerCase();
  const match = readInvites().find(
    (row) => row.clubName.trim().toLowerCase() === key
  );
  return match?.ids ?? [];
}

export function recordPhilanthropistInvites({
  clubName,
  ids,
}: {
  clubName: string;
  ids: string[];
}): string[] {
  const unique = [...new Set(ids.filter(Boolean))];
  if (typeof window === "undefined" || !clubName.trim() || unique.length === 0) {
    return unique;
  }
  const key = clubName.trim().toLowerCase();
  const rest = readInvites().filter(
    (row) => row.clubName.trim().toLowerCase() !== key
  );
  const previous = philanthropistInviteIds(clubName);
  const next = [...new Set([...previous, ...unique])];
  window.localStorage.setItem(
    PHILANTHROPIST_INVITES_STORAGE,
    JSON.stringify([
      { clubName: clubName.trim(), ids: next, sentAt: new Date().toISOString() },
      ...rest,
    ])
  );
  return next;
}
