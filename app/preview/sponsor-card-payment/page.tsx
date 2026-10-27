"use client";

import { useMemo, useState } from "react";
import { ClubChosenProjectsPanel } from "@/app/components/sponsor/ClubChosenProjectsPanel";
import { StripeCardPayment } from "@/app/components/sponsor/StripeCardPayment";
import {
  MATCH_DAY_APPROVED_LABEL,
  MATCH_DAY_PENDING_APPROVAL_LABEL,
  matchDayProjectApprovalLabel,
} from "@/app/lib/partner-projects";
import {
  CARD_PAYMENT_CONFIRMED_COPY,
  PAY_WITH_CARD_LABEL,
  recordMatchDayCardPayment,
} from "@/app/lib/sponsor-card-payment";

const PROJECTS = [
  { id: "gss", name: "Global Schools Solar" },
  { id: "lcr", name: "London Community Retrofit" },
  { id: "icas", name: "Islington Clean Air Schools" },
  { id: "cfi", name: "Carbon Forest Initiative" },
  { id: "cwu", name: "Clean Water Uganda" },
];

export default function SponsorCardPaymentPreview() {
  const [paid, setPaid] = useState(false);
  const clubName = "Fulham";
  const projects = useMemo(
    () =>
      PROJECTS.map((project) => ({
        id: project.id,
        name: project.name,
        description: null,
        category: null,
        country: "England",
        estimated_co2: null,
        funding_goal: null,
        image_url: null,
        status: "active" as const,
      })),
    []
  );

  return (
    <main className="min-h-screen space-y-8 bg-slate-950 p-8 text-white">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
          Confirmation then card payment
        </p>
        <h1 className="mt-2 text-4xl font-black">{PAY_WITH_CARD_LABEL}</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Deposit into the Climate Sponsorship Wallet opens this Stripe card
          form. Pending approval becomes {MATCH_DAY_APPROVED_LABEL} when payment
          is confirmed.
        </p>
      </section>
      <ClubChosenProjectsPanel
        clubName={clubName}
        projects={projects}
        approved={paid}
        confirmation
      />
      {paid ? (
        <p className="rounded-3xl border border-green-500/40 bg-green-500/10 p-8 font-semibold text-green-300">
          {CARD_PAYMENT_CONFIRMED_COPY} Each project is tagged{" "}
          {matchDayProjectApprovalLabel(true)}, not{" "}
          {MATCH_DAY_PENDING_APPROVAL_LABEL}.
        </p>
      ) : (
        <StripeCardPayment
          amountGbp={2625}
          clubName={clubName}
          onPay={() => {
            recordMatchDayCardPayment({
              clubId: "fulham",
              clubName,
              brandName: "Preview Brand",
              projectIds: PROJECTS.map((project) => project.id),
              amountGbp: 2625,
              kind: "lead",
            });
            setPaid(true);
          }}
        />
      )}
    </main>
  );
}
