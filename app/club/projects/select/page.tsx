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
  clubClimateProjectsIntroCopy,
  isPartnerUpload,
} from "@/app/lib/partner-projects";
import { isInternationalCatalogName, isLocalCatalogName } from "@/app/lib/sccan-catalog";
import {
  climateProjectCountryLabel,
  localCatalogCountryForClub,
} from "@/app/lib/featured-climate-country";
import {
  DEFAULT_WALLET_VOTE_GBP,
  FUND_IT_LABEL,
  formatWalletGbp,
} from "@/app/lib/sponsor-wallet";
import { leadWalletMatchFunding } from "@/app/services/sponsor-wallet.service";
import {
  CLUB_DASHBOARD_PATH,
  CLUB_LOGIN_PATH,
} from "@/app/lib/routes";
import ClubNav from "@/app/components/club/ClubNav";
import { clubShouldStartBlank } from "@/app/lib/clear-club-data";
import { clearClubProjectsAndSponsors } from "@/app/services/clear-club-data.service";
import { clubGateCopy } from "@/app/lib/signed-in-role";
import { identifySignedInKind } from "@/app/services/signed-in-role.service";
import { ClimateProjectCivBlock } from "@/app/components/climate/ClimateProjectCiv";

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
        if (clubShouldStartBlank(session.club.id, session.club.name)) {
          try {
            await clearClubProjectsAndSponsors(session.club.name);
          } catch {
            // Local blank-slate still hides old campaigns if hosted delete is blocked.
          }
        }
        const stored = readStoredMatchDay(session.club.id);
        if (stored && !clubShouldStartBlank(session.club.id, session.club.name)) {
          const chosen = stored.projectIds.filter(
            (id) => id !== featuredProject?.id && validIds.has(id)
          );
          setSelected(new Set(chosen.slice(0, MATCH_DAY_CHOICE_COUNT)));
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
        `Select exactly ${MATCH_DAY_CHOICE_COUNT} Climate Partner projects. Global Schools Solar Project is included in every Match Day List.`
      );
      return;
    }
    const rate = DEFAULT_WALLET_VOTE_GBP;
    const funding = leadWalletMatchFunding(clubName);
    setSaving(true);
    setError(null);
    try {
      await saveMatchDaySelection({
        clubId,
        clubName,
        country: clubCountry,
        projectIds: [...selected],
        minAmount: funding.minAmount,
        gbpPerGoal: funding.gbpPerGoal,
        maxAmount: funding.maxAmount,
        projectedVotes: 0,
        gbpPerVote: rate,
        expectedSponsorship: rate,
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
        <ClubNav />

        <h1 className="mt-6 text-4xl font-black">S4P Climate Projects</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          {clubClimateProjectsIntroCopy()}
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
            </p>
            <ClimateProjectCivBlock project={featured} compact={false} />
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
                </div>
                <ClimateProjectCivBlock project={project} compact={false} />
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
          <p className="text-sm text-slate-400">{FUND_IT_LABEL}</p>
          <p className="mt-2 text-lg font-bold text-white">
            {formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)}
          </p>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Fans press {FUND_IT_LABEL} up to 5 times and take{" "}
            {formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)} once from each Carbon
            Wallet onto any of these Climate Projects. Goal-scored funding is
            already set by the Lead Climate Sponsor in the Climate Sponsorship
            Wallet.
          </p>
          <button
            onClick={confirm}
            disabled={saving || selected.size !== MATCH_DAY_CHOICE_COUNT}
            className="mt-6 w-full rounded-xl bg-green-500 py-4 text-lg font-bold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {saving
              ? "Saving..."
              : `Confirm ${MATCH_DAY_PROJECT_COUNT} Climate Projects`}
          </button>
        </div>
      </div>
    </main>
  );
}
