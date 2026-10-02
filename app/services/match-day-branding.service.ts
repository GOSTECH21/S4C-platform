import {
  selectedSponsors,
  type ClubClimateSponsor,
} from "../lib/climate-sponsors";
import {
  resolveMatchDayBranding,
  resolveLeadClimateSponsor,
  uploadedLocalSponsorsForClub,
  isLeadClimateBrand,
  isRegisteredLocalSponsor,
} from "../lib/match-day-branding";
import type { MatchDayLocalAssignment } from "../lib/match-day-local-sponsors";
import {
  loadBrandLogo,
  loadClubSponsorRoster,
  lockedBrandNameForClub,
  lockedBrandNameForClubAndMatch,
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
  fixtureName = null,
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
  fixtureName?: string | null;
}) {
  const roster = loadClubSponsorRoster(clubId || clubName, clubName);
  const matchBrand = lockedBrandNameForClubAndMatch(clubName, fixtureName);
  const namedFixture = Boolean(String(fixtureName ?? "").trim());
  const useClubFallback = !namedFixture || Boolean(matchBrand);
  return resolveMatchDayBranding({
    clubName,
    projects,
    rosterSponsors: roster.sponsors,
    selected: selectedSponsors(roster),
    lockedBrandName: matchBrand,
    signedBrandName: useClubFallback ? signedBrandName : null,
    storedLeadName: useClubFallback ? storedLeadName : null,
    storedLeadLogoUrl: useClubFallback ? storedLeadLogoUrl : null,
    campaignSponsorName: useClubFallback ? campaignSponsorName : null,
    campaignSponsorLogoUrl: useClubFallback ? campaignSponsorLogoUrl : null,
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
  const locals = uploadedLocalSponsorsForClub(clubName, roster.sponsors);
  const leadName = resolveLeadClimateSponsor({
    clubName,
    rosterSponsors: roster.sponsors,
    selected,
    lockedBrandName: lockedBrandNameForClub(clubName),
    extraBrandNames: locals.map((row) => row.brandName),
  });
  const lead = roster.sponsors.find(
    (row) => row.brandName.trim().toLowerCase() === (leadName ?? "").toLowerCase()
  );
  return {
    leadName,
    leadLogoUrl:
      lead?.logoUrl || (leadName ? loadBrandLogo(leadName) : null) || null,
    locals: locals.filter(
      (row) =>
        isRegisteredLocalSponsor(row) &&
        !isLeadClimateBrand(row.brandName) &&
        row.brandName.trim().toLowerCase() !== (leadName ?? "").toLowerCase()
    ),
    selected,
  };
}
