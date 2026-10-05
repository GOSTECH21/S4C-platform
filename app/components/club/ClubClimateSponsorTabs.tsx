"use client";

import { useMemo, useState } from "react";
import { BrandMark } from "@/app/components/club/BrandMark";
import type { LeadClubSponsorRow } from "@/app/lib/climate-sponsors";
import {
  localMatchLabels,
  totalLocalPledge,
  type LocalSponsorRecord,
} from "@/app/lib/local-sponsor";
import { formatMoney } from "@/app/lib/sponsorship-auction";
import { CLUB_SPONSORS_PATH } from "@/app/lib/routes";
import Link from "next/link";

export type ClimateSponsorTab = "lead" | "local";

export function ClubClimateSponsorTabs({
  clubName,
  leadSponsors,
  localSponsors,
}: {
  clubName: string;
  leadSponsors: LeadClubSponsorRow[];
  localSponsors: LocalSponsorRecord[];
}) {
  const [tab, setTab] = useState<ClimateSponsorTab>("lead");
  const leadCount = leadSponsors.length;
  const localCount = localSponsors.length;

  return (
    <section
      id="our-climate-sponsors"
      className="mt-12 rounded-3xl border border-amber-400/30 bg-slate-900 p-10"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
        Brands
      </p>
      <h2 className="mt-2 text-4xl font-black">Our Climate Sponsors</h2>
      <p className="mt-3 max-w-3xl text-slate-300">
        Lead Climate Sponsors and Local Business Climate Sponsors who have
        registered, chosen {clubName}, and submitted the Match Days they will
        fund. Each club has one Lead Climate Sponsor. Every other brand that
        chose {clubName} is a Local Business Climate Sponsor. This is the
        incoming list for the Sustainability Director — not a roster to pick
        from, and never another club&apos;s brands.
      </p>

      <div
        role="tablist"
        aria-label="Our Climate Sponsors"
        className="mt-8 flex flex-wrap gap-3"
      >
        <TabButton
          id="lead-climate-sponsor-tab"
          selected={tab === "lead"}
          onClick={() => setTab("lead")}
          controls="lead-climate-sponsor-panel"
        >
          Our Lead Climate Sponsor
          {leadCount ? ` (${leadCount})` : ""}
        </TabButton>
        <TabButton
          id="local-businesses-sponsor-tab"
          selected={tab === "local"}
          onClick={() => setTab("local")}
          controls="local-businesses-sponsor-panel"
        >
          Our Local Businesses Sponsor
          {localCount ? ` (${localCount})` : ""}
        </TabButton>
      </div>

      {tab === "lead" ? (
        <div
          role="tabpanel"
          id="lead-climate-sponsor-panel"
          aria-labelledby="lead-climate-sponsor-tab"
          className="mt-8"
        >
          <h3 className="text-2xl font-black">Our Lead Climate Sponsor</h3>
          <p className="mt-2 max-w-3xl text-slate-400">
            When a Lead Climate Sponsor registers, opts to sponsor {clubName},
            and selects the Match they wish to be Lead Climate Sponsor for, they
            appear here with those fixtures. Only that one Lead Climate Sponsor
            is listed — never a Local Business Climate Sponsor.
          </p>
          {leadSponsors.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-950 p-6 text-slate-500">
              No Lead Climate Sponsor has opted to sponsor {clubName} Match Days
              yet.
            </p>
          ) : (
            <ul className="mt-6 grid gap-4">
              {leadSponsors.map((sponsor) => (
                <li
                  key={sponsor.brandKey}
                  className="rounded-2xl border border-slate-700 bg-slate-950 p-5"
                >
                  <div className="flex items-start gap-3">
                    <BrandMark
                      name={sponsor.brandName}
                      logoUrl={sponsor.logoUrl}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">{sponsor.brandName}</p>
                      <p className="text-sm text-slate-400">
                        {sponsor.inNetwork
                          ? `Lead Climate Sponsor for ${clubName}`
                          : `Locked ${clubName} Match Days`}
                      </p>
                      <MatchPills
                        matches={sponsor.matches}
                        empty="Match not yet selected"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div
          role="tabpanel"
          id="local-businesses-sponsor-panel"
          aria-labelledby="local-businesses-sponsor-tab"
          className="mt-8"
        >
          <h3 className="text-2xl font-black">
            Local Businesses Climate Sponsors
          </h3>
          <p className="mt-2 max-w-3xl text-slate-400">
            Local businesses that registered, chose {clubName}, selected the
            Match or Matches they wish to sponsor, entered their sponsorship
            amounts and submitted. These brands are supporting {clubName}&apos;s
            Match Day carbon-emissions mitigation.
          </p>
          {localSponsors.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-950 p-6 text-slate-500">
              No Local Business Climate Sponsor has submitted support for{" "}
              {clubName}&apos;s Match Day carbon-emissions mitigation yet.
            </p>
          ) : (
            <ul className="mt-6 grid gap-4">
              {localSponsors.map((sponsor) => (
                <LocalSponsorCard
                  key={`${sponsor.brandName}:${sponsor.email}`}
                  sponsor={sponsor}
                />
              ))}
            </ul>
          )}
        </div>
      )}

      <p className="mt-8 text-sm text-slate-500">
        Need decision-maker contacts for sign-off?{" "}
        <Link
          href={CLUB_SPONSORS_PATH}
          className="font-semibold text-amber-300 hover:underline"
        >
          Add brand contacts
        </Link>
      </p>
    </section>
  );
}

function TabButton({
  id,
  selected,
  onClick,
  controls,
  children,
}: {
  id: string;
  selected: boolean;
  onClick: () => void;
  controls: string;
  children: React.ReactNode;
}) {
  return (
    <button
      id={id}
      type="button"
      role="tab"
      aria-selected={selected}
      aria-controls={controls}
      onClick={onClick}
      className={`rounded-xl px-5 py-3 text-sm font-bold ${
        selected
          ? "bg-amber-400 text-slate-950"
          : "border border-slate-600 bg-slate-950 text-slate-200 hover:border-amber-300"
      }`}
    >
      {children}
    </button>
  );
}

function MatchPills({
  matches,
  empty,
}: {
  matches: string[];
  empty: string;
}) {
  if (matches.length === 0) {
    return <p className="mt-3 text-sm text-slate-500">{empty}</p>;
  }
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {matches.map((match) => (
        <li
          key={match}
          className="rounded-full border border-green-500/40 bg-green-500/10 px-3 py-1 text-sm font-semibold text-green-300"
        >
          {match}
        </li>
      ))}
    </ul>
  );
}

function LocalSponsorCard({ sponsor }: { sponsor: LocalSponsorRecord }) {
  const matches = useMemo(() => localMatchLabels(sponsor), [sponsor]);
  const total = totalLocalPledge(sponsor);
  return (
    <li className="rounded-2xl border border-slate-700 bg-slate-950 p-5">
      <div className="flex items-start gap-3">
        <BrandMark name={sponsor.brandName} logoUrl={sponsor.logoUrl} />
        <div className="min-w-0 flex-1">
          <p className="font-bold">{sponsor.brandName}</p>
          <p className="text-sm text-slate-400">
            Local Business Climate Sponsor
            {total > 0 ? ` · ${formatMoney(total)} submitted` : ` for ${sponsor.clubName}`}
          </p>
          {(sponsor.matchSponsorships?.length ?? 0) > 0 ? (
            <ul className="mt-3 space-y-1 text-sm text-slate-300">
              {sponsor.matchSponsorships!.map((row) => (
                <li key={row.fixtureName}>
                  <span className="font-semibold text-green-300">
                    {row.fixtureName}
                  </span>
                  {" · "}
                  {formatMoney(row.amountGbp)}
                </li>
              ))}
            </ul>
          ) : (
            <MatchPills matches={matches} empty="Match Day support submitted" />
          )}
        </div>
      </div>
    </li>
  );
}
