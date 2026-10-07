import { supabase } from "../lib/supabase";
import {
  addClubsToNetwork,
  acceptInviteIntoNetwork,
  appendChosenMatch,
  brandKey,
  brandsMatch,
  emptySponsor,
  inviteMatchesSponsor,
  isLeadClimateSponsorName,
  leadSponsorBrandForFixture,
  leadSponsorsForClubFromStores,
  localBusinessSponsorsForClubFromStores,
  removeSponsor,
  selectedSponsors,
  toggleSelectedSponsor,
  upsertSponsor,
  type ClubClimateSponsor,
  type ClubSponsorRoster,
  type GoalSponsorshipNetwork,
  type LeadClubSponsorRow,
  type MatchDayClubLock,
  type NetworkInvite,
} from "../lib/climate-sponsors";
import { uniqueClubNames } from "../lib/s4p-admin";
import {
  CURRENT_SEASON_LEAGUES,
  demoClubNamesOnly,
  isDemoClubName,
} from "../lib/current-season";
import { offerBelongsToClub } from "../lib/campaign-sponsor";
import { isExampleLocalBrand } from "../lib/match-day-branding";
import {
  allLocalSponsors,
  submittedLocalSponsorsForClub,
  withAgreedPledge,
  type LocalSponsorRecord,
} from "../lib/local-sponsor";

const ROSTER_KEY = "s4p.club.climateSponsors";
const NETWORK_KEY = "s4p.sponsor.goalNetwork";
const LOCK_KEY = "s4p.sponsor.matchLock";
const INVITE_KEY = "s4p.network.invites";
const LOGO_KEY = "s4p.sponsor.brandLogo";

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

type RosterStore = Record<string, ClubSponsorRoster>;
type NetworkStore = Record<string, GoalSponsorshipNetwork>;
type LockStore = Record<string, MatchDayClubLock>;

export function loadClubSponsorRoster(
  clubId: string,
  clubName: string
): ClubSponsorRoster {
  const store = readJson<RosterStore>(ROSTER_KEY, {});
  const existing = store[clubId];
  if (existing) {
    return {
      ...existing,
      clubName: existing.clubName || clubName,
      selectedIds: existing.selectedIds ?? [],
    };
  }
  const byName = Object.values(store).find(
    (roster) => roster.clubName && offerBelongsToClub(roster.clubName, clubName)
  );
  if (byName) {
    return {
      ...byName,
      clubName: byName.clubName || clubName,
      selectedIds: byName.selectedIds ?? [],
    };
  }
  return { clubId, clubName, sponsors: [], selectedIds: [] };
}

function demoOnlyNetwork(network: GoalSponsorshipNetwork): GoalSponsorshipNetwork {
  return {
    ...network,
    clubNames: demoClubNamesOnly(network.clubNames ?? []),
    leagues: (network.leagues ?? []).filter(
      (league) => Boolean(CURRENT_SEASON_LEAGUES[league])
    ),
  };
}

function pruneNonDemoLocalSponsorStores() {
  if (typeof window === "undefined") return;
  const networks = readJson<NetworkStore>(NETWORK_KEY, {});
  const nextNetworks: NetworkStore = {};
  let networkChanged = false;
  for (const [key, row] of Object.entries(networks)) {
    if (!row?.brandName) {
      networkChanged = true;
      continue;
    }
    const next = demoOnlyNetwork(row);
    if (next.clubNames.length === 0) {
      networkChanged = true;
      continue;
    }
    if (
      next.clubNames.length !== (row.clubNames ?? []).length ||
      next.leagues.length !== (row.leagues ?? []).length
    ) {
      networkChanged = true;
    }
    nextNetworks[key] = next;
  }
  if (networkChanged) writeJson(NETWORK_KEY, nextNetworks);

  const locks = readJson<LockStore>(LOCK_KEY, {});
  const nextLocks: LockStore = {};
  let lockChanged = false;
  for (const [key, row] of Object.entries(locks)) {
    if (row && isDemoClubName(row.clubName)) nextLocks[key] = row;
    else lockChanged = true;
  }
  if (lockChanged) writeJson(LOCK_KEY, nextLocks);

  const rosters = readJson<RosterStore>(ROSTER_KEY, {});
  const nextRosters: RosterStore = {};
  let rosterChanged = false;
  for (const [key, row] of Object.entries(rosters)) {
    if (row && isDemoClubName(row.clubName)) nextRosters[key] = row;
    else rosterChanged = true;
  }
  if (rosterChanged) writeJson(ROSTER_KEY, nextRosters);
}

