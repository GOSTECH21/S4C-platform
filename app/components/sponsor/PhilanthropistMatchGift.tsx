"use client";

import { useEffect, useState } from "react";
import HowS4pSelectMatch from "@/app/components/home/HowS4pSelectMatch";
import type { HomeUpcomingMatch } from "@/app/components/home/SelectMatchFixtures";
import { SeeMatchDetails } from "@/app/components/sponsor/SeeMatchDetails";
import {
  ClubLeagueMenu,
  MatchFixtureMenu,
} from "@/app/components/sponsor/ClubMatchMenus";
import { SafeInput } from "@/app/components/forms/SafeFormField";
import {
  applyPhilanthropistMatchGifts,
  PHILANTHROPIST_AMOUNT_LABEL,
  PHILANTHROPIST_MIN_GBP,
  PHILANTHROPIST_SPONSOR_COPY,
  PHILANTHROPIST_SPONSOR_CTA,
  PHILANTHROPIST_SPONSOR_HEADING,
  philanthropistClubTotalGbp,
  philanthropistDisplayName,
  writePhilanthropistRecord,
  type PhilanthropistIdentity,
  type PhilanthropistRecord,
} from "@/app/lib/philanthropist";
import { PHILANTHROPIST_SPONSOR_ID } from "@/app/lib/routes";
import { fixtureByIdOrName, type ClubFixture } from "@/app/lib/club-fixtures";
import { loadClubFixtures } from "@/app/services/club-fixtures.service";
import {
  ensureGoalNetwork,
  lockMatchDayClub,
} from "@/app/services/climate-sponsors.service";
import { depositPhilanthropistClimateWallet } from "@/app/services/sponsor-wallet.service";

function fixtureFromHomeMatch(match: HomeUpcomingMatch): ClubFixture {
  const fixtureName = match.fixtureName.includes(" v ")
    ? match.fixtureName
    : match.fixtureName.replace(" vs ", " v ");
  return {
    id: match.id,
    homeName: match.homeName,
    awayName: match.awayName,
    fixtureName,
    competition: match.league,
    date: match.date,
    kickoff: match.kickoff,
    venue: match.venue,
    sourceUrl: null,
  };
}

