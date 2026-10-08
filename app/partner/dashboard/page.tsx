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
import { ListedClimateProjectCard } from "@/app/components/climate/ListedClimateProjectCard";

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
              Your listed Climate Projects
            </h1>
            <p className="mt-2 max-w-2xl text-slate-300">
              This is the Climate Project you signed off for listing on S4P.
              Attach images that explain and showcase it. Sustainability
              Directors can select it; a club cannot add tCO₂e until it is Live.
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

        <section className="mt-10">
          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-8 text-slate-400">
              No Climate Project is listed on this account yet. After you
              register, fill the Climate Project Form and sign it off, it
              appears here on login.
            </div>
          ) : (
            <div className="grid gap-4">
              {projects.map((project) => (
                <ListedClimateProjectCard
                  key={project.id}
                  project={project}
                  canUploadImages
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
