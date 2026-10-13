"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClimateSponsorshipWallet } from "@/app/components/sponsor/ClimateSponsorshipWallet";
import { SeeMatchDetails } from "@/app/components/sponsor/SeeMatchDetails";
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
  clubsMatch,
  displayLockFixture,
  localLockCopy,
  unlockedMatchDay,
  type MatchDayClubLock,
} from "@/app/lib/climate-sponsors";
import {
  ensureCarbonOffsetSponsorshipOffer,
  loadSponsorFolder,
  type SponsorMatchOffer,
} from "@/app/services/sponsor-offers.service";
import {
  LOCAL_SPONSOR_HOME_PATH,
  SPONSOR_LOGIN_PATH,
  SPONSOR_OFFERS_PATH,
  SPONSOR_RECEIVE_SECTION_ID,
  isNewSponsorshipRequest,
  sponsorOfferSignOffPath,
} from "@/app/lib/routes";
import {
  isLeadSponsorHome,
  isLocalClimateSponsor,
  rememberLocalSponsorSession,
  sponsorHomePath,
} from "@/app/lib/sponsor-home";
import {
  LOCAL_FIVE_RECORD_COPY,
  MATCH_DAY_PROJECTS_RECORD_LABEL,
} from "@/app/lib/match-day-carbon-offset";
import type { ClimateWallet } from "@/app/lib/sponsor-wallet";
import { formatWalletGbp } from "@/app/lib/sponsor-wallet";
import { SPONSORED_GOAL_EVENT } from "@/app/lib/sponsored-goal";

export default function SponsorWalletPage() {
  const router = useRouter();
  const [brand, setBrand] = useState("");
  const [clubName, setClubName] = useState("");
  const [lock, setLock] = useState<MatchDayClubLock | null>(null);
  const [lockFixture, setLockFixture] = useState("");
  const [chosenFixture, setChosenFixture] = useState<ClubFixture | null>(null);
  const [clubFixtures, setClubFixtures] = useState<ClubFixture[]>([]);
  const [fixturesLoading, setFixturesLoading] = useState(false);
  const [fixtureNotice, setFixtureNotice] = useState<string | null>(null);
  const [pending, setPending] = useState<SponsorMatchOffer[]>([]);
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
        const matchLock = loadMatchDayLock(brandName);
        const clubFromQuery =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("club")?.trim() ||
              ""
            : "";
        const club =
          matchLock?.clubName ||
          localForBrand?.clubName ||
          clubFromQuery ||
          "";
        setLock(matchLock);
        setClubName(club);
        setLockFixture(matchLock ? displayLockFixture(matchLock) : "");
        const localKind = isLocalClimateSponsor(brandName, { jobTitle });
        setKind(localKind ? "local" : "lead");
        if (localKind && !isNewSponsorshipRequest(window.location.search)) {
          router.replace(LOCAL_SPONSOR_HOME_PATH);
          return;
        }
        if (club) setWallet(readClimateWallet(club, brandName));
        if (localKind) {
          const folder = await loadSponsorFolder({
            brandName,
            brandEmail: (sponsor.email as string | null) ?? null,
          });
          setPending(folder.pending);
        }
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
      setLock(null);
      setClubName("");
      setLockFixture("");
      setChosenFixture(null);
      setFixtureNotice(null);
      setWallet(null);
      return;
    }
    setClubName(club);
    if (brand) setWallet(readClimateWallet(club, brand));
    if (!fixture) {
      setLockFixture("");
      setChosenFixture(null);
      if (lock && !clubsMatch(lock.clubName, club)) {
        clearMatchDayLock(brand);
        setLock(null);
      }
      return;
    }
    setLockFixture(fixture.fixtureName);
    setChosenFixture(fixture);
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
      ensureGoalNetwork({ brandName: brand, clubNames: [club] });
      setLock(next);
      setError(null);
      setFixtureNotice(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not lock this Match.";
      setError(message);
      setFixtureNotice(message);
    }
  }

  function unlockMatchDay() {
    applyLocalLock(unlockedMatchDay().clubName, null);
  }

  const selectedFixture =
    chosenFixture && chosenFixture.fixtureName === lockFixture
      ? chosenFixture
      : fixtureByIdOrName(clubFixtures, lockFixture);
  const matchLocked = Boolean(clubName && (selectedFixture || lockFixture));

  if (loading) {
    return <p className="text-slate-400">Loading Climate Sponsorship Wallet...</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          {kind === "local" ? "Local Business Climate Sponsor" : brand}
        </p>
        <h1 className="mt-2 text-4xl font-black">
          {kind === "local" ? "New Sponsorship" : "Climate Sponsorship Wallet"}
        </h1>
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
        <button
          type="button"
          onClick={() => router.push(LOCAL_SPONSOR_HOME_PATH)}
          className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold"
        >
          Back to your sponsored Match Days
        </button>
      ) : null}

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
              {matchLocked
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
            {fixtureNotice && (
              <p className="mt-4 text-sm font-semibold text-amber-300">
                {fixtureNotice}
              </p>
            )}
            {matchLocked ? (
              <>
                <p className="mt-4 text-2xl font-black">
                  {clubName} · {lockFixture}
                </p>
                <SeeMatchDetails
                  key={lockFixture}
                  defaultOpen
                  date={lock?.fixtureDate || selectedFixture?.date}
                  venue={lock?.venue || selectedFixture?.venue}
                  kickoff={lock?.kickoff || selectedFixture?.kickoff}
                />
              </>
            ) : clubName ? (
              <p className="mt-4 text-sm text-slate-400">
                {clubName} is selected. Choose the Match you wish to sponsor,
                then See Match details before topping up the cash fans will put
                into Climate Projects.
              </p>
            ) : (
              <p className="mt-4 text-sm text-slate-400">
                Select a club from Premier League or Scottish Premiership, then
                select the Match you wish to sponsor. You can then See Match
                details and top up the cash fans will put into Climate Projects.
              </p>
            )}
            <button
              type="button"
              onClick={unlockMatchDay}
              disabled={!clubName}
              className="mt-4 rounded-xl border border-slate-600 px-4 py-2 text-sm disabled:opacity-40"
            >
              Unlock
            </button>
          </div>
        </section>
      ) : null}

      <div id="top-up-cash" className="scroll-mt-6">
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
      </div>

      {kind === "local" ? (
        <section id={SPONSOR_RECEIVE_SECTION_ID} className="scroll-mt-6">
          <Link
            href={SPONSOR_OFFERS_PATH}
            className="block rounded-3xl border border-slate-700 bg-slate-900 p-8 hover:border-green-500"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
              Match Day record
            </p>
            <h2 className="mt-3 text-2xl font-black">
              {MATCH_DAY_PROJECTS_RECORD_LABEL}
            </h2>
            <p className="mt-3 max-w-3xl text-slate-300">
              {LOCAL_FIVE_RECORD_COPY}
            </p>
            <p className="mt-5 inline-flex rounded-xl bg-green-500 px-5 py-3 font-bold text-slate-950">
              {pending.some((offer) => offer.projects.length > 0)
                ? "Open your Match Day Climate Projects record"
                : "Waiting for the club to choose Climate Projects"}
            </p>
          </Link>
        </section>
      ) : null}

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
