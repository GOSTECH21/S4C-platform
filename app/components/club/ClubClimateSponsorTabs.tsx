"use client";

import { useMemo, useState } from "react";
import { BrandMark } from "@/app/components/club/BrandMark";
import type { LeadClubSponsorRow } from "@/app/lib/climate-sponsors";
import { splitClubClimateSponsorsForTabs } from "@/app/lib/match-day-branding";
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
  initialTab = "lead",
}: {
  clubName: string;
  leadSponsors: LeadClubSponsorRow[];
  localSponsors: LocalSponsorRecord[];
  initialTab?: ClimateSponsorTab;
}) {
  const { leads, locals } = useMemo(
    () =>
      splitClubClimateSponsorsForTabs({
        clubName,
        leadSponsors,
        localSponsors,
      }),
    [clubName, leadSponsors, localSponsors]
  );
  const [tab, setTab] = useState<ClimateSponsorTab>(initialTab);
  const leadCount = leads.length;
  const localCount = locals.length;
  const tabPrefix = clubName.trim().toLowerCase().replace(/\s+/g, "-") || "club";
  const leadTabId = `${tabPrefix}-lead-climate-sponsor-tab`;
  const localTabId = `${tabPrefix}-local-businesses-sponsor-tab`;
  const leadPanelId = `${tabPrefix}-lead-climate-sponsor-panel`;
  const localPanelId = `${tabPrefix}-local-businesses-sponsor-panel`;

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
        Interested Lead Climate Sponsors and Local Business Climate Sponsors
        who signed up to sponsor your Club will automatically appear here. Only
        one Lead Climate Sponsor is allowed each Match Day. Four Local Business
        Climate Sponsors are accepted each Match Day.
      </p>

      <div
        role="tablist"
        aria-label="Our Climate Sponsors"
        className="mt-8 flex flex-wrap gap-3"
      >
        <TabButton
          id={leadTabId}
          selected={tab === "lead"}
          onClick={() => setTab("lead")}
          controls={leadPanelId}
        >
          Our Lead Climate Sponsor
          {leadCount ? ` (${leadCount})` : ""}
        </TabButton>
        <TabButton
          id={localTabId}
          selected={tab === "local"}
          onClick={() => setTab("local")}
          controls={localPanelId}
        >
          Our Local Businesses Sponsor
          {localCount ? ` (${localCount})` : ""}
        </TabButton>
      </div>

      {tab === "lead" ? (
        <div
          role="tabpanel"
          id={leadPanelId}
          aria-labelledby={leadTabId}
          className="mt-8"
        >
          {leads.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-950 p-6 text-slate-500">
              No Lead Climate Sponsor has opted to sponsor {clubName} Match Days
              yet.
            </p>
          ) : (
            <ul className="mt-6 grid gap-4">
              {leads.map((sponsor) => (
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
          id={localPanelId}
          aria-labelledby={localTabId}
          className="mt-8"
        >
          <h3 className="text-2xl font-black">
            Local Businesses Climate Sponsors
          </h3>
          <p className="mt-2 max-w-3xl text-slate-400">
            Local businesses that registered, chose {clubName}, uploaded their
            logo, selected the Match or Matches they wish to sponsor, entered
            their sponsorship amounts, agreed to the Terms and Conditions,
            signed off, and SUBMITTED. These brands appear here once and are
            supporting {clubName}&apos;s Match Day carbon-emissions mitigation.
          </p>
          {locals.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-950 p-6 text-slate-500">
              No Local Business Climate Sponsor has submitted support for{" "}
              {clubName}&apos;s Match Day carbon-emissions mitigation yet.
            </p>
          ) : (
            <ul className="mt-6 grid gap-4">
              {locals.map((sponsor) => (
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
          {sponsor.signerName ? (
            <p className="text-sm text-slate-500">
              Signed off by {sponsor.signerName}
            </p>
          ) : null}
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
