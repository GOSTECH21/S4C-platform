import {
  LIFECYCLE_LABELS,
  PROJECT_LIFECYCLE,
  civForProject,
  deriveProjectLifecycle,
  fundingProgress,
  formatProjectedCiv,
  lifecycleIndex,
  type ProjectLifecycleStage,
} from "@/app/lib/climate-impact-value";

export function FundingProgressPanel({
  receivedGbp,
  soughtGbp,
}: {
  receivedGbp: number;
  soughtGbp: number;
}) {
  const progress = fundingProgress(receivedGbp, soughtGbp);
  if (progress.soughtGbp <= 0 && progress.receivedGbp <= 0) return null;
  return (
    <div className="mt-3 rounded-xl border border-emerald-500/20 bg-slate-950/70 p-3">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-emerald-400">
        Funding progress
      </p>
      <p className="mt-1 text-lg font-black text-white">{progress.headline}</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-emerald-400"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      <p className="mt-2 text-xs font-semibold text-amber-300">{progress.throughS4p}</p>
      <p className="text-xs text-slate-300">{progress.remainingCopy}</p>
    </div>
  );
}

export function ProjectLifecycleStrip({
  stage,
  compact = false,
}: {
  stage: ProjectLifecycleStage;
  compact?: boolean;
}) {
  const active = lifecycleIndex(stage);
  return (
    <ol
      className={`mt-3 flex flex-wrap ${compact ? "gap-1" : "gap-1.5"}`}
      aria-label="Climate Project lifecycle"
    >
      {PROJECT_LIFECYCLE.map((item, index) => {
        const current = index === active;
        const done = index < active;
        return (
          <li
            key={item}
            className={`rounded-full px-2 py-0.5 text-[0.62rem] font-bold ${
              current
                ? "bg-emerald-500 text-slate-950"
                : done
                  ? "bg-emerald-500/20 text-emerald-200"
                  : "bg-slate-800 text-slate-500"
            }`}
          >
            {LIFECYCLE_LABELS[item]}
            {index < PROJECT_LIFECYCLE.length - 1 && !compact ? (
              <span className="ml-1 text-slate-600" aria-hidden>
                →
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export function CivSummary({
  tonnes,
  period,
  pipDays,
}: {
  tonnes: number;
  period: string;
  pipDays?: number;
}) {
  return (
    <p className="mt-2 text-xs font-semibold text-amber-300">
      Projected CIV {formatProjectedCiv(tonnes, period)}
      {pipDays ? ` · PIP ${pipDays} days after full funding` : ""}
    </p>
  );
}

export function ClimateProjectCivBlock({
  project,
  fundedGbp = 0,
  compact = true,
}: {
  project: {
    estimated_co2?: number | null;
    funding_goal?: number | null;
    location?: string | null;
    category?: string | null;
    name?: string | null;
    status?: string | null;
  };
  fundedGbp?: number;
  compact?: boolean;
}) {
  const civ = civForProject(project);
  const stage = deriveProjectLifecycle({ ...project, fundedGbp });
  const tonnes = civ.projectedCiv || Number(project.estimated_co2) || 0;
  const sought = Number(project.funding_goal) || 0;
  return (
    <>
      {sought > 0 ? (
        <FundingProgressPanel receivedGbp={fundedGbp} soughtGbp={sought} />
      ) : null}
      {tonnes > 0 ? (
        <CivSummary tonnes={tonnes} period={civ.civPeriod} pipDays={civ.pipDays} />
      ) : null}
      <ProjectLifecycleStrip stage={stage} compact={compact} />
    </>
  );
}