export function listClubSponsorRosters(): ClubSponsorRoster[] {
  if (typeof window === "undefined") return [];
  pruneNonDemoLocalSponsorStores();
  return Object.values(readJson<RosterStore>(ROSTER_KEY, {})).filter(
    (roster) =>
      roster && Array.isArray(roster.sponsors) && isDemoClubName(roster.clubName)
  );
}

export function selectedBrandNamesForClubName(clubName: string): string[] {
  if (!clubName.trim() || typeof window === "undefined") return [];
  const store = readJson<RosterStore>(ROSTER_KEY, {});
  for (const roster of Object.values(store)) {
    if (!offerBelongsToClub(roster.clubName || "", clubName)) continue;
    return selectedSponsors(roster)
      .map((sponsor) => sponsor.brandName.trim())
      .filter(Boolean);
  }
  return [];
}

export function saveClubSponsorRoster(roster: ClubSponsorRoster) {
  if (!isDemoClubName(roster.clubName)) return;
  const store = readJson<RosterStore>(ROSTER_KEY, {});
  store[roster.clubId] = roster;
  writeJson(ROSTER_KEY, store);
}

export function addClubClimateSponsor(
  clubId: string,
  clubName: string,
  input: Partial<ClubClimateSponsor>
): ClubSponsorRoster {
  const roster = loadClubSponsorRoster(clubId, clubName);
  const next = upsertSponsor(roster, emptySponsor(input));
  saveClubSponsorRoster(next);
  return next;
}

export function updateClubClimateSponsor(
  clubId: string,
  clubName: string,
  sponsor: ClubClimateSponsor
): ClubSponsorRoster {
  const roster = loadClubSponsorRoster(clubId, clubName);
  const next = upsertSponsor(roster, sponsor);
  saveClubSponsorRoster(next);
  return next;
}

export function deleteClubClimateSponsor(
  clubId: string,
  clubName: string,
  sponsorId: string
): ClubSponsorRoster {
  const roster = removeSponsor(loadClubSponsorRoster(clubId, clubName), sponsorId);
  saveClubSponsorRoster(roster);
  return roster;
}

export function setMatchDaySponsorTargets(
  clubId: string,
  clubName: string,
  sponsorId: string
): ClubSponsorRoster {
  const roster = toggleSelectedSponsor(
    loadClubSponsorRoster(clubId, clubName),
    sponsorId
  );
  saveClubSponsorRoster(roster);
  return roster;
}

export function rosterForClubName(clubName: string): ClubSponsorRoster | null {
  if (!isDemoClubName(clubName)) return null;
  const store = readJson<RosterStore>(ROSTER_KEY, {});
  return (
    Object.values(store).find((row) =>
      row.clubName.toLowerCase() === clubName.toLowerCase() ||
      row.clubName.toLowerCase().includes(clubName.toLowerCase()) ||
      clubName.toLowerCase().includes(row.clubName.toLowerCase())
    ) ?? null
  );
}

export function listGoalNetworks(): GoalSponsorshipNetwork[] {
  if (typeof window === "undefined") return [];
  pruneNonDemoLocalSponsorStores();
  return Object.values(readJson<NetworkStore>(NETWORK_KEY, {}))
    .filter((row) => row && row.brandName)
    .map(demoOnlyNetwork)
    .filter((row) => row.clubNames.length > 0);
}

export function listMatchDayLocks(): MatchDayClubLock[] {
  if (typeof window === "undefined") return [];
  pruneNonDemoLocalSponsorStores();
  return Object.values(readJson<LockStore>(LOCK_KEY, {})).filter(
    (row) => row && isDemoClubName(row.clubName)
  );
}

