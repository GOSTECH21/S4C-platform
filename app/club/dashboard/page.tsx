"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import {
  loadClubSession,
  loadClubProjectBoard,
  readStoredMatchDay,
  matchDayWindowCopy,
  type ClubAccount,
  type ClubProfile,
} from "@/app/services/club-match-day.service";
import {
  hydrateClubSponsorsFromSigned,
  listClubSignedSponsorships,
  type SignedSponsorship,
} from "@/app/services/sponsor-offers.service";
import type { ClimateProject } from "@/app/services/votes.service";
import { chosenFeaturedProject } from "@/app/lib/featured-gss";
import { isFeaturedClimateProject } from "@/app/services/votes.service";
import { climateProjectCountryLabel } from "@/app/lib/featured-climate-country";
import { ClimateProjectCivBlock } from "@/app/components/climate/ClimateProjectCiv";
import {
  MATCH_DAY_APPROVED_LABEL,
  MATCH_DAY_PENDING_APPROVAL_LABEL,
  MATCH_DAY_PROJECT_COUNT,
  matchDayProjectApprovalLabel,
  SELECT_CLIMATE_PROJECTS_LABEL,
  SEND_INVITATION_LABEL,
} from "@/app/lib/partner-projects";
import ClubChooseProjectsCopy from "@/app/components/club/ClubChooseProjectsCopy";
import {
  loadClubSponsorRoster,
  loadGoalNetwork,
  loadMatchDayLock,
} from "@/app/services/climate-sponsors.service";
import {
  selectedBrandsReadyToReceive,
  type ClubSponsorRoster,
} from "@/app/lib/climate-sponsors";
import {
  CLUB_LOGIN_PATH,
  CLUB_SELECT_PROJECTS_PATH,
  CLUB_SPONSORS_ADDRESS_BOOKS_PATH,
} from "@/app/lib/routes";
import { clubGateCopy, type SignedInKind } from "@/app/lib/signed-in-role";
import { identifySignedInKind } from "@/app/services/signed-in-role.service";
import ClubNav from "@/app/components/club/ClubNav";
import HowS4pSelectMatch from "@/app/components/home/HowS4pSelectMatch";
import { clubShouldStartBlank } from "@/app/lib/clear-club-data";
import { SIGNED_SPONSORSHIP_EVENT } from "@/app/lib/sponsor-completion-flow";
import { clearClubProjectsAndSponsors } from "@/app/services/clear-club-data.service";
import { approvedIdsForClubMatch } from "@/app/services/sponsor-listings.service";
import { hydrateLocalSponsorRecords } from "@/app/services/local-sponsor.service";

