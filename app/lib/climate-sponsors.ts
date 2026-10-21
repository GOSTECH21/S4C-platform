/** Club climate-sponsor roster, Goal Sponsorship Network, and match-day lock-in. */

import { CURRENT_SEASON_LEAGUES, leagueForClubName } from "./current-season";
import {
  leagueForSportingCalendarClub,
  sportingCalendarClubGroups,
} from "./calendar-clubs";
import { clubsMatch, normalizeClubName } from "./sponsor-dashboard";
export { clubsMatch };
import { MATCH_DAY_LEAD_HOURS } from "./partner-projects";
import { sameNamedFixture } from "./club-fixtures";

export const CLIMATE_SPONSOR_LEAD_HOURS = MATCH_DAY_LEAD_HOURS;

export const SUGGESTED_CLIMATE_BRANDS = [
  "Diageo",
  "Gillette",
  "Budweiser",
  "Puma",
];

/** National / fashion Lead Climate Sponsors. Never local businesses. */
export const LEAD_CLIMATE_SPONSOR_NAMES = [
  "American Express",
  "Amex",
  ...SUGGESTED_CLIMATE_BRANDS,
];

/** Local businesses that must never occupy the Lead Climate Sponsor tab. */
export const KNOWN_LOCAL_BUSINESS_SPONSOR_NAMES = [
  "Tax Assist",
  "Top Cellar",
  "Kokobean Cafe",
  "Kokobean",
  "Mash Tun",
  "Interval",
  "The Fountain",
  "Piazza Italiana",
];

function compactSponsorKey(name: string): string {
  return brandKey(name).replace(/\s+/g, "");
}

function listedSponsorName(name: string, listed: string[]): boolean {
  const key = compactSponsorKey(name);
  if (!key) return false;
  return listed.some((row) => compactSponsorKey(row) === key);
}

export function isKnownLocalBusinessSponsorName(brandName: string): boolean {
  return listedSponsorName(brandName, KNOWN_LOCAL_BUSINESS_SPONSOR_NAMES);
}

/** Carbon Warriors Limited is removed from the platform as a sponsor. */
export function isRemovedSponsorBrand(name: string | null | undefined): boolean {
  const key = compactSponsorKey(String(name ?? ""));
  return key.startsWith("carbonwarriors");
}

/** People deleted from the platform. They registered as Gillette for Hearts. */
export const REMOVED_SPONSOR_PEOPLE = ["Clive Owen", "Andrew Stephens"];

export function isRemovedSponsorPerson(
  value: string | null | undefined
): boolean {
  const key = compactSponsorKey(String(value ?? "").split("@")[0] ?? "");
  if (!key) return false;
  return REMOVED_SPONSOR_PEOPLE.some((name) => {
    const person = compactSponsorKey(name);
    return key === person || key.startsWith(person);
  });
}

export function isRemovedSponsorIdentity(
  ...values: Array<string | null | undefined>
): boolean {
  return values.some((value) => isRemovedSponsorPerson(value));
}

export function isBudweiserBrand(name: string | null | undefined): boolean {
  return compactSponsorKey(String(name ?? "")).startsWith("budweiser");
}

/** Budweiser is deleted from Hibernian so Puma remains the only Lead. */
export function isSponsorBlockedFromClub(
  brandName: string | null | undefined,
  clubName: string | null | undefined
): boolean {
  return clubsMatch(String(clubName ?? ""), "Hibernian") && isBudweiserBrand(brandName);
}

export const SECOND_LEAD_CLIMATE_SPONSOR_REJECTED =
  "Only one Lead Climate Sponsor is allowed. A second Lead Climate Sponsor is rejected.";

export function secondLeadClimateSponsorRejectedMessage(
  clubName: string,
  occupantName: string,
  fixtureName?: string | null
): string {
  const club = clubName.trim() || "this club";
  const occupant = occupantName.trim() || "another brand";
  const fixture = String(fixtureName ?? "").trim();
  const matchBit = isNamedFixture(fixture) ? ` for ${fixture}` : "";
  return `${SECOND_LEAD_CLIMATE_SPONSOR_REJECTED} ${occupant} already holds ${club}${matchBit}. A different Lead can sponsor a later ${club} Match.`;
}

/** True only for designated Lead Climate Sponsor brands — one type per club. */
export function isLeadClimateSponsorName(brandName: string): boolean {
  if (!brandName.trim()) return false;
  if (isKnownLocalBusinessSponsorName(brandName)) return false;
  if (listedSponsorName(brandName, LEAD_CLIMATE_SPONSOR_NAMES)) return true;
  const key = compactSponsorKey(brandName);
  return LEAD_CLIMATE_SPONSOR_NAMES.map(compactSponsorKey).some(
    (lead) => lead.length >= 4 && key.startsWith(lead)
  );
}

