"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClimateSponsorshipWallet } from "@/app/components/sponsor/ClimateSponsorshipWallet";
import { getCurrentSponsor } from "@/app/services/current-sponsor.service";
import {
  depositLeadClimateWallet,
  depositLocalClimateWallet,
  readClimateWallet,
} from "@/app/services/sponsor-wallet.service";
import {
  localRecordFromProfile,
  readLocalSponsorRecord,
} from "@/app/lib/local-sponsor";
import {
  bindFundedSponsorToClub,
  clearMatchDayLock,
  ensureGoalNetwork,
  ensureMatchDayClubLock,
  loadMatchDayLock,
  lockMatchDayClub,
  lockWalletFundingToClub,
} from "@/app/services/climate-sponsors.service";
import {
  ClubLeagueMenu,
  MatchFixtureMenu,
} from "@/app/components/sponsor/ClubMatchMenus";
import { fixtureByIdOrName, type ClubFixture } from "@/app/lib/club-fixtures";
import { loadClubFixtures } from "@/app/services/club-fixtures.service";
import {
  displayLockFixture,
  localLockCopy,
} from "@/app/lib/climate-sponsors";
import { ensureCarbonOffsetSponsorshipOffer } from "@/app/services/sponsor-offers.service";
import {
  LOCAL_SPONSOR_HOME_PATH,
  SPONSOR_LOGIN_PATH,
  SPONSOR_OFFERS_PATH,
  isNewSponsorshipRequest,
  sponsorOfferSignOffPath,
} from "@/app/lib/routes";
import {
  isLeadSponsorHome,
  isLocalClimateSponsor,
  rememberLocalSponsorSession,
  sponsorHomePath,
} from "@/app/lib/sponsor-home";
import type { ClimateWallet } from "@/app/lib/sponsor-wallet";
import { formatWalletGbp } from "@/app/lib/sponsor-wallet";
import { SPONSORED_GOAL_EVENT } from "@/app/lib/sponsored-goal";

