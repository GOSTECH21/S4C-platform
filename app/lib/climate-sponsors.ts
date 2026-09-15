/** Club climate-sponsor roster, Goal Sponsorship Network, and match-day lock-in. */

import { CURRENT_SEASON_LEAGUES, leagueForClubName } from "./current-season";
import { clubsMatch, normalizeClubName } from "./sponsor-dashboard";
import { MATCH_DAY_LEAD_HOURS } from "./partner-projects";

export const CLIMATE_SPONSOR_LEAD_HOURS = MATCH_DAY_LEAD_HOURS;

export const SUGGESTED_CLIMATE_BRANDS = [
  "Diageo",
  "Gillette",
  "Budweiser",
  "Puma",
];

export const MATCH_DAY_LOCK_LABELS = [
  "Premier League Match",
  "Champions League Match",
  "FA Cup Match",
  "Scottish Premiership Match",
  "La Liga Match",
  "Other Match Day",
];

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

export type MatchDayClubLock = {
  brandKey: string;
  clubName: string;
  matchLabel: string;
  lockedAt: string;
};

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
  const clubs = CURRENT_SEASON_LEAGUES[leagueName] ?? [];
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
    const league = leagueForClubName(invite.fromClubName);
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

export function offersForLockedSponsor<
  T extends { clubName: string; targetBrandNames?: string[] | null },
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
  return offers.filter((offer) =>
    sponsorCanReceiveClubPost({
      network,
      lock,
      clubName: offer.clubName,
      brandName,
      targetBrandNames: offer.targetBrandNames,
    })
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
  return `${hours} hours before kick-off, lock in one club from your Goal Sponsorship Network. Posted Climate Projects from other clubs will not reach this account while that lock is active.`;
}
