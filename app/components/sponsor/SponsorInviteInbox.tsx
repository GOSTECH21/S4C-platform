"use client";

import { useState } from "react";
import {
  GLOBAL_COMMITMENT_FEE_RANGES,
  GLOBAL_INVITE_WINDOW_HOURS,
  formatRangeLabel,
  inviteDeadlineLabel,
  inviteWindowOpen,
  type SponsorInviteRound,
  type SponsorListing,
} from "@/app/lib/sponsor-listings";
import { MATCH_DAY_APPROVED_LABEL } from "@/app/lib/partner-projects";
import { submitGlobalSponsorshipCommitment } from "@/app/services/sponsor-listings.service";
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
  const [amount, setAmount] = useState(
    listing.kind === "global"
      ? String(
          GLOBAL_COMMITMENT_FEE_RANGES.find(
            (row) => row.id === listing.commitmentFeeRangeId
          )?.minGbp ?? ""
        )
      : ""
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const open = inviteWindowOpen(round, new Date());
  const isWinner = round.lockedListingId === listing.id;

  async function commit() {
    if (listing.kind !== "global") return;
    setSaving(true);
    setError(null);
    setNotice(null);
    const result = await submitGlobalSponsorshipCommitment({
      clubId: round.clubId,
      listing,
      amountGbp: Number(amount),
    });
    if (result.round) onRoundChange?.(result.round);
    if (result.error) setError(result.error);
    else if (result.round?.lockedListingId === listing.id) {
      setNotice(
        `You are locked in for ${round.clubName}. Climate Projects are now ${MATCH_DAY_APPROVED_LABEL} and visible to that club's fans.`
      );
    } else {
      setNotice("Your amount is recorded. The highest commitment within 8 hours is accepted.");
    }
    setSaving(false);
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
          {round.lockedAmountGbp
            ? ` at £${round.lockedAmountGbp.toLocaleString("en-GB")}`
            : ""}
          . Projects are {MATCH_DAY_APPROVED_LABEL}.
        </p>
      )}
      {round.lockedBrandName && !isWinner && (
        <p className="mt-4 text-sm text-amber-200">
          {round.lockedBrandName} currently holds this Match Day at £
          {(round.lockedAmountGbp ?? 0).toLocaleString("en-GB")}. A higher amount
          within the window can still take the slot.
        </p>
      )}
      {notice && <p className="mt-4 text-sm text-green-300">{notice}</p>}
      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
      {listing.kind === "global" && open && (
        <div className="mt-5">
          <p className="text-sm text-slate-400">
            Your Commitment Fee Range:{" "}
            {formatRangeLabel(GLOBAL_COMMITMENT_FEE_RANGES, listing.commitmentFeeRangeId)}
          </p>
          <label className="mt-3 block text-sm text-slate-400">
            Amount you commit for this Match Day (£)
            <SafeInput
              type="number"
              min={1}
              step={100}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
            />
          </label>
          <button
            type="button"
            disabled={saving}
            onClick={() => void commit()}
            className="mt-4 w-full rounded-xl bg-green-500 py-3 font-bold text-slate-950 hover:bg-green-400 disabled:opacity-60"
          >
            {saving ? "Submitting..." : "Commit sponsorship amount"}
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
