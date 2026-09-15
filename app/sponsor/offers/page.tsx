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
  SPONSOR_OFFERS_PATH,
} from "@/app/lib/routes";
import { climateProjectCountryLabel } from "@/app/lib/featured-climate-country";
import { formatLongMatchDate } from "@/app/lib/s4p-climate-projects";
import { isFeaturedClimateProject } from "@/app/services/votes.service";

export default function NewSponsorshipOfferPage() {
  const router = useRouter();
  const [pending, setPending] = useState<SponsorMatchOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const sponsor = await getCurrentSponsor();
        const folder = await loadSponsorFolder({
          sponsorId: String(sponsor.id ?? ""),
          brandName: String(sponsor.name ?? ""),
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
        Option 1
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
        <OfferPreview offer={offer} />
      )}

      {pending.length > 1 && (
        <section className="mt-12">
          <h2 className="text-2xl font-black">Other open offers</h2>
          <div className="mt-4 space-y-3">
            {pending.slice(1).map((row) => (
              <Link
                key={row.id}
                href={`${SPONSOR_OFFERS_PATH}/${row.id}`}
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

function OfferPreview({ offer }: { offer: SponsorMatchOffer }) {
  const when = formatLongMatchDate(offer.matchDate);
  return (
    <div className="mt-10">
      <h2 className="text-2xl font-black">{offer.headline}</h2>
      {when && <p className="mt-2 text-slate-400">{when}</p>}
      <div className="mt-8 space-y-4">
        {offer.projects.map((project) => (
          <div
            key={project.id}
            className="rounded-2xl border border-slate-700 bg-slate-900 p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-2xl font-bold">{project.name}</h3>
              {isFeaturedClimateProject({
                name: project.name,
                featured: false,
              }) && (
                <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-400">
                  Featured
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-400">
              📍 {climateProjectCountryLabel(project, { clubName: offer.clubName })}
            </p>
            <p className="mt-3 text-slate-300">{project.description}</p>
          </div>
        ))}
      </div>
      <Link
        href={`${SPONSOR_OFFERS_PATH}/${offer.id}`}
        className="mt-8 inline-flex rounded-xl bg-green-500 px-6 py-4 font-bold text-slate-950 hover:bg-green-400"
      >
        Agree and sign off
      </Link>
    </div>
  );
}
