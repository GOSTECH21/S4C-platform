import { seasonNamesMatch } from "./current-season";
import { FAN_GOAL_ALERTS_STORAGE } from "./sponsored-goal";

export const CLUB_SPONSOR_ROSTER_KEY = "s4p.club.climateSponsors";
export const GOAL_NETWORK_KEY = "s4p.sponsor.goalNetwork";
export const MATCH_LOCK_KEY = "s4p.sponsor.matchLock";
export const LOCAL_SPONSORS_BY_CLUB_KEY = "s4p.local-sponsors-by-club";
export const WALLET_STORAGE_KEY = "s4p.sponsor.wallets";
export const MATCH_OFFERS_KEY = "s4p.sponsor.matchOffers";
export const PROJECT_PROPOSALS_KEY = "s4p.sponsor.projectProposals";
export const NETWORK_INVITES_KEY = "s4p.network.invites";

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

function removeKeysForClubIds(clubIds: string[]) {
  if (typeof window === "undefined") return;
  const ids = new Set(clubIds.filter(Boolean));
  const drop: string[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key) continue;
    if (KEY_PREFIXES.some((prefix) => ids.has(key.slice(prefix.length)) && key.startsWith(prefix))) {
      drop.push(key);
      continue;
    }
    if (key.startsWith("s4p.fan.sponsorVote.") && [...ids].some((id) => key.endsWith(`:${id}`))) {
      drop.push(key);
    }
  }
  for (const key of drop) window.localStorage.removeItem(key);
}

export function clearClubLocalProjectsAndSponsors({
  clubName,
  clubIds = [],
}: {
  clubName: string;
  clubIds?: string[];
}): { walletsRemoved: number; sponsorsRemoved: number } {
  if (typeof window === "undefined") {
    return { walletsRemoved: 0, sponsorsRemoved: 0 };
  }

  removeKeysForClubIds(clubIds);

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

  const offers = readJson<Array<{ clubName?: string }>>(MATCH_OFFERS_KEY, []);
  writeJson(
    MATCH_OFFERS_KEY,
    offers.filter((row) => !clubDataMatches(row.clubName, clubName))
  );

  const proposals = readJson<Array<{ clubName?: string }>>(PROJECT_PROPOSALS_KEY, []);
  writeJson(
    PROJECT_PROPOSALS_KEY,
    proposals.filter((row) => !clubDataMatches(row.clubName, clubName))
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
