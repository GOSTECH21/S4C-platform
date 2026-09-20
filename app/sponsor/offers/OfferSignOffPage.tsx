"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getSponsorMatchOffer,
  type SponsorMatchOffer,
} from "@/app/services/sponsor-offers.service";
import {
  loadGoalNetwork,
  loadMatchDayLock,
} from "@/app/services/climate-sponsors.service";
import { sponsorCanReceiveClubPost } from "@/app/lib/climate-sponsors";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import {
  SPONSOR_DASHBOARD_PATH,
  SPONSOR_LOGIN_PATH,
  SPONSOR_OFFERS_PATH,
} from "@/app/lib/routes";
import {
  formatMoney,
  formatStipulatedRate,
} from "@/app/lib/sponsorship-auction";
import { OfferSignOffForm } from "./OfferSignOff";

export function OfferSignOffPage({ offerId }: { offerId?: string }) {
  const router = useRouter();
  const [offer, setOffer] = useState<SponsorMatchOffer | null>(null);
  const [brandDefault, setBrandDefault] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      let brand = "";
      try {
        const sponsor = await getCurrentSponsor();
        brand = String(sponsor.name ?? "");
        setBrandDefault(brand);
      } catch {
        router.replace(SPONSOR_LOGIN_PATH);
        return;
      }
      if (!offerId) {
        setOffer(null);
        setLoading(false);
        return;
      }
      const next = await getSponsorMatchOffer(offerId);
      const allowed =
        next &&
        sponsorCanReceiveClubPost({
          network: loadGoalNetwork(brand),
          lock: loadMatchDayLock(brand),
          clubName: next.clubName,
          brandName: brand,
          targetBrandNames: next.targetBrandNames,
        });
      setOffer(allowed ? next : null);
      setLoading(false);
    }
    load();
  }, [offerId, router]);

  if (loading) {
    return <p className="text-slate-400">Loading Climate Projects...</p>;
  }

  if (!offer) {
    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-black">Offer not found</h1>
        <p className="mt-3 text-slate-300">
          This sponsorship offer is not available for the club you have locked
          in. Open New Sponsorship/Score Offer from your dashboard.
        </p>
        <Link
          href={SPONSOR_OFFERS_PATH}
          className="mt-4 inline-block text-green-400"
        >
          Back to New Sponsorship/Score Offer
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link href={SPONSOR_DASHBOARD_PATH} className="text-sm font-semibold text-green-400">
        ← Back to dashboard
      </Link>
      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
        Option 1
      </p>
      <h1 className="mt-3 text-4xl font-black">{offer.headline}</h1>
      <p className="mt-4 text-slate-300">
        These are the 5 Climate Projects {offer.clubName} posted to fans.
        Agree to be Goal Sponsor for this match. You pay only for Goals scored
        by {offer.clubName} players: live £/Goal is max(
        {formatMoney(offer.sponsorshipAmountGbp)} Minimum,{" "}
        {offer.gbpPerVote
          ? formatStipulatedRate(offer.gbpPerVote)
          : "the stipulated £/Vote"}{" "}
        × fans who voted).
      </p>
      <OfferSignOffForm offer={offer} brandDefault={brandDefault} showProjects />
    </div>
  );
}
