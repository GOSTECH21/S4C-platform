"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LocalSignedSponsorHome } from "@/app/components/sponsor/LocalSignedSponsorHome";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import {
  loadBrandLogo,
  loadMatchDayLock,
} from "@/app/services/climate-sponsors.service";
import { loadClubFixtures } from "@/app/services/club-fixtures.service";
import { loadSponsorFolder } from "@/app/services/sponsor-offers.service";
import { loadVotedPortfolioProjects } from "@/app/services/club-match-day.service";
import { allLocalSponsors, readLocalSponsorRecord } from "@/app/lib/local-sponsor";
import { lobiRowsForArea, inferredPostcodeArea, monthKeyFromDate } from "@/app/lib/lobi";
import {
  localCommittedGbp,
  localRecordsForBrand,
  localSponsoredMatches,
} from "@/app/lib/local-sponsor-home";
import {
  defaultCalendarMonth,
  fundedClimateProjectsForHome,
} from "@/app/lib/sponsor-signed-home";
import type { ClubFixture } from "@/app/lib/club-fixtures";
import {
  SPONSOR_LOGIN_PATH,
  isNewSponsorshipRequest,
  localNewSponsorshipPath,
} from "@/app/lib/routes";
import {
  isLocalClimateSponsor,
  rememberLocalSponsorSession,
} from "@/app/lib/sponsor-home";
import { sponsorLogoSrc } from "@/app/services/teams.service";

export default function LocalSponsorHomePage() {
  const router = useRouter();
  const [brand, setBrand] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [matches, setMatches] = useState(
    localSponsoredMatches({ records: [] })
  );
  const [projects, setProjects] = useState(
    fundedClimateProjectsForHome([], [])
  );
  const [lobiRows, setLobiRows] = useState(
    lobiRowsForArea({
      records: [],
      area: "",
      monthKey: "",
      brandName: "",
    })
  );
  const [area, setArea] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isNewSponsorshipRequest(window.location.search)) {
      router.replace(localNewSponsorshipPath());
      return;
    }
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
        setBrand(brandName);
        setLogoUrl(
          loadBrandLogo(brandName) ||
            (sponsor.logo_url as string | null) ||
            sponsorLogoSrc(brandName, (sponsor.logo_url as string | null) ?? null)
        );
        const records = localRecordsForBrand(brandName, [
          ...allLocalSponsors(),
          ...(readLocalSponsorRecord() ? [readLocalSponsorRecord()!] : []),
        ]);
        const lock = loadMatchDayLock(brandName);
        const clubs = [
          ...new Set(records.map((row) => row.clubName).filter(Boolean)),
        ];
        if (lock?.clubName) clubs.push(lock.clubName);
        const fixtureLists = await Promise.all(
          [...new Set(clubs)].map((club) =>
            loadClubFixtures(club).catch(() => [] as ClubFixture[])
          )
        );
        const fixtures = fixtureLists.flat();
        const listings = localSponsoredMatches({ records, lock, fixtures });
        setMatches(listings);
        const calendar = defaultCalendarMonth(listings);
        const month = `${calendar.year}-${String(calendar.month + 1).padStart(2, "0")}`;
        const ownArea =
          records.map(inferredPostcodeArea).find(Boolean) ||
          inferredPostcodeArea({
            postcode: readLocalSponsorRecord()?.postcode,
            clubName: lock?.clubName || records[0]?.clubName || "",
          });
        setArea(ownArea);
        setLobiRows(
          lobiRowsForArea({
            records: allLocalSponsors(),
            area: ownArea,
            monthKey: monthKeyFromDate(listings[listings.length - 1]?.date) || month,
            brandName,
            ownFundingGbp: localCommittedGbp(records),
            fixtures,
          })
        );
        const folder = await loadSponsorFolder({
          brandName,
          brandEmail: (sponsor.email as string | null) ?? null,
        });
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
        setProjects(
          fundedClimateProjectsForHome(
            folder.signed,
            folder.pending,
            Object.fromEntries(votedEntries)
          )
        );
      } catch {
        router.replace(SPONSOR_LOGIN_PATH);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [router]);

  if (loading) {
    return <p className="text-slate-400">Loading your Local Business home...</p>;
  }

  return (
    <LocalSignedSponsorHome
      brand={brand}
      logoUrl={logoUrl}
      matches={matches}
      projects={projects}
      lobiRows={lobiRows}
      postcodeArea={area}
      onNewSponsorship={() => router.push(localNewSponsorshipPath())}
    />
  );
}
