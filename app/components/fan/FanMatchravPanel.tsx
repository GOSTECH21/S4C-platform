import {
  MATCHRAV_ACCOUNT_INTRO,
  MATCHRAV_ACCOUNT_STAMP,
  MATCHRAV_ACCOUNT_STEPS,
  MATCHRAV_NAME,
  MATCHRAV_TAB_DETAIL,
} from "@/app/lib/matchrav";

export default function FanMatchravPanel() {
  return (
    <section
      className="px-6 pb-16 text-white"
      data-matchrav-account={MATCHRAV_ACCOUNT_STAMP}
    >
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          {MATCHRAV_TAB_DETAIL}
        </p>
        <h1 className="mt-2 text-4xl font-black">{MATCHRAV_NAME}</h1>
        <p className="mt-3 max-w-2xl text-slate-300">{MATCHRAV_ACCOUNT_INTRO}</p>

        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {MATCHRAV_ACCOUNT_STEPS.map((step, index) => (
            <li
              key={step.title}
              className="rounded-2xl border border-emerald-400/25 bg-slate-900/80 p-5"
            >
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                {index + 1}
              </p>
              <h2 className="mt-2 text-xl font-black">{step.title}</h2>
              <p className="mt-2 text-sm font-medium text-slate-300">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
