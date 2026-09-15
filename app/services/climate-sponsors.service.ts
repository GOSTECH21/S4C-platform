import {
  addClubsToNetwork,
  acceptInviteIntoNetwork,
  brandKey,
  emptySponsor,
  inviteMatchesSponsor,
  removeSponsor,
  toggleSelectedSponsor,
  upsertSponsor,
  type ClubClimateSponsor,
  type ClubSponsorRoster,
  type GoalSponsorshipNetwork,
  type MatchDayClubLock,
  type NetworkInvite,
} from "../lib/climate-sponsors";

const ROSTER_KEY = "s4p.club.climateSponsors";
const NETWORK_KEY = "s4p.sponsor.goalNetwork";
const LOCK_KEY = "s4p.sponsor.matchLock";
const INVITE_KEY = "s4p.network.invites";

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
  return { clubId, clubName, sponsors: [], selectedIds: [] };
}

export function saveClubSponsorRoster(roster: ClubSponsorRoster) {
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
  const store = readJson<RosterStore>(ROSTER_KEY, {});
  return (
    Object.values(store).find((row) =>
      row.clubName.toLowerCase() === clubName.toLowerCase() ||
      row.clubName.toLowerCase().includes(clubName.toLowerCase()) ||
      clubName.toLowerCase().includes(row.clubName.toLowerCase())
    ) ?? null
  );
}

export function loadGoalNetwork(
  brandName: string,
  email?: string | null
): GoalSponsorshipNetwork | null {
  const store = readJson<NetworkStore>(NETWORK_KEY, {});
  const byBrand = store[brandKey(brandName)];
  if (byBrand) return byBrand;
  if (email) {
    return (
      Object.values(store).find(
        (row) => (row.email ?? "").toLowerCase() === email.toLowerCase()
      ) ?? null
    );
  }
  return null;
}

export function saveGoalNetwork(network: GoalSponsorshipNetwork) {
  const store = readJson<NetworkStore>(NETWORK_KEY, {});
  store[brandKey(network.brandName)] = {
    ...network,
    brandKey: brandKey(network.brandName),
  };
  writeJson(NETWORK_KEY, store);
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
    clubNames
  );
  saveGoalNetwork(next);
  return next;
}

export function loadMatchDayLock(brandName: string): MatchDayClubLock | null {
  const store = readJson<LockStore>(LOCK_KEY, {});
  return store[brandKey(brandName)] ?? null;
}

export function lockMatchDayClub({
  brandName,
  clubName,
  matchLabel,
}: {
  brandName: string;
  clubName: string;
  matchLabel: string;
}): MatchDayClubLock {
  const lock: MatchDayClubLock = {
    brandKey: brandKey(brandName),
    clubName,
    matchLabel,
    lockedAt: new Date().toISOString(),
  };
  const store = readJson<LockStore>(LOCK_KEY, {});
  store[brandKey(brandName)] = lock;
  writeJson(LOCK_KEY, store);
  return lock;
}

export function clearMatchDayLock(brandName: string) {
  const store = readJson<LockStore>(LOCK_KEY, {});
  delete store[brandKey(brandName)];
  writeJson(LOCK_KEY, store);
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
