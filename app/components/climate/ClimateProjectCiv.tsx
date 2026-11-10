import {
  LIFECYCLE_LABELS,
  PROJECT_LIFECYCLE,
  civForProject,
  deriveProjectLifecycle,
  fundingProgress,
  formatCivPipSummary,
  lifecycleIndex,
  type ProjectLifecycleStage,
} from "@/app/lib/climate-impact-value";

export type ClimateProjectCivTone = "dark" | "paper";

export function FundingProgressPanel({
  receivedGbp,
  soughtGbp,
  tone = "dark",
}: {
  receivedGbp: number;
  soughtGbp: number;
  tone?: ClimateProjectCivTone;
}) {
  const progress = fundingProgress(receivedGbp, soughtGbp);
  if (progress.soughtGbp <= 0 && progress.receivedGbp <= 0) return null;
  const paper = tone === "paper";
  return (
    <div
      className={`mt-3 rounded-xl p-3 ${
        paper
          ? "border border-emerald-200 bg-emerald-50/80"
          : "border border-emerald-500/20 bg-slate-950/70"
      }`}
    >
      <p
        className={`text-[0.65rem] font-semibold uppercase tracking-[0.18em] ${
          paper ? "text-emerald-700" : "text-emerald-400"
        }`}
      >
        Funding progress
      </p>
      <p
        className={`mt-1 text-lg font-black ${
          paper ? "text-slate-950" : "text-white"
        }`}
      >
        {progress.headline}
      </p>
      <div
        className={`mt-2 h-2 overflow-hidden rounded-full ${
          paper ? "bg-emerald-100" : "bg-slate-800"
        }`}
      >
        <div
          className="h-full rounded-full bg-emerald-400"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      <p
        className={`mt-2 text-xs font-semibold ${
          paper ? "text-emerald-700" : "text-amber-300"
        }`}
      >
        {progress.throughS4p}
      </p>
      <p className={`text-xs ${paper ? "text-slate-500" : "text-slate-300"}`}>
        {progress.remainingCopy}
      </p>
    </div>
  );
}

export function ProjectLifecycleStrip({
  stage,
  compact = false,
  tone = "dark",
}: {
  stage: ProjectLifecycleStage;
  compact?: boolean;
  tone?: ClimateProjectCivTone;
}) {
  const active = lifecycleIndex(stage);
  const paper = tone === "paper";
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
                ? paper
                  ? "bg-emerald-700 text-white ring-2 ring-emerald-200"
                  : "bg-emerald-500 text-slate-950 ring-2 ring-emerald-200"
                : done
                  ? paper
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-emerald-500/20 text-emerald-200"
                  : paper
                    ? "bg-emerald-50 text-emerald-700/70"
                    : "bg-slate-800 text-slate-500"
            }`}
            aria-current={current ? "step" : undefined}
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
  pipDays,
  tone = "dark",
}: {
  tonnes: number;
  period?: string;
  pipDays?: number;
  tone?: ClimateProjectCivTone;
}) {
  return (
    <p
      className={`mt-2 text-xs font-semibold ${
        tone === "paper" ? "text-emerald-700" : "text-amber-300"
      }`}
    >
      {formatCivPipSummary(tonnes, pipDays ?? 0)}
    </p>
  );
}

export function ClimateProjectCivBlock({
  project,
  fundedGbp = 0,
  compact = true,
  tone = "dark",
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
  tone?: ClimateProjectCivTone;
}) {
  const civ = civForProject(project);
  const stage = deriveProjectLifecycle({ ...project, fundedGbp });
  const tonnes = civ.projectedCiv || Number(project.estimated_co2) || 0;
  const sought = Number(project.funding_goal) || 0;
  return (
    <>
      {sought > 0 ? (
        <FundingProgressPanel
          receivedGbp={fundedGbp}
          soughtGbp={sought}
          tone={tone}
        />
      ) : null}
      {tonnes > 0 ? (
        <CivSummary tonnes={tonnes} pipDays={civ.pipDays} tone={tone} />
      ) : null}
      <ProjectLifecycleStrip stage={stage} compact={compact} tone={tone} />
    </>
  );
}
