import { redirect } from "next/navigation";
import { sponsorOfferSignOffPath } from "@/app/lib/routes";

export default async function SponsorOfferIdRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(sponsorOfferSignOffPath(id));
}
