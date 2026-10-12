"use client";

import { formatFundingGbp } from "@/app/lib/platform-stats";
import type { FundedSponsorProject } from "@/app/lib/sponsor-signed-home";

export function FundedClimateProjectsList({
  projects,
}: {
  projects: FundedSponsorProject[];
}) {
  const fanFunded = projects.filter((row) => row.fanFunded || row.fundedGbp > 0);
  return (
    <section className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
        Fan-funded Climate Projects
      </p>
      <h2 className="mt-2 text-3xl font-black">Where your money went</h2>
      <p className="mt-3 max-w-3xl text-slate-300">
        Fans take your Commitment Fee and Goals-scored Sponsorship and put that
        cash onto numbered Climate Projects. Open a project to see how much of
        your money it has received.
      </p>
      {fanFunded.length === 0 ? (
        <p className="mt-6 text-slate-400">
          Fans have not yet taken cash from your Climate Sponsorship Wallet onto
          a Climate Project. These are the signed five waiting for FUND-IT.
        </p>
      ) : null}
      <div className="mt-6 space-y-3">
        {(fanFunded.length > 0 ? fanFunded : projects).map((project) => (
          <details
            key={project.id}
            className="group rounded-2xl border border-slate-700 bg-slate-950 p-5"
          >
            <summary className="cursor-pointer list-none font-bold">
              <span className="flex items-start justify-between gap-4">
                <span>
                  <span
                    aria-hidden
                    className="mr-2 inline-block text-green-400 transition group-open:rotate-90"
                  >
                    ▸
                  </span>
                  {project.name}
                </span>
                <span className="shrink-0 text-sm font-semibold text-green-300">
                  {formatFundingGbp(project.fundedGbp)}
                </span>
              </span>
            </summary>
            <p className="mt-3 text-sm text-slate-400">
              {project.clubName} · {project.matchTitle}
            </p>
            {project.description ? (
              <p className="mt-2 text-slate-300">{project.description}</p>
            ) : null}
            <p className="mt-3 text-sm text-slate-400">
              {project.fanFunded
                ? `Fans have put ${formatFundingGbp(project.fundedGbp)} of your Commitment Fee and Goals-scored Sponsorship onto this Climate Project.`
                : "Waiting for fans to FUND-IT from your Climate Sponsorship Wallet onto this Climate Project."}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
