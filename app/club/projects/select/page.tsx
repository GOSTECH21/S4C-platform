"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import type { ClimateProject } from "@/app/services/votes.service";
import {
  loadClubSession,
  loadPartnerClimateProjectLists,
  loadFeaturedMatchDayProjects,
  readStoredMatchDay,
  saveMatchDaySelection,
} from "@/app/services/club-match-day.service";
import {
  MATCH_DAY_CHOICE_COUNT,
  isPartnerUpload,
  SELECT_CLIMATE_PROJECTS_LABEL,
  SEND_INVITATION_LABEL,
} from "@/app/lib/partner-projects";
import ClubSelectedMatchBanner from "@/app/components/club/ClubSelectedMatchBanner";
import { isInternationalCatalogName, isLocalCatalogName } from "@/app/lib/sccan-catalog";
import {
  localCatalogCountryForClub,
} from "@/app/lib/featured-climate-country";
import {
  DEFAULT_WALLET_VOTE_GBP,
} from "@/app/lib/sponsor-wallet";
import { leadWalletMatchFunding } from "@/app/services/sponsor-wallet.service";
import {
  CLUB_LOGIN_PATH,
  CLUB_SPONSORS_ADDRESS_BOOKS_PATH,
} from "@/app/lib/routes";
import ClubNav from "@/app/components/club/ClubNav";
import { FeaturedGssPicker } from "@/app/components/club/FeaturedGssPicker";
import { chosenFeaturedProject } from "@/app/lib/featured-gss";
import { clubShouldStartBlank } from "@/app/lib/clear-club-data";
import { clearClubProjectsAndSponsors } from "@/app/services/clear-club-data.service";
import { clubGateCopy } from "@/app/lib/signed-in-role";
import { identifySignedInKind } from "@/app/services/signed-in-role.service";
import { ClimateProjectCivBlock } from "@/app/components/climate/ClimateProjectCiv";
import { ProjectSiteLine } from "@/app/components/climate/ProjectSiteLine";
import { nearbyProjectsCopy, stadiumSiteForClub } from "@/app/lib/project-site";
import { s4pActionBarClass } from "@/app/lib/s4p-tabs";
import {
  climateProjectsForScope,
  climateProjectScopeHeading,
  type ClimateProjectScope,
} from "@/app/lib/s4p-climate-projects";
import {
  ClubClimateProjectScopeChooser,
  ClubClimateProjectScopeTabs,
} from "@/app/components/club/ClubClimateProjectScopeChooser";

