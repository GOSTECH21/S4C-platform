"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import type { ClimateProject } from "@/app/services/votes.service";
import {
  loadClubSession,
  loadPartnerClimateProjectLists,
  loadFeaturedMatchDayProject,
  readStoredMatchDay,
  saveMatchDaySelection,
} from "@/app/services/club-match-day.service";
import {
  MATCH_DAY_CHOICE_COUNT,
  MATCH_DAY_PROJECT_COUNT,
  isPartnerUpload,
} from "@/app/lib/partner-projects";
import { isInternationalCatalogName, isLocalCatalogName } from "@/app/lib/sccan-catalog";
import {
  climateProjectCountryLabel,
  localCatalogCountryForClub,
} from "@/app/lib/featured-climate-country";
import {
  DEFAULT_GBP_PER_VOTE,
  DEFAULT_PROJECTED_VOTES,
  OPENING_SPONSORSHIP,
  expectedSponsorshipFromVotes,
  formatGbpPerVote,
  formatMoney,
  gbpPerVoteFromExpected,
} from "@/app/lib/sponsorship-auction";
import {
  CLUB_DASHBOARD_PATH,
  CLUB_LOGIN_PATH,
} from "@/app/lib/routes";
import { clubGateCopy } from "@/app/lib/signed-in-role";
import { identifySignedInKind } from "@/app/services/signed-in-role.service";