export function PhilanthropistMatchGift({
  identity,
  record,
  brandName,
  onSaved,
}: {
  identity: PhilanthropistIdentity;
  record: PhilanthropistRecord | null;
  brandName: string;
  onSaved: (next: PhilanthropistRecord) => void;
}) {
  const [clubName, setClubName] = useState("");
  const [lockFixture, setLockFixture] = useState("");
  const [chosenFixture, setChosenFixture] = useState<ClubFixture | null>(null);
  const [clubFixtures, setClubFixtures] = useState<ClubFixture[]>([]);
  const [fixturesLoading, setFixturesLoading] = useState(false);
  const [amountGbp, setAmountGbp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pickerEpoch, setPickerEpoch] = useState(0);

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

  function applyClub(nextClub: string, fixture: ClubFixture | null) {
    const club = nextClub.trim();
    setError(null);
    setNotice(null);
    setClubName(club);
    if (!fixture) {
      setLockFixture("");
      setChosenFixture(null);
      return;
    }
    setLockFixture(fixture.fixtureName);
    setChosenFixture(fixture);
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const club = params.get("club")?.trim() || "";
    const fixtureName = params.get("fixture")?.trim() || "";
    if (!club) return;
    applyClub(
      club,
      fixtureName
        ? {
            id: fixtureName,
            homeName: "",
            awayName: "",
            fixtureName,
            competition: "",
            date: "",
            kickoff: null,
            venue: null,
            sourceUrl: null,
          }
        : null
    );
  }, []);

  const selectedFixture =
    chosenFixture && chosenFixture.fixtureName === lockFixture
      ? chosenFixture
      : fixtureByIdOrName(clubFixtures, lockFixture);
  const matchLocked = Boolean(clubName && (selectedFixture || lockFixture));

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    const club = clubName.trim();
    const gift = Number(amountGbp);
    if (!club) {
      setError("Select the Club you wish to sponsor.");
      return;
    }
    if (!selectedFixture && !lockFixture) {
      setError("Select the Match you wish to sponsor.");
      return;
    }
    if (!Number.isFinite(gift) || gift < PHILANTHROPIST_MIN_GBP) {
      setError("Enter how much money you are putting into this sponsorship.");
      return;
    }
    const fixtureName = selectedFixture?.fixtureName || lockFixture;
    setBusy(true);
    setError(null);
    try {
      const next = applyPhilanthropistMatchGifts(
        {
          name: identity.name || record?.name || brandName,
          organisation:
            identity.organisation || record?.organisation || brandName,
          email: identity.email || record?.email || "",
          createdAt: record?.createdAt,
          clubName: record?.clubName,
          giftGbp: record?.giftGbp,
          matchSponsorships: record?.matchSponsorships,
        },
        [
          {
            clubName: club,
            fixtureName,
            amountGbp: gift,
            date: selectedFixture?.date,
            competition: selectedFixture?.competition,
            kickoff: selectedFixture?.kickoff,
            venue: selectedFixture?.venue,
          },
        ]
      );
      writePhilanthropistRecord(next);
      const brand = philanthropistDisplayName(next) || brandName;
      if (brand) {
        lockMatchDayClub({
          brandName: brand,
          clubName: club,
          matchLabel: selectedFixture?.competition || "Match Day",
          fixtureName,
          competition: selectedFixture?.competition,
          fixtureDate: selectedFixture?.date,
          kickoff: selectedFixture?.kickoff,
          venue: selectedFixture?.venue,
          sourceUrl: selectedFixture?.sourceUrl,
        });
        ensureGoalNetwork({ brandName: brand, clubNames: [club] });
        depositPhilanthropistClimateWallet({
          clubName: club,
          brandName: brand,
          giftGbp: philanthropistClubTotalGbp(next, club),
        });
      }
      setNotice(
        `${club} · ${fixtureName} is now in your Philanthropist Carbon Wallet at £${gift.toLocaleString("en-GB")}.`
      );
      setAmountGbp("");
      setClubName("");
      setLockFixture("");
      setChosenFixture(null);
      setPickerEpoch((current) => current + 1);
      onSaved(next);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save this sponsorship."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      id={PHILANTHROPIST_SPONSOR_ID}
      data-testid="philanthropist-match-gift"
      data-philanthropist-match-gift="philanthropist-choose-match-v1"
      data-philanthropist-new-match="philanthropist-new-match-v1"
      data-draft-club={clubName}
      data-draft-fixture={lockFixture}
      className="mt-10 scroll-mt-6 space-y-6 rounded-3xl border border-green-500/30 bg-slate-900 p-6 max-md:rounded-none max-md:border-0 max-md:px-0 sm:p-8"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
          New Sponsorship
        </p>
        <h2 className="mt-2 text-3xl font-black">{PHILANTHROPIST_SPONSOR_HEADING}</h2>
        <p className="mt-3 max-w-3xl text-slate-300">{PHILANTHROPIST_SPONSOR_COPY}</p>
      </div>

      <HowS4pSelectMatch
        key={pickerEpoch}
        audience="sponsor"
        initialClub={clubName}
        onClubConfirmed={(club) => {
          if (club.trim() === clubName.trim()) return;
          applyClub(club, null);
        }}
        onClubMatchSelected={(match, club) =>
          applyClub(club, fixtureFromHomeMatch(match))
        }
      />

      <div className="overflow-visible rounded-2xl border border-green-500/40 bg-green-500/10 p-5">
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
            allPlatformClubs
            onChange={(club) => applyClub(club, null)}
          />
          <MatchFixtureMenu
            clubName={clubName}
            value={lockFixture}
            fixtures={clubFixtures}
            loading={fixturesLoading}
            onChange={(fixture) => applyClub(clubName, fixture)}
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
              date={selectedFixture?.date}
              venue={selectedFixture?.venue}
              kickoff={selectedFixture?.kickoff}
            />
          </>
        ) : clubName ? (
          <p className="mt-4 text-sm text-slate-400">
            {clubName} is selected. Choose the Match you wish to sponsor, then
            enter how much money you are putting into this sponsorship.
          </p>
        ) : (
          <p className="mt-4 text-sm text-slate-400">
            Select any club on the Sporting Calendar, then select the Match you
            wish to sponsor.
          </p>
        )}
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block max-w-md text-sm text-slate-400">
          {PHILANTHROPIST_AMOUNT_LABEL}
          <SafeInput
            type="number"
            min={PHILANTHROPIST_MIN_GBP}
            step={1}
            inputMode="numeric"
            autoComplete="off"
            value={amountGbp}
            onChange={(event) => setAmountGbp(event.target.value)}
            className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
            data-testid="philanthropist-gift-amount"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-green-500 py-4 font-bold text-slate-950 hover:bg-green-400 disabled:opacity-70"
        >
          {busy ? "Saving sponsorship..." : PHILANTHROPIST_SPONSOR_CTA}
        </button>
      </form>
      {error ? (
        <p className="text-sm font-semibold text-red-400">{error}</p>
      ) : null}
      {notice && !error ? (
        <p className="text-sm font-semibold text-green-300">{notice}</p>
      ) : null}
    </section>
  );
}
