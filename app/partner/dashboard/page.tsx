"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import type { ClimateProject } from "@/app/services/votes.service";
import {
  loadMyListedClimateProjects,
  loadPartnerSession,
  type PartnerProfile,
} from "@/app/services/partner.service";
import {
  HOME_PATH,
  PARTNER_LOGIN_PATH,
} from "@/app/lib/routes";
import { civForProject } from "@/app/lib/climate-impact-value";
import { ClimateProjectCivBlock } from "@/app/components/climate/ClimateProjectCiv";
import { ClimateProjectListingForm } from "@/app/components/climate/ClimateProjectListingForm";
import { ProjectSiteLine } from "@/app/components/climate/ProjectSiteLine";

export default function PartnerDashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [projects, setProjects] = useState<ClimateProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const session = await loadPartnerSession();
    if (!session) {
      router.push(PARTNER_LOGIN_PATH);
      return;
    }
    setEmail(session.email);
    setProfile(session.profile);
    setProjects(await loadMyListedClimateProjects());
  }

  useEffect(() => {
    refresh()
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load your projects.")
      )
      .finally(() => setLoading(false));
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.push(PARTNER_LOGIN_PATH);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading Climate Partner dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
              Climate Partner
            </p>
            <h1 className="mt-2 text-4xl font-black">
              List your Climate Project
            </h1>
            <p className="mt-2 max-w-2xl text-slate-300">
              You are a Project Partner with a Climate Project to put on S4P.
              Fill in the Climate Project Form, sign the undertaking, and list
              it. Clubs’ Sustainability Directors can then select it. S4P will
              not list a project without CIV, Funding Amount Sought, PIP, the
              implementation postcode and this sign-off.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {profile?.organisationName}
              {email ? ` · ${email}` : ""}
            </p>
          </div>
          <div className="flex gap-3">
            <a href={HOME_PATH} className="rounded-xl border border-slate-700 px-4 py-3">
              Home
            </a>
            <button
              onClick={logout}
              className="rounded-xl bg-red-500 px-4 py-3 font-semibold"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        <div className="mt-10">
          <ClimateProjectListingForm
            defaultCountry={profile?.country ?? ""}
            defaultSignerName={profile?.contactName ?? ""}
            onListed={async () => setProjects(await loadMyListedClimateProjects())}
          />
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-black">Your listed Climate Projects</h2>
          <p className="mt-2 text-slate-400">
            These are the projects you have signed off and listed. They are
            visible to Sustainability Directors. A club cannot add tCO₂e until
            a project is Live.
          </p>
          {projects.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-8 text-slate-400">
              You have not listed a Climate Project yet. Use the Climate Project
              Form above to fill, sign and list one.
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {projects.map((project) => (
                <ListedProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ListedProjectCard({ project }: { project: ClimateProject }) {
  const civ = civForProject(project);
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      {civ.undertakingSigned ? (
        <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300">
          Signed
        </span>
      ) : null}
      <h3 className="mt-3 text-2xl font-bold">{project.name}</h3>
      <p className="mt-2 text-sm text-slate-300">{project.description}</p>
      <div className="mt-3">
        <ProjectSiteLine project={project} />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {project.country}
        {` · ${civ.verificationStatus}`}
      </p>
      <ClimateProjectCivBlock project={project} compact={false} />
    </div>
  );
}
