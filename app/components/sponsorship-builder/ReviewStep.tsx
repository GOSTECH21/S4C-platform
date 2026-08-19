"use client";

import { SponsorshipProduct } from "@/app/data/sponsorship-products";

type ReviewStepProps = {
  product: SponsorshipProduct;
  competition: string;
  fixture: string;
  selectedTeam: string;
  impactValue: number;
  budget: number;
  onLaunch: () => void;
};

export default function ReviewStep({
  product,
  competition,
  fixture,
  selectedTeam,
  impactValue,
  budget,
  onLaunch,
}: ReviewStepProps) {
  return (
    <div className="rounded-2xl border bg-white p-8 shadow-sm">

      <h2 className="text-3xl font-bold">
        Review Sponsorship
      </h2>

      <p className="mt-2 text-slate-500">
        Please review your sponsorship before launching.
      </p>

      <div className="mt-8 space-y-5">

        <SummaryRow
          label="Sponsorship Product"
          value={product.name}
        />

        <SummaryRow
          label="Competition"
          value={competition}
        />

        <SummaryRow
          label="Fixture"
          value={fixture}
        />

        <SummaryRow
          label="Sponsored Team"
          value={selectedTeam}
        />

        <SummaryRow
          label="Climate Impact Value"
          value={`£${impactValue} per ${product.trigger}`}
        />

        <SummaryRow
          label="Marketing Budget Commitment"
          value={`£${budget.toLocaleString()}`}
        />

      </div>

      <div className="mt-10 rounded-xl bg-emerald-50 p-6">

        <h3 className="font-semibold">
          Climate Impact
        </h3>

        <p className="mt-3 text-slate-600">

          Every qualifying sporting event unlocks
          <strong> £{impactValue}</strong> of climate funding,
          empowering supporters to direct real marketing investment
          towards verified climate projects.

        </p>

      </div>

      <div className="mt-10 flex justify-end">

        <button
          onClick={onLaunch}
          className="rounded-xl bg-emerald-600 px-10 py-4 text-lg font-semibold text-white hover:bg-emerald-700"
        >
          Launch Sponsorship
        </button>

      </div>

    </div>
  );
}

type SummaryRowProps = {
  label: string;
  value: string;
};

function SummaryRow({
  label,
  value,
}: SummaryRowProps) {
  return (
    <div className="flex justify-between border-b pb-3">

      <span className="font-medium text-slate-600">
        {label}
      </span>

      <span className="font-semibold">
        {value}
      </span>

    </div>
  );
}