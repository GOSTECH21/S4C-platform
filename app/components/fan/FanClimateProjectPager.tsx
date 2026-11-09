"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/app/components/club/BrandMark";
import { ProjectSiteLine } from "@/app/components/climate/ProjectSiteLine";
import { showcaseImagesForProject } from "@/app/lib/project-images";
import {
  LEAD_CLIMATE_SPONSOR_LABEL,
  LOCAL_BUSINESS_SPONSOR_LABEL,
} from "@/app/lib/dual-sponsor";
import {
  FAN_CLIMATE_PAGER_STAMP,
  FAN_CLIMATE_PROJECT_PAGE_COUNT,
  FUND_IT_ALLOCATED_LABEL,
  FUND_IT_HOW_IT_WORKS,
  FUND_IT_HOW_IT_WORKS_TITLE,
  READY_TO_ALLOCATE_LABEL,
  fallbackHeroImage,
  fundItButtonLabel,
  pairFanClimateProjectPages,
  readyToAllocateCopy,
  type FanClimateProjectPage,
  type FanProjectDetail,
  type FanProjectSponsor,
} from "@/app/lib/fan-climate-project-cards";
import { SUPPORTER_CAMPAIGN_PATH } from "@/app/lib/routes";
import {
  DEFAULT_WALLET_VOTE_GBP,
  canPressFundIt,
  formatWalletGbp,
  type NumberedClimateProject,
} from "@/app/lib/sponsor-wallet";
import { loadBrandLogo } from "@/app/services/climate-sponsors.service";
import { sponsorLogoSrc } from "@/app/services/teams.service";

