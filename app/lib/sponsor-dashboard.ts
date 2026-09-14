import { OPENING_SPONSORSHIP } from "./sponsorship-auction";

export type FolderProject = {
  id: string;
  name: string;
  description?: string | null;
  country?: string | null;
  category?: string | null;
  estimated_co2?: number | null;
};

export type FolderOffer = {
  id: string;
  clubId: string;
  clubName: string;
  headline: string;
  matchTitle: string;
  matchDate: string | null;
  projectIds: string[];
  projects: FolderProject[];
  postedAt: string;
  sponsorshipAmountGbp?: number | null;
};

export type FolderSignature = {
  id: string;
  offerId: string;
  sponsorId: string | null;
  signerName: string;
  brandName: string;
  acceptedTerms: boolean;
  signedAt: string;
};

export type SignedSponsorship = {
  offer: FolderOffer;
  signature: FolderSignature;
};

export type SponsorDashboardStats = {
  projectCount: number;
  carbonTonnes: number;
  expenditureGbp: number;
  fanVotes: number;
};

export function clubsMatch(left: string, right: string): boolean {
  const a = left.trim().toLowerCase();
  const b = right.trim().toLowerCase();
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

export function pairSignedSponsorships(
  offers: FolderOffer[],
  signatures: FolderSignature[],
  filter?: { sponsorId?: string | null; clubId?: string; clubName?: string }
): SignedSponsorship[] {
  return signatures
    .map((signature) => {
      const offer = offers.find((row) => row.id === signature.offerId);
      if (!offer) return null;
      if (
        filter?.sponsorId &&
        signature.sponsorId &&
        signature.sponsorId !== filter.sponsorId
      ) {
        return null;
      }
      if (filter?.clubId || filter?.clubName) {
        const clubIdMatch = Boolean(
          filter.clubId && offer.clubId && offer.clubId === filter.clubId
        );
        const clubNameMatch = Boolean(
          filter.clubName && clubsMatch(offer.clubName, filter.clubName)
        );
        if (!clubIdMatch && !clubNameMatch) return null;
      }
      return { offer, signature };
    })
    .filter((row): row is SignedSponsorship => Boolean(row))
    .sort((a, b) => b.signature.signedAt.localeCompare(a.signature.signedAt));
}

export function unsignedMatchOffers(
  offers: FolderOffer[],
  signatures: FolderSignature[]
): FolderOffer[] {
  const signedIds = new Set(signatures.map((row) => row.offerId));
  return offers.filter((offer) => !signedIds.has(offer.id));
}

export function sponsorshipFolderStats(
  signed: SignedSponsorship[],
  fanVotes = 0
): SponsorDashboardStats {
  const projectIds = new Set<string>();
  let carbonTonnes = 0;
  let expenditureGbp = 0;
  for (const row of signed) {
    expenditureGbp +=
      Number(row.offer.sponsorshipAmountGbp) || OPENING_SPONSORSHIP;
    for (const project of row.offer.projects) {
      if (projectIds.has(project.id)) continue;
      projectIds.add(project.id);
      carbonTonnes += Number(project.estimated_co2) || 0;
    }
  }
  return {
    projectCount: projectIds.size,
    carbonTonnes,
    expenditureGbp,
    fanVotes,
  };
}

export function signedCopyDownloadName(clubName: string, brandName: string) {
  const slug = `${clubName}-${brandName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `s4p-signed-sponsorship-${slug || "copy"}.json`;
}

export function signedCopyPayload(copy: SignedSponsorship) {
  return {
    title: "S4P signed sponsorship copy",
    club: copy.offer.clubName,
    match: copy.offer.headline,
    matchDate: copy.offer.matchDate,
    brand: copy.signature.brandName,
    signedBy: copy.signature.signerName,
    signedAt: copy.signature.signedAt,
    termsAccepted: copy.signature.acceptedTerms,
    sponsorshipAmountGbp:
      Number(copy.offer.sponsorshipAmountGbp) || OPENING_SPONSORSHIP,
    climateProjects: copy.offer.projects.map((project) => ({
      name: project.name,
      country: project.country,
      estimated_co2: project.estimated_co2,
    })),
  };
}