export function leadClimateSponsorsForClub(clubName: string): LeadClubSponsorRow[] {
  const excluded = allLocalSponsors()
    .map((row) => row.brandName)
    .filter((name) => !isLeadClimateSponsorName(name));
  return leadSponsorsForClubFromStores({
    clubName,
    networks: listGoalNetworks(),
    locks: listMatchDayLocks(),
    excludeBrandKeys: excluded,
  }).map((row) => ({
    ...row,
    logoUrl: loadBrandLogo(row.brandName),
  }));
}

function localRecordFromInbound(
  clubName: string,
  row: LeadClubSponsorRow
): LocalSponsorRecord {
  return withAgreedPledge({
    brandName: row.brandName,
    email: row.email ?? "",
    clubName,
    pledgeGbp: 0,
    createdAt: row.lockedAt ?? "",
    submittedAt: row.lockedAt || undefined,
    source: "registered",
    logoUrl: loadBrandLogo(row.brandName),
    matchSponsorships: row.matches.map((fixtureName) => ({
      fixtureName,
      amountGbp: 0,
    })),
  });
}

function mergeLocalInbound(
  existing: LocalSponsorRecord,
  extra: LeadClubSponsorRow
): LocalSponsorRecord {
  const matchSponsorships = [...(existing.matchSponsorships ?? [])];
  for (const name of extra.matches) {
    const trimmed = name.trim();
    if (
      !trimmed ||
      matchSponsorships.some(
        (row) => row.fixtureName.trim().toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      continue;
    }
    matchSponsorships.push({ fixtureName: trimmed, amountGbp: 0 });
  }
  return withAgreedPledge({
    ...existing,
    logoUrl: existing.logoUrl || loadBrandLogo(existing.brandName),
    matchSponsorships,
  });
}

/** Local Business Climate Sponsors of this club — never the Lead Climate Sponsor. */
export function localBusinessClimateSponsorsForClub(
  clubName: string
): LocalSponsorRecord[] {
  const byBrand = new Map<string, LocalSponsorRecord>();
  for (const row of submittedLocalSponsorsForClub(clubName)) {
    if (
      isLeadClimateSponsorName(row.brandName) ||
      isExampleLocalBrand(row.brandName)
    ) {
      continue;
    }
    byBrand.set(brandKey(row.brandName), {
      ...row,
      logoUrl: row.logoUrl || loadBrandLogo(row.brandName),
    });
  }
  for (const row of localBusinessSponsorsForClubFromStores({
    clubName,
    networks: listGoalNetworks(),
    locks: listMatchDayLocks(),
  })) {
    if (
      isLeadClimateSponsorName(row.brandName) ||
      isExampleLocalBrand(row.brandName)
    ) {
      continue;
    }
    const key = brandKey(row.brandName);
    const existing = byBrand.get(key);
    byBrand.set(
      key,
      existing ? mergeLocalInbound(existing, row) : localRecordFromInbound(clubName, row)
    );
  }
  return [...byBrand.values()].sort((left, right) => {
    const leftAt = left.submittedAt || left.createdAt;
    const rightAt = right.submittedAt || right.createdAt;
    if (rightAt !== leftAt) return rightAt.localeCompare(leftAt);
    return left.brandName.localeCompare(right.brandName);
  });
}

export function loadGoalNetwork(
  brandName: string,
  email?: string | null
): GoalSponsorshipNetwork | null {
  pruneNonDemoLocalSponsorStores();
  const store = readJson<NetworkStore>(NETWORK_KEY, {});
  const byBrand = store[brandKey(brandName)];
  if (byBrand) return demoOnlyNetwork(byBrand);
  if (email) {
    const match = Object.values(store).find(
      (row) => (row.email ?? "").toLowerCase() === email.toLowerCase()
    );
    return match ? demoOnlyNetwork(match) : null;
  }
  return null;
}

export function saveGoalNetwork(network: GoalSponsorshipNetwork) {
  const next = demoOnlyNetwork({
    ...network,
    brandKey: brandKey(network.brandName),
  });
  const store = readJson<NetworkStore>(NETWORK_KEY, {});
  if (next.clubNames.length === 0) {
    delete store[brandKey(network.brandName)];
  } else {
    store[brandKey(network.brandName)] = next;
  }
  writeJson(NETWORK_KEY, store);
  void persistSponsorClubNetwork(next);
}

export function clubsForBrandFromLocalStores(
  brandName: string,
  email?: string | null
): string[] {
  const names: string[] = [];
  const network = loadGoalNetwork(brandName, email);
  names.push(...(network?.clubNames ?? []));
  const rosters = readJson<RosterStore>(ROSTER_KEY, {});
  for (const roster of Object.values(rosters)) {
    const listed = roster.sponsors?.some(
      (sponsor) =>
        brandsMatch(sponsor.brandName, brandName) ||
        Boolean(
          email &&
            sponsor.email &&
            sponsor.email.toLowerCase() === email.toLowerCase()
        )
    );
    if (listed && roster.clubName) names.push(roster.clubName);
  }
  return uniqueClubNames(names).filter((name) => isDemoClubName(name));
}

async function persistSponsorClubNetwork(network: GoalSponsorshipNetwork) {
  const clubNames = demoClubNamesOnly(uniqueClubNames(network.clubNames));
  try {
    const existing = await supabase
      .from("sponsor_club_network")
      .select("club_name")
      .eq("brand_name", network.brandName);
    for (const row of existing.data ?? []) {
      const club = String(row.club_name ?? "").trim();
      if (club && !isDemoClubName(club)) {
        await supabase
          .from("sponsor_club_network")
          .delete()
          .eq("brand_name", network.brandName)
          .eq("club_name", club);
      }
    }
    if (clubNames.length === 0) return;
    const rows = clubNames.map((clubName) => ({
      brand_name: network.brandName,
      club_name: clubName,
      email: network.email,
    }));
    await supabase.from("sponsor_club_network").upsert(rows, {
      onConflict: "brand_name,club_name",
    });
  } catch {
    // Table is optional until migration 0009 is applied.
  }
}

export function ensureGoalNetwork({
  brandName,
  email,
  clubNames = [],
}: {
  brandName: string;
  email?: string | null;
  clubNames?: string[];
}): GoalSponsorshipNetwork {
  const existing = loadGoalNetwork(brandName, email) ?? {
    brandKey: brandKey(brandName),
    brandName,
    email: email ?? null,
    clubNames: [],
    leagues: [],
  };
  const next = addClubsToNetwork(
    { ...existing, brandName, email: email ?? existing.email },
    demoClubNamesOnly(clubNames)
  );
  saveGoalNetwork(next);
  return next;
}

export function lockedBrandNameForClubAndMatch(
  clubName: string,
  fixtureName?: string | null
): string | null {
  if (!clubName.trim() || typeof window === "undefined") return null;
  const fixture = String(fixtureName ?? "").trim();
  if (fixture) {
    return leadSponsorBrandForFixture({
      clubName,
      fixtureName: fixture,
      locks: listMatchDayLocks(),
      networks: listGoalNetworks(),
    });
  }
  return lockedBrandNameForClub(clubName);
}

export function lockedBrandNameForClub(clubName: string): string | null {
  if (!clubName.trim() || typeof window === "undefined") return null;
  const locks = readJson<LockStore>(LOCK_KEY, {});
  const networks = readJson<NetworkStore>(NETWORK_KEY, {});
  const rosters = readJson<RosterStore>(ROSTER_KEY, {});
  for (const lock of Object.values(locks)) {
    if (!lock?.clubName || !offerBelongsToClub(lock.clubName, clubName)) continue;
    const fromNetwork = Object.values(networks).find(
      (row) =>
        row.brandKey === lock.brandKey ||
        brandsMatch(row.brandName, lock.brandKey)
    );
    if (fromNetwork?.brandName) return fromNetwork.brandName;
    for (const roster of Object.values(rosters)) {
      const sponsor = roster.sponsors.find(
        (row) => brandKey(row.brandName) === lock.brandKey
      );
      if (sponsor?.brandName) return sponsor.brandName;
    }
  }
  return null;
}

export function loadMatchDayLock(brandName: string): MatchDayClubLock | null {
  const store = readJson<LockStore>(LOCK_KEY, {});
  return store[brandKey(brandName)] ?? null;
}

export function lockMatchDayClub({
  brandName,
  clubName,
  matchLabel,
  fixtureName,
  competition,
  fixtureDate,
  kickoff,
  venue,
  sourceUrl,
}: {
  brandName: string;
  clubName: string;
  matchLabel: string;
  fixtureName?: string;
  competition?: string;
  fixtureDate?: string;
  kickoff?: string | null;
  venue?: string | null;
  sourceUrl?: string | null;
}): MatchDayClubLock {
  const lockedAt = new Date().toISOString();
  const next: MatchDayClubLock = {
    brandKey: brandKey(brandName),
    clubName,
    matchLabel,
    fixtureName,
    competition: competition || matchLabel,
    fixtureDate,
    kickoff,
    venue,
    sourceUrl,
    lockedAt,
  };
  const store = readJson<LockStore>(LOCK_KEY, {});
  const existing = store[brandKey(brandName)] ?? null;
  const lock = appendChosenMatch(existing, next);
  store[brandKey(brandName)] = lock;
  writeJson(LOCK_KEY, store);
  return lock;
}

export function clearMatchDayLock(brandName: string) {
  const store = readJson<LockStore>(LOCK_KEY, {});
  for (const key of Object.keys(store)) {
    const row = store[key];
    if (
      key === brandKey(brandName) ||
      brandsMatch(key, brandName) ||
      brandsMatch(row.brandKey, brandName)
    ) {
      store[key] = {
        ...row,
        clubName: "",
        matchLabel: row.competition || row.matchLabel,
        fixtureName: undefined,
        fixtureDate: undefined,
        kickoff: undefined,
        venue: undefined,
        sourceUrl: undefined,
        lockedAt: new Date().toISOString(),
        matches: row.matches ?? [],
      };
    }
  }
  writeJson(LOCK_KEY, store);
}

export function saveBrandLogo(brandName: string, logoDataUrl: string) {
  const store = readJson<Record<string, string>>(LOGO_KEY, {});
  store[brandKey(brandName)] = logoDataUrl;
  writeJson(LOGO_KEY, store);
}

export function loadBrandLogo(brandName: string): string | null {
  const store = readJson<Record<string, string>>(LOGO_KEY, {});
  const exact = store[brandKey(brandName)];
  if (exact) return exact;
  const match = Object.entries(store).find(([key]) => brandsMatch(key, brandName));
  return match?.[1] ?? null;
}

export function readLogoFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    return Promise.reject(new Error("Please upload an image file for your brand logo."));
  }
  if (file.size > 1_500_000) {
    return Promise.reject(new Error("Brand logo must be under 1.5 MB."));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read that logo."));
    reader.readAsDataURL(file);
  });
}

