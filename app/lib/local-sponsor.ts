import { clubsMatch } from "./sponsor-dashboard";
import { MATCH_DAY_PROJECT_COUNT } from "./partner-projects";
import { isSportingCalendarClub } from "./calendar-clubs";
import {
  isRemovedSponsorBrand,
  isRemovedSponsorIdentity,
} from "./climate-sponsors";

export const LOCAL_SPONSOR_MIN_GBP = 500;
/** Fans may FUND-IT onto the Match Day list; leftover-only branding is retired. */
export const FAN_VOTE_PICK_COUNT = MATCH_DAY_PROJECT_COUNT;
export const LOCAL_SPONSOR_LEFTOVER_COUNT =
  MATCH_DAY_PROJECT_COUNT - FAN_VOTE_PICK_COUNT;
export const LOCAL_SPONSORS_PER_MATCH = 5;
export const LOCAL_SPONSOR_STORAGE = "s4p.sponsor.local";
export const LOCAL_SPONSORS_BY_CLUB_STORAGE = "s4p.local-sponsors-by-club";

export type SponsorTier = "local" | "national";

export type LocalMatchSponsorship = {
  fixtureName: string;
  amountGbp: number;
  date?: string | null;
};

export type LocalSponsorRecord = {
  brandName: string;
  email: string;
  clubName: string;
  pledgeGbp: number;
  createdAt: string;
  logoUrl?: string | null;
  tagline?: string | null;
  source?: "example" | "uploaded" | "registered";
  matchSponsorships?: LocalMatchSponsorship[];
  submittedAt?: string;
  acceptedTerms?: boolean;
  signerName?: string;
  signedAt?: string;
  postcode?: string;
};

export function parseMatchSponsorships(value: unknown): LocalMatchSponsorship[] {
  if (!Array.isArray(value)) return [];
  const rows: LocalMatchSponsorship[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as {
      fixtureName?: string;
      fixture_name?: string;
      amountGbp?: number;
      amount_gbp?: number;
      date?: string | null;
    };
    const fixtureName = String(row.fixtureName ?? row.fixture_name ?? "").trim();
    if (!fixtureName) continue;
    const iso = String(row.date ?? "").slice(0, 10);
    rows.push({
      fixtureName,
      amountGbp: Number(row.amountGbp ?? row.amount_gbp) || 0,
      date: /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : undefined,
    });
  }
  return rows;
}

export function recordFromSponsorRow(row: {
  name?: string | null;
  email?: string | null;
  club_name?: string | null;
  postcode?: string | null;
  pledge_gbp?: number | null;
  match_sponsorships?: unknown;
  logo_url?: string | null;
} | null | undefined): LocalSponsorRecord | null {
  if (!row) return null;
  const brandName = String(row.name ?? "").trim();
  const clubName = String(row.club_name ?? "").trim();
  if (!brandName || !clubName || !isSportingCalendarClub(clubName)) return null;
  const matchSponsorships = parseMatchSponsorships(row.match_sponsorships);
  return withAgreedPledge({
    brandName,
    email: String(row.email ?? "").trim(),
    clubName,
    pledgeGbp: Number(row.pledge_gbp) || 0,
    createdAt: new Date().toISOString(),
    logoUrl: row.logo_url ?? null,
    source: "registered",
    matchSponsorships,
    postcode: String(row.postcode ?? "").trim() || undefined,
  });
}

export const LOCAL_SPONSOR_TERMS = `S4P Local Business Climate Sponsor Terms and Conditions: by signing you agree to pay the Match Day amounts you entered (from a minimum of £${LOCAL_SPONSOR_MIN_GBP} per Match), plus a 10% management fee. Fans can take £0.20 from your Climate Sponsorship Wallet and donate it to a Climate Projects of their choice. Your business name & logo will appear to Fans that takes £0.20 from your Climate Sponsorship Wallet. Your sponsorship payment must be paid for and cleared before it will appear in your Wallet`;

