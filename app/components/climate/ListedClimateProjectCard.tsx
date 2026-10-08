import type { ClimateProject } from "@/app/services/votes.service";
import {
  LIFECYCLE_LABELS,
  civForProject,
  deriveProjectLifecycle,
} from "@/app/lib/climate-impact-value";
import { partnerOrganisationFromLocation } from "@/app/lib/partner-projects";
import { ClimateProjectCivBlock } from "@/app/components/climate/ClimateProjectCiv";
import { PartnerProjectImages } from "@/app/components/climate/PartnerProjectImages";
import { ProjectSiteLine } from "@/app/components/climate/ProjectSiteLine";

export function ListedClimateProjectCard({
  project,
  fundedGbp = 0,
  canUploadImages = false,
}: {
  project: ClimateProject;
  fundedGbp?: number;
  canUploadImages?: boolean;
}) {
  const civ = civForProject(project);
  const stage = deriveProjectLifecycle({ ...project, fundedGbp });
  const provider = partnerOrganisationFromLocation(project.location);
  const stageClass =
    stage === "implementation"
      ? "bg-amber-500 text-slate-950 ring-2 ring-amber-200"
      : stage === "listed"
        ? "bg-emerald-500 text-slate-950 ring-2 ring-emerald-200"
        : "bg-emerald-500/20 text-emerald-200";
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${stageClass}`}
        >
          {LIFECYCLE_LABELS[stage]}
        </span>
        {civ.undertakingSigned ? (
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
            Signed
          </span>
        ) : null}
      </div>
      <h3 className="mt-3 text-2xl font-bold">{project.name}</h3>
      {provider ? (
        <p className="mt-2 text-sm font-semibold text-emerald-300">
          Provider: {provider}
        </p>
      ) : null}
      <p className="mt-2 text-sm text-slate-300">{project.description}</p>
      <div className="mt-3">
        <ProjectSiteLine project={project} />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {project.country}
        {` · ${civ.verificationStatus}`}
      </p>
      <ClimateProjectCivBlock
        project={project}
        fundedGbp={fundedGbp}
        compact={false}
      />
      <PartnerProjectImages
        projectId={project.id}
        imageUrl={project.image_url}
        canUpload={canUploadImages}
      />
    </div>
  );
}