export function FanClimateProjectPager({
  clubName,
  numbered,
  details,
  lead,
  locals,
  fundingOpen = true,
  busy = false,
  usedSponsorNames = [],
  voteError = null,
  voteNotice = null,
  onFund,
}: {
  clubName: string;
  numbered: NumberedClimateProject[];
  details: FanProjectDetail[];
  lead: FanProjectSponsor | null;
  locals: FanProjectSponsor[];
  fundingOpen?: boolean;
  busy?: boolean;
  usedSponsorNames?: string[];
  voteError?: string | null;
  voteNotice?: string | null;
  onFund: (input: {
    brandName: string;
    projectNumber: string;
  }) => Promise<boolean> | boolean;
}) {
  const pages = useMemo(
    () => pairFanClimateProjectPages({ numbered, details, lead, locals }),
    [numbered, details, lead, locals]
  );
  const [pageIndex, setPageIndex] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    setConfirming(false);
  }, [pageIndex]);

  useEffect(() => {
    if (voteNotice) setConfirming(false);
  }, [voteNotice]);

  const page = pages[pageIndex] ?? pages[0];
  const used = new Set(
    usedSponsorNames.map((name) => name.trim().toLowerCase())
  );

  function go(next: number) {
    const wrapped =
      (next + FAN_CLIMATE_PROJECT_PAGE_COUNT) % FAN_CLIMATE_PROJECT_PAGE_COUNT;
    setPageIndex(wrapped);
  }

  return (
    <section
      data-fan-climate-pager={FAN_CLIMATE_PAGER_STAMP}
      data-active-page={page?.position ?? "1/5"}
      className="mx-auto max-w-xl text-slate-950"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          href={SUPPORTER_CAMPAIGN_PATH}
          className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-800 hover:text-emerald-950"
        >
          ← My Climate Projects
        </Link>
        {clubName ? (
          <p className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">
            ✓ {clubName} supporter
          </p>
        ) : null}
      </div>

      <HowItWorksHeadings
        activeStep={
          page && sponsorIsUsed(page.sponsor, used)
            ? 3
            : confirming
              ? 2
              : 1
        }
      />

      <nav
        aria-label="Climate Projects"
        className="mt-5 flex items-center justify-center gap-2"
      >
        <button
          type="button"
          aria-label="Previous Climate Project"
          onClick={() => go(pageIndex - 1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-white text-lg font-black text-emerald-900"
        >
          ‹
        </button>
        {pages.map((item) => (
          <button
            key={item.position}
            type="button"
            aria-current={item.index === pageIndex ? "page" : undefined}
            onClick={() => setPageIndex(item.index)}
            className={`min-w-[2.6rem] rounded-full px-2 py-2 text-sm font-black ${
              item.index === pageIndex
                ? "bg-emerald-800 text-white"
                : "bg-white text-emerald-900 ring-1 ring-emerald-200"
            }`}
          >
            {item.position}
          </button>
        ))}
        <button
          type="button"
          aria-label="Next Climate Project"
          onClick={() => go(pageIndex + 1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-white text-lg font-black text-emerald-900"
        >
          ›
        </button>
      </nav>

      {page ? (
        <div
          className="mt-5"
          onTouchStart={(event) => setTouchStart(event.changedTouches[0]?.clientX ?? null)}
          onTouchEnd={(event) => {
            if (touchStart == null) return;
            const delta = (event.changedTouches[0]?.clientX ?? touchStart) - touchStart;
            if (delta > 40) go(pageIndex - 1);
            if (delta < -40) go(pageIndex + 1);
            setTouchStart(null);
          }}
        >
          <ClimateProjectFundCard
            key={page.position}
            page={page}
            clubName={clubName}
            fundingOpen={fundingOpen}
            busy={busy}
            used={sponsorIsUsed(page.sponsor, used)}
            confirming={confirming}
            voteError={voteError}
            voteNotice={voteNotice}
            onSelectFundIt={() => setConfirming(true)}
            onCancel={() => setConfirming(false)}
            onConfirm={() => {
              if (!page.sponsor || !page.project) return;
              void Promise.resolve(
                onFund({
                  brandName: page.sponsor.brandName,
                  projectNumber: String(page.project.number),
                })
              );
            }}
          />
        </div>
      ) : null}
    </section>
  );
}

function sponsorIsUsed(
  sponsor: FanProjectSponsor | null,
  used: Set<string>
): boolean {
  if (!sponsor) return false;
  return used.has(sponsor.brandName.trim().toLowerCase());
}

function HowItWorksHeadings({ activeStep }: { activeStep: 1 | 2 | 3 }) {
  return (
    <section
      data-how-it-works="fund-it-headings-only"
      className="rounded-2xl bg-white px-4 py-4 shadow-sm"
    >
      <h2 className="text-center text-lg font-black text-emerald-900">
        {FUND_IT_HOW_IT_WORKS_TITLE}
      </h2>
      <ol className="mt-3 space-y-2">
        {FUND_IT_HOW_IT_WORKS.map((step, index) => {
          const number = index + 1;
          const active = number === activeStep;
          return (
            <li
              key={step.heading}
              data-fund-it-step={number}
              className={`flex items-start gap-2 text-sm ${
                active ? "font-black text-slate-950" : "font-semibold text-slate-600"
              }`}
            >
              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[0.7rem] font-black text-emerald-900">
                {number}
              </span>
              <span>
                {number}. {step.heading}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function ClimateProjectFundCard({
  page,
  clubName,
  fundingOpen,
  busy,
  used,
  confirming,
  voteError,
  voteNotice,
  onSelectFundIt,
  onCancel,
  onConfirm,
}: {
  page: FanClimateProjectPage;
  clubName: string;
  fundingOpen: boolean;
  busy: boolean;
  used: boolean;
  confirming: boolean;
  voteError: string | null;
  voteNotice: string | null;
  onSelectFundIt: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const project = page.project;
  const sponsor = page.sponsor;
  const title = project?.name ?? `Climate Project ${page.position}`;
  const photos = project
    ? showcaseImagesForProject({ id: project.id, image_url: project.imageUrl })
    : [];
  const hero =
    photos[0] ||
    project?.imageUrl ||
    fallbackHeroImage(project?.name, project?.category);
  const logo = sponsor
    ? sponsor.logoUrl ||
      loadBrandLogo(sponsor.brandName) ||
      sponsorLogoSrc(sponsor.brandName, sponsor.logoUrl)
    : null;
  const sponsorKindLabel =
    page.kind === "featured" || sponsor?.kind === "lead"
      ? LEAD_CLIMATE_SPONSOR_LABEL
      : LOCAL_BUSINESS_SPONSOR_LABEL;
  const canFund =
    Boolean(sponsor && project) &&
    canPressFundIt({
      busy,
      fundingOpen,
      used,
      remainingGbp: sponsor?.remainingGbp ?? 0,
      projectNumber: project?.number,
      projectCount: Math.max(project?.number ?? 1, FAN_CLIMATE_PROJECT_PAGE_COUNT),
    });

  return (
    <article
      data-climate-project-card={page.position}
      className="overflow-hidden rounded-[1.6rem] bg-s4p-paper text-slate-950"
    >
      <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
        {page.badge}
      </p>
      <h3 className="mt-3 text-3xl font-black leading-tight tracking-tight">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        {project?.description ??
          "This Climate Project will appear here when the club Sustainability Director posts it."}
      </p>
      <div className="mt-4 overflow-hidden rounded-2xl bg-emerald-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={hero} alt="" className="h-52 w-full object-cover" />
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {sponsorKindLabel}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
            {sponsor ? (
              <BrandMark
                name={sponsor.brandName}
                logoUrl={logo}
                className="h-12 w-12 text-sm"
              />
            ) : (
              <StorefrontIcon />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-black leading-tight">
              {sponsor?.brandName ||
                (page.kind === "featured"
                  ? "Your Lead Climate Sponsor"
                  : "Your local sponsor")}
            </p>
            <p className="text-sm text-slate-500">
              {sponsor
                ? page.kind === "featured"
                  ? "Match Climate Sponsor"
                  : "Local Business Climate Sponsor"
                : "Sponsor identity shown here"}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs text-slate-500">Sponsor wallet balance</p>
            <p className="mt-1 text-2xl font-black text-emerald-800">
              {sponsor ? formatWalletGbp(sponsor.remainingGbp) : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Your available allocation</p>
            <p className="mt-1 text-2xl font-black text-emerald-800">
              {formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
        {used ? (
          <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
            ✓ {FUND_IT_ALLOCATED_LABEL} {formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)}{" "}
            from this Carbon Wallet is on {title}.
          </p>
        ) : (
          <div className="rounded-2xl bg-emerald-50 px-4 py-3">
            <p className="flex items-center gap-2 font-black text-emerald-900">
              <span aria-hidden>✓</span> {READY_TO_ALLOCATE_LABEL}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {readyToAllocateCopy(title)}
            </p>
          </div>
        )}

        {voteError ? (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-center text-sm font-bold text-red-800">
            {voteError}
          </p>
        ) : null}
        {voteNotice && !voteError ? (
          <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-center text-sm font-bold text-emerald-900">
            {voteNotice}
          </p>
        ) : null}

        {used ? (
          <p
            data-testid={`fund-it-${page.position}`}
            className="mt-4 flex h-12 items-center justify-center rounded-full bg-emerald-900 text-sm font-black text-white"
          >
            {FUND_IT_ALLOCATED_LABEL}
          </p>
        ) : confirming ? (
          <div className="mt-4 space-y-2">
            <button
              type="button"
              data-testid={`fund-it-confirm-${page.position}`}
              disabled={!canFund}
              onClick={onConfirm}
              className="flex h-12 w-full items-center justify-center rounded-full bg-emerald-800 text-sm font-black text-white disabled:opacity-50"
            >
              {busy ? "Allocating..." : `Confirm ${formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)} →`}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full text-sm font-semibold text-slate-500"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            data-testid={`fund-it-${page.position}`}
            disabled={!canFund}
            onClick={onSelectFundIt}
            className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-emerald-800 text-sm font-black text-white disabled:opacity-50"
          >
            {fundItButtonLabel()} →
          </button>
        )}
      </div>

      <AboutAccordion title="About this climate project">
        {project ? (
          <div className="space-y-2 text-sm text-slate-600">
            <p>{project.description}</p>
            <ProjectSiteLine
              project={{ name: project.name, location: project.location }}
              clubName={clubName}
            />
            <p>
              Received so far{" "}
              <span className="font-black text-emerald-800">
                {formatWalletGbp(project.fundedGbp)}
              </span>
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Project details appear when the Sustainability Director posts this
            Match Day list.
          </p>
        )}
      </AboutAccordion>

      <AboutAccordion
        title={
          page.kind === "featured"
            ? "About the Lead Climate Sponsor"
            : "About the local sponsor"
        }
      >
        {sponsor ? (
          <div className="space-y-1 text-sm text-slate-600">
            <p className="font-black text-slate-950">{sponsor.brandName}</p>
            <p>{sponsorKindLabel}</p>
            <p>
              Carbon Wallet{" "}
              <span className="font-black text-emerald-800">
                {formatWalletGbp(sponsor.remainingGbp)}
              </span>
            </p>
            {sponsor.sponsoredProjectName ? (
              <p>Committed to {sponsor.sponsoredProjectName}.</p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            {page.kind === "featured"
              ? "The Lead Climate Sponsor for this Match Day will appear here with their logo."
              : "A Local Business Climate Sponsor chooses this Climate Project and the amount they commit to it. Their name and logo then appear here."}
          </p>
        )}
      </AboutAccordion>
    </article>
  );
}

function AboutAccordion({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 overflow-hidden rounded-2xl bg-white shadow-sm">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between px-4 py-4 text-left text-sm font-black"
      >
        {title}
        <span className="text-lg font-normal text-slate-400">{open ? "⌃" : "⌄"}</span>
      </button>
      {open ? <div className="px-4 pb-4">{children}</div> : null}
    </div>
  );
}

function StorefrontIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
      <path
        d="M4 10.5V19a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M3 10.5 5.2 5h13.6L21 10.5c0 1.4-1.1 2.5-2.5 2.5S16 11.9 16 10.5C16 11.9 14.9 13 13.5 13S11 11.9 11 10.5C11 11.9 9.9 13 8.5 13S6 11.9 6 10.5C6 11.9 4.9 13 3.5 13 3.2 13 3 12.8 3 12.5v-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M10 20v-6h4v6" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
