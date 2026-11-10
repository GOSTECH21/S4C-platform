"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import {
  loadClubSession,
  loadClubProjectBoard,
  readStoredMatchDay,
  type ClubAccount,
  type ClubProfile,
} from "@/app/services/club-match-day.service";
import { hydrateClubSponsorsFromSigned } from "@/app/services/sponsor-offers.service";
import type { ClimateProject } from "@/app/services/votes.service";
import { chosenFeaturedProject } from "@/app/lib/featured-gss";
import { isFeaturedClimateProject } from "@/app/services/votes.service";
import {
  CLUB_SELECT_MATCH_SENT_STAMP,
  clubDashboardProjectsSentCopy,
  matchDayInvitationSent,
} from "@/app/lib/partner-projects";
import {
  CLUB_ADMIN_PATH,
  CLUB_LOGIN_PATH,
  CLUB_SELECT_PROJECTS_PATH,
  CLUB_SPONSORS_PATH,
} from "@/app/lib/routes";
import { clubGateCopy, type SignedInKind } from "@/app/lib/signed-in-role";
import { identifySignedInKind } from "@/app/services/signed-in-role.service";
import ClubNav from "@/app/components/club/ClubNav";
import HowS4pSelectMatch from "@/app/components/home/HowS4pSelectMatch";
import { clubShouldStartBlank } from "@/app/lib/clear-club-data";
import { SIGNED_SPONSORSHIP_EVENT } from "@/app/lib/sponsor-completion-flow";
import { clearClubProjectsAndSponsors } from "@/app/services/clear-club-data.service";
import { hydrateLocalSponsorRecords } from "@/app/services/local-sponsor.service";

export default function ClubDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState<ClubProfile | null>(null);
  const [account, setAccount] = useState<ClubAccount | null>(null);
  const [selected, setSelected] = useState<ClimateProject[]>([]);
  const [unlinked, setUnlinked] = useState(false);
  const [signedInKind, setSignedInKind] = useState<SignedInKind>("unknown");
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
      setFeaturedId(
        stored?.featuredProjectId ??
          chosenFeaturedProject(board.selected, stored?.featuredProjectId)?.id ??
          null
      );
      await hydrateClubSponsorsFromSigned(session.club.id, session.club.name);
      await hydrateLocalSponsorRecords();
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
      const stored = readStoredMatchDay(club.id);
      setFeaturedId(stored?.featuredProjectId ?? null);
      try {
        const board = await loadClubProjectBoard(club.id, club.name);
        setSelected(board.selected);
      } catch {
        // Sent copy still lives in My Admin if the project board cannot refresh.
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
  const projectsSent = matchDayInvitationSent(
    Math.max(selected.length, orderedSelected.length)
  );

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
          onClubMatchSelected={() => router.push(CLUB_SELECT_PROJECTS_PATH)}
        />
        {projectsSent ? (
          <p
            data-select-match-sent={CLUB_SELECT_MATCH_SENT_STAMP}
            className="mt-6 text-center text-sm font-semibold text-green-300"
          >
            {clubDashboardProjectsSentCopy()}{" "}
            <Link href={CLUB_ADMIN_PATH} className="underline">
              My Admin
            </Link>
            {" · "}
            <Link href={CLUB_SPONSORS_PATH} className="underline">
              Sponsors
            </Link>
          </p>
        ) : null}
      </div>
    </main>
  );
}
