import { seasonNamesMatch } from "./current-season";
import { FAN_GOAL_ALERTS_STORAGE } from "./sponsored-goal";

export const CLUB_SPONSOR_ROSTER_KEY = "s4p.club.climateSponsors";
export const GOAL_NETWORK_KEY = "s4p.sponsor.goalNetwork";
export const MATCH_LOCK_KEY = "s4p.sponsor.matchLock";
export const LOCAL_SPONSORS_BY_CLUB_KEY = "s4p.local-sponsors-by-club";
export const WALLET_STORAGE_KEY = "s4p.sponsor.wallets";
export const MATCH_OFFERS_KEY = "s4p.sponsor.matchOffers";
export const OFFER_SIGNATURES_KEY = "s4p.sponsor.offerSignatures";
export const PROJECT_PROPOSALS_KEY = "s4p.sponsor.projectProposals";
export const NETWORK_INVITES_KEY = "s4p.network.invites";
export const LOCAL_SPONSOR_RECORD_KEY = "s4p.sponsor.local";
export const SELECTION_LIVE_PREFIX = "s4p.sd.selectionLive.";
export const IGNORED_CAMPAIGNS_KEY = "s4p.sd.ignoredCampaigns";
export const ARSENAL_BLANK_SLATE_VERSION = "3";

const KEY_PREFIXES = [
  "s4p.sd.matchDay.",
  "s4p.sd.matchDayFolder.",
  "s4p.sd.fileRecords.",
  "s4p.fan.postSchedule.",
  "s4p.climate.funding.",
  "s4p.campaign.auction.",
];

export function clubDataMatches(value: string | null | undefined, clubName: string) {
  if (!value?.trim() || !clubName.trim()) return false;
  return seasonNamesMatch(value, clubName);
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function jsonMentionsClub(
  value: unknown,
  clubName: string,
  clubIds: string[]
): boolean {
  if (value == null) return false;
  if (typeof value === "string") {
    return clubIds.includes(value) || clubDataMatches(value, clubName);
  }
  if (typeof value === "number" || typeof value === "boolean") return false;
  if (Array.isArray(value)) {
    return value.some((entry) => jsonMentionsClub(entry, clubName, clubIds));
  }
  if (typeof value === "object") {
    const row = value as Record<string, unknown>;
    for (const [key, nested] of Object.entries(row)) {
      if (
        (key === "clubId" || key === "club_id") &&
        clubIds.includes(String(nested ?? ""))
      ) {
        return true;
      }
      if (
        (key === "clubName" || key === "club_name") &&
        clubDataMatches(String(nested ?? ""), clubName)
      ) {
        return true;
      }
    }
  }
  return false;
}

function removeClubScopedKeys(clubName: string, clubIds: string[]) {
  if (typeof window === "undefined") return;
  const ids = new Set(clubIds.filter(Boolean));
  const drop: string[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key) continue;
    const prefix = KEY_PREFIXES.find((item) => key.startsWith(item));
    if (prefix) {
      const suffix = key.slice(prefix.length);
      if (ids.has(suffix)) {
        drop.push(key);
        continue;
      }
      try {
        const parsed = JSON.parse(window.localStorage.getItem(key) ?? "");
        if (jsonMentionsClub(parsed, clubName, clubIds)) drop.push(key);
      } catch {
        // Keep keys that are not club JSON.
      }
      continue;
    }
    if (key.startsWith("s4p.fan.sponsorVote.") && [...ids].some((id) => key.endsWith(`:${id}`))) {
      drop.push(key);
    }
  }
  for (const key of drop) window.localStorage.removeItem(key);
}

function belongsToClub(
  row: { clubId?: string | null; clubName?: string | null },
  clubName: string,
  clubIds: string[]
) {
  if (row.clubId && clubIds.includes(row.clubId)) return true;
  return clubDataMatches(row.clubName, clubName);
}

export function readIgnoredCampaignIds(): string[] {
  return readJson<string[]>(IGNORED_CAMPAIGNS_KEY, []).filter(Boolean);
}

export function rememberIgnoredCampaigns(campaignIds: string[]) {
  const next = [...new Set([...readIgnoredCampaignIds(), ...campaignIds.filter(Boolean)])];
  writeJson(IGNORED_CAMPAIGNS_KEY, next);
}

export function isIgnoredCampaign(campaignId: string | null | undefined) {
  if (!campaignId) return false;
  return readIgnoredCampaignIds().includes(campaignId);
}

export function clubShouldStartBlank(clubId: string, clubName: string) {
  if (typeof window === "undefined") {
    return clubDataMatches(clubName, "Arsenal");
  }
  const live = window.localStorage.getItem(SELECTION_LIVE_PREFIX + clubId);
  if (clubDataMatches(clubName, "Arsenal")) {
    return live !== ARSENAL_BLANK_SLATE_VERSION;
  }
  return live === "blank";
}

export function markClubBlankSlate(clubIds: string[]) {
  if (typeof window === "undefined") return;
  for (const clubId of clubIds.filter(Boolean)) {
    window.localStorage.setItem(SELECTION_LIVE_PREFIX + clubId, "blank");
  }
}

