"use client";

type ClimateImpactStepProps = {
  impactValue: number;
  setImpactValue: (value: number) => void;
  onContinue: () => void;
};

const impactOptions = [
  {
    value: 1,
    title: "£1 per Sporting Event",
    description: "Unlock £1 of climate funding every time the sponsored event occurs.",
  },
  {
    value: 3,
    title: "£3 per Sporting Event",
    description: "A balanced option for most sponsorship campaigns.",
  },
  {
    value: 5,
    title: "£5 per Sporting Event",
    description: "Create greater climate impact with every sponsored event.",
  },
  {
    value: 10,
    title: "£10 per Sporting Event",
    description: "Premium sponsorship with maximum climate impact.",
  },
];

export default function ClimateImpactStep({
  impactValue,
  setImpactValue,
  onContinue,
}: ClimateImpactStepProps) {
  return (
    <div className="rounded-2xl border bg-white p-8 shadow-sm">

      <h2 className="text-3xl font-bold">
        Step 4 of 6
      </h2>

      <p className="mt-2 text-slate-500">
        Choose the Climate Impact Value that will be unlocked whenever the sponsored sporting event occurs.
      </p>

      <div className="mt-8 space-y-4">

        {impactOptions.map((option) => (

          <label
            key={option.value}
            className="flex cursor-pointer rounded-xl border p-5 hover:border-emerald-500 hover:bg-emerald-50"
          >

            <input
              type="radio"
              className="mr-4 mt-1"
              checked={impactValue === option.value}
              onChange={() => setImpactValue(option.value)}
            />

            <div>

              <h3 className="font-semibold">
                {option.title}
              </h3>

              <p className="text-sm text-slate-500">
                {option.description}
              </p>

            </div>

          </label>

        ))}

      </div>

      <div className="mt-8 flex justify-end">

        <button
          disabled={!impactValue}
          onClick={onContinue}
          className="rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white disabled:bg-gray-300"
        >
          Continue →
        </button>

      </div>

    </div>
  );
}