export default function SponsorWalletPage() {
  const router = useRouter();
  const [brand, setBrand] = useState("");
  const [clubName, setClubName] = useState("");
  const [lockFixture, setLockFixture] = useState("");
  const [clubFixtures, setClubFixtures] = useState<ClubFixture[]>([]);
  const [fixturesLoading, setFixturesLoading] = useState(false);
  const [kind, setKind] = useState<"lead" | "local">("lead");
  const [wallet, setWallet] = useState<ClimateWallet | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const sponsor = await getCurrentSponsor();
        const brandName = String(sponsor.name ?? "");
        if (!brandName) {
          router.replace(SPONSOR_LOGIN_PATH);
          return;
        }
        setBrand(brandName);
        rememberLocalSponsorSession(sponsor);
        const jobTitle = String(sponsor.industry ?? "");
        const local = readLocalSponsorRecord() ?? localRecordFromProfile();
        const localForBrand =
          local &&
          local.brandName.trim().toLowerCase() === brandName.trim().toLowerCase()
            ? local
            : null;
        const lock = loadMatchDayLock(brandName);
        const clubFromQuery =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("club")?.trim() ||
              ""
            : "";
        const club =
          lock?.clubName ||
          localForBrand?.clubName ||
          clubFromQuery ||
          "";
        setClubName(club);
        setLockFixture(lock ? displayLockFixture(lock) : "");
        const localKind = isLocalClimateSponsor(brandName, { jobTitle });
        setKind(localKind ? "local" : "lead");
        if (localKind && !isNewSponsorshipRequest(window.location.search)) {
          router.replace(LOCAL_SPONSOR_HOME_PATH);
          return;
        }
        if (club) setWallet(readClimateWallet(club, brandName));
      } catch {
        router.replace(SPONSOR_LOGIN_PATH);
        return;
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [router]);

  useEffect(() => {
    if (!clubName || !brand) return;
    function refreshWallet() {
      setWallet(readClimateWallet(clubName, brand));
    }
    window.addEventListener(SPONSORED_GOAL_EVENT, refreshWallet);
    window.addEventListener("storage", refreshWallet);
    return () => {
      window.removeEventListener(SPONSORED_GOAL_EVENT, refreshWallet);
      window.removeEventListener("storage", refreshWallet);
    };
  }, [clubName, brand]);

  useEffect(() => {
    if (kind !== "local" || !clubName) {
      setClubFixtures([]);
      return;
    }
    let cancelled = false;
    setFixturesLoading(true);
    void loadClubFixtures(clubName)
      .then((rows) => {
        if (!cancelled) setClubFixtures(rows);
      })
      .catch(() => {
        if (!cancelled) setClubFixtures([]);
      })
      .finally(() => {
        if (!cancelled) setFixturesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [kind, clubName]);

  function applyLocalLock(nextClub: string, fixture: ClubFixture | null) {
    const club = nextClub.trim();
    if (!club) {
      if (brand) clearMatchDayLock(brand);
      setClubName("");
      setLockFixture("");
      setWallet(null);
      return;
    }
    setClubName(club);
    if (brand) setWallet(readClimateWallet(club, brand));
    if (!fixture) {
      setLockFixture("");
      return;
    }
    setLockFixture(fixture.fixtureName);
    try {
      lockMatchDayClub({
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
      ensureGoalNetwork({ brandName: brand, clubNames: [club] });
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not lock this Match."
      );
    }
  }

  if (loading) {
    return <p className="text-slate-400">Loading Climate Sponsorship Wallet...</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          {kind === "local" ? "Local Business Climate Sponsor" : brand}
        </p>
        <h1 className="mt-2 text-4xl font-black">Climate Sponsorship Wallet</h1>
        {kind === "local" ? (
          <p className="mt-1 text-sm font-semibold text-slate-400">{brand}</p>
        ) : (
          <p className="mt-3 max-w-3xl text-slate-300">
            Fans of {clubName || "your club"} take cash from this wallet and put
            that cash into a numbered Climate Project.
          </p>
        )}
      </div>

      {kind === "local" ? (
        <section
          id="match-day-lock-in"
          className="scroll-mt-6 overflow-visible rounded-3xl border border-green-500/30 bg-slate-900 p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
            Match Day lock-in
          </p>
          <h2 className="mt-2 text-3xl font-black">Select a Club</h2>
          <p className="mt-3 max-w-3xl text-slate-300">{localLockCopy()}</p>
          <div className="mt-6 overflow-visible rounded-2xl border border-green-500/40 bg-green-500/10 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-green-300">
              {clubName && (lockFixture || fixtureByIdOrName(clubFixtures, lockFixture))
                ? "Locked in"
                : clubName
                  ? "Select the Match"
                  : "Select a Club"}
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <ClubLeagueMenu
                value={clubName}
                onChange={(club) => applyLocalLock(club, null)}
              />
              <MatchFixtureMenu
                clubName={clubName}
                value={lockFixture}
                fixtures={clubFixtures}
                loading={fixturesLoading}
                onChange={(fixture) => applyLocalLock(clubName, fixture)}
              />
            </div>
            {clubName && lockFixture ? (
              <p className="mt-4 text-2xl font-black">
                {clubName} · {lockFixture}
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      <ClimateSponsorshipWallet
        kind={kind}
        wallet={wallet}
        clubName={clubName}
        busy={busy}
        error={error}
        notice={notice}
        onLocalDeposit={(input) => {
          if (!clubName || !brand) {
            setError("Choose the club this Local Business Climate Sponsor supports.");
            return;
          }
          if (!lockFixture) {
            setError("Select the specific Match you wish to sponsor first.");
            return;
          }
          if (!(Number(input.sponsorshipGbp) > 0)) {
            setError("Enter how much you are putting into this Carbon Wallet.");
            return;
          }
          setBusy(true);
          setError(null);
          try {
            const next = depositLocalClimateWallet({
              clubName,
              brandName: brand,
              sponsorshipGbp: input.sponsorshipGbp,
            });
            bindFundedSponsorToClub({
              clubName,
              brandName: brand,
              spentGbp: next.sponsorshipGbp,
            });
            setWallet(next);
            setNotice(
              `${formatWalletGbp(next.sponsorshipGbp)} is in the Carbon Wallet for ${clubName} (${formatWalletGbp(next.paidGbp)} paid including the 10% management fee).`
            );
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "Could not update the wallet."
            );
          } finally {
            setBusy(false);
          }
        }}
        onLeadDeposit={(input) => {
          if (!clubName || !brand) {
            setError("Lock a club for this Match Day first.");
            return;
          }
          setBusy(true);
          setError(null);
          void (async () => {
            try {
              const existing = loadMatchDayLock(brand);
              ensureMatchDayClubLock({
                brandName: brand,
                clubName,
                matchLabel: existing?.matchLabel,
                fixtureName: existing?.fixtureName,
                competition: existing?.competition,
                fixtureDate: existing?.fixtureDate,
                kickoff: existing?.kickoff,
                venue: existing?.venue,
                sourceUrl: existing?.sourceUrl,
              });
              const next = depositLeadClimateWallet({
                clubName,
                brandName: brand,
                ...input,
              });
              lockWalletFundingToClub({
                brandName: brand,
                clubName,
                commitmentFeeGbp: next.commitmentFeeGbp,
                gbpPerGoal: next.gbpPerGoal,
                maximumSponsorshipGbp: next.maximumSponsorshipGbp,
              });
              ensureGoalNetwork({
                brandName: brand,
                clubNames: [clubName],
              });
              bindFundedSponsorToClub({
                clubName,
                brandName: brand,
                spentGbp: next.commitmentFeeGbp,
              });
              setWallet(next);
              setNotice(
                `Commitment Fee ${formatWalletGbp(next.commitmentFeeGbp)} is locked in for ${clubName}.`
              );
              if (isLeadSponsorHome(brand)) {
                const offset = await ensureCarbonOffsetSponsorshipOffer({
                  brandName: brand,
                });
                router.push(
                  offset
                    ? sponsorOfferSignOffPath(offset.id)
                    : SPONSOR_OFFERS_PATH
                );
                return;
              }
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "Could not update the wallet."
              );
            } finally {
              setBusy(false);
            }
          })();
        }}
      />

      {isLeadSponsorHome(brand) ? (
        <button
          type="button"
          onClick={() => router.push(sponsorHomePath(brand))}
          className="rounded-xl border border-slate-600 px-5 py-3 font-semibold"
        >
          Back to dashboard
        </button>
      ) : null}
    </div>
  );
}
