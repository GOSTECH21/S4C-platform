"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  listOfferSignatures,
  signSponsorOffer,
  type SponsorMatchOffer,
} from "@/app/services/sponsor-offers.service";
import { SPONSOR_DASHBOARD_PATH } from "@/app/lib/routes";
import { climateProjectCountryLabel } from "@/app/lib/featured-climate-country";
import { isFeaturedClimateProject } from "@/app/services/votes.service";
import {
  formatMoney,
  formatStipulatedRate,
} from "@/app/lib/sponsorship-auction";

export const GOAL_SPONSOR_TERMS = `S4P Goal Sponsor Terms and Conditions: by signing you agree to sponsor Goals scored by this club's players during the named match. The amount payable per Goal is the Sustainability Director's stipulated amount per Vote multiplied by the number of fans who voted, never less than the posted Minimum Amount. You pay that live amount for each Goal scored. If the club does not score, you pay nothing. You may then display your brand name as SPONSORED BY on those five Climate Projects. You may withdraw before kick-off by writing to the club Sustainability Director.`;

export function OfferProjectList({ offer }: { offer: SponsorMatchOffer }) {
  return (
    <div className="space-y-4">
      {offer.projects.map((project) => (
        <div
          key={project.id}
          className="rounded-2xl border border-slate-700 bg-slate-900 p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-2xl font-bold">{project.name}</h2>
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
  );
}

export function OfferSignOffForm({
  offer,
  brandDefault,
  showProjects = false,
}: {
  offer: SponsorMatchOffer;
  brandDefault: string;
  showProjects?: boolean;
}) {
  const [signerName, setSignerName] = useState("");
  const [brandName, setBrandName] = useState(brandDefault);
  const [accepted, setAccepted] = useState(false);
  const [signedBrand, setSignedBrand] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBrandName(brandDefault);
  }, [brandDefault]);

  useEffect(() => {
    let cancelled = false;
    listOfferSignatures().then((signatures) => {
      if (cancelled) return;
      const signed = signatures.find((row) => row.offerId === offer.id);
      if (signed) {
        setSignedBrand(signed.brandName);
        setSignerName(signed.signerName);
        setBrandName(signed.brandName);
        setAccepted(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [offer.id]);

  async function sign(event: React.FormEvent) {
    event.preventDefault();
    if (!accepted) return;
    setSaving(true);
    setError(null);
    try {
      const signed = await signSponsorOffer({
        offerId: offer.id,
        signerName,
        brandName: brandName || brandDefault,
      });
      setSignedBrand(signed.brandName);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save your signature."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {showProjects && (
        <div className="mt-8">
          <OfferProjectList offer={offer} />
        </div>
      )}

      {signedBrand ? (
        <div className="mt-10 rounded-2xl border border-green-500/40 bg-green-500/10 p-8">
          <h2 className="text-2xl font-black">Signed as Goal Sponsor</h2>
          <p className="mt-3 text-lg font-semibold text-amber-300">
            SPONSORED BY {signedBrand}
          </p>
          <p className="mt-2 text-slate-300">
            Fans of {offer.clubName} will see this brand name alongside each of
            the 5 Climate Projects. This copy is now lodged in your Dashboard
            folder, and the club Sustainability Director has a signed copy.
          </p>
          <Link
            href={`${SPONSOR_DASHBOARD_PATH}#signed-folder`}
            className="mt-5 inline-flex rounded-xl bg-green-500 px-5 py-3 font-bold text-slate-950"
          >
            Open Dashboard folder
          </Link>
        </div>
      ) : (
        <form
          onSubmit={sign}
          className="mt-10 space-y-5 rounded-2xl border border-slate-700 bg-slate-900 p-8"
        >
          <h2 className="text-2xl font-black">Agree to be Goal Sponsor</h2>
          <p className="text-slate-300">
            Amount payable per Goal is max(
            {formatMoney(offer.sponsorshipAmountGbp)} Minimum,{" "}
            {offer.gbpPerVote
              ? formatStipulatedRate(offer.gbpPerVote)
              : "the stipulated £/Vote"}{" "}
            × fans who voted). Terms and Conditions apply.
          </p>
          <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-400">
            {GOAL_SPONSOR_TERMS}
          </div>
          <label className="flex items-start gap-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              className="mt-1"
              required
            />
            I have read and agree to the Terms and Conditions.
          </label>
          <label className="block text-sm text-slate-400">
            Signature (type your full name)
            <input
              value={signerName}
              onChange={(event) => setSignerName(event.target.value)}
              className="mt-2 w-full rounded-lg bg-slate-800 p-3 font-serif text-2xl text-white"
              required
            />
          </label>
          <label className="block text-sm text-slate-400">
            Brand name for SPONSORED BY
            <input
              value={brandName}
              onChange={(event) => setBrandName(event.target.value)}
              className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
              placeholder="Gillette"
              required
            />
          </label>
          {error && <p className="text-sm font-semibold text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={saving || !accepted}
            className="w-full rounded-xl bg-green-500 py-4 font-bold text-slate-950 disabled:opacity-70"
          >
            {saving ? "Saving signature..." : "Agree and sign off"}
          </button>
        </form>
      )}
    </div>
  );
}
