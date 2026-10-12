"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import {
  loadSponsorFolder,
  type SignedSponsorship,
  type SponsorDashboardStats,
  type SponsorMatchOffer,
} from "@/app/services/sponsor-offers.service";
import {
  clearMatchDayLock,
  ensureGoalNetwork,
  loadBrandLogo,
  loadMatchDayLock,
  lockMatchDayClub,
  readLogoFile,
  saveBrandLogo,
} from "@/app/services/climate-sponsors.service";
import { BrandMark } from "@/app/components/club/BrandMark";
import {
  MATCH_DAY_LOCK_LABELS,
  clubsMatch,
  displayLockFixture,
  lockCopy,
  secondLeadClimateSponsorRejectedMessage,
  unlockedMatchDay,
  type MatchDayClubLock,
} from "@/app/lib/climate-sponsors";
import { fixtureByIdOrName, type ClubFixture } from "@/app/lib/club-fixtures";
import { loadClubFixtures } from "@/app/services/club-fixtures.service";
import { SeeMatchDetails } from "@/app/components/sponsor/SeeMatchDetails";
import {
  ClubLeagueMenu,
  MatchFixtureMenu,
} from "@/app/components/sponsor/ClubMatchMenus";
import {
  SPONSOR_DASHBOARD_PATH,
  SPONSOR_LOGIN_PATH,
  SPONSOR_OFFERS_PATH,
  SPONSOR_RECEIVE_SECTION_ID,
  SPONSOR_SIGNED_SECTION_ID,
  SPONSOR_WALLET_PATH,
  isNewSponsorshipRequest,
  sponsorNewSponsorshipPath,
  sponsorOfferSignOffPath,
  sponsorWalletPath,
} from "@/app/lib/routes";
import { SignedSponsorHome } from "@/app/components/sponsor/SignedSponsorHome";
import { showsSignedSponsorHome } from "@/app/lib/sponsor-signed-home";
import { formatLongMatchDate } from "@/app/lib/s4p-climate-projects";
import {
  formatMatchFundingLine,
  formatMoney,
  formatStipulatedRate,
  formatVoteCount,
} from "@/app/lib/sponsorship-auction";
import { votedProjectsOnSignedOffer, fanVotesOnSignedOffers } from "@/app/lib/sponsor-dashboard";
import { loadVotedPortfolioProjects } from "@/app/services/club-match-day.service";
import { isLeadSponsorHome } from "@/app/lib/sponsor-home";
import { sponsorLogoSrc } from "@/app/services/teams.service";
import type { ClimateProject } from "@/app/services/votes.service";

const EMPTY_STATS: SponsorDashboardStats = {
  projectCount: 0,
  carbonTonnes: 0,
  expenditureGbp: 0,
  fanVotes: 0,
};

