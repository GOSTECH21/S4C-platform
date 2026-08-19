"use client";

import { SponsorshipProduct } from "@/app/data/sponsorship-products";

type CompetitionStepProps = {
  product: SponsorshipProduct;
  competition: string;
  setCompetition: (value: string) => void;
  onContinue: () => void;
};

const competitions: Record<string, string[]> = {
  Football: [
    "Premier League",
    "Championship",
    "FA Cup",
    "Champions League",
    "Europa League",
  ],

  Rugby: [
    "Six Nations",
    "Premiership Rugby",
    "United Rugby Championship",
  ],

  NFL: [
    "NFL Regular Season",
    "NFL Playoffs",
    "Super Bowl",
  ],

  Basketball: [
    "NBA",
    "EuroLeague",
  ],

  Hockey: [
    "NHL",
  ],

  Golf: [
    "PGA Tour",
    "DP World Tour",
    "The Masters",
  ],
};

export default function CompetitionStep({
  product,
  competition,
  setCompetition,
  onContinue,
}: CompetitionStepProps) {
  return (
    <div className="rounded-2xl border bg-white p-8 shadow-sm">

      <h2 className="text-3xl font-bold">
        {product.icon} {product.name}
      </h2>

      <p className="mt-2 text-slate-500">
        Choose the competition you want to sponsor.
      </p>

      <label className="mt-8 mb-2 block font-semibold">
        Competition
      </label>

      <select
        value={competition}
        onChange={(e) => setCompetition(e.target.value)}
        className="w-full rounded-xl border p-3"
      >
        <option value="">
          Select Competition
        </option>

        {(competitions[product.sport] || []).map((item) => (
          <option
            key={item}
            value={item}
          >
            {item}
          </option>
        ))}
      </select>

      <div className="mt-8 flex justify-end">

        <button
          disabled={!competition}
          onClick={onContinue}
          className="rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white disabled:bg-gray-300"
        >
          Continue →
        </button>

      </div>

    </div>
  );
}