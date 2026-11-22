/* philanthropist-register-v1 */

import { sameNamedFixture } from "./club-fixtures";
import { fixtureIncludesClub } from "./club-fixture-guard";
import {
  allLocalSponsors,
  readLocalSponsorRecord,
  type LocalSponsorRecord,
} from "./local-sponsor";
import { brandsMatch, clubsMatch } from "./sponsor-dashboard";

export const PHILANTHROPIST_STORAGE = "s4p.sponsor.philanthropist";
export const PHILANTHROPISTS_BY_CLUB_STORAGE = "s4p.philanthropists-by-club";
export const PHILANTHROPIST_CARBON_WALLET_LABEL = "Philanthropist Carbon Wallet";
export const PHILANTHROPIST_JOB_TITLE = "Philanthropist";
export const PHILANTHROPIST_KICKER = "Philanthropist";
export const PHILANTHROPIST_MIN_GBP = 1;
export const PHILANTHROPIST_REGISTER_HEADING = "Register as a Philanthropist";
export const PHILANTHROPIST_REGISTER_COPY =
  "Make a climate donation (any amount per match) and let fans direct your gift to club-approved climate projects that help your team climb the Climate Impact League Table (CILT). Choose the Club, the Match, and how much you are putting into that sponsorship — you can do this again whenever you log in.";
export const PHILANTHROPIST_REGISTER_CTA = "Register as Philanthropist";
export const PHILANTHROPIST_NAV_REGISTER = "Register as Philanthropist";
export const PHILANTHROPIST_HOME_HEADING = "Your philanthropic climate gift";
export const PHILANTHROPIST_HOME_EMPTY =
  "Register as a Philanthropist to make a climate donation. Fans of your chosen team direct that gift to club-approved climate projects.";
export const PHILANTHROPIST_HOME_READY =
  "You have not put a sponsorship into your Philanthropist Carbon Wallet yet. Select a Club and a Match below and enter your amount, or open an Invitation from a Club's Sustainability Director.";
export const PHILANTHROPIST_SPONSOR_HEADING = "Select a Club and a Match";
export const PHILANTHROPIST_SPONSOR_COPY =
  "Choose the Club you wish to sponsor, choose the Match, then enter how much money you are putting into this sponsorship. You can log in at any time and do this again for another Club or Match.";
export const PHILANTHROPIST_INVITE_COPY =
  "Or, if a Club's Sustainability Director has sent you an Invitation to Sponsor, open the invitation and follow the instructions to complete your sponsorship.";
export const PHILANTHROPIST_SPONSOR_CTA = "Put into Carbon Wallet";
export const PHILANTHROPIST_AMOUNT_LABEL = "How much you are putting into this sponsorship (£)";
export const PHILANTHROPIST_ADMIN_NAV = "My S4P Admin";
export const PHILANTHROPIST_ADMIN_HEADING = "My S4P Admin";
export const PHILANTHROPIST_ADMIN_COPY =
  "Clubs you have put money up for, the Match Days you are sponsoring or have sponsored, and how many fans have taken £0.50 from your Philanthropist Carbon Wallet.";
export const PHILANTHROPIST_PST_SHORT = "PST";
export const PHILANTHROPIST_PST_TITLE = "Philanthropist Sponsors Table (PST)";
export const PHILANTHROPIST_PST_COPY =
  "PST ranks Philanthropist Sponsors by climate funding put into Match Day sponsorships, in each geographical area.";

export type PhilanthropistMatchSponsorship = {
  clubName: string;
  fixtureName: string;
  amountGbp: number;
  date?: string | null;
  competition?: string;
  kickoff?: string | null;
  venue?: string | null;
};

export type PhilanthropistRecord = {
  name: string;
  organisation: string;
  email: string;
  clubName: string;
  giftGbp: number;
  createdAt: string;
  matchSponsorships?: PhilanthropistMatchSponsorship[];
};

export type PhilanthropistIdentity = {
  name: string;
  organisation: string;
  email: string;
  createdAt?: string;
};

export function isPhilanthropistJobTitle(value: string | null | undefined): boolean {
  return /philanthropist/i.test(String(value ?? "").trim());
}

export function philanthropistDisplayName(record: {
  name: string;
  organisation: string;
}): string {
  return record.organisation.trim() || record.name.trim();
}

