"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SportingCalendarBoard } from "@/app/components/sponsor/SportingCalendarBoard";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import {
  loadBrandLogo,
  loadMatchDayLock,
  lockGlobalMatchDayPicks,
  unlockGlobalMatchPick,
} from "@/app/services/climate-sponsors.service";
import { globalPicksFromLock, type GlobalMatchPick } from "@/app/lib/global-match-day";
import {
  LOCAL_SPONSOR_HOME_PATH,
  SPONSOR_LOGIN_PATH,
} from "@/app/lib/routes";
import { sponsorLogoSrc } from "@/app/services/teams.service";
import {
  isLeadSponsorHome,
  rememberLocalSponsorSession,
} from "@/app/lib/sponsor-home";
import type { MatchDayClubLock } from "@/app/lib/climate-sponsors";

export default function SponsorCalendarPage() {
  const router = useRouter();
  const [brand, setBrand] = useState("your brand");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [picks, setPicks] = useState<GlobalMatchPick[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const sponsor = await getCurrentSponsor();
        const name = String(sponsor.name ?? "your brand");
        rememberLocalSponsorSession(sponsor);
        if (!isLeadSponsorHome(name, { jobTitle: String(sponsor.industry ?? "") })) {
          router.replace(LOCAL_SPONSOR_HOME_PATH);
          return;
        }
        if (cancelled) return;
        setBrand(name);
        setLogoUrl(
          sponsorLogoSrc(name, loadBrandLogo(name) || (sponsor.logo_url as string | null))
        );
        const lock = loadMatchDayLock(name);
        setPicks(globalPicksFromLock(lock));
      } catch {
        router.replace(SPONSOR_LOGIN_PATH);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  function lockPicks(next: GlobalMatchPick[]) {
    try {
      const lock = lockGlobalMatchDayPicks({
        brandName: brand,
        picks: next,
      });
      setPicks(globalPicksFromLock(lock));
      setNotice(
        next.length === 0
          ? null
          : `Locked ${next.length} named ${next.length === 1 ? "Match" : "Matches"} for ${brand}.`
      );
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Could not lock those Matches.");
    }
  }

  function unlockPick(pick: GlobalMatchPick) {
    const lock: MatchDayClubLock | null = unlockGlobalMatchPick({
      brandName: brand,
      clubName: pick.clubName,
      fixtureName: pick.fixtureName,
    });
    setPicks(globalPicksFromLock(lock));
  }

  if (loading) {
    return <p className="text-slate-400">Loading 2026/27 Sporting Calendar...</p>;
  }

  return (
    <SportingCalendarBoard
      brandName={brand}
      logoUrl={logoUrl}
      initialPicks={picks}
      notice={notice}
      onLockPicks={lockPicks}
      onUnlockPick={unlockPick}
      showExampleButton={/budweiser/i.test(brand)}
    />
  );
}
