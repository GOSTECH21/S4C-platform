"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GLOBAL_INVITE_WINDOW_HOURS,
  GLOBAL_MATCH_SPONSORSHIP_RANGES,
  INVITE_LOCKED_NEXT_COPY,
  INVITE_PROCEED_APPROVAL_LABEL,
  LOCAL_INVITE_AMOUNT_LABEL,
  LOCAL_INVITE_NEXT_COPY,
  LOCAL_INVITE_SIGN_LABEL,
  LOCAL_SPONSORSHIP_AMOUNT_RANGES,
  MATCH_SPONSORSHIP_COMMIT_LABEL,
  MATCH_SPONSORSHIP_HINT,
  MATCH_SPONSORSHIP_LABEL,
  MATCH_SPONSORSHIP_RANGE_LABEL,
  formatRangeLabel,
  formatInviteGbp,
  inviteDeadlineLabel,
  inviteWindowOpen,
  lockedInviteSummary,
  rangeById,
  type SponsorInviteRound,
  type SponsorListing,
} from "@/app/lib/sponsor-listings";
import {
  acceptLocalInviteSponsorship,
  prepareInviteApprovalPath,
  submitGlobalSponsorshipCommitment,
} from "@/app/services/sponsor-listings.service";
import { SafeInput } from "@/app/components/forms/SafeFormField";
import { sponsorWalletPath } from "@/app/lib/routes";
import {
  LOCAL_SIGNOFF_TERMS,
  LOCAL_SPONSOR_MIN_GBP,
  isSignedOffLocalSponsor,
  localSponsorsForClub,
} from "@/app/lib/local-sponsor";
import { brandsMatch } from "@/app/lib/climate-sponsors";

