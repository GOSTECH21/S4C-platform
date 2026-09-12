"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import type { ClimateProject } from "@/app/services/votes.service";
import {
  loadPartnerLibrary,
  loadPartnerSession,
  publishSccanCatalog,
  uploadPartnerProject,
  type PartnerProfile,
} from "@/app/services/partner.service";
import {
  HOME_PATH,
  PARTNER_LOGIN_PATH,
} from "@/app/lib/routes";
import {
  FEATURED_PROJECT_NAME,
  SCCAN_CLIMATE_PROJECTS,
  SCCAN_SOURCE_URL,
} from "@/app/lib/sccan-catalog";
import { isFeaturedClimateProject } from "@/app/services/votes.service";

const CATEGORIES = [
  "Solar Energy",
  "Renewable Energy",
  "Biodiversity",
  "Sustainable Agriculture",
  "Active Travel",
  "Recycling",
  "Ocean Cleanup",
  "Community Climate Action",
  "Resilience",
  "Education",
];

export default function PartnerDashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [projects, setProjects] = useState<ClimateProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Community Climate Action",
    country: "Scotland",
    estimated_co2: "",
    funding_goal: "",
  });

  async function refresh() {
    const session = await loadPartnerSession();
    if (!session) {
      router.push(PARTNER_LOGIN_PATH);
      return;
    }
    setEmail(session.email);
    setProfile(session.profile);
    await publishSccanCatalog();
    setProjects(await loadPartnerLibrary());
  }

  useEffect(() => {
    refresh()
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load projects.")
      )
      .finally(() => setLoading(false));
  }, [router]);

  async function handleUpload(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setSaving(true);
    try {
      await uploadPartnerProject({
        name: form.name,
        description: form.description,
        category: form.category,
        country: form.country,
        estimated_co2: Number(form.estimated_co2) || 0,
        funding_goal: Number(form.funding_goal) || 0,
      });
      setForm({
        name: "",
        description: "",
        category: form.category,
        country: form.country,
        estimated_co2: "",
        funding_goal: "",
      });
      setNotice("Project uploaded. Sustainability Directors can now include it in later catalogs.");
      setProjects(await loadPartnerLibrary());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setSaving(false);
    }
  }

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

  const featured = projects.filter(isFeaturedClimateProject);
  const sccan = projects.filter(
    (project) =>
      !isFeaturedClimateProject(project) &&
      SCCAN_CLIMATE_PROJECTS.some(
        (item) => item.name.toLowerCase() === project.name.toLowerCase()
      )
  );
  const uploaded = projects.filter(
    (project) =>
      !isFeaturedClimateProject(project) &&
      !SCCAN_CLIMATE_PROJECTS.some(
        (item) => item.name.toLowerCase() === project.name.toLowerCase()
      )
  );

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
              Climate Partner
            </p>
            <h1 className="mt-2 text-4xl font-black">
              {profile?.organisationName ?? "Your climate programme"}
            </h1>
            <p className="mt-2 max-w-2xl text-slate-300">
              Publish projects for Sustainability Directors to choose from before
              they invite brands and send match-day votes to fans. Demo catalog:{" "}
              <a href={SCCAN_SOURCE_URL} className="text-green-400 underline">
                sccan.scot
              </a>{" "}
              ({SCCAN_CLIMATE_PROJECTS.length} projects) plus featured{" "}
              {FEATURED_PROJECT_NAME}.
            </p>
            <p className="mt-2 text-sm text-slate-500">{email}</p>
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
        {notice && (
          <div className="mt-6 rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-green-300">
            {notice}
          </div>
        )}

        <section className="mt-10">
          <h2 className="text-2xl font-black">Featured project</h2>
          <div className="mt-4 grid gap-6">
            {featured.map((project) => (
              <ProjectRow key={project.id} project={project} featured />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-black">
            SCCAN catalog ({sccan.length} of {SCCAN_CLIMATE_PROJECTS.length})
          </h2>
          <p className="mt-2 text-slate-400">
            These 19 projects are offered to every Sustainability Director on
            match day.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {sccan.map((project) => (
              <ProjectRow key={project.id} project={project} />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-black">Upload a climate project</h2>
          <form
            onSubmit={handleUpload}
            className="mt-6 grid gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
            <input
              required
              placeholder="Project name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="rounded-lg bg-slate-800 p-4"
            />
            <textarea
              required
              placeholder="Description"
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              className="h-28 rounded-lg bg-slate-800 p-4"
            />
            <select
              value={form.category}
              onChange={(event) =>
                setForm({ ...form, category: event.target.value })
              }
              className="rounded-lg bg-slate-800 p-4"
            >
              {CATEGORIES.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
            <input
              placeholder="Country"
              value={form.country}
              onChange={(event) =>
                setForm({ ...form, country: event.target.value })
              }
              className="rounded-lg bg-slate-800 p-4"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <input
                required
                type="number"
                min={0}
                placeholder="Estimated t CO₂"
                value={form.estimated_co2}
                onChange={(event) =>
                  setForm({ ...form, estimated_co2: event.target.value })
                }
                className="rounded-lg bg-slate-800 p-4"
              />
              <input
                required
                type="number"
                min={0}
                placeholder="Funding goal (£)"
                value={form.funding_goal}
                onChange={(event) =>
                  setForm({ ...form, funding_goal: event.target.value })
                }
                className="rounded-lg bg-slate-800 p-4"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-green-500 py-4 font-bold text-slate-950 disabled:opacity-70"
            >
              {saving ? "Uploading..." : "Upload climate project"}
            </button>
          </form>

          {uploaded.length > 0 && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {uploaded.map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ProjectRow({
  project,
  featured = false,
}: {
  project: ClimateProject;
  featured?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      {featured && (
        <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-bold">
          Featured
        </span>
      )}
      <h3 className={`font-bold ${featured ? "mt-3 text-2xl" : "text-xl"}`}>
        {project.name}
      </h3>
      <p className="mt-2 text-sm text-slate-300">{project.description}</p>
      <p className="mt-3 text-xs text-slate-500">
        {project.country}
        {project.estimated_co2 != null
          ? ` · ${project.estimated_co2.toLocaleString("en-GB")} t CO₂`
          : ""}
      </p>
    </div>
  );
}