/** Sign-off T&Cs for Local Business Climate Sponsors — no Goals, no Base Match Sponsorship. */
export const LOCAL_SIGNOFF_TERMS =
  "S4P Climate Sponsor Terms and Conditions: By signing you agree to sponsor the Club's Match Day carbon footprint offset. The Sustainability Director chooses five Climate Projects for each Match Day. All sponsored Projects (including those that received your monies) will be available to you for your records. Your brand logo is displayed alongside Climate Projects. You may withdraw before kick-off by writing to the club Sustainability Director.";

export function localSignOffSponsorshipGbp({
  wallet,
  record,
}: {
  wallet?: { sponsorshipGbp?: number | null } | null;
  record?: { pledgeGbp?: number | null } | null;
}): number {
  const fromWallet = Number(wallet?.sponsorshipGbp);
  if (fromWallet > 0) return fromWallet;
  const fromRecord = Number(record?.pledgeGbp);
  if (fromRecord > 0) return fromRecord;
  return 0;
}

function isLocalRecord(value: unknown): value is LocalSponsorRecord {
  if (!value || typeof value !== "object") return false;
  const row = value as LocalSponsorRecord;
  return Boolean(row.brandName && row.clubName);
}

function parseClubLocals(value: unknown): LocalSponsorRecord[] {
  if (Array.isArray(value)) return value.filter(isLocalRecord);
  if (isLocalRecord(value)) return [value];
  return [];
}

export function clubKey(clubName: string): string {
  return clubName.trim().toLowerCase();
}

export function localBrandKey(name: string): string {
  return name.trim().toLowerCase();
}

function brandKey(name: string): string {
  return localBrandKey(name);
}

export function leftoverProjectsFromVotes<T extends { id: string }>({
  posted,
  votedIds,
  leftoverCount = LOCAL_SPONSOR_LEFTOVER_COUNT,
}: {
  posted: T[];
  votedIds: Iterable<string>;
  leftoverCount?: number;
}): T[] {
  const voted = new Set(
    [...votedIds].map((id) => String(id)).filter(Boolean)
  );
  const unused = posted.filter((project) => !voted.has(project.id));
  if (unused.length >= leftoverCount) return unused.slice(0, leftoverCount);
  return unused;
}

export function leftoverProjectsByVoteCount<T extends { id: string }>({
  posted,
  voteCounts,
  leftoverCount = LOCAL_SPONSOR_LEFTOVER_COUNT,
}: {
  posted: T[];
  voteCounts: Record<string, number>;
  leftoverCount?: number;
}): T[] {
  return [...posted]
    .sort((left, right) => {
      const leftVotes = Number(voteCounts[left.id]) || 0;
      const rightVotes = Number(voteCounts[right.id]) || 0;
      if (leftVotes !== rightVotes) return leftVotes - rightVotes;
      return posted.indexOf(left) - posted.indexOf(right);
    })
    .slice(0, leftoverCount);
}

export function leftoverProjectsForLocalSponsor<T extends { id: string }>({
  posted,
  votedIds,
  voteCounts,
  leftoverCount = LOCAL_SPONSOR_LEFTOVER_COUNT,
}: {
  posted: T[];
  votedIds: Iterable<string>;
  voteCounts?: Record<string, number>;
  leftoverCount?: number;
}): T[] {
  const voted = [...votedIds].map(String).filter(Boolean);
  if (voted.length < FAN_VOTE_PICK_COUNT) return [];
  const unused = leftoverProjectsFromVotes({
    posted,
    votedIds: voted,
    leftoverCount: posted.length,
  });
  if (unused.length >= leftoverCount) return unused.slice(0, leftoverCount);
  const counts =
    voteCounts ??
    Object.fromEntries(
      posted.map((project) => [project.id, voted.includes(project.id) ? 1 : 0])
    );
  return leftoverProjectsByVoteCount({
    posted,
    voteCounts: counts,
    leftoverCount,
  });
}

export function readLocalSponsorRecord(): LocalSponsorRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_SPONSOR_STORAGE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LocalSponsorRecord;
    if (!parsed?.brandName || !parsed?.clubName) return null;
    if (
      !isSportingCalendarClub(parsed.clubName) ||
      isRemovedSponsorBrand(parsed.brandName) ||
      isRemovedSponsorIdentity(parsed.signerName, parsed.email)
    ) {
      window.localStorage.removeItem(LOCAL_SPONSOR_STORAGE);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function readLocalsStore(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LOCAL_SPONSORS_BY_CLUB_STORAGE);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeLocalsStore(store: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    LOCAL_SPONSORS_BY_CLUB_STORAGE,
    JSON.stringify(store)
  );
}