/** Any non-local brand sponsoring a Club's Match Day carbon footprint offset. */
export function isLeadMatchDaySponsorBrand(brandName: string): boolean {
  if (!brandName.trim() || isRemovedSponsorBrand(brandName)) return false;
  if (isKnownLocalBusinessSponsorName(brandName)) return false;
  return true;
}

export const MATCH_DAY_LOCK_LABELS = [
  "Premier League Match",
  "Champions League Match",
  "FA Cup Match",
  "Scottish Premiership Match",
  "La Liga Match",
  "Other Match Day",
];

export function leagueFromMatchLabel(matchLabel: string): string | null {
  const name = String(matchLabel ?? "")
    .replace(/\s+Match$/i, "")
    .trim();
  return name && CURRENT_SEASON_LEAGUES[name] ? name : null;
}

export function clubNetworkLeagueId(league: string): string {
  const key = brandKey(league).replace(/\s+/g, "-");
  return key ? `club-network-${key}` : "goal-sponsorship-network";
}

export type ClubClimateSponsor = {
  id: string;
  brandName: string;
  contactName: string;
  jobTitle: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  logoUrl: string;
  website: string;
  spentGbp: number;
  notes: string;
};

export type ClubSponsorRoster = {
  clubId: string;
  clubName: string;
  sponsors: ClubClimateSponsor[];
  selectedIds: string[];
};

export type NetworkInvite = {
  id: string;
  fromClubId: string;
  fromClubName: string;
  fromDirectorName: string;
  toBrandName: string;
  toEmail: string;
  message: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
};

export type GoalSponsorshipNetwork = {
  brandKey: string;
  brandName: string;
  email: string | null;
  clubNames: string[];
  leagues: string[];
};

export type ChosenMatch = {
  clubName: string;
  fixtureName: string;
  competition?: string;
  fixtureDate?: string;
  kickoff?: string | null;
  venue?: string | null;
  sourceUrl?: string | null;
  lockedAt: string;
};

export type MatchDayClubLock = {
  brandKey: string;
  clubName: string;
  matchLabel: string;
  fixtureName?: string;
  competition?: string;
  fixtureDate?: string;
  kickoff?: string | null;
  venue?: string | null;
  sourceUrl?: string | null;
  matches?: ChosenMatch[];
  lockedAt: string;
  /** Set when the Lead deposits the Climate Sponsorship Wallet for this lock. */
  fundingLockedAt?: string;
  commitmentFeeGbp?: number;
  gbpPerGoal?: number;
  maximumSponsorshipGbp?: number;
};

export type LeadClubSponsorRow = {
  brandKey: string;
  brandName: string;
  email: string | null;
  matches: string[];
  lockedAt: string | null;
  inNetwork: boolean;
  logoUrl?: string | null;
};

export function isNamedFixture(label: string | null | undefined): boolean {
  return /\sv\s/i.test(String(label ?? "").trim());
}

export function displayLockFixture(lock: MatchDayClubLock): string {
  if (lock.fixtureName?.trim()) return lock.fixtureName.trim();
  if (isNamedFixture(lock.matchLabel)) return lock.matchLabel.trim();
  return lock.matchLabel;
}

export function chosenMatchSortKey(
  match: Pick<ChosenMatch, "fixtureDate" | "kickoff">
): string {
  const date = String(match.fixtureDate ?? "").slice(0, 10);
  const kickoff = String(match.kickoff ?? "99:99").slice(0, 5);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return `9999-12-31T${kickoff}`;
  return `${date}T${kickoff}`;
}

export function sortChosenMatchesChronologically(
  matches: ChosenMatch[]
): ChosenMatch[] {
  return [...matches].sort((left, right) =>
    chosenMatchSortKey(left).localeCompare(chosenMatchSortKey(right))
  );
}

export function chronologicalChosenMatches(
  matches: ChosenMatch[],
  now: Date | string = new Date()
): ChosenMatch[] {
  const today = (now instanceof Date ? now : new Date(now))
    .toISOString()
    .slice(0, 10);
  return sortChosenMatchesChronologically(
    matches.filter((row) => {
      const date = String(row.fixtureDate ?? "").slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return true;
      return date >= today;
    })
  );
}

