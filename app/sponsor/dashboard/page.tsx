"use client";

import { useEffect, useState } from "react";
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
  loadBrandLogo,
  loadMatchDayLock,
  readLogoFile,
  saveBrandLogo,
} from "@/app/services/climate-sponsors.service";
import { BrandMark } from "@/app/components/club/BrandMark";
import {
  brandsMatch,
  type MatchDayClubLock,
} from "@/app/lib/climate-sponsors";
import { MatchDayLockIn } from "@/app/components/sponsor/MatchDayLockIn";
import {
  LOCAL_SPONSOR_HOME_PATH,
  SPONSOR_DASHBOARD_PATH,
  SPONSOR_LOGIN_PATH,
  SPONSOR_RECEIVE_SECTION_ID,
  SPONSOR_SIGNED_SECTION_ID,
  isNewSponsorshipRequest,
  sponsorNewSponsorshipPath,
  sponsorOfferSignOffPath,
  sponsorWalletPath,
} from "@/app/lib/routes";
import { SignedSponsorHome } from "@/app/components/sponsor/SignedSponsorHome";
import {
  committedGbpForSignedHome,
  hasCompletedMatchSponsorship,
  showsSignedSponsorHome,
} from "@/app/lib/sponsor-signed-home";
import { findClimateWallet } from "@/app/services/sponsor-wallet.service";
import { formatLongMatchDate } from "@/app/lib/s4p-climate-projects";
import {
  formatMatchFundingLine,
  formatMoney,
  formatStipulatedRate,
  formatVoteCount,
} from "@/app/lib/sponsorship-auction";
import { votedProjectsOnSignedOffer, fanVotesOnSignedOffers } from "@/app/lib/sponsor-dashboard";
import { loadVotedPortfolioProjects } from "@/app/services/club-match-day.service";
import {
  isLeadSponsorHome,
  rememberLocalSponsorSession,
} from "@/app/lib/sponsor-home";
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
  const [email, setEmail] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSponsorship, setNewSponsorship] = useState(false);
  const [completedMatch, setCompletedMatch] = useState(false);
  const [committedGbp, setCommittedGbp] = useState(0);

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
        const jobTitle = String(sponsor.industry ?? "");
        rememberLocalSponsorSession(sponsor);
        setBrand(sponsorName);
        setEmail(sponsorEmail);
        if (!isLeadSponsorHome(sponsorName, { jobTitle })) {
          router.replace(LOCAL_SPONSOR_HOME_PATH);
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
        const folder = await loadSponsorFolder({
          sponsorId,
          brandName: sponsorName,
          brandEmail: sponsorEmail,
        });
        const wallet = currentLock?.clubName
          ? findClimateWallet(currentLock.clubName, sponsorName)
          : null;
        setPending(folder.pending);
        setSigned(folder.signed);
        setCompletedMatch(
          folder.signed.length > 0 ||
            hasCompletedMatchSponsorship(currentLock, wallet) ||
            folder.signatures.some((row) =>
              brandsMatch(row.brandName, sponsorName)
            )
        );
        setCommittedGbp(
          committedGbpForSignedHome({
            signedExpenditureGbp: folder.stats.expenditureGbp,
            lock: currentLock,
            wallet,
          })
        );
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
    const folder = await loadSponsorFolder({
      brandName: brand,
      brandEmail: email,
    });
    const currentLock = loadMatchDayLock(brand);
    const wallet = currentLock?.clubName
      ? findClimateWallet(currentLock.clubName, brand)
      : null;
    setLock(currentLock);
    setPending(folder.pending);
    setSigned(folder.signed);
    setCompletedMatch(
      folder.signed.length > 0 ||
        hasCompletedMatchSponsorship(currentLock, wallet) ||
        folder.signatures.some((row) => brandsMatch(row.brandName, brand))
    );
    setCommittedGbp(
      committedGbpForSignedHome({
        signedExpenditureGbp: folder.stats.expenditureGbp,
        lock: currentLock,
        wallet,
      })
    );
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

  if (loading) {
    return <p className="text-slate-400">Loading sponsor dashboard...</p>;
  }

  if (showsSignedSponsorHome(signed.length, newSponsorship, completedMatch)) {
    return (
      <SignedSponsorHome
        brand={brand}
        logoUrl={logoUrl}
        signed={signed}
        votedByClub={votedByClub}
        committedGbp={committedGbp || stats.expenditureGbp}
        lock={lock}
        pendingOffers={pending}
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

      <div id="match-day-lock-in" className="scroll-mt-6">
        <MatchDayLockIn
          brandName={brand}
          lock={lock}
          onClubChange={setLockClub}
          onLockChange={(next) => {
            setLock(next);
            if (next?.clubName) setLockClub(next.clubName);
            void refreshFolder();
          }}
          onMatchLocked={(club) => {
            router.push(sponsorWalletPath(club));
          }}
          projectsSectionId={SPONSOR_RECEIVE_SECTION_ID}
        />
      </div>

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
          Once you have seen this Club&apos;s chosen Climate Projects and sign
          off the Match Day carbon footprint offset, it is lodged here. If the
          Club has not uploaded those Projects yet, sign-off stays pending
          approval until they do.
        </p>
        {signed.length === 0 ? (
          <p className="mt-6 text-slate-500">
            No signed sponsorships yet. Lock a Club and Match, deposit into the
            Climate Sponsorship Wallet, and sign off the Match Day carbon
            footprint offset.
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
