"use client";

import {
  LOCAL_SPONSOR_MIN_GBP,
  localSponsorsForClub,
  type LocalSponsorRecord,
} from "@/app/lib/local-sponsor";
import {
  assignLocalSponsorsToProjects,
  localExposureMultiplier,
} from "@/app/lib/match-day-local-sponsors";
import { formatMoney } from "@/app/lib/sponsorship-auction";
import { clubsMatch } from "@/app/lib/sponsor-dashboard";
import type { ClimateProject } from "@/app/services/votes.service";
import type {
  SignedSponsorship,
  SponsorMatchOffer,
} from "@/app/services/sponsor-offers.service";

export function LocalLeftoverPanel({
  local,
  pending,
  signed,
}: {
  local: LocalSponsorRecord;
  pending: SponsorMatchOffer[];
  signed: SignedSponsorship[];
  votedByClub: Record<string, ClimateProject[]>;
}) {
  const offers = [
    ...pending,
    ...signed.map((row) => row.offer),
  ].filter((offer) => clubsMatch(offer.clubName, local.clubName));
  const offer = offers[0];
  const posted = offer?.projects ?? [];
  const clubLocals = localSponsorsForClub(local.clubName);
  const placement =
    posted.length === 0
      ? undefined
      : assignLocalSponsorsToProjects(
          posted,
          clubLocals.length ? clubLocals : [local]
        ).find(
          (row) =>
            row.local &&
            row.local.brandName.trim().toLowerCase() ===
              local.brandName.trim().toLowerCase()
        );
  const multiplier = localExposureMultiplier(local.pledgeGbp);

  return (
    <section className="rounded-3xl border border-amber-400/30 bg-slate-900 p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">
        Local Business Climate Sponsor
      </p>
      <h2 className="mt-2 text-3xl font-black">
        {local.clubName} Match Day card
      </h2>
      <p className="mt-3 max-w-3xl text-slate-300">
        You pledged {formatMoney(local.pledgeGbp)}. That is {multiplier}× the
        fan exposures of a £{LOCAL_SPONSOR_MIN_GBP} local sponsor. Your logo
        appears on one of the five Climate Project cards posted to{" "}
        {local.clubName} fans — higher pledges take the more prominent cards,
        starting with Global Schools Solar.
      </p>
      {!offer || posted.length === 0 ? (
        <p className="mt-6 text-slate-500">
          Waiting for {local.clubName} to post this Match Day five. Once the
          Sustainability Director posts, your logo is attached 1-each by pledge
          rank.
        </p>
      ) : placement?.local ? (
        <p className="mt-6 text-slate-200">
          Card {placement.cardIndex}:{" "}
          <span className="font-black">{placement.project.name}</span>
          <span className="ml-2 text-sm font-semibold text-amber-300">
            SPONSORED BY {local.brandName} · {multiplier}× exposures
          </span>
        </p>
      ) : (
        <p className="mt-6 text-slate-400">
          Five higher-pledging local businesses currently occupy the five cards.
          Increase your pledge from £{LOCAL_SPONSOR_MIN_GBP} to move up the
          ranking.
        </p>
      )}
    </section>
  );
}
