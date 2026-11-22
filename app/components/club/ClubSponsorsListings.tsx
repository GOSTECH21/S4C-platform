"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BrandMark } from "@/app/components/club/BrandMark";
import { s4pTabClass } from "@/app/lib/s4p-tabs";
import { CLUB_EXISTING_SPONSORS_ID } from "@/app/lib/routes";
import {
  GLOBAL_BRANDS_TAB_LABEL,
  inviteSelectionCountCopy,
  meetsInviteMinimum,
  GLOBAL_INVITE_SUBJECT,
  GLOBAL_MATCH_SPONSORSHIP_RANGES,
  MATCH_SPONSORSHIP_RANGE_LABEL,
  LOCAL_BUSINESS_TAB_LABEL,
  PHILANTHROPIST_SPONSOR_TAB_LABEL,
  LOCAL_INVITE_SUBJECT,
  LOCAL_SPONSORSHIP_AMOUNT_RANGES,
  SEND_INVITATIONS_LABEL,
  EXISTING_SPONSORS_HEADING,
  SPONSORS_SECTION_TITLE,
  formatRangeLabel,
  globalInviteCountCopy,
  globalInviteMailtos,
  localInviteCountCopy,
  localInviteMailtos,
  localInvitesDeliveredCopy,
  localInvitesSentCopy,
  inviteReceiptsForKind,
  isMatchSponsorListing,
  sponsorsSectionIntroCopy,
  type SponsorInviteRound,
  type SponsorListing,
  type SponsorListingKind,
} from "@/app/lib/sponsor-listings";
import { MATCH_DAY_PROJECT_COUNT } from "@/app/lib/partner-projects";
import {
  loadPhilanthropistDirectory,
  philanthropistInviteIds,
  recordPhilanthropistInvites,
  type PhilanthropistDirectoryEntry,
} from "@/app/lib/philanthropist-directory";
import { loadPlatformPhilanthropists } from "@/app/services/philanthropist-directory.service";

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
  children?: ReactNode;
};

type DirectoryTab = SponsorListingKind | "philanthropist";

