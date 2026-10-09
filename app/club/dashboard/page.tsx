"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import {
  loadClubSession,
  loadClubProjectBoard,
  fileRecordDownloadName,
  postMatchDayProjectsToFans,
  readStoredMatchDay,
  matchDayWindowCopy,
  type ClubAccount,
  type ClubFileRecord,
  type ClubProfile,
} from "@/app/services/club-match-day.service";
import {
  listClubSignedSponsorships,
  type SignedSponsorship,
} from "@/app/services/sponsor-offers.service";
import type { ClimateProject } from "@/app/services/votes.service";
import { isFeaturedClimateProject } from "@/app/services/votes.service";
import {
  climateProjectCountryLabel,
  localCatalogCountryForClub,
} from "@/app/lib/featured-climate-country";
import {
  ciltLeagueForClub,
  ciltPositionLabel,
  climateImpactLeagueTable,
} from "@/app/lib/cilt";
import { qualifyingCivTonnes } from "@/app/lib/climate-impact-value";
import { ClimateProjectCivBlock } from "@/app/components/climate/ClimateProjectCiv";
import {
  MATCH_DAY_CHOICE_COUNT,
  MATCH_DAY_PROJECT_COUNT,
} from "@/app/lib/partner-projects";
import {
  DEFAULT_MINIMUM_SPONSORSHIP,
  formatMatchFundingLine,
  formatMoney,
} from "@/app/lib/sponsorship-auction";
import {
  DEFAULT_WALLET_VOTE_GBP,
  FUND_IT_LABEL,
  formatWalletGbp,
} from "@/app/lib/sponsor-wallet";
import {
  lookbackSponsorForRecord,
  signedCopyDownloadName,
  signedCopyPayload,
} from "@/app/lib/sponsor-dashboard";
import {
  leadClimateSponsorsForClub,
  loadClubSponsorRoster,
  loadGoalNetwork,
  loadMatchDayLock,
  localBusinessClimateSponsorsForClub,
} from "@/app/services/climate-sponsors.service";
import {
  selectedBrandsReadyToReceive,
  type ClubSponsorRoster,
  type LeadClubSponsorRow,
} from "@/app/lib/climate-sponsors";
import { BrandMark } from "@/app/components/club/BrandMark";
import { ClubClimateSponsorTabs } from "@/app/components/club/ClubClimateSponsorTabs";
import { type LocalSponsorRecord } from "@/app/lib/local-sponsor";
import { splitClubClimateSponsorsForTabs } from "@/app/lib/match-day-branding";
import { sponsorLogoSrc } from "@/app/services/teams.service";
import {
  CLUB_LOGIN_PATH,
  CLUB_SELECT_PROJECTS_PATH,
} from "@/app/lib/routes";
import { clubGateCopy, type SignedInKind } from "@/app/lib/signed-in-role";
import { identifySignedInKind } from "@/app/services/signed-in-role.service";
import { MatchDayFolderPanel } from "@/app/components/club/MatchDayFolderPanel";
import ClubNav from "@/app/components/club/ClubNav";
import { clubShouldStartBlank } from "@/app/lib/clear-club-data";
import { SIGNED_SPONSORSHIP_EVENT } from "@/app/lib/sponsor-completion-flow";
import { clearClubProjectsAndSponsors } from "@/app/services/clear-club-data.service";
import {
  readMatchDayFolder,
  saveClubProjectsFile,
  saveClubSponsorsFile,
  submitClubMatchDayFolder,
} from "@/app/services/match-day-folder.service";
import type { MatchDayFolder } from "@/app/lib/match-day-folder";

