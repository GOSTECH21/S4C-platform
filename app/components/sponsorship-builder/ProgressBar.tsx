type ProgressBarProps = {
  step: number;
  totalSteps: number;
};

export default function ProgressBar({
  step,
  totalSteps,
}: ProgressBarProps) {

  const percentage = (step / totalSteps) * 100;

  return (
    <div className="mb-10">

      <div className="mb-2 flex justify-between text-sm font-medium text-slate-600">

        <span>
          Step {step} of {totalSteps}
        </span>

        <span>
          {Math.round(percentage)}%
        </span>

      </div>

      <div className="h-3 w-full rounded-full bg-slate-200">

        <div
          className="h-3 rounded-full bg-emerald-600 transition-all duration-500"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}