export function ClubSponsorsListings({
  clubName,
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
  children,
}: ClubSponsorsListingsProps) {
  const [tab, setTab] = useState<DirectoryTab>(initialTab);
  const [philanthropists, setPhilanthropists] = useState<
    PhilanthropistDirectoryEntry[]
  >([]);
  const [selectedPhilanthropistIds, setSelectedPhilanthropistIds] = useState<
    string[]
  >([]);
  const [philanthropistSentIds, setPhilanthropistSentIds] = useState<string[]>(
    []
  );
  const [philanthropistNotice, setPhilanthropistNotice] = useState<string | null>(
    null
  );
  const globals = useMemo(
    () => listings.filter((row) => isMatchSponsorListing(row)),
    [listings]
  );
  const locals = useMemo(
    () => listings.filter((row) => row.kind === "local"),
    [listings]
  );
  const ready = projectCount >= MATCH_DAY_PROJECT_COUNT;
  const globalSent = (round?.globalInviteeIds.length ?? 0) > 0;

  useEffect(() => {
    setPhilanthropists(loadPhilanthropistDirectory());
    setPhilanthropistSentIds(philanthropistInviteIds(clubName));
    void loadPlatformPhilanthropists().then(setPhilanthropists);
  }, [clubName]);

  useEffect(() => {
    if (globalSent && !error) setTab("local");
  }, [globalSent, error]);

  return (
    <section className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
        {clubName}
      </p>
      <h1 className="mt-2 text-4xl font-black">{SPONSORS_SECTION_TITLE}</h1>
      <p className="mt-3 max-w-3xl text-slate-300">{sponsorsSectionIntroCopy()}</p>

      {children}

      <div
        id={CLUB_EXISTING_SPONSORS_ID}
        className="mt-10 scroll-mt-24"
        data-existing-sponsors="club-sponsors-address-books-v1"
      >
        <h2 className="text-3xl font-black">{EXISTING_SPONSORS_HEADING}</h2>
      </div>

      <div className="mt-8 flex flex-wrap gap-2" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "global"}
          data-global-brands-tab={globalSent ? "sent" : "open"}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            globalSent
              ? "border border-slate-800 bg-slate-100 text-slate-950"
              : s4pTabClass(tab === "global")
          }`}
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
        <button
          type="button"
          role="tab"
          aria-selected={tab === "philanthropist"}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${s4pTabClass(tab === "philanthropist")}`}
          onClick={() => setTab("philanthropist")}
        >
          {PHILANTHROPIST_SPONSOR_TAB_LABEL}
        </button>
      </div>

      {tab === "global" ? (
        <DirectoryPanel
          kind="global"
          title={GLOBAL_BRANDS_TAB_LABEL}
          copy={globalInviteCountCopy()}
          rows={globals}
          selectedIds={selectedGlobalIds}
          ready={ready}
          sending={sending}
          inviteLabel={SEND_INVITATIONS_LABEL}
          notice={noticeKind === "local" ? null : notice}
          error={noticeKind === "local" ? null : error}
          invitesSent={globalSent}
          onToggle={onToggle}
          onInvite={() => {
            onInvite("global");
            setTab("local");
          }}
        />
      ) : tab === "local" ? (
        <DirectoryPanel
          kind="local"
          title={LOCAL_BUSINESS_TAB_LABEL}
          copy={localInviteCountCopy()}
          rows={locals}
          selectedIds={selectedLocalIds}
          ready={ready}
          sending={sending}
          inviteLabel={SEND_INVITATIONS_LABEL}
          notice={noticeKind === "global" ? null : notice}
          error={noticeKind === "global" ? null : error}
          receipts={inviteReceiptsForKind(round, listings, "local")}
          receiptIntro={
            round && round.localInviteeIds.length > 0
              ? localInvitesDeliveredCopy(round.localInviteeIds.length)
              : null
          }
          receiptHeadline={
            noticeKind === "global" || notice
              ? null
              : round && round.localInviteeIds.length > 0
                ? localInvitesSentCopy(round.localInviteeIds.length)
                : null
          }
          onToggle={onToggle}
          onInvite={() => onInvite("local")}
        />
      ) : (
        <PhilanthropistDirectoryPanel
          rows={philanthropists}
          selectedIds={selectedPhilanthropistIds}
          sentIds={philanthropistSentIds}
          ready={ready}
          notice={philanthropistNotice}
          onToggle={(id) =>
            setSelectedPhilanthropistIds((current) =>
              current.includes(id)
                ? current.filter((row) => row !== id)
                : [...current, id]
            )
          }
          onInvite={() => {
            if (selectedPhilanthropistIds.length < 1) return;
            const ids = recordPhilanthropistInvites({
              clubName,
              ids: selectedPhilanthropistIds,
            });
            setPhilanthropistSentIds(ids);
            setPhilanthropistNotice(
              `${SEND_INVITATIONS_LABEL} sent to ${selectedPhilanthropistIds.length} Philanthropist Sponsor${selectedPhilanthropistIds.length === 1 ? "" : "s"}.`
            );
          }}
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
  ready,
  sending,
  inviteLabel,
  notice,
  error,
  receipts,
  receiptIntro,
  receiptHeadline,
  invitesSent = false,
  onToggle,
  onInvite,
}: {
  kind: SponsorListingKind;
  title: string;
  copy: string;
  extra?: string;
  rows: SponsorListing[];
  selectedIds: string[];
  ready: boolean;
  sending?: boolean;
  inviteLabel: string;
  notice?: string | null;
  error?: string | null;
  receipts?: { brandName: string; status: string }[];
  receiptIntro?: string | null;
  receiptHeadline?: string | null;
  invitesSent?: boolean;
  onToggle: (listing: SponsorListing) => void;
  onInvite: () => void;
}) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-black">{title}</h2>
      <p className="mt-2 text-slate-400">{copy}</p>
      {extra && <p className="mt-1 text-sm text-slate-500">{extra}</p>}
      <p className="mt-2 text-sm font-semibold text-green-300">
        {inviteSelectionCountCopy(selectedIds.length, kind)}
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
                    {MATCH_SPONSORSHIP_RANGE_LABEL}:{" "}
                    {formatRangeLabel(
                      GLOBAL_MATCH_SPONSORSHIP_RANGES,
                      listing.commitmentFeeRangeId
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
        data-send-invitations="club-sponsors-invite-counts-v1"
        disabled={
          invitesSent || !ready || sending || !meetsInviteMinimum(selectedIds, kind)
        }
        onClick={onInvite}
        className={
          invitesSent
            ? "mt-8 w-full rounded-xl bg-slate-100 py-4 font-bold text-slate-950"
            : "mt-8 w-full rounded-xl bg-s4p-mark py-4 font-bold text-slate-950 hover:brightness-110 active:bg-s4p-mark disabled:bg-s4p-mark/40 disabled:text-slate-950 disabled:opacity-100"
        }
      >
        {invitesSent ? "Invitations sent" : sending ? "Sending..." : inviteLabel}
      </button>
      {notice && !(receipts && receipts.length > 0) && (
        <div
          role="status"
          className="mt-4 rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-green-300"
        >
          {notice}
        </div>
      )}
      {(receiptHeadline || notice || (receipts && receipts.length > 0)) &&
        receipts &&
        receipts.length > 0 && (
        <div
          role="status"
          className="mt-4 rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-green-200"
        >
          <p className="font-semibold text-green-300">
            {notice || receiptHeadline}
          </p>
          {receiptIntro && <p className="mt-2 text-sm">{receiptIntro}</p>}
          <ul className="mt-3 space-y-1 text-sm">
            {receipts.map((row) => (
              <li key={row.brandName}>
                <span className="font-semibold text-green-300">
                  {row.brandName}
                </span>
                {" — "}
                {row.status}
              </li>
            ))}
          </ul>
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
      {ready && !meetsInviteMinimum(selectedIds, kind) && (
        <p className="mt-3 text-center text-sm text-amber-200">
          {inviteSelectionCountCopy(selectedIds.length, kind)}
        </p>
      )}
      {!ready && (
        <p className="mt-3 text-center text-sm text-amber-200">
          Choose {MATCH_DAY_PROJECT_COUNT} Climate Projects, then send invitations.
        </p>
      )}
    </div>
  );
}

function PhilanthropistDirectoryPanel({
  rows,
  selectedIds,
  sentIds,
  ready,
  notice,
  onToggle,
  onInvite,
}: {
  rows: PhilanthropistDirectoryEntry[];
  selectedIds: string[];
  sentIds: string[];
  ready: boolean;
  notice?: string | null;
  onToggle: (id: string) => void;
  onInvite: () => void;
}) {
  const sent = sentIds.length > 0;
  return (
    <div className="mt-8" data-philanthropist-directory="philanthropist-directory-v1">
      <h2 className="text-2xl font-black">{PHILANTHROPIST_SPONSOR_TAB_LABEL}</h2>
      <p className="mt-2 text-slate-400">
        Choose the Philanthropist Sponsors you wish to invite, then press{" "}
        {SEND_INVITATIONS_LABEL}. One sponsor is enough. Registered
        philanthropists are stored for every club in the Philanthropist
        directory.
      </p>
      <p className="mt-2 text-sm font-semibold text-green-300">
        {selectedIds.length > 0
          ? `${selectedIds.length} selected`
          : "Select at least 1 Philanthropist Sponsor to continue"}
      </p>
      <div className="mt-6 space-y-3">
        {rows.map((row) => {
          const checked = selectedIds.includes(row.id);
          return (
            <label
              key={row.id}
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
                onChange={() => onToggle(row.id)}
                aria-label={`Invite ${row.organisation}`}
              />
              <BrandMark name={row.organisation} />
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-bold">{row.organisation}</h3>
                <p className="text-sm text-slate-400">{row.contactName}</p>
                <p className="mt-2 text-sm text-slate-300">
                  {row.clubName ? `${row.clubName} · ` : ""}
                  {row.giftGbp > 0
                    ? `£${row.giftGbp.toLocaleString("en-GB")}`
                    : "Philanthropist Sponsor"}
                </p>
              </div>
            </label>
          );
        })}
      </div>
      <button
        type="button"
        data-send-philanthropist-invitations="philanthropist-directory-v1"
        disabled={sent || !ready || selectedIds.length < 1}
        onClick={onInvite}
        className={
          sent
            ? "mt-8 w-full rounded-xl bg-slate-100 py-4 font-bold text-slate-950"
            : "mt-8 w-full rounded-xl bg-s4p-mark py-4 font-bold text-slate-950 hover:brightness-110 active:bg-s4p-mark disabled:bg-s4p-mark/40 disabled:text-slate-950 disabled:opacity-100"
        }
      >
        {sent ? "Invitations sent" : SEND_INVITATIONS_LABEL}
      </button>
      {notice ? (
        <div
          role="status"
          className="mt-4 rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-green-300"
        >
          {notice}
        </div>
      ) : null}
      {!ready ? (
        <p className="mt-3 text-center text-sm text-amber-200">
          Choose {MATCH_DAY_PROJECT_COUNT} Climate Projects, then send invitations.
        </p>
      ) : null}
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