export function SponsorInviteInbox({
  listing,
  rounds,
  onRoundChange,
}: {
  listing: SponsorListing;
  rounds: SponsorInviteRound[];
  onRoundChange?: (round: SponsorInviteRound) => void;
}) {
  if (rounds.length === 0) {
    return (
      <p className="text-slate-400">
        No Invitation to Sponsor is waiting. Club Sustainability Directors send
        invitations from the Sponsors listings.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {rounds.map((round) => (
        <InviteCard
          key={round.id}
          listing={listing}
          round={round}
          onRoundChange={onRoundChange}
        />
      ))}
    </div>
  );
}

function InviteCard({
  listing,
  round,
  onRoundChange,
}: {
  listing: SponsorListing;
  round: SponsorInviteRound;
  onRoundChange?: (round: SponsorInviteRound) => void;
}) {
  const matchRange = rangeById(
    GLOBAL_MATCH_SPONSORSHIP_RANGES,
    listing.commitmentFeeRangeId
  );
  const localRange = rangeById(
    LOCAL_SPONSORSHIP_AMOUNT_RANGES,
    listing.amountRangeId
  );
  const [matchSponsorship, setMatchSponsorship] = useState(
    listing.kind === "global" ? String(matchRange?.minGbp ?? "") : ""
  );
  const [localAmount, setLocalAmount] = useState(
    listing.kind === "local"
      ? String(localRange?.minGbp || LOCAL_SPONSOR_MIN_GBP)
      : ""
  );
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [signerName, setSignerName] = useState("");
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [openingApproval, setOpeningApproval] = useState(false);
  const open = inviteWindowOpen(round, new Date());
  const isWinner = round.lockedListingId === listing.id;
  const ownCommitment = round.commitments.find(
    (row) => row.listingId === listing.id
  );

  async function commit() {
    if (listing.kind !== "global") return;
    setSaving(true);
    setError(null);
    setNotice(null);
    const result = await submitGlobalSponsorshipCommitment({
      clubId: round.clubId,
      listing,
      funding: {
        matchSponsorshipGbp: Number(matchSponsorship),
        commitmentFeeGbp: Number(matchSponsorship),
        gbpPerGoal: 0,
        maximumSponsorshipGbp: Number(matchSponsorship),
      },
    });
    if (result.round) onRoundChange?.(result.round);
    if (result.error) setError(result.error);
    else if (result.round?.lockedListingId === listing.id) {
      setNotice(`${INVITE_LOCKED_NEXT_COPY}.`);
    } else {
      setNotice(
        `Your ${MATCH_SPONSORSHIP_LABEL} is recorded. The highest amount within 8 hours is accepted.`
      );
    }
    setSaving(false);
  }

  const signedLocal = localSponsorsForClub(round.clubName).find((row) =>
    brandsMatch(row.brandName, listing.brandName)
  );
  const localSigned = Boolean(
    signedLocal && isSignedOffLocalSponsor(signedLocal)
  );

  async function acceptLocal() {
    if (listing.kind !== "local") return;
    setSaving(true);
    setError(null);
    setNotice(null);
    const result = await acceptLocalInviteSponsorship({
      listing,
      round,
      amountGbp: Number(localAmount),
      signerName,
      acceptedTerms,
    });
    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }
    if (result.paymentPath) {
      router.push(result.paymentPath);
      return;
    }
    setSaving(false);
  }

  async function proceedToApproval() {
    setOpeningApproval(true);
    setError(null);
    try {
      const href = await prepareInviteApprovalPath({ listing, round });
      router.push(href);
    } catch {
      setError("Could not open Approval and Payment. Try again from your Dashboard.");
      setOpeningApproval(false);
    }
  }

  return (
    <article className="rounded-2xl border border-slate-700 bg-slate-950 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
        Invitation to Sponsor
      </p>
      <h3 className="mt-2 text-2xl font-black">{round.clubName}</h3>
      <p className="mt-1 text-slate-300">{round.matchLabel}</p>
      <p className="mt-2 text-sm text-slate-400">
        From {round.directorName}, Sustainability Director.{" "}
        {listing.kind === "global"
          ? `Only one Global Brand is accepted — highest amount within ${GLOBAL_INVITE_WINDOW_HOURS} hours (deadline ${inviteDeadlineLabel(round.expiresAt)}).`
          : "This is a simple Invitation to Sponsor as a Local Business Climate Sponsor."}
      </p>
      {round.projectNames.length > 0 && (
        <ul className="mt-3 list-disc pl-5 text-sm text-slate-300">
          {round.projectNames.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      )}
      {isWinner && (
        <p className="mt-4 font-semibold text-green-300">
          Locked in
          {lockedInviteSummary(ownCommitment, round.lockedAmountGbp)}.{" "}
          {INVITE_LOCKED_NEXT_COPY}.
        </p>
      )}
      {round.lockedBrandName && !isWinner && (
        <p className="mt-4 text-sm text-amber-200">
          {round.lockedBrandName} currently holds this Match Day at{" "}
          {formatInviteGbp(round.lockedAmountGbp)}. A higher{" "}
          {MATCH_SPONSORSHIP_LABEL} within the window can still take the slot.
        </p>
      )}
      {notice && <p className="mt-4 text-sm text-green-300">{notice}</p>}
      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
      {listing.kind === "global" && isWinner && (
        <button
          type="button"
          disabled={openingApproval}
          onClick={() => void proceedToApproval()}
          className="mt-5 w-full rounded-xl bg-green-500 py-3 font-bold text-slate-950 hover:bg-green-400 disabled:opacity-60"
        >
          {openingApproval ? "Opening..." : INVITE_PROCEED_APPROVAL_LABEL}
        </button>
      )}
      {listing.kind === "global" && open && !isWinner && (
        <div className="mt-5 space-y-4">
          <p className="text-sm text-slate-400">
            Your registered {MATCH_SPONSORSHIP_RANGE_LABEL}:{" "}
            {formatRangeLabel(
              GLOBAL_MATCH_SPONSORSHIP_RANGES,
              listing.commitmentFeeRangeId
            )}
            . Enter how much you wish to sponsor this Match for.
          </p>
          <label className="block text-sm text-slate-400">
            {MATCH_SPONSORSHIP_LABEL} (£)
            <SafeInput
              type="number"
              min={1}
              step={100}
              value={matchSponsorship}
              onChange={(event) => setMatchSponsorship(event.target.value)}
              className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
            />
            <span className="mt-1 block text-xs text-slate-500">
              {MATCH_SPONSORSHIP_HINT}
            </span>
          </label>
          <button
            type="button"
            disabled={saving}
            onClick={() => void commit()}
            className="w-full rounded-xl bg-green-500 py-3 font-bold text-slate-950 hover:bg-green-400 disabled:opacity-60"
          >
            {saving ? "Submitting..." : MATCH_SPONSORSHIP_COMMIT_LABEL}
          </button>
        </div>
      )}
      {listing.kind === "local" && (
        <div className="mt-5 space-y-4">
          <p className="text-sm text-green-200">{LOCAL_INVITE_NEXT_COPY}</p>
          {localSigned ? (
            <>
              <p className="font-semibold text-green-300">
                Signed at £
                {(signedLocal?.pledgeGbp ?? 0).toLocaleString("en-GB")}. Proceed
                to Payment for {round.clubName}.
              </p>
              <button
                type="button"
                onClick={() =>
                  router.push(sponsorWalletPath(round.clubName))
                }
                className="w-full rounded-xl bg-green-500 py-3 font-bold text-slate-950 hover:bg-green-400"
              >
                Proceed to Payment
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-400">
                Your registered Sponsorship amount range:{" "}
                {formatRangeLabel(
                  LOCAL_SPONSORSHIP_AMOUNT_RANGES,
                  listing.amountRangeId
                )}
                .
              </p>
              <label className="block text-sm text-slate-400">
                {LOCAL_INVITE_AMOUNT_LABEL}
                <SafeInput
                  type="number"
                  min={LOCAL_SPONSOR_MIN_GBP}
                  step={50}
                  value={localAmount}
                  onChange={(event) => setLocalAmount(event.target.value)}
                  className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
                />
              </label>
              <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-400">
                {LOCAL_SIGNOFF_TERMS}
              </div>
              <label className="flex items-start gap-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                  className="mt-1"
                />
                I have read and agree to the Terms & Conditions.
              </label>
              <label className="block text-sm text-slate-400">
                Signature (type your full name)
                <SafeInput
                  value={signerName}
                  onChange={(event) => setSignerName(event.target.value)}
                  className="mt-2 w-full rounded-lg bg-slate-800 p-3 font-serif text-2xl text-white"
                />
              </label>
              <button
                type="button"
                disabled={saving || !acceptedTerms}
                onClick={() => void acceptLocal()}
                className="w-full rounded-xl bg-green-500 py-3 font-bold text-slate-950 hover:bg-green-400 disabled:opacity-60"
              >
                {saving ? "Saving..." : LOCAL_INVITE_SIGN_LABEL}
              </button>
            </>
          )}
        </div>
      )}
    </article>
  );
}
