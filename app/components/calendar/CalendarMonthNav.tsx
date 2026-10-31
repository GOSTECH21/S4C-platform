export const CALENDAR_WEEKDAY_CLASS =
  "grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs sm:tracking-[0.16em]";

export function CalendarMonthNav({
  label,
  onPrev,
  onNext,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div
      className="mt-6 flex min-w-0 items-center gap-2 sm:gap-4"
      data-calendar-month-nav="site-mobile-scale-v1"
    >
      <button
        type="button"
        onClick={onPrev}
        className="shrink-0 rounded-xl border border-slate-600 px-3 py-2 text-xs font-semibold sm:px-4 sm:text-sm"
      >
        Previous
      </button>
      <p className="min-w-0 flex-1 text-center text-base font-black leading-tight sm:text-xl">
        {label}
      </p>
      <button
        type="button"
        onClick={onNext}
        className="shrink-0 rounded-xl border border-slate-600 px-3 py-2 text-xs font-semibold sm:px-4 sm:text-sm"
      >
        Next
      </button>
    </div>
  );
}
