"use client";

import ClubNav from "@/app/components/club/ClubNav";
import SendInvitationToSponsorsLink from "@/app/components/club/SendInvitationToSponsorsLink";
import { ClimateProjectCivBlock } from "@/app/components/climate/ClimateProjectCiv";
import { CLUB_ADDRESS_BOOKS_ID } from "@/app/lib/routes";
import {
  MATCH_DAY_PENDING_APPROVAL_LABEL,
  SEND_INVITATION_LABEL,
} from "@/app/lib/partner-projects";

const PROJECT = {
  name: "Clean Water Uganda",
  description: "Provide solar-powered clean water systems.",
  country: "Uganda",
  funding_goal: 75000,
  estimated_co2: 1500,
  status: "live",
};

export default function ClubPendingInvitePreviewPage() {
  return (
    <main className="min-h-screen p-4 text-white sm:p-10">
      <div className="mx-auto max-w-7xl">
        <ClubNav />
        <section className="mt-6 rounded-3xl border border-slate-700 bg-slate-900 p-4 sm:p-10">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-bold">{PROJECT.name}</h3>
              <span className="shrink-0 rounded-full border border-s4p-mark bg-s4p-mark/15 px-3 py-1 text-xs font-semibold text-slate-950">
                {MATCH_DAY_PENDING_APPROVAL_LABEL}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400">📍 {PROJECT.country}</p>
            <p className="mt-3 text-slate-300">{PROJECT.description}</p>
            <ClimateProjectCivBlock project={PROJECT} compact={false} />
          </div>
          <SendInvitationToSponsorsLink
            href={`/preview/club-sponsors-address-books#${CLUB_ADDRESS_BOOKS_ID}`}
          />
          <p className="mt-4 text-center text-sm text-slate-500">
            Live dashboard uses the same {SEND_INVITATION_LABEL} bar after the
            last Pending Approval project.
          </p>
        </section>
      </div>
    </main>
  );
}
