"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  listOfferSignatures,
  signSponsorOffer,
  type SponsorMatchOffer,
} from "@/app/services/sponsor-offers.service";
import { loadMatchDayLock } from "@/app/services/climate-sponsors.service";
import { readClimateWallet } from "@/app/services/sponsor-wallet.service";
import {
  LOCAL_SPONSOR_HOME_PATH,
  SPONSOR_DASHBOARD_PATH,
  SPONSOR_OFFER_SIGN_SECTION_ID,
} from "@/app/lib/routes";
import { climateProjectCountryLabel } from "@/app/lib/featured-climate-country";
import { isFeaturedClimateProject } from "@/app/services/votes.service";
import { ClimateProjectCivBlock } from "@/app/components/climate/ClimateProjectCiv";
import { resolveCommittedMatchFunding } from "@/app/lib/sponsor-completion-flow";
import {
  formatLocalSponsorPayableCopy,
  formatSponsorPayableCopy,
  EXPOSURES_PER_POST,
} from "@/app/lib/sponsorship-auction";
import {
  LOCAL_SIGNOFF_TERMS,
  localSignOffSponsorshipGbp,
  readLocalSponsorRecord,
} from "@/app/lib/local-sponsor";
import { isLocalClimateSponsor, sponsorHomePath } from "@/app/lib/sponsor-home";

export const GOAL_SPONSOR_TERMS = `S4P Goal Sponsor Terms and Conditions: by signing you agree to sponsor the Club's Match Day carbon footprint offset — a Base Match Sponsorship (the Minimum Payment, payable even if the club scores no Goals) plus Sponsorship per Goal scored, up to the posted Maximum. Example: a £3,000 base and £3,000 per Goal means 0–0 pays £3,000, 1–0 pays £6,000, and 2–0 pays £9,000, never more than the cap. The Sustainability Director later chooses five Climate Projects for that Match Day; those Projects are your record and the list Fans FUND-IT onto. Each post to a fan is 1 eyeball and ${EXPOSURES_PER_POST} exposures. You may display your brand as SPONSORED BY on those Climate Projects. You may withdraw before kick-off by writing to the club Sustainability Director.`;

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
          <ClimateProjectCivBlock project={project} />
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
  const router = useRouter();
  const [signerName, setSignerName] = useState("");
  const [brandName, setBrandName] = useState(brandDefault);
  const [accepted, setAccepted] = useState(false);
  const [signedBrand, setSignedBrand] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signedBrandName = brandName || brandDefault;
  const localSponsor = isLocalClimateSponsor(signedBrandName);
  const wallet = readClimateWallet(offer.clubName, signedBrandName);
  const funding = resolveCommittedMatchFunding({
    lock: loadMatchDayLock(signedBrandName),
    wallet,
    offer,
  });
  const payableCopy = localSponsor
    ? formatLocalSponsorPayableCopy({
        sponsorshipGbp: localSignOffSponsorshipGbp({
          wallet,
          record: readLocalSponsorRecord(),
        }),
        clubName: offer.clubName,
      })
    : formatSponsorPayableCopy({
        baseAmount: funding.baseAmount,
        gbpPerGoal: funding.gbpPerGoal,
        maxAmount: funding.maxAmount,
        clubName: offer.clubName,
      });

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
      router.replace(sponsorHomePath(signed.brandName) || LOCAL_SPONSOR_HOME_PATH);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save your signature."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div id={SPONSOR_OFFER_SIGN_SECTION_ID} className="scroll-mt-6">
      <p className="mt-10 text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
        Signed Sponsorship
      </p>
      {showProjects && (
        <div className="mt-8">
          <OfferProjectList offer={offer} />
        </div>
      )}

      {signedBrand ? (
        <div className="mt-10 rounded-2xl border border-green-500/40 bg-green-500/10 p-8">
          <h2 className="text-2xl font-black">
            {isLocalClimateSponsor(signedBrand)
              ? "Signed as Local Business Climate Sponsor"
              : "Signed as Goal Sponsor"}
          </h2>
          <p className="mt-3 text-lg font-semibold text-amber-300">
            SPONSORED BY {signedBrand}
          </p>
          <p className="mt-2 text-slate-300">
            Fans of {offer.clubName} and the club Sustainability Director can
            now see this Match Day carbon footprint offset sponsorship
            immediately. Climate Projects the club later chooses for this Match
            appear as your record. This copy is lodged in your Dashboard
            folder.
          </p>
          <Link
            href={sponsorHomePath(signedBrand) || SPONSOR_DASHBOARD_PATH}
            className="mt-5 inline-flex rounded-xl bg-green-500 px-5 py-3 font-bold text-slate-950"
          >
            Open your sponsored Match Days
          </Link>
        </div>
      ) : (
        <form
          onSubmit={sign}
          className="mt-10 space-y-5 rounded-2xl border border-slate-700 bg-slate-900 p-8"
        >
          <h2 className="text-2xl font-black">
            Agree to sponsor this Match Day carbon footprint offset
          </h2>
          <p className="text-slate-300">
            {payableCopy} Terms and Conditions apply.
          </p>
          <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-400">
            {localSponsor ? LOCAL_SIGNOFF_TERMS : GOAL_SPONSOR_TERMS}
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
