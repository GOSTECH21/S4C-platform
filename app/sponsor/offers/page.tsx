"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import {
  loadSponsorFolder,
  type SponsorMatchOffer,
} from "@/app/services/sponsor-offers.service";
import {
  SPONSOR_DASHBOARD_PATH,
  SPONSOR_LOGIN_PATH,
  SPONSOR_OFFER_SIGN_SECTION_ID,
  sponsorOfferSignOffPath,
} from "@/app/lib/routes";
import { formatLongMatchDate } from "@/app/lib/s4p-climate-projects";
import { OfferProjectList, OfferSignOffForm } from "./OfferSignOff";

export default function NewSponsorshipOfferPage() {
  const router = useRouter();
  const [pending, setPending] = useState<SponsorMatchOffer[]>([]);
  const [brandDefault, setBrandDefault] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const sponsor = await getCurrentSponsor();
        const brand = String(sponsor.name ?? "");
        setBrandDefault(brand);
        const folder = await loadSponsorFolder({
          sponsorId: String(sponsor.id ?? ""),
          brandName: brand,
        });
        setPending(folder.pending);
      } catch {
        router.replace(SPONSOR_LOGIN_PATH);
        return;
      }
      setLoading(false);
    }
    load();
  }, [router]);

  useEffect(() => {
    if (loading || pending.length === 0) return;
    const scroll = () =>
      document.getElementById(SPONSOR_OFFER_SIGN_SECTION_ID)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    const frame = window.requestAnimationFrame(scroll);
    const timer = window.setTimeout(scroll, 400);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [loading, pending]);

  if (loading) {
    return <p className="text-slate-400">Loading New Sponsorship/Score Offer...</p>;
  }

  const offer = pending[0] ?? null;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={SPONSOR_DASHBOARD_PATH}
        className="text-sm font-semibold text-green-400"
      >
        ← Back to dashboard
      </Link>
      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
        Match Day record
      </p>
      <h1 className="mt-3 text-4xl font-black">Match Day Climate Projects</h1>
      <p className="mt-4 text-slate-300">
        You sponsor this Club&apos;s Match Day carbon footprint offset. When
        the Sustainability Director chooses the five Climate Projects for that
        Match, they appear here as your record — and Fans FUND-IT onto them.
        Sign off your sponsorship after the wallet deposit; you do not wait
        for this list.
      </p>

      {!offer ? (
        <p className="mt-10 rounded-2xl border border-slate-700 bg-slate-900 p-8 text-slate-400">
          No Climate Projects on record yet for the Match you locked in. Lock
          a Club and Match, deposit your Commitment Fee and Goals-scored
          Sponsorship, and sign off. This list fills when the Sustainability
          Director chooses the five Climate Projects for that Match Day.
        </p>
      ) : (
        <OfferPreview offer={offer} brandDefault={brandDefault} />
      )}

      {pending.length > 1 && (
        <section className="mt-12">
          <h2 className="text-2xl font-black">Other open offers</h2>
          <div className="mt-4 space-y-3">
            {pending.slice(1).map((row) => (
              <Link
                key={row.id}
                href={sponsorOfferSignOffPath(row.id)}
                className="block rounded-2xl border border-slate-700 bg-slate-900 p-5 hover:border-green-500"
              >
                <h3 className="text-lg font-bold">{row.headline}</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {formatLongMatchDate(row.matchDate) || row.clubName}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function OfferPreview({
  offer,
  brandDefault,
}: {
  offer: SponsorMatchOffer;
  brandDefault: string;
}) {
  const when = formatLongMatchDate(offer.matchDate);
  return (
    <div className="mt-10">
      <h2 className="text-2xl font-black">{offer.headline}</h2>
      {when && <p className="mt-2 text-slate-400">{when}</p>}
      <div className="mt-8">
        <OfferProjectList offer={offer} />
      </div>
      <OfferSignOffForm offer={offer} brandDefault={brandDefault} />
    </div>
  );
}
