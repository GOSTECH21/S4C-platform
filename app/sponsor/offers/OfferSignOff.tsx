"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  listOfferSignatures,
  loadClubChosenClimateProjects,
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
import { LEAD_APPROVED_SECTION_ID } from "@/app/lib/lead-sponsor-home";
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
import {
  MATCH_DAY_SIGNOFF_PENDING_COPY,
  chosenProjectsReadyForMatchDay,
} from "@/app/lib/match-day-carbon-offset";

export const GOAL_SPONSOR_TERMS = `S4P Match-Sponsorship Terms and Conditions: by signing you agree to sponsor the Club's Match Day carbon footprint offset with one fixed Match-Sponsorship amount for a five-day campaign, plus a 5% Platform Fee. Example: a £4,000 Match-Sponsorship is paid as £4,000 plus £200 Platform Fee, total £4,200. 80% (£3,200) is the Fan Participation Pool for eligible fan-directed allocations. 20% (£800) is the Score Impact Pool, unlocked by a confirmed score from the sponsored team. If the score is 0–0, no payment will be unlocked. Any score during the Match will unlock one-third of the 20% amount until the total amount reads £0.00. Further scores after that pool is unlocked still count in S4P statistics but do not add sponsor liabilities. Scoring-triggered climate funding is exclusive to the S4P Lead Sponsor. You must see the Club's five chosen Climate Projects before you sign; those Projects are your record and the list Fans take £0.20 onto. If the Club has not uploaded them yet, sign-off stays pending approval until they do. Each post to a fan is 1 eyeball and ${EXPOSURES_PER_POST} exposures. You may display your brand as SPONSORED BY on those Climate Projects. You may withdraw before kick-off by writing to the club Sustainability Director.`;

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
  const [clubProjectCount, setClubProjectCount] = useState(
    offer.projects.length
  );

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

  const projectsReady = chosenProjectsReadyForMatchDay(
    Math.max(offer.projects.length, clubProjectCount)
  );

  useEffect(() => {
    setBrandName(brandDefault);
  }, [brandDefault]);

  useEffect(() => {
    if (localSponsor || chosenProjectsReadyForMatchDay(offer.projects.length)) {
      setClubProjectCount(offer.projects.length);
      return;
    }
    let cancelled = false;
    void loadClubChosenClimateProjects(offer.clubName)
      .then((uploaded) => {
        if (!cancelled) {
          setClubProjectCount(uploaded?.projects.length ?? 0);
        }
      })
      .catch(() => {
        if (!cancelled) setClubProjectCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [localSponsor, offer.clubName, offer.projects.length]);

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
    if (!localSponsor && !projectsReady) {
      setError(MATCH_DAY_SIGNOFF_PENDING_COPY);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const signed = await signSponsorOffer({
        offerId: offer.id,
        signerName,
        brandName: brandName || brandDefault,
      });
      setSignedBrand(signed.brandName);
      router.replace(
        isLocalClimateSponsor(signed.brandName)
          ? LOCAL_SPONSOR_HOME_PATH
          : `${SPONSOR_DASHBOARD_PATH}#${LEAD_APPROVED_SECTION_ID}`
      );
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
              : "Signed as Lead Climate Sponsor"}
          </h2>
          <p className="mt-3 text-lg font-semibold text-amber-300">
            SPONSORED BY {signedBrand}
          </p>
          <p className="mt-2 text-slate-300">
            Fans of {offer.clubName} and the club Sustainability Director can
            now see this Match Day carbon footprint offset sponsorship
            immediately. The Climate Projects you saw before signing are your
            record. This copy is lodged in your Dashboard folder.
          </p>
          <Link
            href={sponsorHomePath(signedBrand) || SPONSOR_DASHBOARD_PATH}
            className="mt-5 inline-flex rounded-xl bg-green-500 px-5 py-3 font-bold text-slate-950"
          >
            Open your sponsored Match Days
          </Link>
        </div>
      ) : !localSponsor && !projectsReady ? (
        <p className="mt-10 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-8 font-semibold text-amber-200">
          {MATCH_DAY_SIGNOFF_PENDING_COPY}
        </p>
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
