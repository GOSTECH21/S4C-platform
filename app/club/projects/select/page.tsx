"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ClimateProject } from "@/app/services/votes.service";
import {
  loadClubSession,
  loadPartnerClimateProjects,
  readStoredMatchDay,
  saveMatchDaySelection,
} from "@/app/services/club-match-day.service";
import {
  MATCH_DAY_LEAD_HOURS,
  MATCH_DAY_PROJECT_COUNT,
  partnerPageCount,
  partnerProjectPage,
} from "@/app/lib/partner-projects";
import { OPENING_SPONSORSHIP, formatMoney } from "@/app/lib/sponsorship-auction";
import {
  CLUB_DASHBOARD_PATH,
  CLUB_LOGIN_PATH,
} from "@/app/lib/routes";

export default function SelectMatchDayProjectsPage() {
  const router = useRouter();
  const [clubName, setClubName] = useState("your club");
  const [clubId, setClubId] = useState<string | null>(null);
  const [projects, setProjects] = useState<ClimateProject[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [minAmount, setMinAmount] = useState(String(OPENING_SPONSORSHIP));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const session = await loadClubSession();
        if (!session) {
          router.push(CLUB_LOGIN_PATH);
          return;
        }
        setClubId(session.club.id);
        setClubName(session.club.name);
        const catalog = await loadPartnerClimateProjects();
        setProjects(catalog);
        const stored = readStoredMatchDay(session.club.id);
        if (stored) {
          setSelected(new Set(stored.projectIds));
          setMinAmount(String(stored.minAmount));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not load partner projects."
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const pages = partnerPageCount(projects.length);
  const visible = useMemo(
    () => partnerProjectPage(projects, page),
    [projects, page]
  );

  function toggle(projectId: string) {
    setError(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else if (next.size < MATCH_DAY_PROJECT_COUNT) {
        next.add(projectId);
      }
      return next;
    });
  }

  async function confirm() {
    if (!clubId) return;
    if (selected.size !== MATCH_DAY_PROJECT_COUNT) {
      setError(`Select exactly ${MATCH_DAY_PROJECT_COUNT} projects.`);
      return;
    }
    const amount = Number(minAmount);
    if (!Number.isFinite(amount) || amount < OPENING_SPONSORSHIP) {
      setError(
        `Minimum sponsorship must be at least ${formatMoney(OPENING_SPONSORSHIP)} per Goal.`
      );
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveMatchDaySelection({
        clubId,
        clubName,
        projectIds: [...selected],
        minAmount: amount,
      });
      router.push(CLUB_DASHBOARD_PATH);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save your match-day selection."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading Climate Project Partners...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => router.push(CLUB_DASHBOARD_PATH)}
          className="text-sm font-semibold text-green-400 hover:underline"
        >
          ← Back to dashboard
        </button>

        <h1 className="mt-6 text-4xl font-black">
          Select Your {MATCH_DAY_PROJECT_COUNT} New Climate Projects for this
          Match Day
        </h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          These {projects.length} projects are offered by Climate Project
          Partners. Pick {MATCH_DAY_PROJECT_COUNT} that {clubName} should
          support, then attach a minimum sponsorship amount per Goal. Do this
          at least {MATCH_DAY_LEAD_HOURS} hours before kick-off.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4">
          <p className="font-bold">
            {selected.size} of {MATCH_DAY_PROJECT_COUNT} selected
          </p>
          <p className="text-sm text-slate-400">
            Page {page + 1} of {pages}
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {visible.map((project) => {
            const isOn = selected.has(project.id);
            const full = !isOn && selected.size >= MATCH_DAY_PROJECT_COUNT;
            return (
              <div
                key={project.id}
                className={`flex flex-col rounded-2xl border p-6 ${
                  isOn
                    ? "border-green-500 bg-slate-800"
                    : "border-slate-700 bg-slate-900"
                }`}
              >
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Climate Project Partner
                </p>
                <h2 className="mt-2 text-2xl font-bold">{project.name}</h2>
                <p className="mt-3 flex-1 text-slate-300">{project.description}</p>
                <div className="mt-4 space-y-1 text-sm text-slate-400">
                  {project.category && <p>{project.category}</p>}
                  {project.country && <p>📍 {project.country}</p>}
                  {project.estimated_co2 != null && (
                    <p>
                      {project.estimated_co2.toLocaleString("en-GB")} t CO₂
                    </p>
                  )}
                </div>
                <button
                  onClick={() => toggle(project.id)}
                  disabled={full}
                  className={`mt-6 rounded-xl py-3 font-bold ${
                    isOn
                      ? "bg-green-500 text-slate-950"
                      : full
                        ? "cursor-not-allowed bg-slate-800 text-slate-500"
                        : "bg-slate-700 text-white hover:bg-slate-600"
                  }`}
                >
                  {isOn ? "✓ Selected" : full ? "Limit reached" : "Select project"}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => setPage((value) => Math.max(0, value - 1))}
            disabled={page === 0}
            className="rounded-xl border border-slate-700 px-5 py-3 font-bold disabled:cursor-not-allowed disabled:text-slate-600"
          >
            {"<< Previous"}
          </button>
          <button
            onClick={() => setPage((value) => Math.min(pages - 1, value + 1))}
            disabled={page >= pages - 1}
            className="rounded-xl bg-slate-800 px-5 py-3 font-bold hover:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-600"
          >
            {"Next >>"}
          </button>
        </div>

        <div className="mt-10 rounded-2xl border border-slate-700 bg-slate-900 p-8">
          <h3 className="text-2xl font-bold">
            Minimum sponsorship per Goal scored by {clubName} players
          </h3>
          <p className="mt-2 text-slate-400">
            Brands can bid above this floor during the voting window. The amount
            locks {MATCH_DAY_LEAD_HOURS === 72 ? "2 hours before kick-off" : ""}.
          </p>
          <label className="mt-6 block text-sm text-slate-400">
            Minimum £ / Goal
            <input
              type="number"
              min={OPENING_SPONSORSHIP}
              step={100}
              value={minAmount}
              onChange={(event) => setMinAmount(event.target.value)}
              className="mt-2 w-full rounded-lg bg-slate-800 p-4 text-white"
            />
          </label>
          <button
            onClick={confirm}
            disabled={saving || selected.size !== MATCH_DAY_PROJECT_COUNT}
            className="mt-6 w-full rounded-xl bg-green-500 py-4 text-lg font-bold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {saving
              ? "Saving..."
              : `Confirm ${MATCH_DAY_PROJECT_COUNT} projects at ${formatMoney(Number(minAmount) || OPENING_SPONSORSHIP)}/Goal (Min)`}
          </button>
        </div>
      </div>
    </main>
  );
}
