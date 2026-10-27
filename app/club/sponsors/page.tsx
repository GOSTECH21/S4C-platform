"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClubNav from "@/app/components/club/ClubNav";
import { ClubSponsorsListings } from "@/app/components/club/ClubSponsorsListings";
import { CLUB_LOGIN_PATH } from "@/app/lib/routes";
import {
  MATCH_DAY_PROJECT_COUNT,
} from "@/app/lib/partner-projects";
import {
  GLOBAL_INVITE_SUBJECT,
  localInvitesSentCopy,
  type SponsorInviteRound,
  type SponsorListing,
  type SponsorListingKind,
} from "@/app/lib/sponsor-listings";
import {
  loadClubProjectBoard,
  loadClubSession,
  readStoredMatchDay,
} from "@/app/services/club-match-day.service";
import {
  closeInviteWindowIfExpired,
  loadClubInviteRound,
  loadSponsorDirectory,
  recordSponsorInvites,
} from "@/app/services/sponsor-listings.service";

export default function ClubSponsorsPage() {
  const router = useRouter();
  const [clubId, setClubId] = useState<string | null>(null);
  const [clubName, setClubName] = useState("your club");
  const [directorName, setDirectorName] = useState("Sustainability Director");
  const [matchLabel, setMatchLabel] = useState("this Match Day");
  const [projectIds, setProjectIds] = useState<string[]>([]);
  const [projectNames, setProjectNames] = useState<string[]>([]);
  const [listings, setListings] = useState<SponsorListing[]>([]);
  const [round, setRound] = useState<SponsorInviteRound | null>(null);
  const [selectedGlobalIds, setSelectedGlobalIds] = useState<string[]>([]);
  const [selectedLocalIds, setSelectedLocalIds] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeKind, setNoticeKind] = useState<SponsorListingKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const session = await loadClubSession();
      if (!session) {
        router.replace(CLUB_LOGIN_PATH);
        return;
      }
      setClubId(session.club.id);
      setClubName(session.club.name);
      setDirectorName(
        [session.account.first_name, session.account.last_name]
          .filter(Boolean)
          .join(" ") || "Sustainability Director"
      );
      const board = await loadClubProjectBoard(
        session.club.id,
        session.club.name
      );
      const stored = readStoredMatchDay(session.club.id);
      const ids =
        stored?.projectIds?.length
          ? stored.projectIds
          : board.selected.map((project) => project.id);
      setProjectIds(ids);
      setProjectNames(
        board.selected
          .filter((project) => ids.includes(project.id))
          .map((project) => project.name)
      );
      setMatchLabel(`${session.club.name} Match Day`);
      setListings(loadSponsorDirectory());
      const live = await closeInviteWindowIfExpired(session.club.id);
      const current = live ?? loadClubInviteRound(session.club.id);
      setRound(current);
      if (current) {
        setSelectedGlobalIds(current.globalInviteeIds);
        setSelectedLocalIds(current.localInviteeIds);
      }
      setLoading(false);
    }
    void load();
  }, [router]);

  function toggle(listing: SponsorListing) {
    if (listing.kind === "global") {
      setSelectedGlobalIds((current) => toggleId(current, listing.id));
    } else {
      setSelectedLocalIds((current) => toggleId(current, listing.id));
    }
  }

  function invite(kind: SponsorListingKind) {
    if (!clubId) return;
    setSending(true);
    setNotice(null);
    setError(null);
    setNoticeKind(kind);
    const result = recordSponsorInvites({
      clubId,
      clubName,
      directorName,
      matchLabel,
      projectIds,
      projectNames,
      globalInviteeIds: kind === "global" ? selectedGlobalIds : [],
      localInviteeIds: kind === "local" ? selectedLocalIds : [],
      kind,
    });
    setRound(result.round);
    if (result.error) {
      setError(result.error);
      setSending(false);
      return;
    }
    const count =
      kind === "global"
        ? result.round.globalInviteeIds.length
        : result.round.localInviteeIds.length;
    setNotice(
      kind === "global"
        ? `${GLOBAL_INVITE_SUBJECT} sent to ${count} Global Brands. Only one will be accepted — highest amount within 8 hours.`
        : localInvitesSentCopy(count)
    );
    setSending(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-white">
        Loading Sponsors...
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <ClubNav />
        <ClubSponsorsListings
          clubName={clubName}
          matchLabel={matchLabel}
          projectNames={projectNames}
          projectCount={projectIds.length >= MATCH_DAY_PROJECT_COUNT ? projectIds.length : projectNames.length}
          listings={listings}
          round={round}
          notice={notice}
          error={error}
          noticeKind={noticeKind}
          sending={sending}
          selectedGlobalIds={selectedGlobalIds}
          selectedLocalIds={selectedLocalIds}
          onToggle={toggle}
          onInvite={invite}
        />
      </div>
    </main>
  );
}

function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((row) => row !== id) : [...ids, id];
}
