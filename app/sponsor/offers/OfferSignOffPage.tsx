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
import { readClimateWallet } from "@/app/services/sponsor-wallet.service";
import { sponsorCanReceiveClubPost } from "@/app/lib/climate-sponsors";
import { resolveCommittedMatchFunding } from "@/app/lib/sponsor-completion-flow";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import {
  SPONSOR_DASHBOARD_PATH,
  SPONSOR_LOGIN_PATH,
  SPONSOR_OFFERS_PATH,
} from "@/app/lib/routes";
import {
  formatLocalSponsorPayableCopy,
  formatSponsorPayableCopy,
} from "@/app/lib/sponsorship-auction";
import {
  localSignOffSponsorshipGbp,
  readLocalSponsorRecord,
} from "@/app/lib/local-sponsor";
import { isLocalClimateSponsor, sponsorHomePath } from "@/app/lib/sponsor-home";
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

  const localSponsor = isLocalClimateSponsor(brandDefault);
  const wallet = readClimateWallet(offer.clubName, brandDefault);
  const payableCopy = localSponsor
    ? formatLocalSponsorPayableCopy({
        sponsorshipGbp: localSignOffSponsorshipGbp({
          wallet,
          record: readLocalSponsorRecord(),
        }),
        clubName: offer.clubName,
      })
    : formatSponsorPayableCopy({
        ...resolveCommittedMatchFunding({
          lock: loadMatchDayLock(brandDefault),
          wallet,
          offer,
        }),
        clubName: offer.clubName,
      });

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={sponsorHomePath(brandDefault) || SPONSOR_DASHBOARD_PATH}
        className="text-sm font-semibold text-green-400"
      >
        ← Back to dashboard
      </Link>
      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
        Match Day carbon footprint offset
      </p>
      <h1 className="mt-3 text-4xl font-black">{offer.headline}</h1>
      <p className="mt-4 text-slate-300">
        Sign off your sponsorship of {offer.clubName}&apos;s Match Day carbon
        footprint offset.{" "}
        {offer.projects.length > 0
          ? `The Climate Projects below are the Sustainability Director's chosen five for this Match — your record, and the list Fans FUND-IT onto. `
          : `The club's five chosen Climate Projects will appear here as your record when the Sustainability Director chooses them. `}
        {payableCopy}
      </p>
      <OfferSignOffForm
        offer={offer}
        brandDefault={brandDefault}
        showProjects={offer.projects.length > 0}
      />
    </div>
  );
}
