"use client";

type RewardStepProps = {
  reward: string;
  setReward: (reward: string) => void;
  onContinue: () => void;
};

const rewards = [
  {
    id: "5cc",
    title: "5 Climate Credits",
    description: "Reward every supporter with 5 Climate Credits.",
  },

  {
    id: "10cc",
    title: "10 Climate Credits",
    description: "Reward every supporter with 10 Climate Credits.",
  },

  {
    id: "solar",
    title: "Solar School Credit",
    description: "Contribute directly to Global Schools Solar.",
  },

  {
    id: "tree",
    title: "Tree Planting Credit",
    description: "Fund verified tree planting projects.",
  },
];

export default function RewardStep({
  reward,
  setReward,
  onContinue,
}: RewardStepProps) {

  return (
    <div className="rounded-2xl border bg-white p-8 shadow-sm">

      <h2 className="text-3xl font-bold">
        Step 4 of 6
      </h2>

      <p className="mt-2 text-slate-500">
        Choose the supporter reward.
      </p>

      <div className="mt-8 space-y-4">

        {rewards.map((item) => (

          <label
            key={item.id}
            className="flex cursor-pointer rounded-xl border p-5 hover:bg-emerald-50"
          >

            <input
              type="radio"
              className="mr-4 mt-1"
              checked={reward === item.title}
              onChange={() => setReward(item.title)}
            />

            <div>

              <h3 className="font-semibold">
                {item.title}
              </h3>

              <p className="text-sm text-slate-500">
                {item.description}
              </p>

            </div>

          </label>

        ))}

      </div>

      <div className="mt-8 flex justify-end">

        <button
          disabled={!reward}
          onClick={onContinue}
          className="rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white disabled:bg-gray-300"
        >
          Continue →
        </button>

      </div>

    </div>
  );
}