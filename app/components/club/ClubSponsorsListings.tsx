"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/app/components/club/BrandMark";
import { s4pTabClass } from "@/app/lib/s4p-tabs";
import {
  CLUB_SELECT_PROJECTS_PATH,
  CLUB_SPONSOR_LEADERBOARD_PATH,
} from "@/app/lib/routes";
import {
  GLOBAL_BRANDS_TAB_LABEL,
  GLOBAL_BRAND_INVITE_COUNT,
  GLOBAL_COMMITMENT_FEE_RANGES,
  GLOBAL_INVITE_SUBJECT,
  GLOBAL_INVITE_WINDOW_HOURS,
  GLOBAL_SPONSORSHIP_GOAL_RANGES,
  GLOBAL_SPONSORS_ACCEPTED_PER_MATCH,
  LOCAL_BUSINESS_INVITE_COUNT,
  LOCAL_BUSINESS_TAB_LABEL,
  LOCAL_INVITE_SUBJECT,
  LOCAL_SPONSORSHIP_AMOUNT_RANGES,
  SPONSORS_SECTION_TITLE,
  formatRangeLabel,
  globalInviteCountCopy,
  globalInviteMailtos,
  inviteDeadlineLabel,
  inviteWindowOpen,
  localInviteCountCopy,
  localInviteMailtos,
  sponsorsSectionIntroCopy,
  type SponsorInviteRound,
  type SponsorListing,
  type SponsorListingKind,
} from "@/app/lib/sponsor-listings";
import { MATCH_DAY_PROJECT_COUNT } from "@/app/lib/partner-projects";

export type ClubSponsorsListingsProps = {
  clubName: string;
  matchLabel: string;
  projectNames: string[];
  projectCount: number;
  listings: SponsorListing[];
  round: SponsorInviteRound | null;
  notice?: string | null;
  error?: string | null;
  noticeKind?: SponsorListingKind | null;
  sending?: boolean;
  selectedGlobalIds: string[];
  selectedLocalIds: string[];
  onToggle: (listing: SponsorListing) => void;
  onInvite: (kind: SponsorListingKind) => void;
  initialTab?: SponsorListingKind;
};

type DirectoryTab = SponsorListingKind;