export function chosenMatchesForClub(
  lock: MatchDayClubLock | null | undefined,
  clubName: string
): ChosenMatch[] {
  if (!lock || !clubName.trim()) return [];
  const rows = [...(lock.matches ?? [])];
  const current = lock.fixtureName || lock.matchLabel;
  if (current && clubsMatch(lock.clubName, clubName)) {
    rows.push({
      clubName: lock.clubName,
      fixtureName: displayLockFixture(lock),
      competition: lock.competition,
      fixtureDate: lock.fixtureDate,
      kickoff: lock.kickoff,
      venue: lock.venue,
      sourceUrl: lock.sourceUrl,
      lockedAt: lock.lockedAt,
    });
  }
  const byKey = new Map<string, ChosenMatch>();
  for (const row of rows) {
    if (!clubsMatch(row.clubName, clubName)) continue;
    const key = row.fixtureName.trim().toLowerCase();
    if (!key) continue;
    const existing = byKey.get(key);
    if (!existing || (!existing.fixtureDate && row.fixtureDate)) {
      byKey.set(key, row);
    }
  }
  return sortChosenMatchesChronologically([...byKey.values()]);
}

export type NextSignedOffFixture = {
  fixtureName: string;
  date?: string;
  kickoff?: string | null;
};

export function nextSignedOffFixtureForClub({
  clubName,
  signedOff,
  published = [],
  now = new Date(),
}: {
  clubName: string;
  signedOff: ChosenMatch[];
  published?: Array<{
    fixtureName: string;
    date: string;
    kickoff?: string | null;
  }>;
  now?: Date | string;
}): NextSignedOffFixture | null {
  const today = (now instanceof Date ? now : new Date(now))
    .toISOString()
    .slice(0, 10);
  const clubMatches = signedOff.filter(
    (row) => !row.clubName || clubsMatch(row.clubName, clubName)
  );
  if (clubMatches.length === 0) return null;

  function isSigned(name: string) {
    return clubMatches.some((row) => sameNamedFixture(row.fixtureName, name));
  }

  const publishedUpcoming = [...published]
    .filter((row) => row.date >= today)
    .sort((left, right) =>
      `${left.date}T${left.kickoff ?? "99:99"}`.localeCompare(
        `${right.date}T${right.kickoff ?? "99:99"}`
      )
    );

  const nextPublished = publishedUpcoming[0];
  if (nextPublished && isSigned(nextPublished.fixtureName)) {
    return {
      fixtureName: nextPublished.fixtureName,
      date: nextPublished.date,
      kickoff: nextPublished.kickoff,
    };
  }

  const nextSignedPublished = publishedUpcoming.find((row) =>
    isSigned(row.fixtureName)
  );
  if (nextSignedPublished) {
    return {
      fixtureName: nextSignedPublished.fixtureName,
      date: nextSignedPublished.date,
      kickoff: nextSignedPublished.kickoff,
    };
  }

  const dated = chronologicalChosenMatches(
    clubMatches.map((row) => {
      const publishedRow = published.find((item) =>
        sameNamedFixture(item.fixtureName, row.fixtureName)
      );
      return {
        ...row,
        fixtureDate: row.fixtureDate || publishedRow?.date,
        kickoff: row.kickoff ?? publishedRow?.kickoff,
      };
    }),
    today
  );
  const first = dated[0];
  if (!first) return nextPublishedFixture(published, today);
  return {
    fixtureName: first.fixtureName,
    date: first.fixtureDate,
    kickoff: first.kickoff,
  };
}

export function nextFanMatchForClub(options: {
  clubName: string;
  signedOff: ChosenMatch[];
  published?: Array<{
    fixtureName: string;
    date: string;
    kickoff?: string | null;
  }>;
  now?: Date | string;
}): NextSignedOffFixture | null {
  const today = (options.now instanceof Date
    ? options.now
    : new Date(options.now ?? Date.now())
  )
    .toISOString()
    .slice(0, 10);
  const nextPublished = nextPublishedFixture(options.published ?? [], today);
  if (nextPublished) return nextPublished;
  return nextSignedOffFixtureForClub(options);
}

function nextPublishedFixture(
  published: Array<{
    fixtureName: string;
    date: string;
    kickoff?: string | null;
  }>,
  today: string
): NextSignedOffFixture | null {
  const upcoming = [...published]
    .filter((row) => row.date >= today)
    .sort((left, right) =>
      `${left.date}T${left.kickoff ?? "99:99"}`.localeCompare(
        `${right.date}T${right.kickoff ?? "99:99"}`
      )
    );
  const first = upcoming[0];
  if (!first) return null;
  return {
    fixtureName: first.fixtureName,
    date: first.date,
    kickoff: first.kickoff,
  };
}

export function appendChosenMatch(
  existing: MatchDayClubLock | null,
  next: MatchDayClubLock
): MatchDayClubLock {
  const fixtureName = displayLockFixture(next);
  const row: ChosenMatch = {
    clubName: next.clubName,
    fixtureName,
    competition: next.competition,
    fixtureDate: next.fixtureDate,
    kickoff: next.kickoff,
    venue: next.venue,
    sourceUrl: next.sourceUrl,
    lockedAt: next.lockedAt,
  };
  const previous = existing?.matches ?? [];
  const matches = [
    ...previous.filter(
      (item) =>
        !(
          clubsMatch(item.clubName, row.clubName) &&
          item.fixtureName.trim().toLowerCase() ===
            row.fixtureName.trim().toLowerCase()
        )
    ),
    row,
  ];
  return { ...next, fixtureName, matches };
}

