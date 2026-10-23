"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import {
  ensureGoalNetwork,
  lockMatchDayClub,
} from "@/app/services/climate-sponsors.service";
import { competitionLockLabel } from "@/app/lib/club-fixtures";
import {
  clearPendingSponsorMatch,
  resolvePendingSponsorMatch,
  savePendingSponsorMatch,
  sponsorFromMatchPath,
} from "@/app/lib/pending-sponsor-match";
import {
  SPONSOR_DASHBOARD_PATH,
  SPONSOR_LOGIN_PATH,
  localNewSponsorshipPath,
  sponsorLoginPath,
  sponsorWalletPath,
} from "@/app/lib/routes";
import {
  isLocalClimateSponsor,
  rememberLocalSponsorSession,
} from "@/app/lib/sponsor-home";

export default function SponsorFromMatchPage() {
  const [error, setError] = useState<string | null>(null);
  const [fixtureLabel, setFixtureLabel] = useState("");

  useEffect(() => {
    async function continueSponsorship() {
      const match = resolvePendingSponsorMatch(window.location.search);
      if (!match) {
        window.location.replace(SPONSOR_LOGIN_PATH);
        return;
      }
      savePendingSponsorMatch(match);
      setFixtureLabel(`${match.club} · ${match.fixtureName}`);
      const returnTo = sponsorFromMatchPath(match);
      let sponsor;
      try {
        sponsor = await getCurrentSponsor();
      } catch {
        window.location.replace(sponsorLoginPath(returnTo));
        return;
      }
      try {
        const brandName = String(sponsor.name ?? "").trim();
        if (!brandName) {
          window.location.replace(sponsorLoginPath(returnTo));
          return;
        }
        rememberLocalSponsorSession(sponsor);
        const jobTitle = String(sponsor.industry ?? "");
        ensureGoalNetwork({
          brandName,
          clubNames: [match.club],
        });
        lockMatchDayClub({
          brandName,
          clubName: match.club,
          matchLabel: competitionLockLabel(match.league) || match.league,
          fixtureName: match.fixtureName,
          competition: match.league,
          fixtureDate: match.date,
          kickoff: match.kickoff || null,
          venue: match.venue || null,
        });
        clearPendingSponsorMatch();
        if (isLocalClimateSponsor(brandName, { jobTitle })) {
          const wallet = new URL(
            localNewSponsorshipPath(),
            window.location.origin
          );
          wallet.searchParams.set("club", match.club);
          window.location.replace(`${wallet.pathname}${wallet.search}`);
          return;
        }
        window.location.replace(sponsorWalletPath(match.club));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not lock this Match for sponsorship."
        );
      }
    }
    void continueSponsorship();
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-lg py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          Sponsor this Match
        </p>
        <h1 className="mt-3 text-4xl font-black">Could not lock this Match</h1>
        {fixtureLabel ? (
          <p className="mt-3 font-semibold">{fixtureLabel}</p>
        ) : null}
        <p className="mt-4 text-slate-300">{error}</p>
        <Link
          href={SPONSOR_DASHBOARD_PATH}
          className="mt-8 inline-flex rounded-xl bg-green-500 px-5 py-3 font-bold text-slate-950"
        >
          Open your sponsorship dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
        Sponsor this Match
      </p>
      <h1 className="mt-3 text-4xl font-black">Opening your sponsorship</h1>
      <p className="mt-4 text-slate-300">
        {fixtureLabel
          ? `Locking in ${fixtureLabel} so you can complete this sponsorship.`
          : "Taking you to complete this Match sponsorship."}
      </p>
    </div>
  );
}
