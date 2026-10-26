/** Lead Climate Sponsor master folder: approved lists and paid history. */

import { clubsMatch, brandsMatch } from "./sponsor-dashboard";
import { isNamedFixture, sameNamedFixture } from "./club-fixtures";

export const LEAD_PROJECT_FOLDER_STORAGE = "s4p.lead-project-folder";

export type LeadFolderProject = {
  id: string;
  name: string;
  description: string | null;
  country: string | null;
  estimated_co2: number | null;
  fundedGbp: number;
};

export type LeadFolderEntry = {
  key: string;
  brandName: string;
  offerId: string;
  clubId: string;
  clubName: string;
  matchTitle: string;
  matchDate: string | null;
  headline: string;
  status: "approved" | "paid";
  signedAt: string;
  paidAt?: string;
  signerName: string;
  projects: LeadFolderProject[];
  sponsorshipAmountGbp: number | null;
  gbpPerGoal: number | null;
  maxAmount: number | null;
};

export function sameLeadMatch(
  left: { clubName: string; matchTitle?: string | null },
  right: { clubName: string; matchTitle?: string | null }
) {
  if (!clubsMatch(left.clubName, right.clubName)) return false;
  const a = String(left.matchTitle ?? "").trim();
  const b = String(right.matchTitle ?? "").trim();
  if (!a || !b) return true;
  if (isNamedFixture(a) && isNamedFixture(b)) return sameNamedFixture(a, b);
  return a.toLowerCase() === b.toLowerCase();
}

export function leadFolderEntryKey(entry: {
  brandName: string;
  clubName: string;
  matchTitle: string;
}) {
  return [
    entry.brandName.trim().toLowerCase(),
    entry.clubName.trim().toLowerCase(),
    entry.matchTitle.trim().toLowerCase(),
  ].join("|");
}

function readAll(): LeadFolderEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LEAD_PROJECT_FOLDER_STORAGE);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LeadFolderEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries: LeadFolderEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    LEAD_PROJECT_FOLDER_STORAGE,
    JSON.stringify(entries.slice(0, 200))
  );
}

export function readLeadProjectFolder(brandName: string): LeadFolderEntry[] {
  const brand = brandName.trim();
  return readAll()
    .filter((row) => brandsMatch(row.brandName, brand))
    .sort((left, right) => {
      const leftAt = left.paidAt || left.signedAt;
      const rightAt = right.paidAt || right.signedAt;
      return rightAt.localeCompare(leftAt);
    });
}

export function recordLeadMatchApproved(
  entry: Omit<LeadFolderEntry, "key" | "status" | "paidAt"> & {
    status?: "approved" | "paid";
    paidAt?: string;
  }
): LeadFolderEntry {
  const next: LeadFolderEntry = {
    ...entry,
    key: leadFolderEntryKey(entry),
    status: entry.status ?? "approved",
    paidAt: entry.paidAt,
  };
  const existing = readAll();
  const kept = existing.filter(
    (row) =>
      !(
        brandsMatch(row.brandName, next.brandName) &&
        sameLeadMatch(row, next)
      )
  );
  const previous = existing.find(
    (row) =>
      brandsMatch(row.brandName, next.brandName) && sameLeadMatch(row, next)
  );
  if (previous?.status === "paid") {
    next.status = "paid";
    next.paidAt = previous.paidAt;
  }
  writeAll([next, ...kept]);
  return next;
}

export function recordLeadMatchPaid(options: {
  brandName: string;
  clubName: string;
  matchTitle?: string | null;
  offerId?: string | null;
}): LeadFolderEntry[] {
  const now = new Date().toISOString();
  const existing = readAll();
  let touched = false;
  const next = existing.map((row) => {
    if (!brandsMatch(row.brandName, options.brandName)) return row;
    if (!clubsMatch(row.clubName, options.clubName)) return row;
    if (
      options.matchTitle &&
      !sameLeadMatch(row, {
        clubName: options.clubName,
        matchTitle: options.matchTitle,
      })
    ) {
      return row;
    }
    if (options.offerId && row.offerId && row.offerId !== options.offerId) {
      if (
        !sameLeadMatch(row, {
          clubName: options.clubName,
          matchTitle: options.matchTitle ?? row.matchTitle,
        })
      ) {
        return row;
      }
    }
    touched = true;
    return {
      ...row,
      status: "paid" as const,
      paidAt: row.paidAt || now,
    };
  });
  if (touched) writeAll(next);
  return next.filter((row) => brandsMatch(row.brandName, options.brandName));
}

export function leadFolderHasApprovedMatch(
  folder: LeadFolderEntry[],
  match: { clubName: string; matchTitle?: string | null; offerId?: string | null }
) {
  return folder.some(
    (row) =>
      (row.offerId && match.offerId && row.offerId === match.offerId) ||
      sameLeadMatch(row, match)
  );
}
