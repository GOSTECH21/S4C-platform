"use client";

import Link from "next/link";
import { SEND_INVITATION_LABEL } from "@/app/lib/partner-projects";
import { CLUB_SPONSORS_ADDRESS_BOOKS_PATH } from "@/app/lib/routes";

export default function SendInvitationToSponsorsLink({
  href = CLUB_SPONSORS_ADDRESS_BOOKS_PATH,
  className = "",
}: {
  href?: string;
  className?: string;
}) {
  return (
    <div
      data-send-invitation-to-sponsors="club-sponsors-address-books-v1"
      data-pending-invite-bar="club-pending-invite-v1"
      className={`sticky bottom-0 z-30 mt-6 bg-gradient-to-t from-slate-950 from-55% to-transparent pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 ${className}`}
    >
      <Link
        href={href}
        className="block w-full rounded-xl bg-green-500 px-4 py-4 text-center text-base font-bold text-slate-950 shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:bg-green-400 sm:text-lg"
      >
        {SEND_INVITATION_LABEL}
      </Link>
      <p className="mt-2 text-center text-xs text-slate-400 sm:text-sm">
        Pending Approval projects stay tagged until you send invitations from
        the Address Book in Sponsors.
      </p>
    </div>
  );
}