function pruneNonDemoLocalSponsors() {
  if (typeof window === "undefined") return;
  const store = readLocalsStore();
  const next: Record<string, unknown> = {};
  let changed = false;
  for (const [key, value] of Object.entries(store)) {
    const rows = parseClubLocals(value).filter(
      (row) =>
        isSportingCalendarClub(row.clubName) &&
      !isRemovedSponsorBrand(row.brandName) &&
      !isRemovedSponsorIdentity(row.signerName, row.email)
    );
    if (rows.length === 0) {
      changed = true;
      continue;
    }
    if (rows.length !== parseClubLocals(value).length) changed = true;
    next[key] = rows;
  }
  if (changed) writeLocalsStore(next);
}

export function localSponsorsForClub(clubName: string): LocalSponsorRecord[] {
  if (!clubName.trim() || !isSportingCalendarClub(clubName)) return [];
  pruneNonDemoLocalSponsors();
  const store = readLocalsStore();
  const rows: LocalSponsorRecord[] = [];
  for (const [key, value] of Object.entries(store)) {
    if (key === clubKey(clubName) || clubsMatch(key, clubName)) {
      rows.push(...parseClubLocals(value));
    }
  }
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = brandKey(row.brandName);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function allLocalSponsors(): LocalSponsorRecord[] {
  pruneNonDemoLocalSponsors();
  const store = readLocalsStore();
  const rows: LocalSponsorRecord[] = [];
  for (const value of Object.values(store)) {
    rows.push(...parseClubLocals(value));
  }
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = `${clubKey(row.clubName)}:${brandKey(row.brandName)}`;
    if (
      !row.brandName.trim() ||
      !isSportingCalendarClub(row.clubName) ||
      isRemovedSponsorBrand(row.brandName) ||
      isRemovedSponsorIdentity(row.signerName, row.email) ||
      seen.has(key)
    ) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function replaceLocalSponsorsForClub(
  clubName: string,
  records: LocalSponsorRecord[]
) {
  if (
    typeof window === "undefined" ||
    !clubName.trim() ||
    !isSportingCalendarClub(clubName)
  ) {
    return;
  }
  try {
    const store = readLocalsStore();
    store[clubKey(clubName)] = records
      .filter(isLocalRecord)
      .filter((row) => !isRemovedSponsorBrand(row.brandName))
      .map((row) => ({
        ...row,
        clubName,
      }));
    writeLocalsStore(store);
  } catch {
    // Browser storage can be blocked; local branding then stays on this device only.
  }
}

export function writeLocalSponsorForClub(record: LocalSponsorRecord) {
  if (typeof window === "undefined") return;
  try {
    const existing = localSponsorsForClub(record.clubName);
    const index = existing.findIndex(
      (row) => brandKey(row.brandName) === brandKey(record.brandName)
    );
    const next =
      index >= 0
        ? existing.map((row, i) => (i === index ? { ...row, ...record } : row))
        : [...existing, record];
    replaceLocalSponsorsForClub(record.clubName, next);
  } catch {
    // Browser storage can be blocked; leftover branding then stays on this device only.
  }
}

export function removeLocalSponsorForClub(clubName: string, brandName: string) {
  replaceLocalSponsorsForClub(
    clubName,
    localSponsorsForClub(clubName).filter(
      (row) => brandKey(row.brandName) !== brandKey(brandName)
    )
  );
}

export function replaceAllLocalSponsors(records: LocalSponsorRecord[]) {
  if (typeof window === "undefined") return;
  const unique = uniqueLocalClubBrandRecords(records).filter(
    (row) =>
      isSportingCalendarClub(row.clubName) &&
      !isRemovedSponsorBrand(row.brandName) &&
      !isRemovedSponsorIdentity(row.signerName, row.email)
  );
  const store: Record<string, LocalSponsorRecord[]> = {};
  for (const row of unique) {
    const key = clubKey(row.clubName);
    store[key] = [...(store[key] ?? []), row];
  }
  writeLocalsStore(store);
}

function syncLocalSponsorProfile(record: LocalSponsorRecord) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem("s4p.sponsor.profile");
    const previous = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    window.localStorage.setItem(
      "s4p.sponsor.profile",
      JSON.stringify({
        ...previous,
        companyName: record.brandName,
        email: record.email || previous.email || "",
        jobTitle:
          previous.jobTitle || "Local Business Climate Sponsor",
        tier: "local",
        clubName: record.clubName,
        pledgeGbp: totalLocalPledge(record),
        postcode: record.postcode ?? previous.postcode ?? null,
        matchSponsorships: record.matchSponsorships ?? [],
        logoUrl: record.logoUrl ?? previous.logoUrl ?? null,
      })
    );
  } catch {
    // Profile storage can be blocked; club/match still live on the record keys.
  }
}

