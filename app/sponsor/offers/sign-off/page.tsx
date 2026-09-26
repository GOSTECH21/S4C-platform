import { OfferSignOffPage } from "../OfferSignOffPage";

export default async function SponsorOfferSignOffRoute({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = params.id;
  const offerId = Array.isArray(raw) ? raw[0] : raw;
  return <OfferSignOffPage offerId={offerId} />;
}