export function parsePhilanthropistMatchSponsorships(
  value: unknown,
  fallbackClub = ""
): PhilanthropistMatchSponsorship[] {
  if (!Array.isArray(value)) return [];
  const rows: PhilanthropistMatchSponsorship[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as {
      clubName?: string;
      club_name?: string;
      fixtureName?: string;
      fixture_name?: string;
      amountGbp?: number;
      amount_gbp?: number;
      date?: string | null;
      competition?: string;
      kickoff?: string | null;
      venue?: string | null;
    };
    const fixtureName = String(row.fixtureName ?? row.fixture_name ?? "").trim();
    const clubName = String(row.clubName ?? row.club_name ?? fallbackClub).trim();
    const amountGbp = Number(row.amountGbp ?? row.amount_gbp);
    if (!fixtureName || !clubName || !Number.isFinite(amountGbp) || amountGbp < PHILANTHROPIST_MIN_GBP) {
      continue;
    }
    const iso = String(row.date ?? "").slice(0, 10);
    rows.push({
      clubName,
      fixtureName,
      amountGbp,
      date: /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : undefined,
      competition: String(row.competition ?? "").trim() || undefined,
      kickoff: String(row.kickoff ?? "").trim() || undefined,
      venue: String(row.venue ?? "").trim() || undefined,
    });
  }
  return rows;
}

export function philanthropistFundingGbp(record: PhilanthropistRecord): number {
  const matches = parsePhilanthropistMatchSponsorships(
    record.matchSponsorships,
    record.clubName
  );
  if (matches.length > 0) {
    return matches.reduce((sum, row) => sum + row.amountGbp, 0);
  }
  return Number(record.giftGbp) || 0;
}

export function philanthropistClubTotalGbp(
  record: PhilanthropistRecord,
  clubName: string
): number {
  const matches = parsePhilanthropistMatchSponsorships(
    record.matchSponsorships,
    record.clubName
  ).filter((row) => clubsMatch(row.clubName, clubName));
  if (matches.length > 0) {
    return matches.reduce((sum, row) => sum + row.amountGbp, 0);
  }
  return clubsMatch(record.clubName, clubName) ? Number(record.giftGbp) || 0 : 0;
}

function normalizeRecord(
  parsed: Partial<PhilanthropistRecord> & { match_sponsorships?: unknown }
): PhilanthropistRecord | null {
  const name = String(parsed.name ?? "").trim();
  const matchSponsorships = parsePhilanthropistMatchSponsorships(
    parsed.matchSponsorships ?? parsed.match_sponsorships,
    String(parsed.clubName ?? "").trim()
  );
  const clubName =
    String(parsed.clubName ?? "").trim() || matchSponsorships[0]?.clubName || "";
  const giftGbp = Number.isFinite(Number(parsed.giftGbp))
    ? Number(parsed.giftGbp)
    : matchSponsorships[0]?.amountGbp ?? 0;
  if (!name) return null;
  if (
    matchSponsorships.length === 0 &&
    (!clubName || !Number.isFinite(giftGbp) || giftGbp < PHILANTHROPIST_MIN_GBP)
  ) {
    return null;
  }
  return {
    name,
    organisation: String(parsed.organisation ?? "").trim(),
    email: String(parsed.email ?? "").trim(),
    clubName,
    giftGbp: Number.isFinite(giftGbp) ? giftGbp : 0,
    createdAt: String(parsed.createdAt ?? new Date().toISOString()),
    matchSponsorships,
  };
}

export function readPhilanthropistRecord(): PhilanthropistRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PHILANTHROPIST_STORAGE);
    if (!raw) return null;
    return normalizeRecord(JSON.parse(raw) as Partial<PhilanthropistRecord>);
  } catch {
    return null;
  }
}

function clubsFromRecord(record: PhilanthropistRecord): string[] {
  const names = parsePhilanthropistMatchSponsorships(
    record.matchSponsorships,
    record.clubName
  ).map((row) => row.clubName.trim());
  if (record.clubName.trim()) names.unshift(record.clubName.trim());
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const name of names) {
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    unique.push(name);
  }
  return unique;
}

export function writePhilanthropistRecord(record: PhilanthropistRecord): void {
  if (typeof window === "undefined") return;
  const normalized: PhilanthropistRecord = {
    ...record,
    matchSponsorships: parsePhilanthropistMatchSponsorships(
      record.matchSponsorships,
      record.clubName
    ),
  };
  window.localStorage.setItem(PHILANTHROPIST_STORAGE, JSON.stringify(normalized));
  const clubs = clubsFromRecord(normalized);
  if (clubs.length === 0) {
    upsertPhilanthropistForClub(normalized);
  } else {
    for (const clubName of clubs) {
      upsertPhilanthropistForClub({
        ...normalized,
        clubName,
        giftGbp: philanthropistClubTotalGbp(normalized, clubName),
      });
    }
  }
  try {
    const raw = window.localStorage.getItem("s4p.sponsor.profile");
    const previous = raw
      ? (JSON.parse(raw) as Record<string, unknown>)
      : {};
    window.localStorage.setItem(
      "s4p.sponsor.profile",
      JSON.stringify({
        ...previous,
        companyName: philanthropistDisplayName(normalized),
        contactName: normalized.name,
        jobTitle: PHILANTHROPIST_JOB_TITLE,
        email: normalized.email,
        clubName: normalized.clubName,
        pledgeGbp: philanthropistFundingGbp(normalized),
        matchSponsorships: normalized.matchSponsorships,
        tier: "philanthropist",
      })
    );
  } catch {
    // Browser storage can be blocked; the dedicated record is enough to route home.
  }
}

