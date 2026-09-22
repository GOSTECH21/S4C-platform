"use client";

import {
  FAN_VOTE_PICK_COUNT,
  leftoverProjectsForLocalSponsor,
  type LocalSponsorRecord,
} from "@/app/lib/local-sponsor";
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
  votedByClub,
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
  const voted = offer ? votedByClub[offer.clubId] ?? [] : [];
  const leftover = leftoverProjectsForLocalSponsor({
    posted,
    votedIds: voted.map((project) => project.id),
  });
  const votingClosed = voted.length >= FAN_VOTE_PICK_COUNT;

  return (
    <section className="rounded-3xl border border-amber-400/30 bg-slate-900 p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">
        Local Business Climate Sponsor
      </p>
      <h2 className="mt-2 text-3xl font-black">
        {local.clubName} leftover projects
      </h2>
      <p className="mt-3 max-w-3xl text-slate-300">
        You pledged {formatMoney(local.pledgeGbp)}. When fans vote for 3 of the
        5 posted Climate Projects, your business name is attached to the 2 they
        did not vote for.
      </p>
      {!offer ? (
        <p className="mt-6 text-slate-500">
          Waiting for {local.clubName} to post this Match Day five.
        </p>
      ) : !votingClosed ? (
        <p className="mt-6 text-slate-400">
          Voting is still open. Your name attaches to the 2 leftover Climate
          Projects when voting closes.
        </p>
      ) : leftover.length === 0 ? (
        <p className="mt-6 text-slate-400">
          Fans have voted across the five. Leftover projects appear here once
          two of the posted five have no votes.
        </p>
      ) : (
        <ul className="mt-6 space-y-2 text-slate-200">
          {leftover.map((project) => (
            <li key={project.id}>
              • {project.name}
              <span className="ml-2 text-sm font-semibold text-amber-300">
                SPONSORED BY {local.brandName}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