export default function SelectMatchDayProjectsPage() {
  const router = useRouter();
  const [clubName, setClubName] = useState("your club");
  const [clubCountry, setClubCountry] = useState<string | null>(null);
  const [clubId, setClubId] = useState<string | null>(null);
  const [localProjects, setLocalProjects] = useState<ClimateProject[]>([]);
  const [internationalProjects, setInternationalProjects] = useState<
    ClimateProject[]
  >([]);
  const [nearbyProjects, setNearbyProjects] = useState<ClimateProject[]>([]);
  const [featured, setFeatured] = useState<ClimateProject[]>([]);
  const [featuredId, setFeaturedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [scope, setScope] = useState<ClimateProjectScope | null>(null);
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
        setNearbyProjects(lists.nearby);
        const catalog = [
          ...lists.local,
          ...lists.international,
          ...lists.nearby,
        ];
        const featuredProjects = await loadFeaturedMatchDayProjects();
        setFeatured(featuredProjects);
        const validIds = new Set(catalog.map((project) => project.id));
        const featuredIds = new Set(featuredProjects.map((project) => project.id));
        const onlyFeatured = featuredProjects[0]?.id ?? null;
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
            (id) => !featuredIds.has(id) && validIds.has(id)
          );
          setSelected(new Set(chosen.slice(0, MATCH_DAY_CHOICE_COUNT)));
        }
        setFeaturedId(
          onlyFeatured ??
            chosenFeaturedProject(featuredProjects)?.id ??
            null
        );
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
  const visible = scope
    ? climateProjectsForScope(scope, {
        local: localProjects,
        international: internationalProjects,
        nearby: nearbyProjects,
      })
    : [];

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

  async function sendInvitation() {
    if (!clubId) return;
    if (!featuredId) {
      setError(
        "Choose Global Schools Solar as the Featured Climate Project, then 4 Climate Partner Projects from the Local and National lists."
      );
      return;
    }
    if (selected.size !== MATCH_DAY_CHOICE_COUNT) {
      setError(
        `Select exactly ${MATCH_DAY_CHOICE_COUNT} Climate Partner projects after choosing one Featured Global Schools Solar project.`
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
        featuredProjectId: featuredId,
        projectIds: [...selected],
        minAmount: funding.minAmount,
        gbpPerGoal: funding.gbpPerGoal,
        maxAmount: funding.maxAmount,
        projectedVotes: 0,
        gbpPerVote: rate,
        expectedSponsorship: rate,
      });
      router.push(CLUB_SPONSORS_ADDRESS_BOOKS_PATH);
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
      <main className="flex min-h-screen items-center justify-center text-white">
        Loading Climate Project Partners...
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 text-white sm:p-10">
      <div className="mx-auto max-w-6xl">
        {/* club-choose-projects-scopes-v1 */}
        <ClubNav />
        <ClubSelectedMatchBanner clubId={clubId} clubName={clubName} />

        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          Choose Projects
        </p>
        <h1 className="mt-3 text-2xl font-bold text-blue-300">
          {SELECT_CLIMATE_PROJECTS_LABEL}
        </h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          {nearbyProjectsCopy(clubName)} Choose Local, National or International
          Climate Projects, then press {SEND_INVITATION_LABEL} to open the Address
          Books in Sponsors and invite Lead Climate Sponsors and Local Business
          Climate Sponsors.
        </p>

        {error && scope === null ? (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        ) : null}

        {scope === null ? (
          <>
            <ClubClimateProjectScopeChooser onChoose={setScope} />
            <Link
              href={CLUB_SPONSORS_ADDRESS_BOOKS_PATH}
              data-send-invitation-to-sponsors="club-sponsors-address-books-v1"
              className="mt-10 block w-full rounded-xl bg-green-500 py-4 text-center text-lg font-bold text-slate-950 hover:bg-green-400"
            >
              {SEND_INVITATION_LABEL}
            </Link>
          </>
        ) : (
          <>
            {featured.length > 0 && (
              <div id="select-climate-projects-list" className="mt-8">
                <FeaturedGssPicker
                  options={featured}
                  chosenId={featuredId}
                  onChoose={setFeaturedId}
                  clubName={clubName}
                  clubCountry={clubCountry}
                />
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4">
              <p className="font-bold">
                {climateProjectScopeHeading(scope)}
              </p>
              <p className="font-bold">
                {selected.size} of {MATCH_DAY_CHOICE_COUNT} partner projects selected
              </p>
            </div>

            {error && (
              <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
                {error}
              </div>
            )}

            {scope === "local" && nearbyProjects.length === 0 ? (
              <p className="mt-8 max-w-3xl text-slate-300">
                {stadiumSiteForClub(clubName)
                  ? "No Climate Projects are listed within 20 miles of this stadium yet."
                  : "We do not have a stadium location for this club yet, so Local Climate Projects is empty."}
              </p>
            ) : null}

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {visible.map((project) => {
                const isOn = selected.has(project.id);
                const full = !isOn && selected.size >= MATCH_DAY_CHOICE_COUNT;
                const region =
                  scope === "local"
                    ? "Local Climate Partner"
                    : scope === "national"
                      ? isLocalCatalogName(project.name, localCountry)
                        ? `${localCountry} Climate Partner`
                        : "National Climate Partner"
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
                      {project.country && <p>{project.country}</p>}
                      <ProjectSiteLine project={project} clubName={clubName} />
                    </div>
                    <ClimateProjectCivBlock project={project} compact={false} />
                    <button
                      onClick={() => toggle(project.id)}
                      disabled={full}
                      className={`mt-6 rounded-xl py-3 font-bold ${s4pActionBarClass(full)}`}
                    >
                      {isOn ? "✓ Selected" : full ? "Limit reached" : "Select project"}
                    </button>
                  </div>
                );
              })}
            </div>

            <ClubClimateProjectScopeTabs current={scope} onChoose={setScope} />

            <div className="mt-10 rounded-2xl border border-slate-700 bg-slate-900 p-8">
              <p className="text-lg font-bold text-white">
                {selected.size} of {MATCH_DAY_CHOICE_COUNT} Climate Partner
                projects selected
                {featuredId ? ", plus one Featured Global Schools Solar project" : ""}
              </p>
              <p className="mt-2 max-w-3xl text-sm text-slate-400">
                Press {SEND_INVITATION_LABEL} to open Address Book 1 and Address
                Book 2 in Sponsors, then choose Existing Sponsors to invite for
                this Match.
              </p>
              <button
                onClick={sendInvitation}
                data-send-invitation-to-sponsors="club-sponsors-address-books-v1"
                disabled={
                  saving || !featuredId || selected.size !== MATCH_DAY_CHOICE_COUNT
                }
                className="mt-6 w-full rounded-xl bg-green-500 py-4 text-lg font-bold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                {saving ? "Saving..." : SEND_INVITATION_LABEL}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
