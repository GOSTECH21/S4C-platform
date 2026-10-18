"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/app/components/club/BrandMark";
import { MatchDayLockIn } from "@/app/components/sponsor/MatchDayLockIn";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import {
  loadBrandLogo,
  loadMatchDayLock,
} from "@/app/services/climate-sponsors.service";
import type { MatchDayClubLock } from "@/app/lib/climate-sponsors";
import {
  LOCAL_SPONSOR_HOME_PATH,
  SPONSOR_LOGIN_PATH,
  sponsorWalletPath,
} from "@/app/lib/routes";
import { sponsorLogoSrc } from "@/app/services/teams.service";
import {
  isLeadSponsorHome,
  rememberLocalSponsorSession,
} from "@/app/lib/sponsor-home";

export default function SponsorCalendarPage() {
  const router = useRouter();
  const [brand, setBrand] = useState("your brand");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [lock, setLock] = useState<MatchDayClubLock | null>(null);
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
        const current = loadMatchDayLock(name);
        setLock(current);
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

  if (loading) {
    return <p className="text-slate-400">Loading Match Day Lock-In...</p>;
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <BrandMark name={brand} logoUrl={logoUrl} large />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
            Signed in as {brand}
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Match Day Lock-In
          </h1>
        </div>
      </div>

      <div id="match-day-lock-in" className="scroll-mt-6">
        <MatchDayLockIn
          brandName={brand}
          lock={lock}
          onLockChange={setLock}
          onMatchLocked={(club) => {
            router.push(sponsorWalletPath(club));
          }}
        />
      </div>
    </div>
  );
}
