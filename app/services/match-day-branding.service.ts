import {
  selectedSponsors,
  type ClubClimateSponsor,
} from "../lib/climate-sponsors";
import {
  resolveMatchDayBranding,
  resolveLeadClimateSponsor,
  uploadedLocalSponsorsForClub,
} from "../lib/match-day-branding";
import type { MatchDayLocalAssignment } from "../lib/match-day-local-sponsors";
import {
  loadBrandLogo,
  loadClubSponsorRoster,
  lockedBrandNameForClub,
} from "./climate-sponsors.service";

export function liveMatchDayBranding<T extends { id: string }>({
  clubId,
  clubName,
  projects,
  storedLeadName = null,
  storedLeadLogoUrl = null,
  campaignSponsorName = null,
  campaignSponsorLogoUrl = null,
  storedLocals = null,
  signedBrandName = null,
}: {
  clubId?: string | null;
  clubName: string;
  projects: T[];
  storedLeadName?: string | null;
  storedLeadLogoUrl?: string | null;
  campaignSponsorName?: string | null;
  campaignSponsorLogoUrl?: string | null;
  storedLocals?: MatchDayLocalAssignment[] | null;
  signedBrandName?: string | null;
}) {
  const roster = loadClubSponsorRoster(clubId || clubName, clubName);
  return resolveMatchDayBranding({
    clubName,
    projects,
    rosterSponsors: roster.sponsors,
    selected: selectedSponsors(roster),
    lockedBrandName: lockedBrandNameForClub(clubName),
    signedBrandName,
    storedLeadName,
    storedLeadLogoUrl,
    campaignSponsorName,
    campaignSponsorLogoUrl,
    storedLocals,
    loadLogo: loadBrandLogo,
  });
}

export function liveLeadAndLocals(clubId: string, clubName: string): {
  leadName: string | null;
  leadLogoUrl: string | null;
  locals: ReturnType<typeof uploadedLocalSponsorsForClub>;
  selected: ClubClimateSponsor[];
} {
  const roster = loadClubSponsorRoster(clubId, clubName);
  const selected = selectedSponsors(roster);
  const leadName = resolveLeadClimateSponsor({
    clubName,
    rosterSponsors: roster.sponsors,
    selected,
    lockedBrandName: lockedBrandNameForClub(clubName),
  });
  const lead = roster.sponsors.find(
    (row) => row.brandName.trim().toLowerCase() === (leadName ?? "").toLowerCase()
  );
  return {
    leadName,
    leadLogoUrl:
      lead?.logoUrl || (leadName ? loadBrandLogo(leadName) : null) || null,
    locals: uploadedLocalSponsorsForClub(clubName, roster.sponsors),
    selected,
  };
}
