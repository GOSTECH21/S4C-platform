"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutSponsor } from "@/app/services/sponsor-auth.service";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import {
  listOfferSignatures,
  listSponsorMatchOffers,
  type SponsorMatchOffer,
  type SponsorOfferSignature,
} from "@/app/services/sponsor-offers.service";
import {
  SPONSOR_CREATE_CAMPAIGN_PATH,
  SPONSOR_LOGIN_PATH,
  SPONSOR_OFFERS_PATH,
} from "@/app/lib/routes";
import { formatLongMatchDate } from "@/app/lib/s4p-climate-projects";

export default function SponsorDashboardPage() {
  const router = useRouter();
  const [brand, setBrand] = useState("your brand");
  const [role, setRole] = useState("Sponsorship Manager");
  const [offers, setOffers] = useState<SponsorMatchOffer[]>([]);
  const [signatures, setSignatures] = useState<SponsorOfferSignature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const sponsor = await getCurrentSponsor();
        setBrand(String(sponsor.name ?? "your brand"));
        if (sponsor.industry) setRole(String(sponsor.industry));
      } catch {
        router.replace(SPONSOR_LOGIN_PATH);
        return;
      }
      try {
        const [nextOffers, nextSignatures] = await Promise.all([
          listSponsorMatchOffers(),
          listOfferSignatures(),
        ]);
        setOffers(nextOffers);
        setSignatures(nextSignatures);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load offers.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function logout() {
    await logoutSponsor();
    router.push(SPONSOR_LOGIN_PATH);
  }

  if (loading) {
    return <p className="text-slate-400">Loading sponsor dashboard...</p>;
  }

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
            {role}; {brand}
          </p>
          <h1 className="mt-3 text-4xl font-black">Sponsor dashboard</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            When a Sustainability Director posts 5 Climate Projects, you receive
            them at the same time as the club&apos;s fans. Or create your own 5
            and send that list to the Sustainability Director.
          </p>
        </div>
        <button
          onClick={() => void logout()}
          className="rounded-xl bg-red-500 px-5 py-3 font-semibold"
        >
          Logout
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
            Option 1
          </p>
          <h2 className="mt-3 text-2xl font-black">Receive the club&apos;s 5</h2>
          <p className="mt-3 text-slate-300">
            Open the same 5 Climate Projects the Sustainability Director posted
            to fans. Sign as Goal Sponsor. Terms and Conditions apply. Then add
            your brand name for SPONSORED BY.
          </p>
        </div>
        <Link
          href={SPONSOR_CREATE_CAMPAIGN_PATH}
          className="rounded-3xl border border-slate-700 bg-slate-900 p-8 hover:border-green-500"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
            Option 2
          </p>
          <h2 className="mt-3 text-2xl font-black">
            Create Your Sponsorship Campaign
          </h2>
          <p className="mt-3 text-slate-300">
            Choose 5 Climate Projects yourself — Global Schools Solar plus 4
            from List 1 (local) and List 2 (international) — and send them to
            the Sustainability Director to push to fans.
          </p>
        </Link>
      </section>

      <section className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
        <h2 className="text-3xl font-black">Match offers from clubs</h2>
        <p className="mt-2 text-slate-400">
          These arrive when a Sustainability Director posts their 5 Climate
          Projects.
        </p>
        {offers.length === 0 ? (
          <p className="mt-6 text-slate-500">
            No club has posted 5 Climate Projects yet. When they do, a Click
            here link appears in this inbox.
          </p>
        ) : (
          <div className="mt-8 space-y-4">
            {offers.map((offer) => {
              const signed = signatures.find((row) => row.offerId === offer.id);
              const when = formatLongMatchDate(offer.matchDate);
              return (
                <div
                  key={offer.id}
                  className="rounded-2xl border border-slate-700 bg-slate-950 p-6"
                >
                  <p className="text-sm text-slate-400">
                    {role}; {brand}
                  </p>
                  <h3 className="mt-2 text-xl font-bold">{offer.headline}</h3>
                  {when && (
                    <p className="mt-1 text-sm text-slate-400">{when}</p>
                  )}
                  {signed ? (
                    <p className="mt-3 font-semibold text-green-300">
                      Signed — SPONSORED BY {signed.brandName}
                    </p>
                  ) : null}
                  <Link
                    href={`${SPONSOR_OFFERS_PATH}/${offer.id}`}
                    className="mt-4 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-bold hover:bg-blue-500"
                  >
                    Click here
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