function readPhilanthropistsByClub(): Record<string, PhilanthropistRecord[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PHILANTHROPISTS_BY_CLUB_STORAGE);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, PhilanthropistRecord[]>;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

export function upsertPhilanthropistForClub(record: PhilanthropistRecord): void {
  if (typeof window === "undefined") return;
  const clubKey = record.clubName.trim().toLowerCase();
  if (!clubKey) return;
  const store = readPhilanthropistsByClub();
  const rows = store[clubKey] ?? [];
  const email = record.email.trim().toLowerCase();
  const next = rows.filter(
    (row) =>
      row.email.trim().toLowerCase() !== email &&
      philanthropistDisplayName(row).toLowerCase() !==
        philanthropistDisplayName(record).toLowerCase()
  );
  next.push(record);
  store[clubKey] = next;
  window.localStorage.setItem(
    PHILANTHROPISTS_BY_CLUB_STORAGE,
    JSON.stringify(store)
  );
}

export function philanthropistsForClub(clubName: string): PhilanthropistRecord[] {
  const club = clubName.trim();
  if (!club) return [];
  const store = readPhilanthropistsByClub();
  const rows: PhilanthropistRecord[] = [];
  for (const list of Object.values(store)) {
    for (const row of list ?? []) {
      if (clubsMatch(row.clubName, club)) rows.push(row);
    }
  }
  const session = readPhilanthropistRecord();
  if (
    session &&
    (clubsMatch(session.clubName, club) ||
      parsePhilanthropistMatchSponsorships(
        session.matchSponsorships,
        session.clubName
      ).some((row) => clubsMatch(row.clubName, club))) &&
    !rows.some(
      (row) =>
        row.email.trim().toLowerCase() === session.email.trim().toLowerCase()
    )
  ) {
    rows.push(session);
  }
  return rows.filter(
    (row) => philanthropistClubTotalGbp(row, club) >= PHILANTHROPIST_MIN_GBP
  );
}

export function isPhilanthropistSponsor(
  brandName?: string | null,
  hints: { jobTitle?: string | null } = {}
): boolean {
  if (isPhilanthropistJobTitle(hints.jobTitle)) return true;
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem("s4p.sponsor.profile");
    if (raw) {
      const parsed = JSON.parse(raw) as {
        companyName?: string;
        jobTitle?: string;
        tier?: string;
      };
      if (parsed.tier === "philanthropist") {
        const name = (brandName ?? "").trim().toLowerCase();
        if (
          !name ||
          String(parsed.companyName ?? "").trim().toLowerCase() === name
        ) {
          return true;
        }
      }
      if (
        isPhilanthropistJobTitle(parsed.jobTitle) &&
        (!brandName ||
          String(parsed.companyName ?? "").trim().toLowerCase() ===
            brandName.trim().toLowerCase())
      ) {
        return true;
      }
    }
  } catch {
    // Fall through to the dedicated record.
  }
  const record = readPhilanthropistRecord();
  if (!record) return false;
  const name = (brandName ?? "").trim().toLowerCase();
  if (!name) return true;
  return (
    philanthropistDisplayName(record).toLowerCase() === name ||
    record.name.toLowerCase() === name
  );
}

