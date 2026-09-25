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
  EXPOSURES_PER_POST,
  brandExposureValue,
  formatBrandExposureLabel,
  formatGbpPerVote,
  formatMatchFundingLine,
  formatMoney,
  formatStipulatedRate,
  totalMatchSponsorshipPayable,
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
  const [gbpPerVote, setGbpPerVote] = useState(String(DEFAULT_GBP_PER_VOTE));
  const [minAmount, setMinAmount] = useState("");
  const [gbpPerGoal, setGbpPerGoal] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
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
          setGbpPerVote(String(stored.gbpPerVote));
          setMinAmount(stored.minAmount ? String(stored.minAmount) : "");
          setGbpPerGoal(stored.gbpPerGoal ? String(stored.gbpPerGoal) : "");
          setMaxAmount(stored.maxAmount ? String(stored.maxAmount) : "");
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

  function updateGbpPerVote(value: string) {
    setGbpPerVote(value);
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
    const rate = Number(gbpPerVote);
    const minimum = Number(minAmount);
    const perGoal = Number(gbpPerGoal);
    const cap = Number(maxAmount);
    if (!Number.isFinite(rate) || rate <= 0) {
      setError(
        "Insert the stipulated amount per Climate Project (for example £0.02). This is the brand-exposure counter, not the amount the sponsor pays."
      );
      return;
    }
    if (!Number.isFinite(minimum) || minimum <= 0) {
      setError(
        "Insert the Base Match Sponsorship for this Match. This is the Minimum Payment even if the club scores no Goals."
      );
      return;
    }
    if (!Number.isFinite(perGoal) || perGoal <= 0) {
      setError(
        "Insert the Sponsorship per Goal scored. This is added to the Base Match Sponsorship for each Goal."
      );
      return;
    }
    if (!Number.isFinite(cap) || cap <= 0) {
      setError(
        'Insert the "Up to a Maximum of" cap. The sponsor cannot pay more than this, however many Goals are scored.'
      );
      return;
    }
    if (cap < minimum) {
      setError(
        "The Maximum must be at least the Base Match Sponsorship. A 0–0 still pays the base."
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
        minAmount: minimum,
        gbpPerGoal: perGoal,
        maxAmount: cap,
        projectedVotes: 0,
        gbpPerVote: rate,
        expectedSponsorship: brandExposureValue({
          posts: 1,
          gbpPerProject: rate,
        }),
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
          including Ugandan Cookstove. Post at least 3 days before kick-off so
          fans can vote for 5 days: a Saturday 15:00 kick-off opens voting
          Wednesday at 15:00 and closes Monday at 15:00.
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
            Goal-scored funding for this Match
          </h3>
          <p className="mt-2 text-slate-400">
            Set a Base Match Sponsorship — the Minimum Payment the brand
            sponsor pays even if {clubName} scores no Goals — then the amount
            added for each Goal scored, and a cap. The stipulated amount per
            Climate Project is a counter for brand exposure: every post to a
            fan is 1 eyeball and {EXPOSURES_PER_POST} exposures (the five
            Climate Projects), even if that fan chooses 3.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <label className="block text-sm text-slate-400">
              Stipulated amount / Climate Project
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
              Base Match Sponsorship
              <input
                type="number"
                min={1}
                step={100}
                value={minAmount}
                onChange={(event) => setMinAmount(event.target.value)}
                placeholder="e.g. 3000"
                className="mt-2 w-full rounded-lg bg-slate-800 p-4 text-white"
              />
            </label>
            <label className="block text-sm text-slate-400">
              Sponsorship per Goal scored
              <input
                type="number"
                min={1}
                step={100}
                value={gbpPerGoal}
                onChange={(event) => setGbpPerGoal(event.target.value)}
                placeholder="e.g. 3000"
                className="mt-2 w-full rounded-lg bg-slate-800 p-4 text-white"
              />
            </label>
            <label className="block text-sm text-slate-400">
              Up to a Maximum of
              <input
                type="number"
                min={1}
                step={100}
                value={maxAmount}
                onChange={(event) => setMaxAmount(event.target.value)}
                placeholder="e.g. 15000"
                className="mt-2 w-full rounded-lg bg-slate-800 p-4 text-white"
              />
            </label>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-slate-800 p-4">
              <p className="text-sm text-slate-400">
                Projected Sponsor/Brand Exposure
              </p>
              <p className="mt-2 text-lg font-bold text-white">
                {formatBrandExposureLabel()}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                1 post = 1 eyeball = {EXPOSURES_PER_POST} exposures. Fans who
                are asked to choose 3 of {MATCH_DAY_PROJECT_COUNT} Climate
                Projects are still exposed {MATCH_DAY_PROJECT_COUNT} times.
              </p>
            </div>
            <div className="rounded-lg bg-slate-800 p-4">
              <p className="text-sm text-slate-400">
                Exposure counter per posted fan
              </p>
              <p className="mt-2 text-lg font-bold text-white">
                {formatGbpPerVote(
                  brandExposureValue({
                    posts: 1,
                    gbpPerProject: Number(gbpPerVote) || 0,
                  })
                )}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {EXPOSURES_PER_POST} × {formatStipulatedRate(Number(gbpPerVote) || 0)}
              </p>
            </div>
          </div>
          <FundingPreview
            gbpPerVote={Number(gbpPerVote) || 0}
            minAmount={Number(minAmount) || 0}
            gbpPerGoal={Number(gbpPerGoal) || 0}
            maxAmount={Number(maxAmount) || 0}
          />
          <button
            onClick={confirm}
            disabled={saving || selected.size !== MATCH_DAY_CHOICE_COUNT}
            className="mt-6 w-full rounded-xl bg-green-500 py-4 text-lg font-bold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {saving
              ? "Saving..."
              : `Confirm ${MATCH_DAY_PROJECT_COUNT} projects · ${
                  formatMatchFundingLine({
                    baseAmount: Number(minAmount) || 0,
                    gbpPerGoal: Number(gbpPerGoal) || 0,
                    maxAmount: Number(maxAmount) || 0,
                  }) || "insert Base, £/Goal and Maximum"
                }`}
          </button>
        </div>
      </div>
    </main>
  );
}

