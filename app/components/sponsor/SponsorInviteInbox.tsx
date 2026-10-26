"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GLOBAL_COMMITMENT_FEE_RANGES,
  GLOBAL_INVITE_WINDOW_HOURS,
  GLOBAL_SPONSORSHIP_GOAL_RANGES,
  INVITE_COMMITMENT_FEE_HINT,
  INVITE_COMMITMENT_FEE_LABEL,
  INVITE_GBP_PER_GOAL_HINT,
  INVITE_GBP_PER_GOAL_LABEL,
  INVITE_LOCKED_NEXT_COPY,
  INVITE_MAXIMUM_HINT,
  INVITE_MAXIMUM_LABEL,
  INVITE_PROCEED_APPROVAL_LABEL,
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
  prepareInviteApprovalPath,
  submitGlobalSponsorshipCommitment,
} from "@/app/services/sponsor-listings.service";
import { SafeInput } from "@/app/components/forms/SafeFormField";

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
  const feeRange = rangeById(
    GLOBAL_COMMITMENT_FEE_RANGES,
    listing.commitmentFeeRangeId
  );
  const goalRange = rangeById(
    GLOBAL_SPONSORSHIP_GOAL_RANGES,
    listing.sponsorshipGoalRangeId
  );
  const [commitmentFee, setCommitmentFee] = useState(
    listing.kind === "global" ? String(feeRange?.minGbp ?? "") : ""
  );
  const [gbpPerGoal, setGbpPerGoal] = useState(
    listing.kind === "global" ? String(goalRange?.minGbp ?? "") : ""
  );
  const [maximumSponsorship, setMaximumSponsorship] = useState(
    listing.kind === "global"
      ? String(
          (feeRange?.minGbp ?? 0) + 2 * (goalRange?.minGbp ?? 0) || ""
        )
      : ""
  );
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
        commitmentFeeGbp: Number(commitmentFee),
        gbpPerGoal: Number(gbpPerGoal),
        maximumSponsorshipGbp: Number(maximumSponsorship),
      },
    });
    if (result.round) onRoundChange?.(result.round);
    if (result.error) setError(result.error);
    else if (result.round?.lockedListingId === listing.id) {
      setNotice(`${INVITE_LOCKED_NEXT_COPY}.`);
    } else {
      setNotice(
        "Your amounts are recorded. The highest Maximum Sponsorship within 8 hours is accepted."
      );
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
          {formatInviteGbp(round.lockedAmountGbp)}. A higher Maximum
          Sponsorship within the window can still take the slot.
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
            Registered ranges: Commitment Fee{" "}
            {formatRangeLabel(
              GLOBAL_COMMITMENT_FEE_RANGES,
              listing.commitmentFeeRangeId
            )}
            {" · "}
            Sponsorship/Goal{" "}
            {formatRangeLabel(
              GLOBAL_SPONSORSHIP_GOAL_RANGES,
              listing.sponsorshipGoalRangeId
            )}
            . Enter the three amounts for this Match Day.
          </p>
          <label className="block text-sm text-slate-400">
            {INVITE_COMMITMENT_FEE_LABEL}
            <SafeInput
              type="number"
              min={1}
              step={100}
              value={commitmentFee}
              onChange={(event) => setCommitmentFee(event.target.value)}
              className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
            />
            <span className="mt-1 block text-xs text-slate-500">
              {INVITE_COMMITMENT_FEE_HINT}
            </span>
          </label>
          <label className="block text-sm text-slate-400">
            {INVITE_GBP_PER_GOAL_LABEL}
            <SafeInput
              type="number"
              min={1}
              step={100}
              value={gbpPerGoal}
              onChange={(event) => setGbpPerGoal(event.target.value)}
              className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
            />
            <span className="mt-1 block text-xs text-slate-500">
              {INVITE_GBP_PER_GOAL_HINT}
            </span>
          </label>
          <label className="block text-sm text-slate-400">
            {INVITE_MAXIMUM_LABEL}
            <SafeInput
              type="number"
              min={1}
              step={100}
              value={maximumSponsorship}
              onChange={(event) => setMaximumSponsorship(event.target.value)}
              className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
            />
            <span className="mt-1 block text-xs text-slate-500">
              {INVITE_MAXIMUM_HINT}
            </span>
          </label>
          <button
            type="button"
            disabled={saving}
            onClick={() => void commit()}
            className="w-full rounded-xl bg-green-500 py-3 font-bold text-slate-950 hover:bg-green-400 disabled:opacity-60"
          >
            {saving ? "Submitting..." : "Commit sponsorship amounts"}
          </button>
        </div>
      )}
      {listing.kind === "local" && (
        <p className="mt-4 text-sm text-green-200">
          Invitation received. Log this Local Business Climate Sponsorship from
          your dashboard when you are ready to pay.
        </p>
      )}
    </article>
  );
}
