import {
  CLUB_CHOOSE_PROJECTS_NOTE,
  CLUB_CHOOSE_PROJECTS_STEPS,
} from "@/app/lib/partner-projects";

export default function ClubChooseProjectsCopy({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={className}>
      <ol className="space-y-3 text-lg font-semibold leading-7 text-slate-200 sm:text-xl">
        {CLUB_CHOOSE_PROJECTS_STEPS.map((step, index) => (
          <li key={step} className="flex gap-3">
            <span className="font-black text-s4p-mark">{index + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-base font-semibold text-emerald-200 sm:text-lg">
        {CLUB_CHOOSE_PROJECTS_NOTE}
      </p>
    </div>
  );
}