export function markClubSelectionLive(clubId: string) {
  if (typeof window === "undefined" || !clubId) return;
  window.localStorage.setItem(
    SELECTION_LIVE_PREFIX + clubId,
    ARSENAL_BLANK_SLATE_VERSION
  );
}

export function clearClubLocalProjectsAndSponsors({
  clubName,
  clubIds = [],
  campaignIds = [],
}: {
  clubName: string;
  clubIds?: string[];
  campaignIds?: string[];
}): { walletsRemoved: number; sponsorsRemoved: number } {
  if (typeof window === "undefined") {
    return { walletsRemoved: 0, sponsorsRemoved: 0 };
  }

  rememberIgnoredCampaigns(campaignIds);
  markClubBlankSlate(clubIds);
  removeClubScopedKeys(clubName, clubIds);
  for (const campaignId of campaignIds.filter(Boolean)) {
    window.localStorage.removeItem(`s4p.campaign.auction.${campaignId}`);
  }
  // Keep the blank-slate flags after scoped key cleanup.
  markClubBlankSlate(clubIds);

  const rosters = readJson<Record<string, { clubId?: string; clubName?: string; sponsors?: unknown[] }>>(
    CLUB_SPONSOR_ROSTER_KEY,
    {}
  );
  let sponsorsRemoved = 0;
  for (const [key, roster] of Object.entries(rosters)) {
    if (
      clubIds.includes(key) ||
      clubIds.includes(String(roster.clubId ?? "")) ||
      clubDataMatches(roster.clubName, clubName)
    ) {
      sponsorsRemoved += Array.isArray(roster.sponsors) ? roster.sponsors.length : 0;
      delete rosters[key];
    }
  }
  writeJson(CLUB_SPONSOR_ROSTER_KEY, rosters);

  const locals = readJson<Record<string, unknown>>(LOCAL_SPONSORS_BY_CLUB_KEY, {});
  for (const key of Object.keys(locals)) {
    if (clubDataMatches(key, clubName)) delete locals[key];
  }
  writeJson(LOCAL_SPONSORS_BY_CLUB_KEY, locals);

  const localSponsor = readJson<{ clubName?: string } | null>(LOCAL_SPONSOR_RECORD_KEY, null);
  if (localSponsor && clubDataMatches(localSponsor.clubName, clubName)) {
    window.localStorage.removeItem(LOCAL_SPONSOR_RECORD_KEY);
  }

  const wallets = readJson<Record<string, { clubName?: string }>>(WALLET_STORAGE_KEY, {});
  let walletsRemoved = 0;
  for (const [key, wallet] of Object.entries(wallets)) {
    if (clubDataMatches(wallet.clubName, clubName)) {
      delete wallets[key];
      walletsRemoved += 1;
    }
  }
  writeJson(WALLET_STORAGE_KEY, wallets);

  const networks = readJson<Record<string, { clubNames?: string[] }>>(GOAL_NETWORK_KEY, {});
  for (const network of Object.values(networks)) {
    network.clubNames = (network.clubNames ?? []).filter(
      (name) => !clubDataMatches(name, clubName)
    );
  }
  writeJson(GOAL_NETWORK_KEY, networks);

  const locks = readJson<Record<string, { clubName?: string }>>(MATCH_LOCK_KEY, {});
  for (const [key, lock] of Object.entries(locks)) {
    if (clubDataMatches(lock.clubName, clubName)) delete locks[key];
  }
  writeJson(MATCH_LOCK_KEY, locks);

  const offers = readJson<Array<{ id?: string; clubId?: string; clubName?: string }>>(
    MATCH_OFFERS_KEY,
    []
  );
  const keptOffers = offers.filter((row) => !belongsToClub(row, clubName, clubIds));
  writeJson(MATCH_OFFERS_KEY, keptOffers);
  const keptOfferIds = new Set(keptOffers.map((row) => String(row.id ?? "")).filter(Boolean));

  const signatures = readJson<Array<{ offerId?: string }>>(OFFER_SIGNATURES_KEY, []);
  writeJson(
    OFFER_SIGNATURES_KEY,
    signatures.filter((row) => keptOfferIds.has(String(row.offerId ?? "")))
  );

  const proposals = readJson<Array<{ clubId?: string; clubName?: string }>>(
    PROJECT_PROPOSALS_KEY,
    []
  );
  writeJson(
    PROJECT_PROPOSALS_KEY,
    proposals.filter((row) => !belongsToClub(row, clubName, clubIds))
  );

  const invites = readJson<Array<{ fromClubName?: string }>>(NETWORK_INVITES_KEY, []);
  writeJson(
    NETWORK_INVITES_KEY,
    invites.filter((row) => !clubDataMatches(row.fromClubName, clubName))
  );

  const alerts = readJson<Array<{ clubName?: string }>>(FAN_GOAL_ALERTS_STORAGE, []);
  writeJson(
    FAN_GOAL_ALERTS_STORAGE,
    alerts.filter((row) => !clubDataMatches(row.clubName, clubName))
  );

  return { walletsRemoved, sponsorsRemoved };
}