export function listNetworkInvites(): NetworkInvite[] {
  return readJson<NetworkInvite[]>(INVITE_KEY, []).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export function sendNetworkInvite(input: {
  fromClubId: string;
  fromClubName: string;
  fromDirectorName: string;
  toBrandName: string;
  toEmail: string;
  message: string;
}): NetworkInvite {
  const invite: NetworkInvite = {
    id: crypto.randomUUID(),
    fromClubId: input.fromClubId,
    fromClubName: input.fromClubName,
    fromDirectorName: input.fromDirectorName,
    toBrandName: input.toBrandName.trim(),
    toEmail: input.toEmail.trim(),
    message: input.message.trim(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  writeJson(INVITE_KEY, [invite, ...listNetworkInvites()].slice(0, 80));
  return invite;
}

export function listInvitesForSponsor(
  brandName: string,
  email?: string | null
): NetworkInvite[] {
  return listNetworkInvites().filter((invite) =>
    inviteMatchesSponsor(invite, brandName, email)
  );
}

export function respondToNetworkInvite({
  inviteId,
  brandName,
  email,
  accept,
  includeLeague,
}: {
  inviteId: string;
  brandName: string;
  email?: string | null;
  accept: boolean;
  includeLeague: boolean;
}): NetworkInvite | null {
  const invites = listNetworkInvites();
  const invite = invites.find((row) => row.id === inviteId) ?? null;
  if (!invite) return null;
  const next: NetworkInvite = {
    ...invite,
    status: accept ? "accepted" : "declined",
  };
  writeJson(
    INVITE_KEY,
    invites.map((row) => (row.id === inviteId ? next : row))
  );
  if (accept) {
    const network = ensureGoalNetwork({ brandName, email });
    saveGoalNetwork(acceptInviteIntoNetwork(network, invite, includeLeague));
  }
  return next;
}

export { brandKey };