export function shouldSyncLocalSponsorRecord(record: LocalSponsorRecord): boolean {
  if (!record?.brandName?.trim() || !isSportingCalendarClub(record.clubName)) {
    return false;
  }
  if (isRemovedSponsorBrand(record.brandName)) return false;
  if (isRemovedSponsorIdentity(record.signerName, record.email)) return false;
  if (record.source === "example" || record.source === "uploaded") return false;
  return (
    (record.matchSponsorships?.length ?? 0) > 0 ||
    totalLocalPledge(record) > 0 ||
    Boolean(record.clubName.trim())
  );
}

export function writeLocalSponsorRecord(record: LocalSponsorRecord) {
  if (
    typeof window === "undefined" ||
    !isSportingCalendarClub(record.clubName) ||
    isRemovedSponsorBrand(record.brandName) ||
    isRemovedSponsorIdentity(record.signerName, record.email)
  ) {
    return;
  }
  const next = withAgreedPledge(record);
  window.localStorage.setItem(LOCAL_SPONSOR_STORAGE, JSON.stringify(next));
  writeLocalSponsorForClub(next);
  syncLocalSponsorProfile(next);
  void import("../services/local-sponsor.service")
    .then((mod) => mod.persistLocalSponsorRecord(next))
    .catch(() => {
      // Shared catalog is optional until migration 0020 is applied.
    });
}

export function localMatchLabels(record: LocalSponsorRecord): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const row of record.matchSponsorships ?? []) {
    const name = row.fixtureName.trim();
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }
  return names;
}

export function totalLocalPledge(record: LocalSponsorRecord): number {
  const fromMatches = (record.matchSponsorships ?? []).reduce(
    (sum, row) => sum + (Number(row.amountGbp) || 0),
    0
  );
  if (fromMatches > 0) return fromMatches;
  return Number(record.pledgeGbp) || 0;
}

function localClubBrandKey(record: LocalSponsorRecord): string {
  return `${clubKey(record.clubName)}:${brandKey(record.brandName)}`;
}

function localRecordFidelity(record: LocalSponsorRecord): number {
  const matches = record.matchSponsorships?.length ?? 0;
  const signed = record.signedAt ? 1 : 0;
  const postcode = record.postcode?.trim() ? 1 : 0;
  const registered = record.source === "registered" ? 1 : 0;
  return matches * 100 + signed * 10 + postcode * 2 + registered;
}

/** One row per club + business, keeping the Match amounts they actually entered. */
export function uniqueLocalClubBrandRecords(
  records: LocalSponsorRecord[]
): LocalSponsorRecord[] {
  const byKey = new Map<string, LocalSponsorRecord>();
  for (const row of records) {
    if (!row?.brandName?.trim() || !row?.clubName?.trim()) continue;
    const key = localClubBrandKey(row);
    const current = byKey.get(key);
    if (!current) {
      byKey.set(key, withAgreedPledge(row));
      continue;
    }
    const nextScore = localRecordFidelity(row);
    const currentScore = localRecordFidelity(current);
    if (nextScore > currentScore) {
      byKey.set(key, withAgreedPledge(row));
      continue;
    }
    if (
      nextScore === currentScore &&
      totalLocalPledge(row) > 0 &&
      totalLocalPledge(current) === 0
    ) {
      byKey.set(key, withAgreedPledge(row));
    }
  }
  return [...byKey.values()];
}