function lockFromChosenMatch(
  brandKeyValue: string,
  lockedAt: string,
  match: ChosenMatch
): MatchDayClubLock {
  return {
    brandKey: brandKeyValue,
    clubName: match.clubName,
    matchLabel: match.competition || match.fixtureName,
    fixtureName: match.fixtureName,
    competition: match.competition,
    fixtureDate: match.fixtureDate,
    kickoff: match.kickoff,
    venue: match.venue,
    sourceUrl: match.sourceUrl,
    lockedAt,
    matches: [match],
  };
}

/** Drop one named Match from a Global Brand lock without clearing other days. */
export function removeChosenMatch(
  existing: MatchDayClubLock | null,
  clubName: string,
  fixtureName: string
): MatchDayClubLock | null {
  if (!existing) return null;
  const remaining = (existing.matches ?? []).filter(
    (item) =>
      !(
        clubsMatch(item.clubName, clubName) &&
        sameNamedFixture(item.fixtureName, fixtureName)
      )
  );
  const primaryGone =
    clubsMatch(existing.clubName, clubName) &&
    sameNamedFixture(displayLockFixture(existing), fixtureName);
  if (remaining.length === 0 && primaryGone) return null;
  if (remaining.length === 0) {
    return primaryGone ? null : { ...existing, matches: remaining };
  }
  const nextPrimary = remaining[remaining.length - 1];
  if (!primaryGone) {
    return { ...existing, matches: remaining };
  }
  return {
    ...lockFromChosenMatch(existing.brandKey, existing.lockedAt, nextPrimary),
    matches: remaining,
    fundingLockedAt: existing.fundingLockedAt,
    commitmentFeeGbp: existing.commitmentFeeGbp,
    gbpPerGoal: existing.gbpPerGoal,
    maximumSponsorshipGbp: existing.maximumSponsorshipGbp,
  };
}

function sponsorsForClubFromStores({
  clubName,
  networks,
  locks,
  excludeBrandKeys = [],
}: {
  clubName: string;
  networks: GoalSponsorshipNetwork[];
  locks: MatchDayClubLock[];
  excludeBrandKeys?: string[];
}): LeadClubSponsorRow[] {
  if (!clubName.trim()) return [];
  const excluded = new Set(
    excludeBrandKeys.map((key) => brandKey(key)).filter(Boolean)
  );
  const byBrand = new Map<string, LeadClubSponsorRow>();

  function upsert(row: {
    brandName: string;
    email?: string | null;
    matches?: string[];
    lockedAt?: string | null;
    inNetwork?: boolean;
  }) {
    const key = brandKey(row.brandName);
    if (
      !key ||
      excluded.has(key) ||
      isRemovedSponsorBrand(row.brandName) ||
      isSponsorBlockedFromClub(row.brandName, clubName) ||
      isRemovedSponsorIdentity(row.email)
    ) {
      return;
    }
    const current = byBrand.get(key);
    const matches = [...(current?.matches ?? [])];
    for (const name of row.matches ?? []) {
      const trimmed = name.trim();
      if (
        trimmed &&
        !matches.some((existing) => existing.toLowerCase() === trimmed.toLowerCase())
      ) {
        matches.push(trimmed);
      }
    }
    byBrand.set(key, {
      brandKey: key,
      brandName: current?.brandName || row.brandName,
      email: row.email ?? current?.email ?? null,
      matches,
      lockedAt: row.lockedAt || current?.lockedAt || null,
      inNetwork: Boolean(row.inNetwork || current?.inNetwork),
    });
  }

  for (const network of networks) {
    if (!networkHasClub(network, clubName)) continue;
    upsert({
      brandName: network.brandName,
      email: network.email,
      inNetwork: true,
    });
  }

  for (const lock of locks) {
    const matches = chosenMatchesForClub(lock, clubName);
    if (matches.length === 0 && !clubsMatch(lock.clubName, clubName)) continue;
    const network = networks.find(
      (row) =>
        row.brandKey === lock.brandKey ||
        brandsMatch(row.brandName, lock.brandKey)
    );
    upsert({
      brandName: network?.brandName || lock.brandKey,
      email: network?.email ?? null,
      matches: sortChosenMatchesChronologically(matches).map(
        (row) => row.fixtureName
      ),
      lockedAt: matches[matches.length - 1]?.lockedAt ?? lock.lockedAt,
      inNetwork: Boolean(network && networkHasClub(network, clubName)),
    });
  }

  return [...byBrand.values()].sort((left, right) => {
    if (right.matches.length !== left.matches.length) {
      return right.matches.length - left.matches.length;
    }
    return left.brandName.localeCompare(right.brandName);
  });
}

