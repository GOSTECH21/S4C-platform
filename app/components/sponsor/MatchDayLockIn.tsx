"use client";

import { useEffect, useMemo, useState } from "react";
import {
  clubsMatch,
  displayLockFixture,
  lockCopy,
  secondLeadClimateSponsorRejectedMessage,
  type MatchDayClubLock,
} from "@/app/lib/climate-sponsors";
import { fixtureByIdOrName, type ClubFixture } from "@/app/lib/club-fixtures";
import {
  clubFixtureFromCalendarMatch,
  nextClubMatches,
  resolveSportingCalendarClub,
} from "@/app/lib/sporting-calendar";
import { SeeMatchDetails } from "@/app/components/sponsor/SeeMatchDetails";
import { ClubTypeInMenu } from "@/app/components/sponsor/ClubMatchMenus";
import { ClubMatchCalendar } from "@/app/components/sponsor/ClubMatchCalendar";
import {
  clearMatchDayLock,
  ensureGoalNetwork,
  lockMatchDayClub,
} from "@/app/services/climate-sponsors.service";

export function MatchDayLockIn({
  brandName,
  lock,
  onLockChange,
  onClubChange,
  onMatchLocked,
}: {
  brandName: string;
  lock: MatchDayClubLock | null;
  onLockChange?: (lock: MatchDayClubLock | null) => void;
  onClubChange?: (club: string) => void;
  onMatchLocked?: (clubName: string) => void;
}) {
  const [lockClub, setLockClub] = useState(lock?.clubName ?? "");
  const [lockFixture, setLockFixture] = useState(
    lock ? displayLockFixture(lock) : ""
  );
  const [chosenFixture, setChosenFixture] = useState<ClubFixture | null>(null);
  const [fixtureNotice, setFixtureNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!lock?.clubName) return;
    setLockClub(lock.clubName);
    setLockFixture(displayLockFixture(lock));
  }, [lock]);

  const clubMatches = useMemo(
    () => (lockClub ? nextClubMatches(lockClub) : []),
    [lockClub]
  );
  const clubFixtures = useMemo(
    () => clubMatches.map(clubFixtureFromCalendarMatch),
    [clubMatches]
  );
  const selectedFixture =
    chosenFixture && chosenFixture.fixtureName === lockFixture
      ? chosenFixture
      : fixtureByIdOrName(clubFixtures, lockFixture);
  const matchLocked = Boolean(lockClub && (selectedFixture || lockFixture));

  function setClub(club: string) {
    setLockClub(club);
    onClubChange?.(club);
  }

  function applyMatchDayLock(clubName: string, fixture: ClubFixture | null) {
    const resolved =
      resolveSportingCalendarClub(clubName) || clubName.trim();
    if (!resolved) {
      clearMatchDayLock(brandName);
      setClub("");
      setLockFixture("");
      setChosenFixture(null);
      setFixtureNotice(null);
      onLockChange?.(null);
      return;
    }
    if (!fixture) {
      setClub(resolved);
      setLockFixture("");
      setChosenFixture(null);
      setFixtureNotice(null);
      if (lock && !clubsMatch(lock.clubName, resolved)) {
        clearMatchDayLock(brandName);
        onLockChange?.(null);
      }
      return;
    }
    setClub(resolved);
    setLockFixture(fixture.fixtureName);
    setChosenFixture(fixture);
    try {
      const next = lockMatchDayClub({
        brandName,
        clubName: resolved,
        matchLabel: fixture.competition,
        fixtureName: fixture.fixtureName,
        competition: fixture.competition,
        fixtureDate: fixture.date,
        kickoff: fixture.kickoff,
        venue: fixture.venue,
        sourceUrl: fixture.sourceUrl,
      });
      ensureGoalNetwork({
        brandName,
        clubNames: [resolved],
      });
      setFixtureNotice(null);
      onLockChange?.(next);
      onMatchLocked?.(resolved);
    } catch (err) {
      setFixtureNotice(
        err instanceof Error
          ? err.message
          : secondLeadClimateSponsorRejectedMessage(
              resolved,
              "",
              fixture.fixtureName
            )
      );
    }
  }

  function unlockMatchDay() {
    clearMatchDayLock(brandName);
    setClub("");
    setLockFixture("");
    setChosenFixture(null);
    setFixtureNotice(null);
    onLockChange?.(null);
  }

  return (
    <section className="overflow-visible rounded-3xl border border-green-500/30 bg-slate-900 p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
        Match Day lock-in
      </p>
      <h2 className="mt-2 text-3xl font-black">Match Day Lock-In</h2>
      <p className="mt-3 max-w-3xl text-slate-300">{lockCopy()}</p>
      <div className="mt-6 overflow-visible rounded-2xl border border-green-500/40 bg-green-500/10 p-5">
        <p className="text-sm uppercase tracking-[0.2em] text-green-300">
          {matchLocked ? "Locked in" : "Choose the Match"}
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ClubTypeInMenu
            value={lockClub}
            onChange={(club) => applyMatchDayLock(club, null)}
          />
          <ClubMatchCalendar
            clubName={lockClub}
            value={lockFixture}
            matches={clubMatches}
            onChange={(fixture) => applyMatchDayLock(lockClub, fixture)}
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
              {lockClub} · {lockFixture}
            </p>
            <SeeMatchDetails
              key={lockFixture}
              defaultOpen
              date={lock?.fixtureDate || selectedFixture?.date}
              venue={lock?.venue || selectedFixture?.venue}
              kickoff={lock?.kickoff || selectedFixture?.kickoff}
            />
          </>
        ) : lockClub ? (
          <p className="mt-4 text-sm text-slate-400">
            Click Select the Match to see {lockClub}&apos;s next 10 League and
            Cup Matches. Lime dates are the only Matches this Club will play.
          </p>
        ) : (
          <p className="mt-4 text-sm text-slate-400">
            Type-in the Name of the Club you wish to sponsor, then click Select
            the Match to see this Club&apos;s next 10 League and Cup Matches.
          </p>
        )}
        <button
          type="button"
          onClick={unlockMatchDay}
          disabled={!lockFixture}
          className="mt-4 rounded-xl border border-slate-600 px-4 py-2 text-sm disabled:opacity-40"
        >
          Unlock
        </button>
      </div>
    </section>
  );
}