/** Keep pledgeGbp in lock-step with submitted Match amounts, not wallet cash. */
export function withAgreedPledge(record: LocalSponsorRecord): LocalSponsorRecord {
  return { ...record, pledgeGbp: totalLocalPledge(record) };
}

export function isSubmittedLocalSponsor(record: LocalSponsorRecord): boolean {
  if (record.source === "example") return false;
  if (record.submittedAt) return true;
  return (record.matchSponsorships?.length ?? 0) > 0 || record.pledgeGbp > 0;
}

export function isSignedOffLocalSponsor(record: LocalSponsorRecord): boolean {
  return Boolean(
    record.acceptedTerms &&
      record.signerName?.trim() &&
      record.signedAt
  );
}

/** Club page lists a local only after sign-off (legacy submitted records still appear). */
export function isClubInboundLocalSponsor(record: LocalSponsorRecord): boolean {
  if (record.source === "example" || record.source === "uploaded") return false;
  if (!isSubmittedLocalSponsor(record)) return false;
  if (record.signedAt) return isSignedOffLocalSponsor(record);
  return Boolean(record.submittedAt);
}

export function submittedLocalSponsorsForClub(
  clubName: string
): LocalSponsorRecord[] {
  return localSponsorsForClub(clubName)
    .filter(isClubInboundLocalSponsor)
    .sort((left, right) => {
      const leftAt = left.submittedAt || left.createdAt;
      const rightAt = right.submittedAt || right.createdAt;
      if (rightAt !== leftAt) return rightAt.localeCompare(leftAt);
      return totalLocalPledge(right) - totalLocalPledge(left);
    });
}

export function clubNameForLocalBrand(
  brandName: string | null | undefined
): string | null {
  const name = (brandName ?? "").trim().toLowerCase();
  if (!name) return null;
  const record = readLocalSponsorRecord() ?? localRecordFromProfile();
  if (record && record.brandName.trim().toLowerCase() === name) {
    return record.clubName;
  }
  const fromClubs = allLocalSponsors().find(
    (row) => row.brandName.trim().toLowerCase() === name
  );
  return fromClubs?.clubName ?? null;
}

export function localSponsorForClub(clubName: string): LocalSponsorRecord | null {
  const ranked = [...localSponsorsForClub(clubName)].sort((left, right) => {
    if (right.pledgeGbp !== left.pledgeGbp) return right.pledgeGbp - left.pledgeGbp;
    return left.createdAt.localeCompare(right.createdAt);
  });
  return ranked[0] ?? null;
}

export function localRecordFromProfile(): LocalSponsorRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("s4p.sponsor.profile");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      tier?: string;
      companyName?: string;
      email?: string;
      clubName?: string;
      pledgeGbp?: number;
      postcode?: string | null;
      matchSponsorships?: LocalMatchSponsorship[];
      logoUrl?: string | null;
    };
    if (parsed.tier !== "local" || !parsed.companyName || !parsed.clubName) {
      return null;
    }
    const matchSponsorships = Array.isArray(parsed.matchSponsorships)
      ? parsed.matchSponsorships.filter(
          (row) => row && typeof row.fixtureName === "string"
        )
      : [];
    return {
      brandName: parsed.companyName,
      email: parsed.email ?? "",
      clubName: parsed.clubName,
      pledgeGbp: Number(parsed.pledgeGbp) || LOCAL_SPONSOR_MIN_GBP,
      createdAt: new Date().toISOString(),
      logoUrl: parsed.logoUrl ?? null,
      postcode: parsed.postcode ?? undefined,
      source: "registered",
      matchSponsorships,
    };
  } catch {
    return null;
  }
}

export function readSponsorTier(): SponsorTier {
  if (typeof window === "undefined") return "national";
  try {
    const raw = window.localStorage.getItem("s4p.sponsor.profile");
    if (!raw) {
      return readLocalSponsorRecord() ? "local" : "national";
    }
    const parsed = JSON.parse(raw) as { tier?: string };
    return parsed.tier === "local" ? "local" : "national";
  } catch {
    return readLocalSponsorRecord() ? "local" : "national";
  }
}