export default function SelectMatchDayProjectsPage() {
  const router = useRouter();
  const [clubName, setClubName] = useState("your club");
  const [clubCountry, setClubCountry] = useState<string | null>(null);
  const [clubId, setClubId] = useState<string | null>(null);
  const [localProjects, setLocalProjects] = useState<ClimateProject[]>([]);
  const [internationalProjects, setInternationalProjects] = useState<
    ClimateProject[]
  >([]);
  const [featured, setFeatured] = useState<ClimateProject | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [projectedVotes, setProjectedVotes] = useState(
    String(DEFAULT_PROJECTED_VOTES)
  );
  const [gbpPerVote, setGbpPerVote] = useState(String(DEFAULT_GBP_PER_VOTE));
  const [expectedSponsorship, setExpectedSponsorship] = useState(
    String(expectedSponsorshipFromVotes({ projectedVotes: DEFAULT_PROJECTED_VOTES }))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const session = await loadClubSession();
        if (!session) {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) {
            router.replace(CLUB_LOGIN_PATH);
            return;
          }
          const kind = (await identifySignedInKind()) ?? "unknown";
          setError(clubGateCopy(kind).body);
          setLoading(false);
          return;
        }
        setClubId(session.club.id);
        setClubName(session.club.name);
        setClubCountry(session.club.country);
        const lists = await loadPartnerClimateProjectLists({
          clubName: session.club.name,
          country: session.club.country,
        });
        setLocalProjects(lists.local);
        setInternationalProjects(lists.international);
        const catalog = [...lists.local, ...lists.international];
        const featuredProject = await loadFeaturedMatchDayProject();
        setFeatured(featuredProject);
        const validIds = new Set(catalog.map((project) => project.id));
        const stored = readStoredMatchDay(session.club.id);
        if (stored) {
          const chosen = stored.projectIds.filter(
            (id) => id !== featuredProject?.id && validIds.has(id)
          );
          setSelected(new Set(chosen.slice(0, MATCH_DAY_CHOICE_COUNT)));
          setProjectedVotes(String(stored.projectedVotes));
          setGbpPerVote(String(stored.gbpPerVote));
          setExpectedSponsorship(String(stored.expectedSponsorship));
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

  const localCountry = localCatalogCountryForClub({
    clubName,
    country: clubCountry,
  });
  const visible = page === 0 ? localProjects : internationalProjects;

  function updateProjectedVotes(value: string) {
    setProjectedVotes(value);
    const votes = Number(value);
    const rate = Number(gbpPerVote) || DEFAULT_GBP_PER_VOTE;
    if (Number.isFinite(votes) && votes >= 0) {
      setExpectedSponsorship(
        String(expectedSponsorshipFromVotes({ projectedVotes: votes, gbpPerVote: rate }))
      );
    }
  }

  function updateGbpPerVote(value: string) {
    setGbpPerVote(value);
    const rate = Number(value);
    const votes = Number(projectedVotes) || DEFAULT_PROJECTED_VOTES;
    if (Number.isFinite(rate) && rate >= 0) {
      setExpectedSponsorship(
        String(expectedSponsorshipFromVotes({ projectedVotes: votes, gbpPerVote: rate }))
      );
    }
  }

  function updateExpectedSponsorship(value: string) {
    setExpectedSponsorship(value);
    const expected = Number(value);
    const votes = Number(projectedVotes) || DEFAULT_PROJECTED_VOTES;
    if (Number.isFinite(expected) && expected >= 0 && votes > 0) {
      setGbpPerVote(String(gbpPerVoteFromExpected({ projectedVotes: votes, expectedSponsorship: expected })));
    }
  }

  function toggle(projectId: string) {
    setError(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else if (next.size < MATCH_DAY_CHOICE_COUNT) {
        next.add(projectId);
      }
      return next;
    });
  }

  async function confirm() {
    if (!clubId) return;
    if (selected.size !== MATCH_DAY_CHOICE_COUNT) {
      setError(
        `Select exactly ${MATCH_DAY_CHOICE_COUNT} Climate Partner projects. Global Schools Solar is included in every Match Day five.`
      );
      return;
    }
    const votes = Number(projectedVotes);
    const rate = Number(gbpPerVote);
    const expected = Number(expectedSponsorship);
    if (!Number.isFinite(votes) || votes <= 0) {
      setError("Enter a projected number of votes.");
      return;
    }
    if (!Number.isFinite(rate) || rate <= 0) {
      setError("Enter a sponsorship amount per vote.");
      return;
    }
    if (!Number.isFinite(expected) || expected < OPENING_SPONSORSHIP) {
      setError(
        `Expected Sponsorship/Goal must be at least ${formatMoney(OPENING_SPONSORSHIP)}.`
      );
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveMatchDaySelection({
        clubId,
        clubName,
        country: clubCountry,
        projectIds: [...selected],
        minAmount: OPENING_SPONSORSHIP,
        projectedVotes: votes,
        gbpPerVote: rate,
        expectedSponsorship: expected,
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

        <h1 className="mt-6 text-4xl font-black">S4P Climate Projects</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Global Schools Solar is included in every Match Day five and is the
          only project classified as UK and International. Choose{" "}
          {MATCH_DAY_CHOICE_COUNT} more from two lists: List 1 is Climate
          Partner projects in {localCountry}. List 2 is international projects,
          including Ugandan Cookstove.
        </p>

        {featured && (
          <div className="mt-8 rounded-2xl border border-green-500/40 bg-green-500/10 p-6">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-green-400">
              Featured Climate Project · included in every Match Day
            </p>
            <h2 className="mt-2 text-2xl font-bold">{featured.name}</h2>
            <p className="mt-2 text-slate-300">{featured.description}</p>
            <p className="mt-3 text-sm text-slate-400">
              {climateProjectCountryLabel(featured, {
                clubName,
                country: clubCountry,
              })}
              {featured.estimated_co2 != null
                ? ` · ${featured.estimated_co2.toLocaleString("en-GB")} t CO₂`
                : ""}
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4">
          <p className="font-bold">
            {selected.size} of {MATCH_DAY_CHOICE_COUNT} partner projects selected
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage(0)}
              className={`rounded-lg px-4 py-2 text-sm font-bold ${
                page === 0
                  ? "bg-green-500 text-slate-950"
                  : "border border-slate-700 text-slate-300"
              }`}
            >
              List 1 · {localCountry}
            </button>
            <button
              type="button"
              onClick={() => setPage(1)}
              className={`rounded-lg px-4 py-2 text-sm font-bold ${
                page === 1
                  ? "bg-green-500 text-slate-950"
                  : "border border-slate-700 text-slate-300"
              }`}
            >
              List 2 · International
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {visible.map((project) => {
            const isOn = selected.has(project.id);
            const full = !isOn && selected.size >= MATCH_DAY_CHOICE_COUNT;
            const region = isLocalCatalogName(project.name, localCountry)
              ? `${localCountry} Climate Partner`
              : isInternationalCatalogName(project.name)
                ? "International Climate Partner"
                : "Climate Project Partner";
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
                  {region}
                </p>
                {isPartnerUpload(project) && (
                    <p className="mt-1 text-xs font-semibold text-green-400">
                      Uploaded climate project
                    </p>
                  )}
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
            onClick={() => setPage(0)}
            disabled={page === 0}
            className="rounded-xl border border-slate-700 px-5 py-3 font-bold disabled:cursor-not-allowed disabled:text-slate-600"
          >
            List 1 · {localCountry}
          </button>
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="rounded-xl bg-slate-800 px-5 py-3 font-bold hover:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-600"
          >
            List 2 · International
          </button>
        </div>

        <div className="mt-10 rounded-2xl border border-slate-700 bg-slate-900 p-8">
          <h3 className="text-2xl font-bold">
            Votes married to Sponsorship/Goal
          </h3>
          <p className="mt-2 text-slate-400">
            Base sponsorship is {formatMoney(OPENING_SPONSORSHIP)} per Goal.
            Projected votes times £/vote set the expected Sponsorship/Goal
            proposed to the brand. Fans see the amount rise from the base as
            votes come in.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <label className="block text-sm text-slate-400">
              Projected Number of Votes
              <input
                type="number"
                min={1}
                step={1000}
                value={projectedVotes}
                onChange={(event) => updateProjectedVotes(event.target.value)}
                className="mt-2 w-full rounded-lg bg-slate-800 p-4 text-white"
              />
            </label>
            <label className="block text-sm text-slate-400">
              £ / Vote
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={gbpPerVote}
                onChange={(event) => updateGbpPerVote(event.target.value)}
                className="mt-2 w-full rounded-lg bg-slate-800 p-4 text-white"
              />
            </label>
            <label className="block text-sm text-slate-400">
              Expected Sponsorship/Goal
              <input
                type="number"
                min={OPENING_SPONSORSHIP}
                step={100}
                value={expectedSponsorship}
                onChange={(event) =>
                  updateExpectedSponsorship(event.target.value)
                }
                className="mt-2 w-full rounded-lg bg-slate-800 p-4 text-white"
              />
            </label>
          </div>
          <p className="mt-4 text-sm text-green-300">
            Opens at {formatMoney(OPENING_SPONSORSHIP)}/Goal (Min). Peaks at{" "}
            {formatMoney(Number(expectedSponsorship) || 0)}/Goal when votes
            reach             {Number(projectedVotes || 0).toLocaleString("en-GB")} (
            {formatGbpPerVote(Number(gbpPerVote) || 0)}/vote).
          </p>
          <button
            onClick={confirm}
            disabled={saving || selected.size !== MATCH_DAY_CHOICE_COUNT}
            className="mt-6 w-full rounded-xl bg-green-500 py-4 text-lg font-bold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {saving
              ? "Saving..."
              : `Confirm ${MATCH_DAY_PROJECT_COUNT} projects at ${formatMoney(OPENING_SPONSORSHIP)} rising to ${formatMoney(Number(expectedSponsorship) || 0)}/Goal`}
          </button>
        </div>
      </div>
    </main>
  );
}