export function philanthropistGiftCopy(record: PhilanthropistRecord): string {
  const matches = parsePhilanthropistMatchSponsorships(
    record.matchSponsorships,
    record.clubName
  );
  if (matches.length === 1) {
    const row = matches[0];
    const amount = `£${row.amountGbp.toLocaleString("en-GB")}`;
    return `You are supporting ${row.clubName} with ${amount} on ${row.fixtureName}. Fans of ${row.clubName} see this in the ${PHILANTHROPIST_CARBON_WALLET_LABEL} and can take £0.50 onto a climate project they choose. This is a philanthropic donation — not a Lead Climate Sponsorship.`;
  }
  if (matches.length > 1) {
    const total = `£${philanthropistFundingGbp(record).toLocaleString("en-GB")}`;
    return `You have put ${total} into ${matches.length} Match Day sponsorships. Fans see this in the ${PHILANTHROPIST_CARBON_WALLET_LABEL} and can take £0.50 onto a climate project they choose. This is a philanthropic donation — not a Lead Climate Sponsorship.`;
  }
  const amount = `£${record.giftGbp.toLocaleString("en-GB")}`;
  return `You are supporting ${record.clubName} with ${amount} per match. Fans of ${record.clubName} see this in the ${PHILANTHROPIST_CARBON_WALLET_LABEL} and can take £0.50 onto a climate project they choose. This is a philanthropic donation — not a Lead Climate Sponsorship.`;
}

export function upsertPhilanthropistMatch(
  record: PhilanthropistRecord,
  gift: PhilanthropistMatchSponsorship
): PhilanthropistRecord {
  const current = parsePhilanthropistMatchSponsorships(
    record.matchSponsorships,
    record.clubName
  );
  const next = current.filter(
    (row) =>
      !(
        clubsMatch(row.clubName, gift.clubName) &&
        sameNamedFixture(row.fixtureName, gift.fixtureName)
      )
  );
  next.push(gift);
  return {
    ...record,
    clubName: gift.clubName,
    giftGbp: gift.amountGbp,
    matchSponsorships: next,
  };
}

export function applyPhilanthropistMatchGifts(
  identity: PhilanthropistIdentity & Partial<PhilanthropistRecord>,
  gifts: PhilanthropistMatchSponsorship[]
): PhilanthropistRecord {
  const createdAt = identity.createdAt || new Date().toISOString();
  let record: PhilanthropistRecord = {
    name: identity.name.trim(),
    organisation: identity.organisation.trim(),
    email: identity.email.trim(),
    clubName: identity.clubName?.trim() || gifts[0]?.clubName || "",
    giftGbp: identity.giftGbp ?? gifts[0]?.amountGbp ?? 0,
    createdAt,
    matchSponsorships: parsePhilanthropistMatchSponsorships(
      identity.matchSponsorships,
      identity.clubName
    ),
  };
  for (const gift of gifts) {
    record = upsertPhilanthropistMatch(record, gift);
  }
  return record;
}

export function philanthropistRecordFromSponsor(
  sponsor: {
    name?: string | null;
    website?: string | null;
    industry?: string | null;
    email?: string | null;
    club_name?: string | null;
    pledge_gbp?: number | null;
    match_sponsorships?: unknown;
  } | null
): PhilanthropistRecord | null {
  if (!sponsor) return null;
  if (!isPhilanthropistJobTitle(String(sponsor.industry ?? ""))) return null;
  const organisation = String(sponsor.name ?? "").trim();
  const name = String(sponsor.website ?? "").trim() || organisation;
  const clubName = String(sponsor.club_name ?? "").trim();
  const matchSponsorships = parsePhilanthropistMatchSponsorships(
    sponsor.match_sponsorships,
    clubName
  );
  return normalizeRecord({
    name,
    organisation,
    email: String(sponsor.email ?? "").trim(),
    clubName,
    giftGbp: Number(sponsor.pledge_gbp) || matchSponsorships[0]?.amountGbp || 0,
    createdAt: new Date().toISOString(),
    matchSponsorships,
  });
}

export function philanthropistRecordFromProfile(): PhilanthropistRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("s4p.sponsor.profile");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      companyName?: string;
      contactName?: string;
      email?: string;
      jobTitle?: string;
      tier?: string;
      clubName?: string;
      pledgeGbp?: number;
      matchSponsorships?: unknown;
    };
    if (
      parsed.tier === "local" ||
      parsed.tier === "lead" ||
      parsed.tier === "national"
    ) {
      return null;
    }
    if (
      parsed.tier !== "philanthropist" &&
      !isPhilanthropistJobTitle(parsed.jobTitle)
    ) {
      return null;
    }
    return normalizeRecord({
      name: String(parsed.contactName ?? "").trim() ||
        String(parsed.companyName ?? "").trim(),
      organisation: String(parsed.companyName ?? "").trim(),
      email: String(parsed.email ?? "").trim(),
      clubName: String(parsed.clubName ?? "").trim(),
      giftGbp: Number(parsed.pledgeGbp) || 0,
      createdAt: new Date().toISOString(),
      matchSponsorships: parsed.matchSponsorships,
    });
  } catch {
    return null;
  }
}