/** First locked (or first opted-in) Lead Climate Sponsor wins. Everyone else is rejected. */
export function pickSoleLeadClimateSponsor(
  rows: LeadClubSponsorRow[],
  clubName?: string | null
): LeadClubSponsorRow | null {
  const leads = rows.filter(
    (row) =>
      isLeadMatchDaySponsorBrand(row.brandName) &&
      !isSponsorBlockedFromClub(row.brandName, clubName)
  );
  if (leads.length === 0) return null;
  const ranked = [...leads].sort((left, right) => {
    const leftLocked = left.matches.length > 0 || Boolean(left.lockedAt);
    const rightLocked = right.matches.length > 0 || Boolean(right.lockedAt);
    if (leftLocked !== rightLocked) return leftLocked ? -1 : 1;
    const leftAt = left.lockedAt || "";
    const rightAt = right.lockedAt || "";
    if (leftAt && rightAt && leftAt !== rightAt) {
      return leftAt.localeCompare(rightAt);
    }
    if (leftAt && !rightAt) return -1;
    if (!leftAt && rightAt) return 1;
    return left.brandName.localeCompare(right.brandName);
  });
  return ranked[0] ?? null;
}

/** True when this lock occupies the named club on this named Match Day. */
export function lockHoldsClubFixture(
  lock: MatchDayClubLock | null | undefined,
  clubName: string,
  fixtureName?: string | null
): boolean {
  if (!lock || !clubName.trim()) return false;
  const fixture = String(fixtureName ?? "").trim();
  if (!isNamedFixture(fixture)) return false;
  const rows: Array<{ clubName: string; fixtureName?: string }> = [
    { clubName: lock.clubName, fixtureName: displayLockFixture(lock) },
    ...(lock.matches ?? []),
  ];
  return rows.some(
    (row) =>
      clubsMatch(row.clubName, clubName) &&
      isNamedFixture(row.fixtureName) &&
      sameNamedFixture(String(row.fixtureName), fixture)
  );
}

export function occupyingLeadClimateSponsor({
  clubName,
  networks,
  locks,
  excludeBrandKeys = [],
}: {
  clubName: string;
  networks: GoalSponsorshipNetwork[];
  locks: MatchDayClubLock[];
  excludeBrandKeys?: string[];
}): LeadClubSponsorRow | null {
  return pickSoleLeadClimateSponsor(
    sponsorsForClubFromStores({
      clubName,
      networks,
      locks,
      excludeBrandKeys,
    }),
    clubName
  );
}

/** One Lead Climate Sponsor per club per Match Day — not per club for the season. */
export function occupyingLeadClimateSponsorForMatch({
  clubName,
  fixtureName,
  networks,
  locks,
  excludeBrandKeys = [],
}: {
  clubName: string;
  fixtureName?: string | null;
  networks: GoalSponsorshipNetwork[];
  locks: MatchDayClubLock[];
  excludeBrandKeys?: string[];
}): LeadClubSponsorRow | null {
  const fixture = String(fixtureName ?? "").trim();
  if (!clubName.trim() || !isNamedFixture(fixture)) return null;
  const matchingLocks = locks.filter((lock) =>
    lockHoldsClubFixture(lock, clubName, fixture)
  );
  if (matchingLocks.length === 0) return null;
  return pickSoleLeadClimateSponsor(
    sponsorsForClubFromStores({
      clubName,
      networks,
      locks: matchingLocks,
      excludeBrandKeys,
    }),
    clubName
  );
}

/** Named-Match occupants only — opted-in Leads do not yet hold the slot. */
export function occupyingLeadBrandNames(rows: LeadClubSponsorRow[]): string[] {
  const names: string[] = [];
  for (const row of rows) {
    if (!isLeadMatchDaySponsorBrand(row.brandName)) continue;
    const holdsMatch =
      Boolean(row.lockedAt) ||
      row.matches.some((name) => isNamedFixture(name));
    if (!holdsMatch) continue;
    if (names.some((name) => brandsMatch(name, row.brandName))) continue;
    names.push(row.brandName);
  }
  return names;
}

export function canClaimLeadClimateSponsor({
  clubName,
  brandName,
  fixtureName,
  networks,
  locks,
  excludeBrandKeys = [],
}: {
  clubName: string;
  brandName: string;
  fixtureName?: string | null;
  networks: GoalSponsorshipNetwork[];
  locks: MatchDayClubLock[];
  excludeBrandKeys?: string[];
}): boolean {
  if (!clubName.trim() || !brandName.trim()) return false;
  if (isSponsorBlockedFromClub(brandName, clubName)) return false;
  if (!isLeadMatchDaySponsorBrand(brandName)) return true;
  if (!isNamedFixture(fixtureName)) return true;
  const occupant = occupyingLeadClimateSponsorForMatch({
    clubName,
    fixtureName,
    networks,
    locks,
    excludeBrandKeys,
  });
  if (!occupant) return true;
  return brandsMatch(occupant.brandName, brandName);
}