export default function ClubDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState<ClubProfile | null>(null);
  const [account, setAccount] = useState<ClubAccount | null>(null);
  const [voted, setVoted] = useState<ClimateProject[]>([]);
  const [funded, setFunded] = useState<ClimateProject[]>([]);
  const [selected, setSelected] = useState<ClimateProject[]>([]);
  const [minAmount, setMinAmount] = useState<number | null>(null);
  const [gbpPerGoal, setGbpPerGoal] = useState<number | null>(null);
  const [maxAmount, setMaxAmount] = useState<number | null>(null);
  const [gbpPerVote, setGbpPerVote] = useState<number | null>(null);
  const [records, setRecords] = useState<ClubFileRecord[]>([]);
  const [unlinked, setUnlinked] = useState(false);
  const [signedInKind, setSignedInKind] = useState<SignedInKind>("unknown");
  const [posting, setPosting] = useState(false);
  const [postedAt, setPostedAt] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const [matchDate, setMatchDate] = useState("2026-10-10");
  const [folder, setFolder] = useState<MatchDayFolder | null>(null);
  const [folderNotice, setFolderNotice] = useState<string | null>(null);
  const [signedCopies, setSignedCopies] = useState<SignedSponsorship[]>([]);
  const [roster, setRoster] = useState<ClubSponsorRoster | null>(null);
  const [leadSponsors, setLeadSponsors] = useState<LeadClubSponsorRow[]>([]);
  const [localSponsors, setLocalSponsors] = useState<LocalSponsorRecord[]>([]);
  const [clearing, setClearing] = useState(false);

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
      setVoted(board.voted);
      setFunded(board.funded);
      setSelected(board.selected);
      setMinAmount(board.minAmount);
      setRecords(board.records);
      const stored = readStoredMatchDay(session.club.id);
      setPostedAt(stored?.postedAt ?? null);
      const storedMin =
        stored?.minAmount && stored.minAmount > 0 ? stored.minAmount : null;
      const boardMin =
        board.minAmount && board.minAmount > 0 ? board.minAmount : null;
      setMinAmount(storedMin ?? boardMin);
      setGbpPerGoal(stored?.gbpPerGoal && stored.gbpPerGoal > 0 ? stored.gbpPerGoal : null);
      setMaxAmount(stored?.maxAmount && stored.maxAmount > 0 ? stored.maxAmount : null);
      setGbpPerVote(stored?.gbpPerVote ?? null);
      setSignedCopies(
        await listClubSignedSponsorships(session.club.id, session.club.name)
      );
      setRoster(loadClubSponsorRoster(session.club.id, session.club.name));
      const inbound = splitClubClimateSponsorsForTabs({
        clubName: session.club.name,
        leadSponsors: leadClimateSponsorsForClub(session.club.name),
        localSponsors: localBusinessClimateSponsorsForClub(session.club.name),
      });
      setLeadSponsors(inbound.leads);
      setLocalSponsors(inbound.locals);
      const storedFolder = readMatchDayFolder(session.club.id);
      setFolder(storedFolder);
      if (storedFolder?.matchDate) setMatchDate(storedFolder.matchDate);
      setLoading(false);
    }

    load();
  }, [router]);

  useEffect(() => {
    if (!club) return;
    async function refreshSignedLive() {
      if (!club) return;
      setSignedCopies(
        await listClubSignedSponsorships(club.id, club.name)
      );
      setRoster(loadClubSponsorRoster(club.id, club.name));
      const inbound = splitClubClimateSponsorsForTabs({
        clubName: club.name,
        leadSponsors: leadClimateSponsorsForClub(club.name),
        localSponsors: localBusinessClimateSponsorsForClub(club.name),
      });
      setLeadSponsors(inbound.leads);
      setLocalSponsors(inbound.locals);
      const stored = readStoredMatchDay(club.id);
      setPostedAt(stored?.postedAt ?? null);
      setFolder(readMatchDayFolder(club.id));
      try {
        const board = await loadClubProjectBoard(club.id, club.name);
        setSelected(board.selected);
        setRecords(board.records);
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

  const extraTonnes = useMemo(
    () =>
      [...funded, ...voted].reduce(
        (sum, project) => sum + qualifyingCivTonnes(project),
        0
      ),
    [funded, voted]
  );
  const ciltLeague = club ? ciltLeagueForClub(club.name) : null;
  const localCountry = club
    ? localCatalogCountryForClub({
        clubName: club.name,
        country: club.country,
      })
    : "local";
  const cilt =
    club && ciltLeague
      ? climateImpactLeagueTable(ciltLeague, club.name, extraTonnes)
      : [];
  const clubRow = cilt.find((row) => row.isClub);
  const orderedSelected = useMemo(() => {
    const featured = selected.find(isFeaturedClimateProject);
    if (!featured) return selected;
    return [featured, ...selected.filter((project) => project.id !== featured.id)];
  }, [selected]);
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

  function downloadFileRecord() {
    if (!club) return;
    const payload = {
      club: club.name,
      country: club.country,
      savedAt: new Date().toISOString(),
      thisMatchDay: {
        minAmount,
        gbpPerGoal,
        maxAmount,
        gbpPerVote,
        selected,
        voted,
        funded,
      },
      records,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileRecordDownloadName(club.name);
    link.click();
    URL.revokeObjectURL(url);
  }

  function downloadSignedCopy(copy: SignedSponsorship) {
    const blob = new Blob(
      [JSON.stringify(signedCopyPayload(copy), null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = signedCopyDownloadName(
      copy.offer.clubName,
      copy.signature.brandName
    );
    link.click();
    URL.revokeObjectURL(url);
  }

  async function logout() {
    const href = clubGateCopy(signedInKind).logoutHref;
    await supabase.auth.signOut();
    router.push(href);
  }

  async function startClubAfresh() {
    if (!club) return;
    const ok = window.confirm(
      `Remove every Climate Project and every sponsor attached to ${club.name}? Shared catalog projects stay in the library. This lets you start ${club.name} Match Day from a blank slate.`
    );
    if (!ok) return;
    setClearing(true);
    setPostError(null);
    try {
      await clearClubProjectsAndSponsors(club.name);
      window.location.reload();
    } catch (err) {
      setPostError(
        err instanceof Error ? err.message : "Could not clear this club's projects and sponsors."
      );
      setClearing(false);
    }
  }

  function saveSponsorsFile() {
    if (!club) return;
    setPostError(null);
    setFolderNotice(null);
    try {
      const next = saveClubSponsorsFile({
        clubId: club.id,
        clubName: club.name,
        matchDate,
        minAmount,
        gbpPerGoal,
      });
      setFolder(next);
      setFolderNotice(`${next.sponsorsFile?.fileName} saved in the Match-Day folder.`);
    } catch (err) {
      setPostError(
        err instanceof Error ? err.message : "Could not save the Sponsors File."
      );
    }
  }

  function saveProjectsFile() {
    if (!club) return;
    setPostError(null);
    setFolderNotice(null);
    try {
      const next = saveClubProjectsFile({
        clubId: club.id,
        clubName: club.name,
        matchDate,
        projects: orderedSelected.slice(0, MATCH_DAY_PROJECT_COUNT),
      });
      setFolder(next);
      setFolderNotice(
        `${next.projectsFile?.fileName} saved in the Match-Day folder.`
      );
    } catch (err) {
      setPostError(
        err instanceof Error
          ? err.message
          : "Could not save the Climate Projects File."
      );
    }
  }

  async function submitMatchDayFolder() {
    if (!club) return;
    setPosting(true);
    setPostError(null);
    setFolderNotice(null);
    try {
      const next = submitClubMatchDayFolder(club.id);
      const posted = await postMatchDayProjectsToFans({
        clubId: club.id,
        clubName: club.name,
        country: club.country,
      });
      setFolder(readMatchDayFolder(club.id) ?? next);
      setPostedAt(posted.postedAt ?? new Date().toISOString());
      setSignedCopies(await listClubSignedSponsorships(club.id, club.name));
      setFolderNotice(
        "SUBMIT posted both Match-Day files. Registered fans of this club can now take cash from sponsor wallets and put it on a numbered Climate Project."
      );
    } catch (err) {
      setPostError(
        err instanceof Error
          ? err.message
          : "Could not submit the Match-Day folder."
      );
    } finally {
      setPosting(false);
    }
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
    <main className="min-h-screen p-10 text-white">
      <div className="mx-auto max-w-7xl">
        <ClubNav />
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black">{club.name}</h1>
            <p className="mt-2 text-slate-400">
              Welcome to your Score-4-Our-Planet Club Dashboard
            </p>
          </div>
          <button
            type="button"
            onClick={() => void startClubAfresh()}
            disabled={clearing}
            className="rounded-xl border border-amber-400/50 px-5 py-3 font-semibold text-amber-200 disabled:opacity-50"
          >
            {clearing ? "Clearing…" : "Start this club afresh"}
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <DashboardCard title="Status" value={account.status} />
          <DashboardCard title="Supporters" value={account.supporter_base} />
          <DashboardCard title="Attendance" value={account.average_attendance} />
          <DashboardCard title="Country" value={club.country} />
        </div>

        <div className="mt-10 rounded-2xl bg-slate-900 p-8">
          <h2 className="mb-6 text-2xl font-bold">Club Representative</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Info label="Name">
              {account.first_name} {account.last_name}
            </Info>
            <Info label="Role">{account.job_title}</Info>
            <Info label="Email">{account.email}</Info>
            <Info label="Phone">{account.phone}</Info>
          </div>
        </div>

        <ClubClimateSponsorTabs
          key={`${club.name}:${leadSponsors[0]?.brandKey ?? "none"}`}
          clubName={club.name}
          leadSponsors={leadSponsors}
          localSponsors={localSponsors}
          initialTab="lead"
        />

        <section className="mt-12 rounded-3xl border border-slate-700 bg-slate-900 p-10">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
              S4P Climate Projects
            </p>
            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              {selected.length >= MATCH_DAY_PROJECT_COUNT
                ? `Here's your ${MATCH_DAY_PROJECT_COUNT} chosen Projects for this Match Day`
                : "S4P Climate Projects"}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-xl text-slate-300">
              {selected.length >= MATCH_DAY_PROJECT_COUNT
                ? "Save these five in the Match-Day folder as the Climate Projects File. Fans press FUND-IT up to 5 times: £0.20 once from each Carbon Wallet onto any of these five Projects."
                : `Open S4P Climate Projects to choose 4 Climate Partner projects from List 1 (${localCountry}) and List 2 (International). Global Schools Solar is included automatically and is UK and International.`}
            </p>
          </div>

          <Link
            href={CLUB_SELECT_PROJECTS_PATH}
            className={`mt-10 block w-full rounded-xl bg-blue-600 py-4 text-center text-lg font-bold text-white hover:bg-blue-500 ${
              posting ? "pointer-events-none cursor-wait opacity-70" : ""
            }`}
          >
            {selected.length >= MATCH_DAY_PROJECT_COUNT
              ? "S4P Climate Projects — change List 1 and List 2"
              : "S4P Climate Projects"}
          </Link>
          {postedAt && !postError && (
            <p className="mt-4 text-center text-sm font-semibold text-green-300">
              Posted to your fans on My S4P
              {readySponsorBrands.length
                ? ` and to ${readySponsorBrands.map((row) => row.brandName).join(", ")}.`
                : roster?.selectedIds.length
                  ? ` Selected Climate Sponsors will see these five once they lock ${club.name} for this Match Day.`
                  : ". No Climate Sponsor was selected, so brand dashboards were not updated."}{" "}
              Supporters of {club.name} will see the Sponsors File and Climate
              Projects File on My S4P and Climate Projects as soon as they open
              those pages. They take cash from a sponsor wallet and put it on a
              numbered Climate Project.
            </p>
          )}

          <div className="mt-10 text-left">
            <h3 className="text-2xl font-black">
              This Match Day — Selected Climate Projects
            </h3>
            <p className="mt-2 max-w-3xl text-sm text-slate-400">
              {matchDayWindowCopy()}
            </p>
            {(minAmount != null && Number(minAmount) > 0) ||
            (gbpPerGoal != null && Number(gbpPerGoal) > 0) ? (
              <p className="mt-2 text-sm text-green-300">
                {[
                  formatMatchFundingLine({
                    baseAmount: minAmount,
                    gbpPerGoal,
                    maxAmount,
                  }),
                  `${FUND_IT_LABEL} ${formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)} from each Carbon Wallet`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            ) : (
              <p className="mt-2 text-sm text-green-300">
                {FUND_IT_LABEL} {formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)} from
                each Carbon Wallet
              </p>
            )}
            <ProjectGrid
              projects={selected}
              empty={`No projects selected for this Match Day yet. Global Schools Solar will be included automatically once you choose ${MATCH_DAY_CHOICE_COUNT} Climate Partner projects.`}
              badge="Selected"
              clubName={club.name}
              clubCountry={club.country}
            />
          </div>
        </section>

        <MatchDayFolderPanel
          clubName={club.name}
          matchDate={matchDate}
          onMatchDateChange={setMatchDate}
          folder={folder}
          selectedCount={selected.length}
          onSaveSponsors={saveSponsorsFile}
          onSaveProjects={saveProjectsFile}
          onSubmit={() => void submitMatchDayFolder()}
          busy={posting}
          error={postError}
          notice={folderNotice}
        />

        <section className="mt-12 rounded-3xl border border-green-500/30 bg-slate-900 p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
            Sponsorship record
          </p>
          <h2 className="mt-2 text-3xl font-black">
            Signed copy of the sponsorship
          </h2>
          <p className="mt-2 max-w-3xl text-slate-300">
            When a Sponsorship Manager signs off your 5 Climate Projects, the
            signed copy — brand name, signer, date, and the five projects —
            is kept here for the club.
          </p>
          {signedCopies.length === 0 ? (
            <p className="mt-6 text-slate-500">
              Waiting for a Sponsorship Manager to sign off Option 1. After
              they agree and sign, the signed copy appears in this folder.
            </p>
          ) : (
            <div className="mt-8 space-y-6">
              {signedCopies.map((copy) => (
                <div
                  key={copy.signature.id}
                  className="rounded-2xl border border-green-500/30 bg-slate-950 p-6"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <p className="text-sm font-semibold text-amber-300">
                        SPONSORED BY {copy.signature.brandName}
                      </p>
                      <h3 className="mt-1 text-xl font-bold">
                        {copy.offer.headline}
                      </h3>
                      <p className="mt-2 text-sm text-slate-400">
                        Signed by {copy.signature.signerName} on{" "}
                        {new Date(copy.signature.signedAt).toLocaleString(
                          "en-GB"
                        )}
                      </p>
                      <p className="mt-1 text-sm text-green-300">
                        {formatMatchFundingLine({
                          baseAmount:
                            Number(copy.offer.sponsorshipAmountGbp) ||
                            DEFAULT_MINIMUM_SPONSORSHIP,
                          gbpPerGoal: copy.offer.gbpPerGoal ?? gbpPerGoal,
                          maxAmount: copy.offer.maxAmount ?? maxAmount,
                        }) ||
                          `${formatMoney(
                            Number(copy.offer.sponsorshipAmountGbp) ||
                              DEFAULT_MINIMUM_SPONSORSHIP
                          )} Base Match Sponsorship`}
                        {` · ${FUND_IT_LABEL} ${formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadSignedCopy(copy)}
                      className="rounded-xl bg-green-500 px-5 py-3 font-bold text-slate-950"
                    >
                      Download signed copy
                    </button>
                  </div>
                  <ul className="mt-4 space-y-1 text-slate-300">
                    {copy.offer.projects.map((project) => (
                      <li key={project.id}>• {project.name}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-black">Voted-For Projects</h2>
          <p className="mt-2 text-slate-400">
            Climate projects supporters have funded with FUND-IT on your
            match-day campaign — up to 5 times, £0.20 once from each Carbon
            Wallet onto any Project.
          </p>
          <ProjectGrid
            projects={voted}
            empty="No FUND-IT allocations yet. Once fans press FUND-IT on My S4P, those projects appear here."
            badge="Voted"
            clubName={club.name}
            clubCountry={club.country}
          />
        </section>

        <section className="mt-12 rounded-3xl border border-slate-700 bg-slate-900 p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
                Match Day File Record
              </p>
              <h2 className="mt-2 text-3xl font-black">
                Selected and voted projects, kept for lookback
              </h2>
              <p className="mt-2 max-w-2xl text-slate-400">
                Every confirmed Match Day five is stored once in this club file
                record so the Sustainability Director can look back later.
                Incomplete or unstamped copies of the same five are merged into
                that lookback. When a second brand signs those projects, that
                brand gets its own stamped card.
              </p>
            </div>
            <button
              onClick={downloadFileRecord}
              className="rounded-xl border border-green-500 px-5 py-3 font-semibold text-green-400"
            >
              Download file record
            </button>
          </div>

          {records.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-950 p-8 text-slate-400">
              No file records yet. Confirm {MATCH_DAY_PROJECT_COUNT} Match Day
              projects to create the first record.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {records.map((record) => {
                const sponsor = lookbackSponsorForRecord(
                  record,
                  signedCopies,
                  (name) => sponsorLogoSrc(name, null)
                );
                return (
                <div
                  key={record.id}
                  className="rounded-2xl border border-slate-700 bg-slate-950 p-6"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div className="flex items-start gap-3">
                      {sponsor && (
                        <BrandMark
                          name={sponsor.name}
                          logoUrl={sponsor.logoUrl}
                        />
                      )}
                      <div>
                        <h3 className="text-xl font-bold">{record.matchLabel}</h3>
                        {sponsor && (
                          <p className="mt-1 text-sm font-semibold text-amber-300">
                            Sponsored by {sponsor.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-400">
                      {new Date(record.savedAt).toLocaleString("en-GB")}
                    </p>
                  </div>
                  {record.minAmount != null && (
                    <p className="mt-2 text-sm text-green-300">
                      Base Match Sponsorship: {formatMoney(record.minAmount)}
                    </p>
                  )}
                  <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Selected
                  </p>
                  <ul className="mt-2 space-y-1 text-slate-300">
                    {record.selected.map((project) => (
                      <li key={project.id}>• {project.name}</li>
                    ))}
                  </ul>
                  <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Voted
                  </p>
                  {record.voted.length === 0 ? (
                    <p className="mt-2 text-slate-500">No votes recorded yet.</p>
                  ) : (
                    <ul className="mt-2 space-y-1 text-slate-300">
                      {record.voted.map((project) => (
                        <li key={project.id}>• {project.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-black">Funded Projects</h2>
          <p className="mt-2 text-slate-400">
            Projects unlocked when {club.name} players score and the locked
            sponsorship is paid.
          </p>
          <ProjectGrid
            projects={funded}
            empty="No projects have been funded from Goals yet."
            funded
            clubName={club.name}
            clubCountry={club.country}
          />
        </section>

        <section className="mt-12 rounded-3xl border border-slate-700 bg-slate-900 p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
                S4P Climate Impact League Table
              </p>
              <h2 className="mt-2 text-3xl font-black">
                CILT · {ciltLeague ?? "League"}
              </h2>
              <p className="mt-2 max-w-2xl text-slate-400">
                {ciltLeague
                  ? `${ciltLeague} clubs ranked by tonnes of carbon avoided, reduced or offset from Goals scored and fan votes.`
                  : "Clubs ranked by tonnes of carbon avoided, reduced or offset from sponsorship funded by Goals scored."}
              </p>
            </div>
            {clubRow && (
              <div className="rounded-2xl bg-green-500 px-6 py-4 text-slate-950">
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                  {club.name} position
                </p>
                <p className="text-3xl font-black">
                  {ciltPositionLabel(clubRow)}
                </p>
                <p className="text-sm font-semibold">
                  {clubRow.tonnes.toLocaleString("en-GB")} t CO₂
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800">
            <div className="grid grid-cols-12 bg-slate-950 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span className="col-span-2">Pos</span>
              <span className="col-span-7">Club</span>
              <span className="col-span-3 text-right">t CO₂</span>
            </div>
            {cilt.map((row) => (
              <div
                key={row.club}
                className={`grid grid-cols-12 border-t border-slate-800 px-5 py-4 ${
                  row.isClub ? "bg-green-500 text-slate-950" : "bg-slate-950/40"
                }`}
              >
                <strong className="col-span-2">{row.position}</strong>
                <span className="col-span-7 font-semibold">{row.club}</span>
                <span className="col-span-3 text-right font-black">
                  {row.tonnes.toLocaleString("en-GB")}
                </span>
              </div>
            ))}
            {cilt.length === 0 && (
              <div className="border-t border-slate-800 px-5 py-6 text-slate-400">
                This club is not yet ranked in a CILT league table.
              </div>
            )}
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
  clubName,
  clubCountry,
}: {
  projects: ClimateProject[];
  empty: string;
  funded?: boolean;
  badge?: string;
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
        return (
        <div
          key={project.id}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-xl font-bold">{project.name}</h3>
            {(funded || badge || isFeaturedClimateProject(project)) && (
              <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-400">
                {funded
                  ? "Funded"
                  : isFeaturedClimateProject(project)
                    ? "Featured"
                    : badge}
              </span>
            )}
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

function DashboardCard({
  title,
  value,
}: {
  title: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="rounded-2xl bg-slate-900 p-6">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-3 text-3xl font-black text-green-400">{value ?? "—"}</p>
    </div>
  );
}

function Info({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-lg">{children}</p>
    </div>
  );
}
