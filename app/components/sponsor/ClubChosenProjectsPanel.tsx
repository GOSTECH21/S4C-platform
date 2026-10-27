"use client";

import { useEffect, useState } from "react";
import { loadClubChosenClimateProjects } from "@/app/services/sponsor-offers.service";
import type { ClimateProject } from "@/app/services/votes.service";
import { isFeaturedClimateProject } from "@/app/services/votes.service";
import { climateProjectCountryLabel } from "@/app/lib/featured-climate-country";
import {
  MATCH_DAY_GOALS_SCORED_COPY,
  MATCH_DAY_PROJECTS_RECORD_COPY,
  MATCH_DAY_PROJECTS_RECORD_LABEL,
  MATCH_DAY_PROJECTS_SEEN_COPY,
  MATCH_DAY_SIGNOFF_PENDING_COPY,
  chosenProjectsReadyForMatchDay,
} from "@/app/lib/match-day-carbon-offset";
import {
  MATCH_DAY_PENDING_APPROVAL_LABEL,
  matchDayProjectApprovalLabel,
} from "@/app/lib/partner-projects";
import {
  WALLET_PROJECTS_AWAIT_PAYMENT_COPY,
  WALLET_PROJECTS_PAID_COPY,
} from "@/app/lib/sponsor-card-payment";

export function ClubChosenProjectsPanel({
  clubName,
  projects: provided,
  approved = false,
  confirmation = false,
}: {
  clubName: string;
  projects?: ClimateProject[];
  approved?: boolean;
  confirmation?: boolean;
}) {
  const [loaded, setLoaded] = useState<ClimateProject[]>([]);
  const [loading, setLoading] = useState(false);
  const projects = provided ?? loaded;
  const ready = chosenProjectsReadyForMatchDay(projects.length);

  useEffect(() => {
    if (provided || !clubName.trim()) {
      if (!clubName.trim()) setLoaded([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void loadClubChosenClimateProjects(clubName)
      .then((uploaded) => {
        if (!cancelled) setLoaded(uploaded?.projects ?? []);
      })
      .catch(() => {
        if (!cancelled) setLoaded([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [clubName, provided]);

  if (!clubName.trim()) return null;

  return (
    <section className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
        Match Day record
      </p>
      <h2 className="mt-3 text-2xl font-black">
        {MATCH_DAY_PROJECTS_RECORD_LABEL}
      </h2>
      <p className="mt-3 max-w-3xl text-slate-300">
        {MATCH_DAY_GOALS_SCORED_COPY} {MATCH_DAY_PROJECTS_RECORD_COPY}
      </p>
      {loading ? (
        <p className="mt-6 text-slate-500">
          Loading {clubName}&apos;s Climate Projects...
        </p>
      ) : projects.length > 0 ? (
        <>
          <ul className="mt-6 space-y-2 text-slate-200">
            {projects.map((project) => {
              const country = climateProjectCountryLabel(project, { clubName });
              return (
                <li
                  key={project.id}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-semibold">{project.name}</span>
                    <span className="flex shrink-0 flex-wrap justify-end gap-2">
                      {isFeaturedClimateProject({
                        name: project.name,
                        featured: project.featured,
                      }) ? (
                        <span className="rounded-full bg-s4p-mark/15 px-3 py-1 text-xs font-semibold text-slate-950">
                          Featured
                        </span>
                      ) : null}
                      <span className="rounded-full border border-s4p-mark bg-s4p-mark/15 px-3 py-1 text-xs font-semibold text-slate-950">
                        {matchDayProjectApprovalLabel(approved)}
                      </span>
                    </span>
                  </div>
                  {country ? (
                    <p className="mt-1 text-sm text-slate-400">📍 {country}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <p
            className={`mt-5 text-sm font-semibold ${
              ready ? "text-green-300" : "text-amber-200"
            }`}
          >
            {approved
              ? WALLET_PROJECTS_PAID_COPY
              : confirmation
                ? ready
                  ? WALLET_PROJECTS_AWAIT_PAYMENT_COPY
                  : `${MATCH_DAY_SIGNOFF_PENDING_COPY} Tagged ${MATCH_DAY_PENDING_APPROVAL_LABEL} until the full five are uploaded.`
                : ready
                  ? MATCH_DAY_PROJECTS_SEEN_COPY
                  : `${MATCH_DAY_SIGNOFF_PENDING_COPY} Tagged ${MATCH_DAY_PENDING_APPROVAL_LABEL} until the full five are uploaded.`}
          </p>
        </>
      ) : (
        <p className="mt-6 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-5 text-amber-200">
          {MATCH_DAY_SIGNOFF_PENDING_COPY} Waiting for the {clubName}{" "}
          Sustainability Director to upload this Club&apos;s five Climate
          Projects. Tagged {MATCH_DAY_PENDING_APPROVAL_LABEL}.
        </p>
      )}
    </section>
  );
}