export function leadSponsorsForClubFromStores({
  clubName,
  networks,
  locks,
  excludeBrandKeys = [],
}: {
  clubName: string;
  networks: GoalSponsorshipNetwork[];
  locks: MatchDayClubLock[];
  excludeBrandKeys?: string[];
}): LeadClubSponsorRow[] {
  const rows = sponsorsForClubFromStores({
    clubName,
    networks,
    locks,
    excludeBrandKeys,
  });
  const fixtures: string[] = [];
  function addFixture(name: string | null | undefined) {
    const trimmed = String(name ?? "").trim();
    if (!isNamedFixture(trimmed)) return;
    if (fixtures.some((existing) => sameNamedFixture(existing, trimmed))) return;
    fixtures.push(trimmed);
  }
  for (const lock of locks) {
    addFixture(displayLockFixture(lock));
    for (const match of lock.matches ?? []) {
      if (!match.clubName || clubsMatch(match.clubName, clubName)) {
        addFixture(match.fixtureName);
      }
    }
  }
  for (const row of rows) {
    for (const name of row.matches) addFixture(name);
  }
  const keepers = new Map<string, LeadClubSponsorRow>();
  for (const fixture of fixtures) {
    const occupant = occupyingLeadClimateSponsorForMatch({
      clubName,
      fixtureName: fixture,
      networks,
      locks,
      excludeBrandKeys,
    });
    if (!occupant) continue;
    const current = keepers.get(occupant.brandKey);
    if (!current) {
      keepers.set(occupant.brandKey, occupant);
      continue;
    }
    const matches = [...current.matches];
    for (const name of occupant.matches) {
      if (
        !matches.some((existing) =>
          sameNamedFixture(existing, name)
        )
      ) {
        matches.push(name);
      }
    }
    keepers.set(occupant.brandKey, { ...current, matches });
  }
  for (const row of rows) {
    if (!isLeadMatchDaySponsorBrand(row.brandName)) continue;
    if (isSponsorBlockedFromClub(row.brandName, clubName)) continue;
    if (keepers.has(row.brandKey)) continue;
    keepers.set(row.brandKey, row);
  }
  return [...keepers.values()].sort((left, right) => {
    if (right.matches.length !== left.matches.length) {
      return right.matches.length - left.matches.length;
    }
    return left.brandName.localeCompare(right.brandName);
  });
}

/** Brands that chose this club but are not the Lead Climate Sponsor. */
export function localBusinessSponsorsForClubFromStores({
  clubName,
  networks,
  locks,
  excludeBrandKeys = [],
}: {
  clubName: string;
  networks: GoalSponsorshipNetwork[];
  locks: MatchDayClubLock[];
  excludeBrandKeys?: string[];
}): LeadClubSponsorRow[] {
  return sponsorsForClubFromStores({
    clubName,
    networks,
    locks,
    excludeBrandKeys,
  }).filter((row) => !isLeadMatchDaySponsorBrand(row.brandName));
}

/** The one Lead Climate Sponsor for this club on this Match Day. */
export function leadSponsorBrandForFixture({
  clubName,
  fixtureName,
  locks,
  networks = [],
}: {
  clubName: string;
  fixtureName?: string | null;
  locks: MatchDayClubLock[];
  networks?: GoalSponsorshipNetwork[];
}): string | null {
  if (!clubName.trim()) return null;
  if (isNamedFixture(fixtureName)) {
    return (
      occupyingLeadClimateSponsorForMatch({
        clubName,
        fixtureName,
        networks,
        locks,
      })?.brandName?.trim() || null
    );
  }
  return (
    occupyingLeadClimateSponsor({
      clubName,
      networks,
      locks,
    })?.brandName?.trim() || null
  );
}

export function brandKey(name: string): string {
  return normalizeClubName(name);
}

export function brandsMatch(left: string, right: string): boolean {
  return clubsMatch(left, right);
}

export function brandInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function rankSponsorsBySpend(
  sponsors: ClubClimateSponsor[]
): ClubClimateSponsor[] {
  return [...sponsors].sort((a, b) => {
    if (b.spentGbp !== a.spentGbp) return b.spentGbp - a.spentGbp;
    return a.brandName.localeCompare(b.brandName);
  });
}

