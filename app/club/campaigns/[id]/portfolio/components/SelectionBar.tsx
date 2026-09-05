interface SelectionBarProps {
  selected: number;
}

export default function SelectionBar({
  selected,
}: SelectionBarProps) {
  return (
    <div className="rounded-2xl bg-slate-900 p-6">

      <div className="flex items-center justify-between">

        <div>

          <h3 className="text-2xl font-bold text-white">
            Match Portfolio
          </h3>

          <p className="mt-2 text-slate-400">
            {selected} of 5 projects selected
          </p>

        </div>

      </div>

    </div>
  );
}