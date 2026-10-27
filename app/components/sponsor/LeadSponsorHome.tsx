"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/app/components/club/BrandMark";
import { SponsorCistTable } from "@/app/components/sponsor/SponsorCistTable";
import { formatLongMatchDate } from "@/app/lib/s4p-climate-projects";
import {
  LEAD_APPROVED_EMPTY,
  LEAD_APPROVED_INTRO,
  LEAD_APPROVED_SECTION_ID,
  LEAD_APPROVED_TITLE,
  LEAD_AWAITING_EMPTY,
  LEAD_AWAITING_INTRO,
  LEAD_AWAITING_SECTION_ID,
  LEAD_AWAITING_TITLE,
  LEAD_CIST_SECTION_ID,
  LEAD_CIST_TITLE,
  LEAD_PAY_LABEL,
  LEAD_PAID_EMPTY,
  LEAD_PAID_INTRO,
  LEAD_PAID_SECTION_ID,
  LEAD_PAID_TITLE,
  leadSponsorHomeSections,
  type ChosenProjectInput,
  type LeadSponsorMatchGroup,
} from "@/app/lib/lead-sponsor-home";
import {
  readLeadProjectFolder,
  recordLeadMatchApproved,
  recordLeadMatchPaid,
  type LeadFolderEntry,
} from "@/app/lib/lead-project-folder";
import type { MatchDayClubLock } from "@/app/lib/climate-sponsors";
import type {
  FolderOffer,
  SignedSponsorship,
} from "@/app/lib/sponsor-dashboard";
import { SIGNED_SPONSORSHIP_EVENT } from "@/app/lib/sponsor-completion-flow";
import { isMatchDayCardPaymentConfirmed } from "@/app/lib/sponsor-card-payment";
import { formatFundingGbp } from "@/app/lib/platform-stats";
import {
  formatMatchFundingLine,
  formatVoteCount,
} from "@/app/lib/sponsorship-auction";
import { readLogoFile, saveBrandLogo } from "@/app/services/climate-sponsors.service";
import { sponsorLogoSrc } from "@/app/services/teams.service";

export function LeadSponsorHome({
  brand,
  logoUrl,
  pending,
  signed,
  chosenByClub,
  votedByClub,
  committedGbp,
  lock,
  folder: folderOverride,
  onLogoChange,
}: {
  brand: string;
  logoUrl: string | null;
  pending: FolderOffer[];
  signed: SignedSponsorship[];
  chosenByClub?: Record<string, ChosenProjectInput[]>;
  votedByClub?: Record<string, Array<{ id: string; fundedGbp?: number | null }>>;
  committedGbp: number;
  lock?: MatchDayClubLock | null;
  folder?: LeadFolderEntry[];
  onLogoChange?: (next: string) => void;
}) {
  const router = useRouter();
  const mark = sponsorLogoSrc(brand, logoUrl);
  const [folder, setFolder] = useState<LeadFolderEntry[]>(
    () => folderOverride ?? readLeadProjectFolder(brand)
  );

  useEffect(() => {
    setFolder(folderOverride ?? readLeadProjectFolder(brand));
  }, [brand, signed.length, pending.length, folderOverride]);

  useEffect(() => {
    const refresh = () => setFolder(readLeadProjectFolder(brand));
    window.addEventListener(SIGNED_SPONSORSHIP_EVENT, refresh);
    return () => window.removeEventListener(SIGNED_SPONSORSHIP_EVENT, refresh);
  }, [brand]);

  const sections = leadSponsorHomeSections({
    pending,
    signed,
    chosenByClub,
    votedByClub,
    lock,
    folder,
  });

  function payForGroup(group: LeadSponsorMatchGroup) {
    recordLeadMatchApproved({
      brandName: brand,
      offerId: group.offerId || "",
      clubId: group.clubId,
      clubName: group.clubName,
      matchTitle: group.matchTitle,
      matchDate: group.matchDate,
      headline: group.headline,
      signedAt: group.signedAt || new Date().toISOString(),
      signerName: group.signerName || brand,
      projects: group.projects.map((project) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        country: project.country,
        estimated_co2: project.estimated_co2,
        fundedGbp: project.fundedGbp,
      })),
      sponsorshipAmountGbp: group.sponsorshipAmountGbp,
      gbpPerGoal: group.gbpPerGoal,
      maxAmount: group.maxAmount,
    });
    const alreadyPaid = isMatchDayCardPaymentConfirmed({
      clubName: group.clubName,
      brandName: brand,
    });
    if (alreadyPaid) {
      recordLeadMatchPaid({
        brandName: brand,
        clubName: group.clubName,
        matchTitle: group.matchTitle,
        offerId: group.offerId,
      });
      setFolder(readLeadProjectFolder(brand));
      return;
    }
    router.push(group.actionHref);
  }

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-4">
          <BrandMark name={brand} logoUrl={mark} large />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
              Signed in as {brand}
            </p>
            <label className="mt-2 inline-flex cursor-pointer items-center rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-green-400">
              {logoUrl ? "Change brand logo" : "Upload brand logo"}
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  void readLogoFile(file).then((next) => {
                    saveBrandLogo(brand, next);
                    onLogoChange?.(next);
                  });
                }}
                className="sr-only"
              />
            </label>
          </div>
        </div>
        <h1 className="mt-3 text-4xl font-black tracking-tight">
          S4P SPONSORSHIP DASHBOARD
        </h1>
      </div>

      <ProjectSection
        id={LEAD_AWAITING_SECTION_ID}
        letter="a"
        title={LEAD_AWAITING_TITLE}
        intro={LEAD_AWAITING_INTRO}
        empty={LEAD_AWAITING_EMPTY}
        groups={sections.awaiting}
      />
      <ProjectSection
        id={LEAD_APPROVED_SECTION_ID}
        letter="b"
        title={LEAD_APPROVED_TITLE}
        intro={LEAD_APPROVED_INTRO}
        empty={LEAD_APPROVED_EMPTY}
        groups={sections.approved}
        onPay={payForGroup}
      />
      <ProjectSection
        id={LEAD_PAID_SECTION_ID}
        letter="c"
        title={LEAD_PAID_TITLE}
        intro={LEAD_PAID_INTRO}
        empty={LEAD_PAID_EMPTY}
        groups={sections.paid}
      />
      <SponsorCistTable
        sectionId={LEAD_CIST_SECTION_ID}
        brandName={brand}
        ownFundingGbp={committedGbp}
        title={LEAD_CIST_TITLE}
        eyebrow="Section (d)"
      />
    </div>
  );
}

