"use client";

type BudgetStepProps = {
  budget: number;
  setBudget: (value: number) => void;
  onContinue: () => void;
};

export default function BudgetStep({
  budget,
  setBudget,
  onContinue,
}: BudgetStepProps) {

  return (

    <div className="rounded-2xl border bg-white p-8 shadow-sm">

      <h2 className="text-3xl font-bold">
        Step 5 of 6
      </h2>

      <p className="mt-2 text-slate-500">
        Set the maximum marketing budget for this sponsorship.
      </p>

      <div className="mt-8">

        <label className="mb-2 block font-semibold">
          Campaign Budget (£)
        </label>

        <input
          type="number"
          min={100}
          step={100}
          value={budget || ""}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full rounded-xl border p-3"
          placeholder="10000"
        />

      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-4">

        <p className="text-sm text-slate-600">

          This is the maximum amount that can be committed from your
          marketing budget for this sponsorship campaign.

        </p>

      </div>

      <div className="mt-8 flex justify-end">

        <button
          disabled={!budget}
          onClick={onContinue}
          className="rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white disabled:bg-gray-300"
        >
          Continue →
        </button>

      </div>

    </div>

  );

}