"use client";

import { useState } from "react";
import { fanInviteRegisterPath } from "@/app/lib/climate-funding";
import { FAN_REGISTER_PATH } from "@/app/lib/routes";
import { FUND_IT_LABEL, FUND_IT_MAX_TIMES } from "@/app/lib/sponsor-wallet";

export const INVITE_FRIENDS_FUNDS_STAMP = "invite-friends-funds-v1";
export const INVITE_FRIENDS_HEADING = "Invite friends to use remaining funds";

export function InviteFriendsRemainingFunds({
  clubId,
  clubName,
}: {
  clubId?: string | null;
  clubName?: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const inviteHref = fanInviteRegisterPath(clubId, clubName);

  async function copyInvite() {
    const url =
      typeof window === "undefined"
        ? inviteHref
        : new URL(inviteHref, window.location.origin).toString();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      data-invite-friends-funds={INVITE_FRIENDS_FUNDS_STAMP}
      className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-slate-950"
    >
      <h3 className="text-xl font-black">{INVITE_FRIENDS_HEADING}</h3>
      <p className="mt-2 max-w-3xl text-sm text-slate-600">
        If Carbon Wallets still show cash on Day 5, invite friends to register
        on S4P. They may or may not support {clubName || "this club"} — they
        only need an account so they can {FUND_IT_LABEL} once from each
        remaining sponsor, up to {FUND_IT_MAX_TIMES} times.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void copyInvite()}
          className="rounded-xl bg-green-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-green-400"
        >
          {copied ? "Invite link copied" : "Copy invite link"}
        </button>
        <a
          href={inviteHref || FAN_REGISTER_PATH}
          className="rounded-xl border border-green-600 px-5 py-3 text-sm font-bold text-emerald-800 hover:bg-green-500/10"
        >
          Open fan registration
        </a>
      </div>
    </div>
  );
}
