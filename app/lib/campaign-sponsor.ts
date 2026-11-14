import { seasonNamesMatch } from "./current-season";

export type SponsorOfferRef = {
  id: string;
  clubName: string;
  postedAt?: string | null;
  targetBrandNames?: string[] | null;
};

export type SponsorSignatureRef = {
  offerId: string;
  brandName: string;
};

export function offerBelongsToClub(offerClubName: string, clubName: string): boolean {
  if (!offerClubName.trim() || !clubName.trim()) return false;
  // Alias match only. Substring match would treat Rangers as Queens Park Rangers.
  return seasonNamesMatch(offerClubName, clubName);
}

/** Signed brand on the latest club offer, else the brand the SD posted that five to. */
export function signedOrPostedBrandForClub(
  clubName: string,
  offers: SponsorOfferRef[],
  signatures: SponsorSignatureRef[],
  isLeadCandidate?: (brandName: string) => boolean
): string | null {
  const ok = (name: string) =>
    Boolean(name.trim()) && (!isLeadCandidate || isLeadCandidate(name));
  const clubOffers = offers
    .filter((offer) => offerBelongsToClub(offer.clubName, clubName))
    .sort((left, right) =>
      String(right.postedAt ?? "").localeCompare(String(left.postedAt ?? ""))
    );
  const latest = clubOffers[0];
  if (latest) {
    const signed = signatures.find(
      (row) => row.offerId === latest.id && ok(row.brandName)
    );
    if (signed?.brandName.trim()) return signed.brandName.trim();
    const posted = (latest.targetBrandNames ?? [])
      .map((name) => name.trim())
      .find((name) => ok(name));
    if (posted) return posted;
  }
  for (const offer of clubOffers) {
    const signed = signatures.find(
      (row) => row.offerId === offer.id && ok(row.brandName)
    );
    if (signed?.brandName.trim()) return signed.brandName.trim();
  }
  return null;
}