export default function SponsorDashboardPage() {
  const router = useRouter();
  const [brand, setBrand] = useState("your brand");
  const [pending, setPending] = useState<SponsorMatchOffer[]>([]);
  const [signed, setSigned] = useState<SignedSponsorship[]>([]);
  const [votedByClub, setVotedByClub] = useState<Record<string, ClimateProject[]>>(
    {}
  );
  const [stats, setStats] = useState<SponsorDashboardStats>(EMPTY_STATS);
  const [lock, setLock] = useState<MatchDayClubLock | null>(null);
  const [lockClub, setLockClub] = useState("");
  const [lockFixture, setLockFixture] = useState("");
  const [lockLabel, setLockLabel] = useState(MATCH_DAY_LOCK_LABELS[0]);
  const [clubFixtures, setClubFixtures] = useState<ClubFixture[]>([]);
  const [fixturesLoading, setFixturesLoading] = useState(false);
  const [fixtureNotice, setFixtureNotice] = useState<string | null>(null);
  const [chosenFixture, setChosenFixture] = useState<ClubFixture | null>(null);
  const lockFixtureRef = useRef(lockFixture);
  lockFixtureRef.current = lockFixture;
  const [email, setEmail] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSponsorship, setNewSponsorship] = useState(false);

  useEffect(() => {
    setNewSponsorship(isNewSponsorshipRequest(window.location.search));
  }, []);

  useEffect(() => {
    async function load() {
      let sponsorName = "your brand";
      let sponsorId = "";
      let sponsorEmail: string | null = null;
      try {
        const sponsor = await getCurrentSponsor();
        sponsorName = String(sponsor.name ?? "your brand");
        sponsorId = String(sponsor.id ?? "");
        sponsorEmail = (sponsor.email as string | null) ?? null;
        setBrand(sponsorName);
        setEmail(sponsorEmail);
        if (!isLeadSponsorHome(sponsorName)) {
          router.replace(SPONSOR_WALLET_PATH);
          return;
        }
        const uploaded = loadBrandLogo(sponsorName);
        const fromRecord = (sponsor.logo_url as string | null) ?? null;
        setLogoUrl(
          uploaded || fromRecord || sponsorLogoSrc(sponsorName, fromRecord)
        );
        const currentLock = loadMatchDayLock(sponsorName);
        setLock(currentLock);
        setLockClub(currentLock?.clubName ?? "");
        setLockFixture(
          currentLock ? displayLockFixture(currentLock) : ""
        );
        if (currentLock?.competition) setLockLabel(currentLock.competition);
        else if (currentLock?.matchLabel && !currentLock.fixtureName) {
          setLockLabel(currentLock.matchLabel);
        }
        const folder = await loadSponsorFolder({
          sponsorId,
          brandName: sponsorName,
          brandEmail: sponsorEmail,
        });
        setPending(folder.pending);
        setSigned(folder.signed);
        const clubIds = [
          ...new Set(
            [
              ...folder.pending.map((offer) => offer.clubId),
              ...folder.signed.map((row) => row.offer.clubId),
            ].filter(Boolean)
          ),
        ];
        const votedEntries = await Promise.all(
          clubIds.map(async (clubId) => {
            const voted = clubId
              ? await loadVotedPortfolioProjects(clubId)
              : [];
            return [clubId, voted] as const;
          })
        );
        const votedMap = Object.fromEntries(votedEntries);
        setVotedByClub(votedMap);
        setStats({
          ...folder.stats,
          fanVotes: fanVotesOnSignedOffers(
            folder.signed,
            votedMap,
            folder.stats.fanVotes
          ),
        });
      } catch (err) {
        if (!sponsorId) {
          router.replace(SPONSOR_LOGIN_PATH);
          return;
        }
        setError(err instanceof Error ? err.message : "Could not load offers.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  useEffect(() => {
    if (!lockClub) {
      setClubFixtures([]);
      setFixturesLoading(false);
      return;
    }
    let cancelled = false;
    setFixturesLoading(true);
    void loadClubFixtures(lockClub)
      .then((rows) => {
        if (cancelled) return;
        setClubFixtures(rows);
        const current = lockFixtureRef.current;
        if (!current) return;
        const published = fixtureByIdOrName(rows, current);
        if (published) {
          setLockFixture(published.fixtureName);
          setLockLabel(published.competition);
          setChosenFixture(published);
          if (
            lock &&
            clubsMatch(lock.clubName, lockClub) &&
            (lock.fixtureDate !== published.date ||
              lock.venue !== published.venue ||
              lock.kickoff !== published.kickoff)
          ) {
            try {
              const next = lockMatchDayClub({
                brandName: brand,
                clubName: lockClub,
                matchLabel: published.competition,
                fixtureName: published.fixtureName,
                competition: published.competition,
                fixtureDate: published.date,
                kickoff: published.kickoff,
                venue: published.venue,
                sourceUrl: published.sourceUrl,
              });
              ensureGoalNetwork({
                brandName: brand,
                clubNames: [lockClub],
              });
              setLock(next);
            } catch (err) {
              setFixtureNotice(
                err instanceof Error
                  ? err.message
                  : secondLeadClimateSponsorRejectedMessage(lockClub, "")
              );
            }
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setClubFixtures([]);
          setFixtureNotice("Could not load published fixtures for this club.");
        }
      })
      .finally(() => {
        if (!cancelled) setFixturesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lockClub, brand]);

  useEffect(() => {
    if (loading) return;
    const hash = window.location.hash.replace(/^#/, "");
    if (
      hash !== SPONSOR_RECEIVE_SECTION_ID &&
      hash !== SPONSOR_SIGNED_SECTION_ID
    ) {
      return;
    }
    const scroll = () =>
      document.getElementById(hash)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    const frame = window.requestAnimationFrame(scroll);
    const timer = window.setTimeout(scroll, 80);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [loading, pending.length, signed.length]);

  async function refreshFolder() {
    const folder = await loadSponsorFolder({ brandName: brand, brandEmail: email });
    setPending(folder.pending);
    setSigned(folder.signed);
    const clubIds = [
      ...new Set(
        [
          ...folder.pending.map((offer) => offer.clubId),
          ...folder.signed.map((row) => row.offer.clubId),
        ].filter(Boolean)
      ),
    ];
    const votedEntries = await Promise.all(
      clubIds.map(async (clubId) => {
        const voted = clubId ? await loadVotedPortfolioProjects(clubId) : [];
        return [clubId, voted] as const;
      })
    );
    setVotedByClub(Object.fromEntries(votedEntries));
    setStats({
      ...folder.stats,
      fanVotes: fanVotesOnSignedOffers(
        folder.signed,
        Object.fromEntries(votedEntries),
        folder.stats.fanVotes
      ),
    });
  }

  function applyMatchDayLock(clubName: string, fixture: ClubFixture | null) {
    const club = clubName.trim();
    if (!club) {
      clearMatchDayLock(brand);
      setLock(null);
      setLockClub("");
      setLockFixture("");
      setChosenFixture(null);
      setFixtureNotice(null);
      void refreshFolder();
      return;
    }
    if (!fixture) {
      setLockClub(club);
      setLockFixture("");
      setChosenFixture(null);
      setFixtureNotice(null);
      if (lock && !clubsMatch(lock.clubName, club)) {
        clearMatchDayLock(brand);
        setLock(null);
      }
      return;
    }
    setLockClub(club);
    setLockFixture(fixture.fixtureName);
    setChosenFixture(fixture);
    if (fixture.competition) setLockLabel(fixture.competition);
    try {
      const next = lockMatchDayClub({
        brandName: brand,
        clubName: club,
        matchLabel: fixture.competition,
        fixtureName: fixture.fixtureName,
        competition: fixture.competition,
        fixtureDate: fixture.date,
        kickoff: fixture.kickoff,
        venue: fixture.venue,
        sourceUrl: fixture.sourceUrl,
      });
      ensureGoalNetwork({
        brandName: brand,
        clubNames: [club],
      });
      setLock(next);
      setFixtureNotice(null);
      void refreshFolder();
    } catch (err) {
      setFixtureNotice(
        err instanceof Error
          ? err.message
          : secondLeadClimateSponsorRejectedMessage(club, "", fixture.fixtureName)
      );
    }
  }

  function unlockMatchDay() {
    const cleared = unlockedMatchDay(lockLabel);
    applyMatchDayLock(cleared.clubName, null);
  }

  const selectedFixture =
    chosenFixture && chosenFixture.fixtureName === lockFixture
      ? chosenFixture
      : fixtureByIdOrName(clubFixtures, lockFixture);
  const matchLocked = Boolean(lockClub && (selectedFixture || lockFixture));

  if (loading) {
    return <p className="text-slate-400">Loading sponsor dashboard...</p>;
  }

  if (showsSignedSponsorHome(signed.length, newSponsorship)) {
    return (
      <SignedSponsorHome
        brand={brand}
        logoUrl={logoUrl}
        signed={signed}
        votedByClub={votedByClub}
        committedGbp={stats.expenditureGbp}
        onNewSponsorship={() => {
          setNewSponsorship(true);
          router.replace(sponsorNewSponsorshipPath());
        }}
      />
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-4">
          <BrandMark name={brand} logoUrl={logoUrl} large />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
              Signed in as {brand}
            </p>
            <label className="mt-2 inline-flex cursor-pointer items-center rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-green-400">
              {logoUrl ? "Change brand logo" : "Upload brand logo"}
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  void readLogoFile(file).then((next) => {
                    setLogoUrl(next);
                    saveBrandLogo(brand, next);
                  });
                }}
                className="sr-only"
              />
            </label>
          </div>
        </div>
        <h1 className="mt-3 text-4xl font-black tracking-tight">
          S4P SPONSORSHIP DASHBOARD
        </h1>
      </div>

      {signed.length > 0 && (
        <button
          type="button"
          onClick={() => {
            setNewSponsorship(false);
            router.replace(SPONSOR_DASHBOARD_PATH);
          }}
          className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold"
        >
          Back to your sponsored Match Days
        </button>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      <section
        id="match-day-lock-in"
        className="scroll-mt-6 overflow-visible rounded-3xl border border-green-500/30 bg-slate-900 p-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
          Match Day lock-in
        </p>
        <h2 className="mt-2 text-3xl font-black">Select a Club</h2>
        <p className="mt-3 max-w-3xl text-slate-300">{lockCopy()}</p>
        <div className="mt-6 overflow-visible rounded-2xl border border-green-500/40 bg-green-500/10 p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-green-300">
            {matchLocked
              ? "Locked in"
              : lockClub
                ? "Select the Match"
                : "Select a Club"}
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <ClubLeagueMenu
              value={lockClub}
              onChange={(club) => applyMatchDayLock(club, null)}
            />
            <MatchFixtureMenu
              clubName={lockClub}
              value={lockFixture}
              fixtures={clubFixtures}
              loading={fixturesLoading}
              onChange={(fixture) => applyMatchDayLock(lockClub, fixture)}
            />
          </div>
          {fixtureNotice && (
            <p className="mt-4 text-sm font-semibold text-amber-300">
              {fixtureNotice}
            </p>
          )}
          {matchLocked ? (
            <>
              <p className="mt-4 text-2xl font-black">
                {lockClub} · {lockFixture}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Posted Climate Projects from other clubs will not appear on this
                dashboard until you change this lock.
              </p>
              <SeeMatchDetails
                key={lockFixture}
                defaultOpen
                date={
                  lock?.fixtureDate ||
                  selectedFixture?.date
                }
                venue={
                  lock?.venue ||
                  selectedFixture?.venue
                }
                kickoff={
                  lock?.kickoff ||
                  selectedFixture?.kickoff
                }
              />
            </>
          ) : lockClub ? (
            <p className="mt-4 text-sm text-slate-400">
              {lockClub} is selected. Choose the Match you wish to sponsor, then
              See Match details before opening the Climate Sponsorship Wallet.
            </p>
          ) : (
            <p className="mt-4 text-sm text-slate-400">
              Select a club from Premier League or Scottish Premiership, then
              select the Match you wish to sponsor. You can then See Match
              details and open the Climate Sponsorship Wallet.
            </p>
          )}
          <button
            type="button"
            onClick={unlockMatchDay}
            disabled={!lockClub}
            className="mt-4 rounded-xl border border-slate-600 px-4 py-2 text-sm disabled:opacity-40"
          >
            Unlock
          </button>
        </div>
      </section>

      <Link
        href={sponsorWalletPath(lockClub)}
        className="block rounded-3xl border border-emerald-400/40 bg-slate-900 p-8 hover:border-emerald-300"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
          Climate Sponsorship Wallet
        </p>
        <h2 className="mt-3 text-2xl font-black">
          Top up the cash fans will put into Climate Projects
        </h2>
        <p className="mt-3 max-w-3xl text-slate-300">
          Deposit your Day 1 Commitment Fee and agree Goals-scored Sponsorship
          Cash. Fans then take cash from this wallet and put it on a numbered
          Climate Project.
        </p>
        <p className="mt-5 inline-flex rounded-xl bg-s4p-mark px-5 py-3 font-bold text-slate-950">
          Open Climate Sponsorship Wallet
        </p>
      </Link>

      {signed.length === 0 && (
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Climate Projects sponsored"
          value={String(stats.projectCount)}
        />
        <StatCard
          label="Carbon impact"
          value={`${formatVoteCount(Math.round(stats.carbonTonnes))} tCO₂e`}
        />
        <StatCard
          label="Base Match Sponsorship committed"
          value={formatMoney(stats.expenditureGbp)}
        />
        <StatCard
          label="Fans who FUND-IT and saw your brand"
          value={formatVoteCount(stats.fanVotes)}
        />
      </section>
      )}

      <section id={SPONSOR_RECEIVE_SECTION_ID} className="scroll-mt-6">
        <Link
          href={SPONSOR_OFFERS_PATH}
          className="block rounded-3xl border border-slate-700 bg-slate-900 p-8 hover:border-green-500"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
            Match Day five
          </p>
          <h2 className="mt-3 text-2xl font-black">
            Receive the club&apos;s 5 chosen Climate Projects
          </h2>
          <p className="mt-3 max-w-3xl text-slate-300">
            After you lock in a club and deposit into the Climate Sponsorship
            Wallet, that funding is locked to the club. Open New
            Sponsorship/Score Offer to pull the Sustainability Director&apos;s
            uploaded five immediately, then sign them off. Posts from other
            clubs stay hidden while the lock is on.
          </p>
          <p className="mt-5 inline-flex rounded-xl bg-green-500 px-5 py-3 font-bold text-slate-950">
            {pending.length > 0
              ? `Open ${pending.length} new offer${pending.length === 1 ? "" : "s"}`
              : "Open New Sponsorship/Score Offer"}
          </p>
        </Link>
      </section>

      {signed.length === 0 && (
      <section
        id={SPONSOR_SIGNED_SECTION_ID}
        className="scroll-mt-6 rounded-3xl border border-slate-700 bg-slate-900 p-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
          Folder
        </p>
        <h2 className="mt-2 text-3xl font-black">Signed sponsorships</h2>
        <p className="mt-2 text-slate-400">
          Once you sign off a club&apos;s 5 and the sponsorship is settled, it
          is lodged here — including the Climate Projects fans later FUND-IT
          from that five.
        </p>
        {signed.length === 0 ? (
          <p className="mt-6 text-slate-500">
            No signed sponsorships yet. Receive the club&apos;s 5 chosen
            Climate Projects, agree, and sign them off.
          </p>
        ) : (
          <div className="mt-8 space-y-4">
            {signed.map((row) => {
              const when = formatLongMatchDate(row.offer.matchDate);
              const votedFor = votedProjectsOnSignedOffer(
                row.offer,
                votedByClub[row.offer.clubId] ?? []
              );
              return (
                <div
                  key={row.signature.id}
                  className="rounded-2xl border border-green-500/30 bg-slate-950 p-6"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <p className="text-sm text-green-300">
                        SPONSORED BY {row.signature.brandName}
                      </p>
                      <h3 className="mt-1 text-xl font-bold">
                        {row.offer.headline}
                      </h3>
                      {when && (
                        <p className="mt-1 text-sm text-slate-400">{when}</p>
                      )}
                      <p className="mt-1 text-sm text-slate-400">
                        Signed by {row.signature.signerName} on{" "}
                        {new Date(row.signature.signedAt).toLocaleString("en-GB")}
                      </p>
                    </div>
                    <p className="font-semibold text-green-300">
                      {formatMatchFundingLine({
                        baseAmount: Number(row.offer.sponsorshipAmountGbp) || 0,
                        gbpPerGoal: row.offer.gbpPerGoal,
                        maxAmount: row.offer.maxAmount,
                      }) ||
                        `${Number(row.offer.sponsorshipAmountGbp) || 0} Base`}
                      {row.offer.gbpPerVote
                        ? ` · ${formatStipulatedRate(Number(row.offer.gbpPerVote))}`
                        : ""}
                    </p>
                  </div>
                  <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Signed Climate Projects
                  </p>
                  <ul className="mt-2 space-y-1 text-slate-300">
                    {row.offer.projects.map((project) => (
                      <li key={project.id}>
                        • {project.name}
                        {project.estimated_co2
                          ? ` — ${formatVoteCount(Math.round(Number(project.estimated_co2)))} tCO₂e`
                          : ""}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-green-400">
                    Voted by fans
                  </p>
                  {votedFor.length === 0 ? (
                    <p className="mt-2 text-slate-500">
                      Waiting for fans to FUND-IT on this Match Day five. They
                      can FUND-IT up to 5 times — £0.20 once from each Carbon
                      Wallet onto any of these Projects.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-1 text-slate-300">
                      {votedFor.map((project) => (
                        <li key={project.id}>
                          • {project.name}
                          {project.estimated_co2
                            ? ` — ${formatVoteCount(Math.round(Number(project.estimated_co2)))} tCO₂e`
                            : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link
                    href={sponsorOfferSignOffPath(row.offer.id)}
                    className="mt-4 inline-flex text-sm font-semibold text-green-400"
                  >
                    Open signed copy
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-2xl font-black text-white">{value}</p>
    </div>
  );
}