export function ClubSponsorsListings({
  clubName,
  matchLabel,
  projectNames,
  projectCount,
  listings,
  round,
  notice,
  error,
  noticeKind,
  sending,
  selectedGlobalIds,
  selectedLocalIds,
  onToggle,
  onInvite,
  initialTab = "global",
}: ClubSponsorsListingsProps) {
  const [tab, setTab] = useState<DirectoryTab>(initialTab);
  const globals = useMemo(
    () => listings.filter((row) => row.kind === "global"),
    [listings]
  );
  const locals = useMemo(
    () => listings.filter((row) => row.kind === "local"),
    [listings]
  );
  const ready = projectCount >= MATCH_DAY_PROJECT_COUNT;
  const windowOpen = round ? inviteWindowOpen(round, new Date()) : false;

  return (
    <section className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
        {clubName}
      </p>
      <h1 className="mt-2 text-4xl font-black">{SPONSORS_SECTION_TITLE}</h1>
      <p className="mt-3 max-w-3xl text-slate-300">{sponsorsSectionIntroCopy()}</p>
      <p className="mt-3 text-sm text-slate-400">
        Match Day: {matchLabel}.{" "}
        {ready
          ? `${projectCount} Climate Projects chosen${
              projectNames.length ? ` — ${projectNames.join(", ")}` : ""
            }.`
          : `Choose ${MATCH_DAY_PROJECT_COUNT} Climate Projects first.`}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={CLUB_SELECT_PROJECTS_PATH}
          className="rounded-xl border border-blue-400/40 px-4 py-2 text-sm font-semibold text-blue-200 hover:bg-blue-500/10"
        >
          Choose Climate Projects
        </Link>
        <Link
          href={CLUB_SPONSOR_LEADERBOARD_PATH}
          className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-300 hover:border-green-400"
        >
          Sponsor Leaderboard
        </Link>
      </div>

      {round?.lockedBrandName && (
        <div className="mt-6 rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-green-200">
          {round.lockedBrandName} is locked in
          {round.lockedAmountGbp
            ? ` at £${round.lockedAmountGbp.toLocaleString("en-GB")}`
            : ""}
          . Climate Projects are Approved and published to {clubName} fans.
        </div>
      )}
      {round && !round.lockedBrandName && windowOpen && (
        <p className="mt-6 text-sm text-amber-200">
          Global Brand invitation window open until{" "}
          {inviteDeadlineLabel(round.expiresAt)}. Highest committed amount wins.
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-2" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "global"}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${s4pTabClass(tab === "global")}`}
          onClick={() => setTab("global")}
        >
          {GLOBAL_BRANDS_TAB_LABEL}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "local"}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${s4pTabClass(tab === "local")}`}
          onClick={() => setTab("local")}
        >
          {LOCAL_BUSINESS_TAB_LABEL}
        </button>
      </div>

      {tab === "global" ? (
        <DirectoryPanel
          kind="global"
          title={GLOBAL_BRANDS_TAB_LABEL}
          copy={globalInviteCountCopy()}
          rows={globals}
          selectedIds={selectedGlobalIds}
          expected={GLOBAL_BRAND_INVITE_COUNT}
          ready={ready}
          sending={sending}
          inviteLabel={`Send ${GLOBAL_INVITE_SUBJECT}`}
          notice={noticeKind === "local" ? null : notice}
          error={noticeKind === "local" ? null : error}
          onToggle={onToggle}
          onInvite={() => onInvite("global")}
          extra={`Only ${GLOBAL_SPONSORS_ACCEPTED_PER_MATCH} Sponsor is accepted within ${GLOBAL_INVITE_WINDOW_HOURS} hours, at the highest committed amount.`}
        />
      ) : (
        <DirectoryPanel
          kind="local"
          title={LOCAL_BUSINESS_TAB_LABEL}
          copy={localInviteCountCopy()}
          rows={locals}
          selectedIds={selectedLocalIds}
          expected={LOCAL_BUSINESS_INVITE_COUNT}
          ready={ready}
          sending={sending}
          inviteLabel={`Send ${LOCAL_INVITE_SUBJECT}`}
          notice={noticeKind === "global" ? null : notice}
          error={noticeKind === "global" ? null : error}
          onToggle={onToggle}
          onInvite={() => onInvite("local")}
        />
      )}

      {round && (round.globalInviteeIds.length > 0 || round.localInviteeIds.length > 0) && (
        <InviteMailFallback round={round} listings={listings} />
      )}
    </section>
  );
}

function DirectoryPanel({
  kind,
  title,
  copy,
  extra,
  rows,
  selectedIds,
  expected,
  ready,
  sending,
  inviteLabel,
  notice,
  error,
  onToggle,
  onInvite,
}: {
  kind: SponsorListingKind;
  title: string;
  copy: string;
  extra?: string;
  rows: SponsorListing[];
  selectedIds: string[];
  expected: number;
  ready: boolean;
  sending?: boolean;
  inviteLabel: string;
  notice?: string | null;
  error?: string | null;
  onToggle: (listing: SponsorListing) => void;
  onInvite: () => void;
}) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-black">{title}</h2>
      <p className="mt-2 text-slate-400">{copy}</p>
      {extra && <p className="mt-1 text-sm text-slate-500">{extra}</p>}
      <p className="mt-2 text-sm font-semibold text-green-300">
        {selectedIds.length} of {expected} selected
      </p>
      <div className="mt-6 space-y-3">
        {rows.map((listing) => {
          const checked = selectedIds.includes(listing.id);
          return (
            <label
              key={listing.id}
              className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-5 ${
                checked
                  ? "border-green-500 bg-slate-800"
                  : "border-slate-700 bg-slate-950"
              }`}
            >
              <input
                type="checkbox"
                className="mt-2 h-5 w-5 accent-green-500"
                checked={checked}
                onChange={() => onToggle(listing)}
                aria-label={`Invite ${listing.brandName}`}
              />
              <BrandMark name={listing.brandName} logoUrl={listing.logoUrl} />
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-bold">{listing.brandName}</h3>
                <p className="text-sm text-slate-400">{listing.contactName}</p>
                {kind === "global" ? (
                  <p className="mt-2 text-sm text-slate-300">
                    Commitment Fee Range:{" "}
                    {formatRangeLabel(
                      GLOBAL_COMMITMENT_FEE_RANGES,
                      listing.commitmentFeeRangeId
                    )}
                    <span className="mx-2 text-slate-600">·</span>
                    Sponsorship/Goal range:{" "}
                    {formatRangeLabel(
                      GLOBAL_SPONSORSHIP_GOAL_RANGES,
                      listing.sponsorshipGoalRangeId
                    )}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-slate-300">
                    Sponsorship amount range:{" "}
                    {formatRangeLabel(
                      LOCAL_SPONSORSHIP_AMOUNT_RANGES,
                      listing.amountRangeId
                    )}
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>
      <button
        type="button"
        disabled={!ready || sending}
        onClick={onInvite}
        className="mt-8 w-full rounded-xl bg-green-500 py-4 font-bold text-slate-950 hover:bg-green-400 disabled:opacity-50"
      >
        {sending ? "Sending..." : inviteLabel}
      </button>
      {notice && (
        <div
          role="status"
          className="mt-4 rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-green-300"
        >
          {notice}
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300"
        >
          {error}
        </div>
      )}
      {!ready && (
        <p className="mt-3 text-center text-sm text-amber-200">
          Choose {MATCH_DAY_PROJECT_COUNT} Climate Projects, then send invitations.
        </p>
      )}
    </div>
  );
}

function InviteMailFallback({
  round,
  listings,
}: {
  round: SponsorInviteRound;
  listings: SponsorListing[];
}) {
  const globalLinks = globalInviteMailtos(round, listings);
  const localLinks = localInviteMailtos(round, listings);
  if (globalLinks.length === 0 && localLinks.length === 0) return null;
  return (
    <div className="mt-8 text-sm text-slate-400">
      <p>
        Stay on this page. Send each Invitation to Sponsor from these links if
        you still need to email the brands:
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {globalLinks.map((row) => (
          <li key={row.href}>
            <a href={row.href} className="font-semibold text-green-300 hover:underline">
              {row.brandName} — Global Brand
            </a>
          </li>
        ))}
        {localLinks.map((row) => (
          <li key={row.href}>
            <a href={row.href} className="font-semibold text-green-300 hover:underline">
              {row.brandName} — Local Business
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function openInvitationMailtos(_hrefs: string[]) {
  // Opening mailto in a new browsing context blanks this page on Windows.
  // Keep the Sustainability Director on Sponsors and show the sent notice instead.
}