function FundingPreview({
  gbpPerVote,
  minAmount,
  gbpPerGoal,
  maxAmount,
}: {
  gbpPerVote: number;
  minAmount: number;
  gbpPerGoal: number;
  maxAmount: number;
}) {
  if (!(gbpPerVote > 0) || !(minAmount > 0) || !(gbpPerGoal > 0) || !(maxAmount > 0)) {
    return (
      <p className="mt-4 text-sm text-amber-300">
        Insert the stipulated amount per Climate Project, the Base Match
        Sponsorship, the amount payable per Goal, and the Maximum. A 0–0 still
        pays the base. Each Goal adds the per-Goal amount, never above the cap.
      </p>
    );
  }

  const nilNil = totalMatchSponsorshipPayable({
    baseAmount: minAmount,
    gbpPerGoal,
    goalsScored: 0,
    maxAmount,
  });
  const oneNil = totalMatchSponsorshipPayable({
    baseAmount: minAmount,
    gbpPerGoal,
    goalsScored: 1,
    maxAmount,
  });
  const twoNil = totalMatchSponsorshipPayable({
    baseAmount: minAmount,
    gbpPerGoal,
    goalsScored: 2,
    maxAmount,
  });

  return (
    <p className="mt-4 text-sm text-green-300">
      0–0 pays {formatMoney(nilNil)} (the Base Match Sponsorship). 1–0 pays{" "}
      {formatMoney(oneNil)}. 2–0 pays {formatMoney(twoNil)}. The sponsor cannot
      pay more than {formatMoney(maxAmount)}, however many Goals are scored.{" "}
      {formatStipulatedRate(gbpPerVote)} is the brand-exposure counter: 1 post
      = 1 eyeball = {EXPOSURES_PER_POST} exposures.
    </p>
  );
}
