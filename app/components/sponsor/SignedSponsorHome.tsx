"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/app/components/club/BrandMark";
import { FundedClimateProjectsList } from "@/app/components/sponsor/FundedClimateProjectsList";
import { SponsorCistTable } from "@/app/components/sponsor/SponsorCistTable";
import { SportingCalendarBoard } from "@/app/components/sponsor/SportingCalendarBoard";
import {
  SPONSOR_NEW_SPONSORSHIP_LABEL,
  sponsorWalletPath,
} from "@/app/lib/routes";
import {
  fundedClimateProjectsForHome,
  picksForSignedSponsorHome,
} from "@/app/lib/sponsor-signed-home";
import {
  describeGlobalPicks,
  globalPicksFromLock,
  type GlobalMatchPick,
} from "@/app/lib/global-match-day";
import type { MatchDayClubLock } from "@/app/lib/climate-sponsors";
import type { SignedSponsorship } from "@/app/lib/sponsor-dashboard";
import {
  loadMatchDayLock,
  lockGlobalMatchDayPicks,
  unlockGlobalMatchPick,
} from "@/app/services/climate-sponsors.service";
import { sponsorLogoSrc } from "@/app/services/teams.service";

export function SignedSponsorHome({
  brand,
  logoUrl,
  signed,
  votedByClub,
  committedGbp,
  lock,
  pendingOffers,
  onNewSponsorship,
}: {
  brand: string;
  logoUrl: string | null;
  signed: SignedSponsorship[];
  votedByClub: Record<string, Array<{ id: string; fundedGbp?: number | null }>>;
  committedGbp: number;
  lock?: MatchDayClubLock | null;
  pendingOffers?: Parameters<typeof fundedClimateProjectsForHome>[1];
  onNewSponsorship: () => void;
}) {
  const router = useRouter();
  const mark = sponsorLogoSrc(brand, logoUrl);
  const [notice, setNotice] = useState<string | null>(null);
  const [picks, setPicks] = useState<GlobalMatchPick[]>(() =>
    picksForSignedSponsorHome(brand, signed, lock)
  );
  const projects = fundedClimateProjectsForHome(
    signed,
    pendingOffers ?? [],
    votedByClub
  );

  useEffect(() => {
    setPicks(picksForSignedSponsorHome(brand, signed, lock));
  }, [brand, signed, lock]);

  function lockPicks(next: GlobalMatchPick[]) {
    try {
      const nextLock = lockGlobalMatchDayPicks({
        brandName: brand,
        picks: next,
      });
      setPicks(globalPicksFromLock(nextLock));
      setNotice(
        next.length === 0
          ? null
          : `Locked ${next.length} named ${
              next.length === 1 ? "Match" : "Matches"
            } for ${brand}: ${describeGlobalPicks(next)}.`
      );
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : "Could not lock those Matches."
      );
    }
  }

  function unlockPick(pick: GlobalMatchPick) {
    const nextLock: MatchDayClubLock | null = unlockGlobalMatchPick({
      brandName: brand,
      clubName: pick.clubName,
      fixtureName: pick.fixtureName,
    });
    setPicks(
      globalPicksFromLock(nextLock ?? loadMatchDayLock(brand))
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-4">
          <BrandMark name={brand} logoUrl={mark} large />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
              Signed in as {brand}
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Your 2026/27 Sporting Calendar
            </h1>
          </div>
        </div>
      </div>

      <SportingCalendarBoard
        brandName={brand}
        logoUrl={mark}
        initialPicks={picks}
        notice={notice}
        onLockPicks={lockPicks}
        onUnlockPick={unlockPick}
        onChosenMatch={(pick) => {
          try {
            lockGlobalMatchDayPicks({
              brandName: brand,
              picks: [pick],
            });
            router.push(sponsorWalletPath(pick.clubName));
          } catch (err) {
            setNotice(
              err instanceof Error
                ? err.message
                : "Could not lock that Match."
            );
          }
        }}
        showExampleButton={/budweiser/i.test(brand)}
        titleAs="h2"
      />
      <FundedClimateProjectsList projects={projects} />
      <SponsorCistTable brandName={brand} ownFundingGbp={committedGbp} />

      <div role="tablist" aria-label="Sponsorship actions" className="flex flex-wrap gap-3">
        <button
          type="button"
          role="tab"
          onClick={onNewSponsorship}
          className="rounded-lg bg-s4p-mark px-5 py-2 text-sm font-bold text-slate-950 hover:brightness-110"
        >
          {SPONSOR_NEW_SPONSORSHIP_LABEL}
        </button>
      </div>
    </div>
  );
}