function mergePhilanthropistRecords(
  ...rows: Array<PhilanthropistRecord | null | undefined>
): PhilanthropistRecord | null {
  const present = rows.filter(Boolean) as PhilanthropistRecord[];
  if (present.length === 0) return null;
  let merged = present[0];
  for (const row of present.slice(1)) {
    const gifts = parsePhilanthropistMatchSponsorships(
      row.matchSponsorships,
      row.clubName
    );
    merged = applyPhilanthropistMatchGifts(
      {
        name: merged.name || row.name,
        organisation: merged.organisation || row.organisation,
        email: merged.email || row.email,
        createdAt: merged.createdAt || row.createdAt,
        clubName: merged.clubName || row.clubName,
        giftGbp: merged.giftGbp || row.giftGbp,
        matchSponsorships: merged.matchSponsorships,
      },
      gifts
    );
    if (!merged.clubName && row.clubName) {
      merged = { ...merged, clubName: row.clubName, giftGbp: row.giftGbp };
    }
  }
  return merged;
}

type LocalGiftSource = Pick<
  LocalSponsorRecord,
  "brandName" | "clubName" | "pledgeGbp" | "matchSponsorships"
>;

function localGiftSources(): LocalGiftSource[] {
  if (typeof window === "undefined") return [];
  const own = readLocalSponsorRecord();
  return own ? [...allLocalSponsors(), own] : allLocalSponsors();
}

function isBorrowedLocalGift(
  gift: PhilanthropistMatchSponsorship,
  ownBrand: string,
  locals: LocalGiftSource[]
): boolean {
  for (const local of locals) {
    if (!local.brandName.trim() || brandsMatch(local.brandName, ownBrand)) continue;
    if (!clubsMatch(local.clubName, gift.clubName)) continue;
    const matches = local.matchSponsorships ?? [];
    for (const match of matches) {
      if (Number(match.amountGbp) !== gift.amountGbp) continue;
      if (!(Number(match.amountGbp) >= PHILANTHROPIST_MIN_GBP)) continue;
      if (
        !match.fixtureName ||
        sameNamedFixture(match.fixtureName, gift.fixtureName) ||
        !fixtureIncludesClub(match.fixtureName, gift.clubName)
      ) {
        return true;
      }
    }
  }
  return false;
}

function isBorrowedClubPledge(
  record: PhilanthropistRecord,
  ownBrand: string,
  locals: LocalGiftSource[]
): boolean {
  if (!record.clubName.trim() || !(Number(record.giftGbp) >= PHILANTHROPIST_MIN_GBP)) {
    return false;
  }
  return locals.some((local) => {
    if (!local.brandName.trim() || brandsMatch(local.brandName, ownBrand)) return false;
    if (!clubsMatch(local.clubName, record.clubName)) return false;
    if (Number(local.pledgeGbp) === record.giftGbp) return true;
    return (local.matchSponsorships ?? []).some(
      (match) => Number(match.amountGbp) === record.giftGbp
    );
  });
}

/** A Local Business sponsorship must not appear as this philanthropist's own gift. */
export function withoutBorrowedLocalGifts(
  record: PhilanthropistRecord,
  locals: LocalGiftSource[] = []
): PhilanthropistRecord | null {
  const ownBrand = philanthropistDisplayName(record);
  const matches = parsePhilanthropistMatchSponsorships(
    record.matchSponsorships,
    record.clubName
  ).filter((gift) => !isBorrowedLocalGift(gift, ownBrand, locals));
  const borrowedPledge =
    matches.length === 0 && isBorrowedClubPledge(record, ownBrand, locals);
  return normalizeRecord({
    ...record,
    clubName: borrowedPledge
      ? ""
      : matches[matches.length - 1]?.clubName || record.clubName,
    giftGbp: borrowedPledge
      ? 0
      : matches.length > 0
        ? matches[matches.length - 1].amountGbp
        : record.giftGbp,
    matchSponsorships: matches,
  });
}

export function hydratePhilanthropistRecord(sponsor?: {
  name?: string | null;
  website?: string | null;
  industry?: string | null;
  email?: string | null;
  club_name?: string | null;
  pledge_gbp?: number | null;
  match_sponsorships?: unknown;
} | null): PhilanthropistRecord | null {
  const merged = mergePhilanthropistRecords(
    readPhilanthropistRecord(),
    philanthropistRecordFromProfile(),
    philanthropistRecordFromSponsor(sponsor ?? null)
  );
  if (!merged) return null;
  const cleaned = withoutBorrowedLocalGifts(merged, localGiftSources());
  if (cleaned) {
    writePhilanthropistRecord(cleaned);
    return cleaned;
  }
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(PHILANTHROPIST_STORAGE);
  }
  return null;
}
