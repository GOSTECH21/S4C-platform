"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  getSponsorMatchOffer,
  listOfferSignatures,
  signSponsorOffer,
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
} from "@/app/lib/routes";
import { climateProjectCountryLabel } from "@/app/lib/featured-climate-country";
import { isFeaturedClimateProject } from "@/app/services/votes.service";

const TERMS = `S4P Goal Sponsor Terms and Conditions: by signing you agree to sponsor Goals scored by this club's players during the named match, at the posted minimum sponsorship amount per Goal, unlocking funding for the Climate Project that fans vote to fund. You may then display your brand name as SPONSORED BY on those five Climate Projects. You may withdraw before kick-off by writing to the club Sustainability Director.`;

export default function SponsorOfferPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [offer, setOffer] = useState<SponsorMatchOffer | null>(null);
  const [brandDefault, setBrandDefault] = useState("");
  const [signerName, setSignerName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [signedBrand, setSignedBrand] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      let brand = "";
      try {
        const sponsor = await getCurrentSponsor();
        brand = String(sponsor.name ?? "");
        setBrandDefault(brand);
        setBrandName(brand);
      } catch {
        router.replace(SPONSOR_LOGIN_PATH);
        return;
      }
      const next = await getSponsorMatchOffer(params.id);
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
      const signatures = await listOfferSignatures();
      const signed = signatures.find((row) => row.offerId === params.id);
      if (signed) {
        setSignedBrand(signed.brandName);
        setSignerName(signed.signerName);
        setBrandName(signed.brandName);
        setAccepted(true);
      }
      setLoading(false);
    }
    load();
  }, [params.id, router]);

  async function sign(event: React.FormEvent) {
    event.preventDefault();
    if (!offer || !accepted) return;
    setSaving(true);
    setError(null);
    try {
      const signed = await signSponsorOffer({
        offerId: offer.id,
        signerName,
        brandName: brandName || brandDefault,
      });
      setSignedBrand(signed.brandName);
      router.push(`${SPONSOR_DASHBOARD_PATH}#signed-folder`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your signature.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-slate-400">Loading Climate Projects...</p>;
  }

  if (!offer) {
    return (
      <div>
        <h1 className="text-3xl font-black">Offer not found</h1>
        <Link href={SPONSOR_DASHBOARD_PATH} className="mt-4 inline-block text-green-400">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link href={SPONSOR_DASHBOARD_PATH} className="text-sm font-semibold text-green-400">
        ← Back to dashboard
      </Link>
      <h1 className="mt-6 text-4xl font-black">{offer.headline}</h1>
      <p className="mt-4 text-slate-300">
        These are the 5 Climate Projects {offer.clubName} posted to fans.
        Agree to be Goal Sponsor for this match, then add your brand name.
      </p>

      <div className="mt-8 space-y-4">
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
          <p className="text-slate-300">Terms and Conditions apply.</p>
          <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-400">
            {TERMS}
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
            {saving ? "Saving signature..." : "Sign and add brand name"}
          </button>
        </form>
      )}
    </div>
  );
}
