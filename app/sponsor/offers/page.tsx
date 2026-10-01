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
        Match Day five
      </p>
      <h1 className="mt-3 text-4xl font-black">New Sponsorship/Score Offer</h1>
      <p className="mt-4 text-slate-300">
        These are the 5 Climate Projects the Sustainability Director posted for
        this match. Read them, then sign off if you agree to go ahead.
      </p>

      {!offer ? (
        <p className="mt-10 rounded-2xl border border-slate-700 bg-slate-900 p-8 text-slate-400">
          No posted Climate Projects for the club you have locked in. Lock a
          club 72 hours before Match Day, and only that club&apos;s five will
          appear here after the Sustainability Director posts them to you.
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
