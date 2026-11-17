"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LocalSponsorMyS4p } from "@/app/components/sponsor/LocalSponsorMyS4p";
import { BrandMark } from "@/app/components/club/BrandMark";
import {
  listLocalWalletTakes,
  WALLET_TAKE_EVENT,
} from "@/app/lib/climate-wallet-takes";
import { allLocalSponsors, readLocalSponsorRecord } from "@/app/lib/local-sponsor";
import {
  localRecordsForBrand,
} from "@/app/lib/local-sponsor-home";
import {
  LOCAL_MY_S4P_HEADING,
  localSponsorMyS4pSnapshot,
} from "@/app/lib/local-sponsor-mys4p";
import { SPONSOR_LOGIN_PATH } from "@/app/lib/routes";
import {
  isLocalClimateSponsor,
  rememberLocalSponsorSession,
} from "@/app/lib/sponsor-home";
import { SIGNED_SPONSORSHIP_EVENT } from "@/app/lib/sponsor-completion-flow";
import { loadBrandLogo } from "@/app/services/climate-sponsors.service";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import { hydrateLocalSponsorRecords } from "@/app/services/local-sponsor.service";
import { listClimateWallets } from "@/app/services/sponsor-wallet.service";
import { sponsorLogoSrc } from "@/app/services/teams.service";

export default function LocalSponsorMyS4pPage() {
  const router = useRouter();
  const [brand, setBrand] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState(() =>
    localSponsorMyS4pSnapshot({ brandName: "", records: [] })
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const sponsor = await getCurrentSponsor();
        const brandName = String(sponsor.name ?? "");
        const jobTitle = String(sponsor.industry ?? "");
        rememberLocalSponsorSession(sponsor);
        if (!brandName || !isLocalClimateSponsor(brandName, { jobTitle })) {
          router.replace(SPONSOR_LOGIN_PATH);
          return;
        }
        const hydrated = await hydrateLocalSponsorRecords({
          brandName,
          email: (sponsor.email as string | null) ?? "",
          sponsor,
        });
        if (!mounted) return;
        const records = localRecordsForBrand(brandName, [
          ...hydrated,
          ...allLocalSponsors(),
          ...(readLocalSponsorRecord() ? [readLocalSponsorRecord()!] : []),
        ]);
        setBrand(brandName);
        setLogoUrl(
          loadBrandLogo(brandName) ||
            (sponsor.logo_url as string | null) ||
            sponsorLogoSrc(
              brandName,
              (sponsor.logo_url as string | null) ?? null
            )
        );
        setSnapshot(
          localSponsorMyS4pSnapshot({
            brandName,
            records,
            wallets: listClimateWallets(),
            takes: listLocalWalletTakes(),
          })
        );
      } catch {
        router.replace(SPONSOR_LOGIN_PATH);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    window.addEventListener("storage", load);
    window.addEventListener(SIGNED_SPONSORSHIP_EVENT, load);
    window.addEventListener(WALLET_TAKE_EVENT, load);
    return () => {
      mounted = false;
      window.removeEventListener("storage", load);
      window.removeEventListener(SIGNED_SPONSORSHIP_EVENT, load);
      window.removeEventListener(WALLET_TAKE_EVENT, load);
    };
  }, [router]);

  if (loading) {
    return <p className="text-slate-400">Loading {LOCAL_MY_S4P_HEADING}...</p>;
  }

  if (!brand) {
    return (
      <div className="flex items-center gap-4 text-slate-300">
        <BrandMark name="Local Business Climate Sponsor" logoUrl={null} />
        <p>Sign in as a Local Business Climate Sponsor to open My S4P.</p>
      </div>
    );
  }

  return (
    <LocalSponsorMyS4p brand={brand} logoUrl={logoUrl} snapshot={snapshot} />
  );
}