export default function ClubDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState<ClubProfile | null>(null);
  const [account, setAccount] = useState<ClubAccount | null>(null);
  const [selected, setSelected] = useState<ClimateProject[]>([]);
  const [unlinked, setUnlinked] = useState(false);
  const [signedInKind, setSignedInKind] = useState<SignedInKind>("unknown");
  const [postedAt, setPostedAt] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const [signedCopies, setSignedCopies] = useState<SignedSponsorship[]>([]);
  const [roster, setRoster] = useState<ClubSponsorRoster | null>(null);
  const [featuredId, setFeaturedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const session = await loadClubSession();
      if (!session) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.replace(CLUB_LOGIN_PATH);
          return;
        }
        setSignedInKind((await identifySignedInKind()) ?? "unknown");
        setUnlinked(true);
        setLoading(false);
        return;
      }
      setAccount(session.account);
      setClub(session.club);
      if (clubShouldStartBlank(session.club.id, session.club.name)) {
        try {
          await clearClubProjectsAndSponsors(session.club.name);
        } catch {
          // Local blank-slate still hides old campaigns if hosted delete is blocked.
        }
      }

      const board = await loadClubProjectBoard(session.club.id, session.club.name);
      setSelected(board.selected);
      const stored = readStoredMatchDay(session.club.id);
      setPostedAt(stored?.postedAt ?? null);
      setFeaturedId(
        stored?.featuredProjectId ??
          chosenFeaturedProject(board.selected, stored?.featuredProjectId)?.id ??
          null
      );
      await hydrateClubSponsorsFromSigned(session.club.id, session.club.name);
      await hydrateLocalSponsorRecords();
      setSignedCopies(
        await listClubSignedSponsorships(session.club.id, session.club.name)
      );
      setRoster(loadClubSponsorRoster(session.club.id, session.club.name));
      setLoading(false);
    }

    load();
  }, [router]);

  useEffect(() => {
    if (!club) return;
    async function refreshSignedLive() {
      if (!club) return;
      await hydrateClubSponsorsFromSigned(club.id, club.name);
      await hydrateLocalSponsorRecords();
      setSignedCopies(
        await listClubSignedSponsorships(club.id, club.name)
      );
      setRoster(loadClubSponsorRoster(club.id, club.name));
      const stored = readStoredMatchDay(club.id);
      setPostedAt(stored?.postedAt ?? null);
      setFeaturedId(stored?.featuredProjectId ?? null);
      try {
        const board = await loadClubProjectBoard(club.id, club.name);
        setSelected(board.selected);
      } catch {
        // Signed copies still refresh even if the project board cannot.
      }
    }
    function onLive() {
      void refreshSignedLive();
    }
    window.addEventListener(SIGNED_SPONSORSHIP_EVENT, onLive);
    window.addEventListener("storage", onLive);
    return () => {
      window.removeEventListener(SIGNED_SPONSORSHIP_EVENT, onLive);
      window.removeEventListener("storage", onLive);
    };
  }, [club]);

  const orderedSelected = useMemo(() => {
    const others = selected.filter(
      (project) => !isFeaturedClimateProject(project)
    );
    const chosen = chosenFeaturedProject(selected, featuredId);
    return chosen ? [chosen, ...others] : others;
  }, [selected, featuredId]);
  const matchDayReady =
    Boolean(featuredId) && orderedSelected.length >= MATCH_DAY_PROJECT_COUNT;
  const approvedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const copy of signedCopies) {
      for (const project of copy.offer.projects) ids.add(project.id);
    }
    if (club) {
      for (const id of approvedIdsForClubMatch(club.id)) ids.add(id);
    }
    return ids;
  }, [signedCopies, club]);
  const hasApproved = approvedIds.size > 0;

  const readySponsorBrands = useMemo(() => {
    if (!roster) return [];
    return selectedBrandsReadyToReceive(roster, {
      networkFor: (brand) => {
        const row = roster.sponsors.find(
          (sponsor) => sponsor.brandName.toLowerCase() === brand.toLowerCase()
        );
        return loadGoalNetwork(brand, row?.email);
      },
      lockFor: (brand) => loadMatchDayLock(brand),
    });
  }, [roster]);

  async function logout() {
    const href = clubGateCopy(signedInKind).logoutHref;
    await supabase.auth.signOut();
    router.push(href);
  }

  if (unlinked) {
    const gate = clubGateCopy(signedInKind);
    return (
      <main className="flex min-h-screen items-center justify-center px-4 text-white">
        <div className="max-w-lg rounded-2xl bg-slate-900 p-8 text-center">
          <h1 className="text-3xl font-black">{gate.title}</h1>
          <p className="mt-4 text-slate-300">{gate.body}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href={gate.primaryHref}
              className="rounded-xl bg-green-500 px-6 py-3 font-bold text-slate-950"
            >
              {gate.primaryLabel}
            </a>
            <button
              onClick={logout}
              className="rounded-xl border border-slate-600 px-6 py-3 font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (loading || !club || !account) {
    return (
      <main className="flex min-h-screen items-center justify-center text-white">
        Loading Dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 text-white sm:p-10">
      <div className="mx-auto max-w-7xl">
        <ClubNav />
        <HowS4pSelectMatch
          audience="club"
          initialClub={club.name}
          clubLocked
          className="mb-10"
        />
        {postError && (
          <p className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
            {postError}
          </p>
        )}

        <section className="mt-12 rounded-3xl border border-slate-700 bg-slate-900 p-10">
          {/* club-choose-projects-scopes-v1 */}
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
              Choose Projects
            </p>
            <div className="mx-auto mt-6 max-w-3xl text-left">
              <ClubChooseProjectsCopy />
            </div>
          </div>

          <Link
            href={CLUB_SELECT_PROJECTS_PATH}
            className="mt-10 block w-full rounded-xl bg-blue-600 py-4 text-center text-lg font-bold text-white hover:bg-blue-500"
          >
            {SELECT_CLIMATE_PROJECTS_LABEL}
          </Link>
          {hasApproved && postedAt && !postError && (
            <p className="mt-4 text-center text-sm font-semibold text-green-300">
              Approved Projects published to your fans on My S4P
              {readySponsorBrands.length
                ? ` and to ${readySponsorBrands.map((row) => row.brandName).join(", ")}.`
                : "."}
            </p>
          )}

          <div className="mt-10 text-left">
            <p className="mt-2 max-w-3xl text-sm text-slate-400">
              {matchDayWindowCopy()}
            </p>
            <ProjectGrid
              projects={matchDayReady ? orderedSelected : []}
              empty={`No Climate Projects chosen yet. Upload your Climate Projects with the blue button. They appear here tagged ${MATCH_DAY_PENDING_APPROVAL_LABEL} until a Global Brand Sponsor is locked in.`}
              statusFor={(project) =>
                matchDayProjectApprovalLabel(approvedIds.has(project.id))
              }
              featuredId={featuredId}
              clubName={club.name}
              clubCountry={club.country}
            />
            <Link
              href={CLUB_SPONSORS_ADDRESS_BOOKS_PATH}
              data-send-invitation-to-sponsors="club-sponsors-address-books-v1"
              className="mt-8 block w-full rounded-xl bg-green-500 py-4 text-center text-lg font-bold text-slate-950 hover:bg-green-400"
            >
              {SEND_INVITATION_LABEL}
            </Link>
            <p className="mt-3 text-center text-sm text-slate-400">
              Pending Approval projects stay tagged until you send invitations
              from the Address Book in Sponsors.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function ProjectGrid({
  projects,
  empty,
  funded = false,
  badge,
  statusFor,
  featuredId = null,
  clubName,
  clubCountry,
}: {
  projects: ClimateProject[];
  empty: string;
  funded?: boolean;
  badge?: string;
  statusFor?: (project: ClimateProject) => string;
  featuredId?: string | null;
  clubName?: string | null;
  clubCountry?: string | null;
}) {
  if (projects.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-8 text-slate-400">
        {empty}
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-6 md:grid-cols-2">
      {projects.map((project) => {
        const country = climateProjectCountryLabel(project, {
          clubName,
          country: clubCountry,
        });
        const featured =
          featuredId != null
            ? project.id === featuredId
            : isFeaturedClimateProject(project);
        const status = statusFor?.(project) ?? badge ?? null;
        return (
        <div
          key={project.id}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-xl font-bold">{project.name}</h3>
            <div className="flex shrink-0 flex-wrap justify-end gap-2">
              {featured && (
                <span className="rounded-full bg-s4p-mark/15 px-3 py-1 text-xs font-semibold text-slate-950">
                  Featured
                </span>
              )}
              {funded && (
                <span className="rounded-full bg-s4p-mark px-3 py-1 text-xs font-semibold text-slate-950">
                  Funded
                </span>
              )}
              {status && (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold text-slate-950 ${
                    status === MATCH_DAY_APPROVED_LABEL
                      ? "bg-s4p-mark"
                      : "border border-s4p-mark bg-s4p-mark/15"
                  }`}
                >
                  {status}
                </span>
              )}
            </div>
          </div>
          {country && (
            <p className="mt-1 text-sm text-slate-400">📍 {country}</p>
          )}
          <p className="mt-3 text-slate-300">{project.description}</p>
          <ClimateProjectCivBlock project={project} compact={false} />
        </div>
        );
      })}
    </div>
  );
}

