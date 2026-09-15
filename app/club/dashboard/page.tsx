"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import {
  loadClubSession,
  loadClubProjectBoard,
  fileRecordDownloadName,
  postMatchDayProjectsToFans,
  readStoredMatchDay,
  saveMatchDaySelection,
  type ClubAccount,
  type ClubFileRecord,
  type ClubProfile,
} from "@/app/services/club-match-day.service";
import {
  listClubSponsorProposals,
  listClubSignedSponsorships,
  markSponsorProposalPosted,
  type SignedSponsorship,
  type SponsorProjectProposal,
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
import {
  MATCH_DAY_CHOICE_COUNT,
  MATCH_DAY_PROJECT_COUNT,
} from "@/app/lib/partner-projects";
import {
  DEFAULT_GBP_PER_VOTE,
  DEFAULT_PROJECTED_VOTES,
  OPENING_SPONSORSHIP,
  formatGbpPerVote,
  formatMoney,
} from "@/app/lib/sponsorship-auction";
import {
  signedCopyDownloadName,
  signedCopyPayload,
  sponsorshipFundedProposals,
  sponsorshipSelectedProposals,
} from "@/app/lib/sponsor-dashboard";
import {
  loadClubSponsorRoster,
  loadGoalNetwork,
  loadMatchDayLock,
  setMatchDaySponsorTargets,
} from "@/app/services/climate-sponsors.service";
import {
  selectedBrandsReadyToReceive,
  rankSponsorsBySpend,
  type ClubSponsorRoster,
} from "@/app/lib/climate-sponsors";
import { BrandMark } from "@/app/components/club/BrandMark";
import {
  CLUB_LOGIN_PATH,
  CLUB_REGISTER_PATH,
  CLUB_SELECT_PROJECTS_PATH,
  CLUB_SPONSORS_PATH,
} from "@/app/lib/routes";

export default function ClubDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState<ClubProfile | null>(null);
  const [account, setAccount] = useState<ClubAccount | null>(null);
  const [voted, setVoted] = useState<ClimateProject[]>([]);
  const [funded, setFunded] = useState<ClimateProject[]>([]);
  const [selected, setSelected] = useState<ClimateProject[]>([]);
  const [minAmount, setMinAmount] = useState<number | null>(null);
  const [projectedVotes, setProjectedVotes] = useState<number | null>(null);
  const [gbpPerVote, setGbpPerVote] = useState<number | null>(null);
  const [expectedSponsorship, setExpectedSponsorship] = useState<number | null>(
    null
  );
  const [records, setRecords] = useState<ClubFileRecord[]>([]);
  const [unlinked, setUnlinked] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postedAt, setPostedAt] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const [proposals, setProposals] = useState<SponsorProjectProposal[]>([]);
  const [signedCopies, setSignedCopies] = useState<SignedSponsorship[]>([]);
  const [roster, setRoster] = useState<ClubSponsorRoster | null>(null);

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
        setUnlinked(true);
        setLoading(false);
        return;
      }
      setAccount(session.account);
      setClub(session.club);

      const board = await loadClubProjectBoard(session.club.id, session.club.name);
      setVoted(board.voted);
      setFunded(board.funded);
      setSelected(board.selected);
      setMinAmount(board.minAmount);
      setRecords(board.records);
      const stored = readStoredMatchDay(session.club.id);
      setPostedAt(stored?.postedAt ?? null);
      const peak =
        stored?.expectedSponsorship && stored.expectedSponsorship > OPENING_SPONSORSHIP
          ? stored.expectedSponsorship
          : board.minAmount && board.minAmount > OPENING_SPONSORSHIP
            ? board.minAmount
            : stored?.expectedSponsorship ?? null;
      setProjectedVotes(stored?.projectedVotes ?? (peak ? DEFAULT_PROJECTED_VOTES : null));
      setGbpPerVote(
        stored?.gbpPerVote ??
          (peak && (stored?.projectedVotes ?? DEFAULT_PROJECTED_VOTES)
            ? peak / (stored?.projectedVotes ?? DEFAULT_PROJECTED_VOTES)
            : null)
      );
      setExpectedSponsorship(peak);
      setProposals(
        await listClubSponsorProposals(session.club.id, session.club.name)
      );
      setSignedCopies(
        await listClubSignedSponsorships(session.club.id, session.club.name)
      );
      setRoster(loadClubSponsorRoster(session.club.id, session.club.name));
      setLoading(false);
    }

    load();
  }, [router]);

  const extraTonnes = useMemo(
    () =>
      [...funded, ...voted].reduce(
        (sum, project) => sum + (Number(project.estimated_co2) || 0),
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
  const selectedProposals = useMemo(
    () => sponsorshipSelectedProposals(proposals),
    [proposals]
  );
  const fundedProposals = useMemo(
    () => sponsorshipFundedProposals(proposals),
    [proposals]
  );
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
    await supabase.auth.signOut();
    router.push(CLUB_LOGIN_PATH);
  }

  async function handleMatchDayAction() {
    if (selected.length < MATCH_DAY_PROJECT_COUNT) {
      router.push(CLUB_SELECT_PROJECTS_PATH);
      return;
    }
    if (!club) return;
    setPosting(true);
    setPostError(null);
    try {
      const posted = await postMatchDayProjectsToFans({
        clubId: club.id,
        clubName: club.name,
        country: club.country,
      });
      setPostedAt(posted.postedAt ?? new Date().toISOString());
      setSignedCopies(
        await listClubSignedSponsorships(club.id, club.name)
      );
    } catch (err) {
      setPostError(
        err instanceof Error
          ? err.message
          : "Could not post these projects to your fans."
      );
    } finally {
      setPosting(false);
    }
  }

  async function pushSponsorProposal(proposal: SponsorProjectProposal) {
    if (!club) return;
    setPosting(true);
    setPostError(null);
    try {
      const featuredId = selected.find(isFeaturedClimateProject)?.id;
      const partnerIds = proposal.projectIds.filter((id) => id !== featuredId);
      await saveMatchDaySelection({
        clubId: club.id,
        clubName: club.name,
        country: club.country,
        projectIds: partnerIds,
        minAmount: minAmount ?? OPENING_SPONSORSHIP,
      });
      const posted = await postMatchDayProjectsToFans({
        clubId: club.id,
        clubName: club.name,
        country: club.country,
      });
      const board = await loadClubProjectBoard(club.id, club.name);
      setSelected(board.selected);
      setPostedAt(posted.postedAt ?? new Date().toISOString());
      await markSponsorProposalPosted(proposal.id);
      setProposals(await listClubSponsorProposals(club.id, club.name));
    } catch (err) {
      setPostError(
        err instanceof Error
          ? err.message
          : "Could not push the sponsor's Climate Projects to your fans."
      );
    } finally {
      setPosting(false);
    }
  }

  if (unlinked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="max-w-lg rounded-2xl bg-slate-900 p-8 text-center">
          <h1 className="text-3xl font-black">Club account not linked yet</h1>
          <p className="mt-4 text-slate-300">
            You are signed in, but this email is not attached to a club
            Sustainability Director profile yet. Complete club registration
            and you will land on the dashboard.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href={CLUB_REGISTER_PATH}
              className="rounded-xl bg-green-500 px-6 py-3 font-bold text-slate-950"
            >
              Complete club registration
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
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading Dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black">{club.name}</h1>
            <p className="mt-2 text-slate-400">
              Welcome to your Score-4-Our-Planet Club Dashboard
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-xl bg-red-500 px-5 py-3 font-semibold"
          >
            Logout
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

        <section id="our-climate-sponsors" className="mt-12 rounded-3xl border border-amber-400/30 bg-slate-900 p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
            Brands
          </p>
          <h2 className="mt-2 text-4xl font-black">Our Climate Sponsors</h2>
          <p className="mt-3 max-w-3xl text-slate-300">
            Add decision-maker contacts, branding and climate-project spend.
            Select who should receive this Match Day five. They only see it if
            they chose {club.name} at registration or accepted your network
            request, and have locked {club.name} for this Match Day.
          </p>
          <button
            type="button"
            onClick={() => router.push(CLUB_SPONSORS_PATH)}
            className="mt-6 rounded-xl bg-amber-400 px-6 py-4 text-lg font-bold text-slate-950"
          >
            Our Climate Sponsors
          </button>
          {roster && roster.sponsors.length > 0 && (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {rankSponsorsBySpend(roster.sponsors).map((sponsor) => {
                const on = roster.selectedIds.includes(sponsor.id);
                const ready = readySponsorBrands.some((row) => row.id === sponsor.id);
                return (
                  <button
                    key={sponsor.id}
                    type="button"
                    onClick={() =>
                      setRoster(
                        setMatchDaySponsorTargets(club.id, club.name, sponsor.id)
                      )
                    }
                    className={`flex items-start gap-3 rounded-2xl border p-4 text-left ${
                      on
                        ? "border-green-500 bg-slate-800"
                        : "border-slate-700 bg-slate-950"
                    }`}
                  >
                    <BrandMark name={sponsor.brandName} logoUrl={sponsor.logoUrl} />
                    <div>
                      <p className="font-bold">{sponsor.brandName}</p>
                      <p className="text-sm text-slate-400">
                        {sponsor.contactName || "Decision maker not set"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatMoney(sponsor.spentGbp)} climate spend
                        {ready
                          ? " · locked in — will receive this post"
                          : on
                            ? " · selected, waiting for lock-in"
                            : ""}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

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
                ? "These Projects will be voted for by your Fans/Supporters as to which project receives the sponsorship funding. Selected Climate Sponsors who have locked this club for the Match Day receive the same five on their dashboard."
                : `Open S4P Climate Projects to choose 4 Climate Partner projects from List 1 (${localCountry}) and List 2 (International). Global Schools Solar is included automatically and is UK and International.`}
            </p>
          </div>

          <button
            className="mt-10 w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white hover:bg-blue-500 disabled:cursor-wait disabled:opacity-70"
            disabled={posting}
            onClick={() => void handleMatchDayAction()}
          >
            {posting
              ? "Posting to your fans and brands..."
              : selected.length >= MATCH_DAY_PROJECT_COUNT
                ? `Post Your ${MATCH_DAY_PROJECT_COUNT} Climate Projects to your Fans/Supporters to Vote on`
                : "S4P Climate Projects"}
          </button>
          {selected.length >= MATCH_DAY_PROJECT_COUNT && (
            <button
              type="button"
              className="mt-3 w-full rounded-xl border border-green-500/40 py-3 text-sm font-semibold text-green-400 hover:bg-green-500/10"
              onClick={() => router.push(CLUB_SELECT_PROJECTS_PATH)}
            >
              S4P Climate Projects — change List 1 and List 2
            </button>
          )}
          {postError && (
            <p className="mt-4 text-center text-sm font-semibold text-red-400">
              {postError}
            </p>
          )}
          {postedAt && !postError && (
            <p className="mt-4 text-center text-sm font-semibold text-green-300">
              Posted to your fans on My S4P
              {readySponsorBrands.length
                ? ` and to ${readySponsorBrands.map((row) => row.brandName).join(", ")}.`
                : roster?.selectedIds.length
                  ? ` Selected Climate Sponsors will see these five once they lock ${club.name} for this Match Day.`
                  : ". No Climate Sponsor was selected, so brand dashboards were not updated."}{" "}
              Supporters of {club.name} will see these {MATCH_DAY_PROJECT_COUNT}{" "}
              projects when they open their page.
            </p>
          )}

          <div className="mt-10 text-left">
            <h3 className="text-2xl font-black">
              This Match Day — Selected Climate Projects
            </h3>
            {(expectedSponsorship != null || minAmount != null) && (
              <p className="mt-2 text-sm text-green-300">
                Base {formatMoney(OPENING_SPONSORSHIP)}/Goal (Min)
                {expectedSponsorship != null && projectedVotes
                  ? ` · proposed ${formatMoney(expectedSponsorship)}/Goal at ${projectedVotes.toLocaleString("en-GB")} votes (${formatGbpPerVote(gbpPerVote ?? 0.01)}/vote)`
                  : minAmount != null
                    ? ` · ${formatMoney(minAmount)}/Goal`
                    : ""}
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

        <section id="sponsorship-selected" className="mt-12 rounded-3xl border border-blue-500/30 bg-slate-900 p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">
            From the Sponsorship Manager
          </p>
          <h2 className="mt-2 text-3xl font-black">
            Sponsorship Selected Projects
          </h2>
          <p className="mt-2 max-w-3xl text-slate-300">
            When a Sponsorship Manager chooses 5 Climate Projects and sends
            them with the blue button, those projects appear here — not the
            five you selected yourself.
          </p>
          {selectedProposals.length === 0 ? (
            <p className="mt-6 text-slate-500">
              No Sponsorship Manager has sent a list yet. Their 5 Climate
              Projects will show here as soon as they click Send these 5
              Climate Projects to the Sustainability Director.
            </p>
          ) : (
            <div className="mt-8 space-y-8">
              {selectedProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="rounded-2xl border border-slate-700 bg-slate-950 p-6"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div>
                      <p className="text-sm font-semibold text-amber-300">
                        Chosen by {proposal.sponsorName}
                      </p>
                      <p className="text-sm text-slate-400">
                        {new Date(proposal.createdAt).toLocaleString("en-GB")}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={posting}
                      onClick={() => void pushSponsorProposal(proposal)}
                      className="rounded-xl bg-blue-600 px-5 py-3 font-bold hover:bg-blue-500 disabled:opacity-70"
                    >
                      Post these to fans
                    </button>
                  </div>
                  <ProjectGrid
                    projects={proposalAsProjects(proposal)}
                    empty="This list has no Climate Projects."
                    badge="Sponsor selected"
                    clubName={club.name}
                    clubCountry={club.country}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

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
                        Amount:{" "}
                        {formatMoney(
                          Number(copy.offer.sponsorshipAmountGbp) ||
                            OPENING_SPONSORSHIP
                        )}
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

        <section className="mt-12 rounded-3xl border border-emerald-500/30 bg-slate-900 p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
            From the Sponsorship Manager
          </p>
          <h2 className="mt-2 text-3xl font-black">
            Sponsorship Funded Projects
          </h2>
          <p className="mt-2 max-w-3xl text-slate-300">
            After you post a Sponsorship Manager&apos;s 5 Climate Projects to
            fans, that list is kept here as the funded sponsorship campaign.
          </p>
          {fundedProposals.length === 0 ? (
            <p className="mt-6 text-slate-500">
              No sponsor-chosen list has been posted to fans yet. Post a
              Sponsorship Selected list and it moves here.
            </p>
          ) : (
            <div className="mt-8 space-y-8">
              {fundedProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="rounded-2xl border border-emerald-500/30 bg-slate-950 p-6"
                >
                  <p className="text-sm font-semibold text-amber-300">
                    Funded by {proposal.sponsorName}
                  </p>
                  <p className="text-sm text-slate-400">
                    Posted {new Date(proposal.createdAt).toLocaleString("en-GB")}
                  </p>
                  <ProjectGrid
                    projects={proposalAsProjects(proposal)}
                    empty="This funded list has no Climate Projects."
                    funded
                    clubName={club.name}
                    clubCountry={club.country}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-black">Voted-For Projects</h2>
          <p className="mt-2 text-slate-400">
            Climate projects supporters have voted for on your match-day
            campaign.
          </p>
          <ProjectGrid
            projects={voted}
            empty="No supporter votes yet. Once fans vote on My S4P, those projects appear here."
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
                Every confirmed Match Day selection and every voted project is
                stored in this club file record so the Sustainability Director
                can look back later.
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
              {records.map((record) => (
                <div
                  key={record.id}
                  className="rounded-2xl border border-slate-700 bg-slate-950 p-6"
                >
                  <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                    <h3 className="text-xl font-bold">{record.matchLabel}</h3>
                    <p className="text-sm text-slate-400">
                      {new Date(record.savedAt).toLocaleString("en-GB")}
                    </p>
                  </div>
                  {record.minAmount != null && (
                    <p className="mt-2 text-sm text-green-300">
                      Minimum sponsorship: {formatMoney(record.minAmount)}/Goal
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
              ))}
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

function proposalAsProjects(
  proposal: SponsorProjectProposal
): ClimateProject[] {
  return proposal.projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    category: project.category,
    country: project.country,
    estimated_co2: project.estimated_co2,
    funding_goal: null,
    image_url: null,
    status: "active",
  }));
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
          {project.estimated_co2 != null && (
            <p className="mt-4 text-sm font-semibold text-green-400">
              {project.estimated_co2.toLocaleString("en-GB")} t CO₂
            </p>
          )}
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