function ProjectSection({
  id,
  letter,
  title,
  intro,
  empty,
  groups,
  onPay,
}: {
  id: string;
  letter: "a" | "b" | "c";
  title: string;
  intro: string;
  empty: string;
  groups: LeadSponsorMatchGroup[];
  onPay?: (group: LeadSponsorMatchGroup) => void;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-6 rounded-3xl border border-slate-700 bg-slate-900 p-8"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
        Section ({letter})
      </p>
      <h2 className="mt-2 text-3xl font-black">{title}</h2>
      <p className="mt-3 max-w-3xl text-slate-300">{intro}</p>
      {groups.length === 0 ? (
        <p className="mt-6 text-slate-500">{empty}</p>
      ) : (
        <div className="mt-8 space-y-4">
          {groups.map((group) => (
            <MatchProjectCard
              key={group.key}
              group={group}
              onPay={onPay}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function MatchProjectCard({
  group,
  onPay,
}: {
  group: LeadSponsorMatchGroup;
  onPay?: (group: LeadSponsorMatchGroup) => void;
}) {
  const when = formatLongMatchDate(group.matchDate);
  const funding = formatMatchFundingLine({
    baseAmount: Number(group.sponsorshipAmountGbp) || 0,
    gbpPerGoal: group.gbpPerGoal,
    maxAmount: group.maxAmount,
  });
  return (
    <article className="rounded-2xl border border-green-500/30 bg-slate-950 p-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <p className="text-sm text-green-300">{group.clubName}</p>
          <h3 className="mt-1 text-xl font-bold">{group.matchTitle}</h3>
          {when ? <p className="mt-1 text-sm text-slate-400">{when}</p> : null}
          {group.signerName && group.signedAt ? (
            <p className="mt-1 text-sm text-slate-400">
              Signed by {group.signerName} on{" "}
              {new Date(group.signedAt).toLocaleString("en-GB")}
            </p>
          ) : null}
        </div>
        {funding ? (
          <p className="font-semibold text-green-300">{funding}</p>
        ) : null}
      </div>
      <ul className="mt-4 space-y-2">
        {group.projects.map((project) => (
          <li
            key={project.id}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="font-semibold">{project.name}</span>
              {project.fundedGbp > 0 ? (
                <span className="shrink-0 text-sm font-semibold text-green-300">
                  {formatFundingGbp(project.fundedGbp)}
                </span>
              ) : null}
            </div>
            {project.country ? (
              <p className="mt-1 text-sm text-slate-400">📍 {project.country}</p>
            ) : null}
            {project.estimated_co2 ? (
              <p className="mt-1 text-sm text-slate-400">
                {formatVoteCount(Math.round(Number(project.estimated_co2)))} tCO₂e
              </p>
            ) : null}
          </li>
        ))}
      </ul>
      {onPay && group.actionLabel === LEAD_PAY_LABEL ? (
        <button
          type="button"
          onClick={() => onPay(group)}
          className="mt-5 inline-flex rounded-xl bg-s4p-mark px-5 py-3 text-sm font-bold text-slate-950 hover:brightness-110"
        >
          {group.actionLabel}
        </button>
      ) : (
        <Link
          href={group.actionHref}
          className="mt-5 inline-flex rounded-xl bg-s4p-mark px-5 py-3 text-sm font-bold text-slate-950 hover:brightness-110"
        >
          {group.actionLabel}
        </Link>
      )}
    </article>
  );
}
