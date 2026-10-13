"use client";

import { useEffect, useState } from "react";
import { ClimateSponsorshipWallet } from "@/app/components/sponsor/ClimateSponsorshipWallet";
import { SeeMatchDetails } from "@/app/components/sponsor/SeeMatchDetails";
import {
  ClubLeagueMenu,
  MatchFixtureMenu,
} from "@/app/components/sponsor/ClubMatchMenus";
import { fixtureByIdOrName, type ClubFixture } from "@/app/lib/club-fixtures";
import { loadClubFixtures } from "@/app/services/club-fixtures.service";
import { localLockCopy } from "@/app/lib/climate-sponsors";
import {
  LOCAL_FIVE_RECORD_COPY,
  MATCH_DAY_PROJECTS_RECORD_LABEL,
} from "@/app/lib/match-day-carbon-offset";
import {
  createLocalWallet,
  remainingGbp,
  type ClimateWallet,
} from "@/app/lib/sponsor-wallet";

export default function LocalWalletPreviewPage() {
  const [clubName, setClubName] = useState("Hibernian");
  const [lockFixture, setLockFixture] = useState("Hibernian v Motherwell");
  const [clubFixtures, setClubFixtures] = useState<ClubFixture[]>([]);
  const [fixturesLoading, setFixturesLoading] = useState(false);
  const [wallet, setWallet] = useState<ClimateWallet | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!clubName) {
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
  }, [clubName]);

  const selectedFixture = fixtureByIdOrName(clubFixtures, lockFixture);
  const matchLocked = Boolean(clubName && lockFixture);

  return (
    <main className="min-h-screen p-8 text-white">
      <div className="mx-auto max-w-4xl space-y-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          Local Business Climate Sponsor
        </p>
        <h1 className="text-4xl font-black">New Sponsorship</h1>
        <p className="mt-1 text-sm font-semibold text-slate-400">Top Cellar</p>
        <button
          type="button"
          className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold"
        >
          Back to your sponsored Match Days
        </button>

        <section
          id="match-day-lock-in"
          className="overflow-visible rounded-3xl border border-green-500/30 bg-slate-900 p-8"
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
                onChange={(club) => {
                  setClubName(club);
                  setLockFixture("");
                  setWallet(null);
                }}
              />
              <MatchFixtureMenu
                clubName={clubName}
                value={lockFixture}
                fixtures={clubFixtures}
                loading={fixturesLoading}
                onChange={(fixture) => setLockFixture(fixture.fixtureName)}
              />
            </div>
            {matchLocked ? (
              <>
                <p className="mt-4 text-2xl font-black">
                  {clubName} · {lockFixture}
                </p>
                <SeeMatchDetails
                  key={lockFixture}
                  defaultOpen
                  date={selectedFixture?.date || "2026-10-18"}
                  venue={selectedFixture?.venue || "Easter Road"}
                  kickoff={selectedFixture?.kickoff || "15:00"}
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
              onClick={() => {
                setClubName("");
                setLockFixture("");
                setWallet(null);
              }}
              disabled={!clubName}
              className="mt-4 rounded-xl border border-slate-600 px-4 py-2 text-sm disabled:opacity-40"
            >
              Unlock
            </button>
          </div>
        </section>

        <ClimateSponsorshipWallet
          kind="local"
          wallet={wallet}
          clubName={clubName}
          notice={notice}
          onLeadDeposit={() => undefined}
          onLocalDeposit={({ sponsorshipGbp }) => {
            const next = createLocalWallet({
              clubName: clubName || "Hibernian",
              brandName: "Top Cellar",
              sponsorshipGbp,
            });
            setWallet(next);
            setNotice(
              `${next.sponsorshipGbp} in Carbon Wallet; ${remainingGbp(next)} remaining.`
            );
          }}
        />

        <section className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
            Match Day record
          </p>
          <h2 className="mt-3 text-2xl font-black">
            {MATCH_DAY_PROJECTS_RECORD_LABEL}
          </h2>
          <p className="mt-3 max-w-3xl text-slate-300">{LOCAL_FIVE_RECORD_COPY}</p>
          <p className="mt-5 inline-flex rounded-xl bg-green-500 px-5 py-3 font-bold text-slate-950">
            Waiting for the club to choose Climate Projects
          </p>
        </section>
      </div>
    </main>
  );
}
