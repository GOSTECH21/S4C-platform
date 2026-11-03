"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClubNav from "@/app/components/club/ClubNav";
import { ClubSponsorsListings } from "@/app/components/club/ClubSponsorsListings";
import ClubSelectedMatchBanner from "@/app/components/club/ClubSelectedMatchBanner";
import { CLUB_LOGIN_PATH } from "@/app/lib/routes";
import {
  clubMatchDayLabel,
  resolveClubSelectedMatch,
} from "@/app/lib/club-selected-match";
import {
  isClubAddressBookListingId,
  loadClubAddressBooks,
  sponsorListingsFromAddressBooks,
} from "@/app/lib/club-address-book";
import {
  MATCH_DAY_PROJECT_COUNT,
} from "@/app/lib/partner-projects";
import {
  LOCAL_BUSINESS_INVITE_COUNT,
  SEND_INVITATIONS_LABEL,
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
  registerSponsorListing,
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
      const selectedMatch = resolveClubSelectedMatch(
        session.club.id,
        session.club.name
      );
      setMatchLabel(clubMatchDayLabel(selectedMatch, session.club.name));
      const books = loadClubAddressBooks(session.club.id);
      const fromBooks = sponsorListingsFromAddressBooks(books);
      const directory = loadSponsorDirectory();
      setListings(fromBooks.length ? [...fromBooks, ...directory] : directory);
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
      setSelectedGlobalIds((current) =>
        current.includes(listing.id) ? [] : [listing.id]
      );
    } else {
      setSelectedLocalIds((current) =>
        toggleCapped(current, listing.id, LOCAL_BUSINESS_INVITE_COUNT)
      );
    }
  }

  function invite(kind: SponsorListingKind | "all") {
    if (!clubId) return;
    for (const listing of listings) {
      const picked =
        (listing.kind === "global" && selectedGlobalIds.includes(listing.id)) ||
        (listing.kind === "local" && selectedLocalIds.includes(listing.id));
      if (picked && isClubAddressBookListingId(listing.id)) {
        registerSponsorListing(listing);
      }
    }
    setSending(true);
    setNotice(null);
    setError(null);
    setNoticeKind(kind === "all" ? "global" : kind);
    const result = recordSponsorInvites({
      clubId,
      clubName,
      directorName,
      matchLabel,
      projectIds,
      projectNames,
      globalInviteeIds:
        kind === "local" ? [] : selectedGlobalIds,
      localInviteeIds:
        kind === "global" ? [] : selectedLocalIds,
      kind,
    });
    setRound(result.round);
    if (result.error) {
      setError(result.error);
      setSending(false);
      return;
    }
    if (kind === "all") {
      setNotice(
        `${SEND_INVITATIONS_LABEL} sent to ${result.round.globalInviteeIds.length} Lead Climate Sponsor and ${result.round.localInviteeIds.length} Local Business Climate Sponsors.`
      );
    } else {
      const count =
        kind === "global"
          ? result.round.globalInviteeIds.length
          : result.round.localInviteeIds.length;
      setNotice(
        kind === "global"
          ? `${SEND_INVITATIONS_LABEL} sent to ${count} Lead Climate Sponsor. Only one is eligible — highest amount within 8 hours.`
          : localInvitesSentCopy(count)
      );
    }
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
        <ClubSelectedMatchBanner clubId={clubId} clubName={clubName} />
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
          onInviteAll={() => invite("all")}
        />
      </div>
    </main>
  );
}

function toggleCapped(ids: string[], id: string, max: number): string[] {
  if (ids.includes(id)) return ids.filter((row) => row !== id);
  if (ids.length >= max) return ids;
  return [...ids, id];
}
