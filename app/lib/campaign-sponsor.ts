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
  if (seasonNamesMatch(offerClubName, clubName)) return true;
  const offer = offerClubName.toLowerCase();
  const club = clubName.toLowerCase();
  return offer.includes(club) || club.includes(offer);
}

function firstBrand(names: string[] | null | undefined): string | null {
  const brand = (names ?? []).map((name) => name.trim()).find(Boolean);
  return brand || null;
}

/** Signed brand on the latest club offer, else the brand the SD posted that five to. */
export function signedOrPostedBrandForClub(
  clubName: string,
  offers: SponsorOfferRef[],
  signatures: SponsorSignatureRef[]
): string | null {
  const clubOffers = offers
    .filter((offer) => offerBelongsToClub(offer.clubName, clubName))
    .sort((left, right) =>
      String(right.postedAt ?? "").localeCompare(String(left.postedAt ?? ""))
    );
  const latest = clubOffers[0];
  if (latest) {
    const signed = signatures.find(
      (row) => row.offerId === latest.id && row.brandName.trim()
    );
    if (signed?.brandName.trim()) return signed.brandName.trim();
    const posted = firstBrand(latest.targetBrandNames);
    if (posted) return posted;
  }
  for (const offer of clubOffers) {
    const signed = signatures.find(
      (row) => row.offerId === offer.id && row.brandName.trim()
    );
    if (signed?.brandName.trim()) return signed.brandName.trim();
  }
  return null;
}