export function topClimateSponsors(
  sponsors: ClubClimateSponsor[],
  count = 3
): ClubClimateSponsor[] {
  return rankSponsorsBySpend(sponsors)
    .filter((sponsor) => sponsor.spentGbp > 0)
    .slice(0, count);
}

export function emptySponsor(partial?: Partial<ClubClimateSponsor>): ClubClimateSponsor {
  return {
    id: partial?.id ?? crypto.randomUUID(),
    brandName: partial?.brandName ?? "",
    contactName: partial?.contactName ?? "",
    jobTitle: partial?.jobTitle ?? "Sponsorship Manager",
    email: partial?.email ?? "",
    phone: partial?.phone ?? "",
    linkedinUrl: partial?.linkedinUrl ?? "",
    logoUrl: partial?.logoUrl ?? "",
    website: partial?.website ?? "",
    spentGbp: Number(partial?.spentGbp) || 0,
    notes: partial?.notes ?? "",
  };
}

export function upsertSponsor(
  roster: ClubSponsorRoster,
  sponsor: ClubClimateSponsor
): ClubSponsorRoster {
  const name = sponsor.brandName.trim();
  if (!name) return roster;
  const next = emptySponsor({ ...sponsor, brandName: name });
  const existing = roster.sponsors.findIndex(
    (row) => row.id === next.id || brandsMatch(row.brandName, next.brandName)
  );
  const sponsors =
    existing >= 0
      ? roster.sponsors.map((row, index) => (index === existing ? { ...row, ...next, id: row.id } : row))
      : [next, ...roster.sponsors];
  return { ...roster, sponsors };
}

export function removeSponsor(
  roster: ClubSponsorRoster,
  sponsorId: string
): ClubSponsorRoster {
  return {
    ...roster,
    sponsors: roster.sponsors.filter((row) => row.id !== sponsorId),
    selectedIds: roster.selectedIds.filter((id) => id !== sponsorId),
  };
}

export function toggleSelectedSponsor(
  roster: ClubSponsorRoster,
  sponsorId: string
): ClubSponsorRoster {
  const selected = new Set(roster.selectedIds);
  if (selected.has(sponsorId)) selected.delete(sponsorId);
  else selected.add(sponsorId);
  return { ...roster, selectedIds: [...selected] };
}

export function ensureSponsorSelected(
  roster: ClubSponsorRoster,
  sponsorId: string
): ClubSponsorRoster {
  if (!sponsorId || roster.selectedIds.includes(sponsorId)) return roster;
  return { ...roster, selectedIds: [...roster.selectedIds, sponsorId] };
}

export function selectedSponsors(
  roster: ClubSponsorRoster
): ClubClimateSponsor[] {
  return roster.sponsors.filter((sponsor) =>
    roster.selectedIds.includes(sponsor.id)
  );
}

export function networkHasClub(
  network: GoalSponsorshipNetwork | null,
  clubName: string
): boolean {
  if (!network) return false;
  return network.clubNames.some((name) => clubsMatch(name, clubName));
}

export function addClubsToNetwork(
  network: GoalSponsorshipNetwork,
  clubNames: string[]
): GoalSponsorshipNetwork {
  const next = [...network.clubNames];
  for (const name of clubNames) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    if (!next.some((existing) => clubsMatch(existing, trimmed))) {
      next.push(trimmed);
    }
  }
  return { ...network, clubNames: next };
}

export function addLeagueToNetwork(
  network: GoalSponsorshipNetwork,
  leagueName: string
): GoalSponsorshipNetwork {
  const clubs =
    CURRENT_SEASON_LEAGUES[leagueName] ??
    sportingCalendarClubGroups().find((row) => row.league === leagueName)
      ?.clubs ??
    [];
  const leagues = network.leagues.some((row) => row === leagueName)
    ? network.leagues
    : [...network.leagues, leagueName];
  return addClubsToNetwork({ ...network, leagues }, clubs);
}

export function acceptInviteIntoNetwork(
  network: GoalSponsorshipNetwork,
  invite: NetworkInvite,
  includeLeague: boolean
): GoalSponsorshipNetwork {
  let next = addClubsToNetwork(network, [invite.fromClubName]);
  if (includeLeague) {
    const league =
      leagueForClubName(invite.fromClubName) ??
      leagueForSportingCalendarClub(invite.fromClubName);
    if (league) next = addLeagueToNetwork(next, league);
  }
  return next;
}

export function inviteMatchesSponsor(
  invite: NetworkInvite,
  brandName: string,
  email?: string | null
): boolean {
  if (brandsMatch(invite.toBrandName, brandName)) return true;
  const left = (invite.toEmail ?? "").trim().toLowerCase();
  const right = (email ?? "").trim().toLowerCase();
  return Boolean(left && right && left === right);
}

