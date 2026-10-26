"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import {
  loadClubChosenClimateProjects,
  loadSponsorFolder,
  type SignedSponsorship,
  type SponsorMatchOffer,
} from "@/app/services/sponsor-offers.service";
import {
  loadBrandLogo,
  loadMatchDayLock,
} from "@/app/services/climate-sponsors.service";
import type { MatchDayClubLock } from "@/app/lib/climate-sponsors";
import { LeadSponsorHome } from "@/app/components/sponsor/LeadSponsorHome";
import {
  LEAD_APPROVED_SECTION_ID,
  LEAD_AWAITING_SECTION_ID,
  LEAD_CIST_SECTION_ID,
  LEAD_PAID_SECTION_ID,
  clubsNeedingChosenProjects,
  type ChosenProjectInput,
} from "@/app/lib/lead-sponsor-home";
import { committedGbpForSignedHome } from "@/app/lib/sponsor-signed-home";
import {
  LOCAL_SPONSOR_HOME_PATH,
  SPONSOR_CALENDAR_PATH,
  SPONSOR_LOGIN_PATH,
  SPONSOR_RECEIVE_SECTION_ID,
  SPONSOR_SIGNED_SECTION_ID,
  isNewSponsorshipRequest,
} from "@/app/lib/routes";
import {
  isLeadSponsorHome,
  rememberLocalSponsorSession,
} from "@/app/lib/sponsor-home";
import { findClimateWallet } from "@/app/services/sponsor-wallet.service";
import { loadVotedPortfolioProjects } from "@/app/services/club-match-day.service";
import { sponsorLogoSrc } from "@/app/services/teams.service";
import type { ClimateProject } from "@/app/services/votes.service";

const SECTION_HASH_ALIASES: Record<string, string> = {
  [SPONSOR_RECEIVE_SECTION_ID]: LEAD_AWAITING_SECTION_ID,
  [SPONSOR_SIGNED_SECTION_ID]: LEAD_APPROVED_SECTION_ID,
  [LEAD_AWAITING_SECTION_ID]: LEAD_AWAITING_SECTION_ID,
  [LEAD_APPROVED_SECTION_ID]: LEAD_APPROVED_SECTION_ID,
  [LEAD_PAID_SECTION_ID]: LEAD_PAID_SECTION_ID,
  [LEAD_CIST_SECTION_ID]: LEAD_CIST_SECTION_ID,
};

export default function SponsorDashboardPage() {
  const router = useRouter();
  const [brand, setBrand] = useState("your brand");
  const [pending, setPending] = useState<SponsorMatchOffer[]>([]);
  const [signed, setSigned] = useState<SignedSponsorship[]>([]);
  const [chosenByClub, setChosenByClub] = useState<
    Record<string, ChosenProjectInput[]>
  >({});
  const [votedByClub, setVotedByClub] = useState<Record<string, ClimateProject[]>>(
    {}
  );
  const [lock, setLock] = useState<MatchDayClubLock | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [committedGbp, setCommittedGbp] = useState(0);

  useEffect(() => {
    if (isNewSponsorshipRequest(window.location.search)) {
      router.replace(SPONSOR_CALENDAR_PATH);
    }
  }, [router]);

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
        setVotedByClub(Object.fromEntries(votedEntries));
        const clubNames = clubsNeedingChosenProjects({
          pending: folder.pending,
          signed: folder.signed,
          lock: currentLock,
        });
        const chosenEntries = await Promise.all(
          clubNames.map(async (clubName) => {
            try {
              const chosen = await loadClubChosenClimateProjects(clubName);
              return [clubName, chosen?.projects ?? []] as const;
            } catch {
              return [clubName, []] as const;
            }
          })
        );
        setChosenByClub(Object.fromEntries(chosenEntries));
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
    const target = SECTION_HASH_ALIASES[hash];
    if (!target) return;
    const scroll = () =>
      document.getElementById(target)?.scrollIntoView({
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

  if (loading) {
    return <p className="text-slate-400">Loading sponsor dashboard...</p>;
  }

  return (
    <div className="space-y-10">
      {error ? (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      ) : null}
      <LeadSponsorHome
        brand={brand}
        logoUrl={logoUrl}
        pending={pending}
        signed={signed}
        chosenByClub={chosenByClub}
        votedByClub={votedByClub}
        committedGbp={committedGbp}
        lock={lock}
        onLogoChange={setLogoUrl}
      />
    </div>
  );
}
