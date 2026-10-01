import {
  LEAD_CLIMATE_SPONSOR_LABEL,
  LOCAL_BUSINESS_SPONSOR_LABEL,
} from "../lib/dual-sponsor";
import {
  isExampleLocalBrand,
  isLeadClimateBrand,
  isLocalBusinessBrand,
} from "../lib/match-day-branding";
import { allLocalSponsors } from "../lib/local-sponsor";
import {
  rankSponsorDonations,
  type SponsorDonationEntry,
  type SponsorLeaderboardRow,
} from "../lib/sponsor-leaderboard";
import {
  listClubSponsorRosters,
  loadBrandLogo,
} from "./climate-sponsors.service";
import {
  listOfferSignatures,
  listSponsorMatchOffers,
} from "./sponsor-offers.service";

function kindForBrand(brandName: string, clubName: string): SponsorDonationEntry["kind"] {
  if (isLeadClimateBrand(brandName) || !isLocalBusinessBrand(brandName, clubName)) {
    return LEAD_CLIMATE_SPONSOR_LABEL;
  }
  return LOCAL_BUSINESS_SPONSOR_LABEL;
}

export function localSponsorDonationEntries(): SponsorDonationEntry[] {
  const entries: SponsorDonationEntry[] = [];
  for (const roster of listClubSponsorRosters()) {
    for (const sponsor of roster.sponsors ?? []) {
      if (isExampleLocalBrand(sponsor.brandName)) continue;
      entries.push({
        brandName: sponsor.brandName,
        donationGbp: Number(sponsor.spentGbp) || 0,
        clubName: roster.clubName,
        logoUrl: sponsor.logoUrl || loadBrandLogo(sponsor.brandName),
        kind: kindForBrand(sponsor.brandName, roster.clubName),
      });
    }
  }
  for (const local of allLocalSponsors()) {
    if (isExampleLocalBrand(local.brandName)) continue;
    entries.push({
      brandName: local.brandName,
      donationGbp: Number(local.pledgeGbp) || 0,
      clubName: local.clubName,
      logoUrl: local.logoUrl || loadBrandLogo(local.brandName),
      kind: LOCAL_BUSINESS_SPONSOR_LABEL,
    });
  }
  return entries;
}

export async function loadSponsorLeaderboard(): Promise<SponsorLeaderboardRow[]> {
  const entries = localSponsorDonationEntries();
  try {
    const [offers, signatures] = await Promise.all([
      listSponsorMatchOffers(),
      listOfferSignatures(),
    ]);
    for (const signature of signatures) {
      if (!signature.brandName.trim() || isExampleLocalBrand(signature.brandName)) {
        continue;
      }
      const offer = offers.find((row) => row.id === signature.offerId);
      entries.push({
        brandName: signature.brandName,
        donationGbp: Number(offer?.sponsorshipAmountGbp) || 0,
        clubName: offer?.clubName ?? null,
        logoUrl: loadBrandLogo(signature.brandName),
        kind: kindForBrand(signature.brandName, offer?.clubName ?? ""),
      });
    }
  } catch {
    // Roster and local pledges still rank when signed offers cannot be loaded.
  }
  return rankSponsorDonations(entries);
}