export function sponsorCanReceiveClubPost({
  network,
  lock,
  clubName,
  brandName,
  targetBrandNames,
}: {
  network: GoalSponsorshipNetwork | null;
  lock: MatchDayClubLock | null;
  clubName: string;
  brandName: string;
  targetBrandNames?: string[] | null;
}): boolean {
  if (!networkHasClub(network, clubName)) return false;
  if (!lock || !clubsMatch(lock.clubName, clubName)) return false;
  const targets = targetBrandNames;
  if (Array.isArray(targets) && targets.length === 0) return false;
  if (targets && targets.length > 0) {
    if (!targets.some((name) => brandsMatch(name, brandName))) return false;
  }
  return true;
}

/** Bind an offer to the locked club AND the named Match, never a leftover from another Match Day. */
export function offerMatchesLockedMatch<
  T extends {
    clubName: string;
    matchTitle?: string | null;
    matchDate?: string | null;
  },
>(offer: T, lock: MatchDayClubLock | null): boolean {
  if (!lock?.clubName?.trim()) return false;
  if (!clubsMatch(offer.clubName, lock.clubName)) return false;
  const fixture = displayLockFixture(lock);
  if (!isNamedFixture(fixture)) return true;
  const title = String(offer.matchTitle ?? "").trim();
  if (!title) return true;
  if (isNamedFixture(title)) return sameNamedFixture(title, fixture);
  const lockDate = String(lock.fixtureDate ?? "").slice(0, 10);
  const offerDate = String(offer.matchDate ?? "").slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(lockDate) && /^\d{4}-\d{2}-\d{2}$/.test(offerDate)) {
    return lockDate === offerDate;
  }
  return false;
}

export function offersForLockedSponsor<
  T extends {
    clubName: string;
    matchTitle?: string | null;
    matchDate?: string | null;
    targetBrandNames?: string[] | null;
  },
>(
  offers: T[],
  {
    brandName,
    network,
    lock,
  }: {
    brandName: string;
    network: GoalSponsorshipNetwork | null;
    lock: MatchDayClubLock | null;
  }
): T[] {
  return offers.filter(
    (offer) =>
      sponsorCanReceiveClubPost({
        network,
        lock,
        clubName: offer.clubName,
        brandName,
        targetBrandNames: offer.targetBrandNames,
      }) && offerMatchesLockedMatch(offer, lock)
  );
}

export function selectedBrandsReadyToReceive(
  roster: ClubSponsorRoster,
  {
    networkFor,
    lockFor,
  }: {
    networkFor: (brandName: string) => GoalSponsorshipNetwork | null;
    lockFor: (brandName: string) => MatchDayClubLock | null;
  }
): ClubClimateSponsor[] {
  return roster.sponsors.filter((sponsor) => {
    if (!roster.selectedIds.includes(sponsor.id)) return false;
    return sponsorCanReceiveClubPost({
      network: networkFor(sponsor.brandName),
      lock: lockFor(sponsor.brandName),
      clubName: roster.clubName,
      brandName: sponsor.brandName,
    });
  });
}

export function lockCopy(hours = CLIMATE_SPONSOR_LEAD_HOURS): string {
  return `${hours} hours before kick-off, choose the Match you wish to lock-in for Goal-Sponsorship; see this Club's Match Day chosen Climate Projects; open your Climate Sponsorship Wallet; deposit your Commitment Fee & Goals-scored Sponsorship; sign-off your Match Day sponsorship`;
}

/** Club chosen at Register as Sponsor — not a second Premier League / Scottish Premiership picker. */
export function registeredClubForLockIn(
  registeredClubs: string[],
  lockedClub?: string | null
): string {
  const registered = registeredClubs.map((name) => name.trim()).filter(Boolean);
  const locked = String(lockedClub ?? "").trim();
  if (locked) {
    const match = registered.find((name) => clubsMatch(name, locked));
    if (match) return match;
    if (registered.length === 0) return locked;
  }
  return registered[0] ?? "";
}

/** Local Business Climate Sponsors lock a Club and Match, then fund an amount — not Goals-scored. */
export function localLockCopy(hours = CLIMATE_SPONSOR_LEAD_HOURS): string {
  return `${hours} hours before kick-off, choose a Club you wish to sponsor and the specific Match. Then open the Climate Sponsorship Wallet; insert your Sponsorship amount; Accept the Terms & Conditions; & Sign-off your sponsorship. The club's five chosen Climate Projects will later appear on your Dashboard for your records.`;
}

export function unlockedMatchDay(matchLabel = MATCH_DAY_LOCK_LABELS[0]): {
  clubName: string;
  matchLabel: string;
} {
  return { clubName: "", matchLabel };
}

export function replaceLockedClub(
  matchLabel: string,
  clubName: string
): { clubName: string; matchLabel: string } {
  return { clubName: clubName.trim(), matchLabel };
}
