"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  MATCHRAV_ACCOUNT_INTRO,
  MATCHRAV_ACCOUNT_STAMP,
  MATCHRAV_JOURNEY_STAMP,
  MATCHRAV_NAME,
  MATCHRAV_PLANNER_STAMP,
  MATCHRAV_TAB_DETAIL,
} from "@/app/lib/matchrav";
import {
  CAR_OCCUPANT_CHOICES,
  TRAVEL_EXAMPLE,
  TRAVEL_MODES,
  estimateTravelKgCo2e,
  formatTravelKgCo2e,
  parseReturnMiles,
  saveStadiumTravelRecord,
  travelModeLabel,
  type TravelMode,
} from "@/app/lib/match-day-travel";
import {
  DEFAULT_MATCHRAV_CONSENT,
  compareRoutes,
  confirmMatchravTrip,
  destinationForFixture,
  fixtureHeadline,
  formatDuration,
  listMatchravTrips,
  matchravStadiumForClub,
  milesFromOriginToDestination,
  readMatchravConsent,
  saveMatchravTrip,
  stadiumLabel,
  writeMatchravConsent,
  type MatchravConsent,
  type MatchravStadium,
  type MatchravTrip,
} from "@/app/lib/matchrav-journey";
import { SUPPORTER_PROJECTS_PATH } from "@/app/lib/routes";
import { getOrCreateSupporter } from "@/app/services/votes.service";
import { getSupportedTeams } from "@/app/services/teams.service";
import {
  clubIsHome,
  formatKickoff,
  formatMatchDate,
  type UpcomingMatch,
} from "@/app/lib/upcoming-matches";

const MARK_GREEN = "#5bc662";
const FIELD =
  "mt-2 w-full rounded-full border border-emerald-400/40 bg-slate-950 px-4 py-3 text-base font-semibold text-white";

export default function FanMatchravPanel({
  initialClub = "",
  initialFixtures = [],
  initialStadium = null,
}: {
  initialClub?: string;
  initialFixtures?: UpcomingMatch[];
  initialStadium?: MatchravStadium | null;
}) {
  const [club, setClub] = useState(initialClub);
  const [clubs, setClubs] = useState<string[]>([]);
  const [fixtures, setFixtures] = useState<UpcomingMatch[]>(initialFixtures);
  const [fixtureId, setFixtureId] = useState(initialFixtures[0]?.id ?? "");
  const [stadium, setStadium] = useState<MatchravStadium | null>(initialStadium);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState(
    destinationForFixture(
      initialClub,
      initialFixtures[0] ?? null,
      initialStadium
    )
  );
  const [outboundMode, setOutboundMode] = useState<TravelMode>(TRAVEL_EXAMPLE.mode);
  const [returnMode, setReturnMode] = useState<TravelMode>(TRAVEL_EXAMPLE.mode);
  const [sameReturn, setSameReturn] = useState(true);
  const [miles, setMiles] = useState("");
  const [returnMiles, setReturnMiles] = useState("");
  const [occupants, setOccupants] = useState(TRAVEL_EXAMPLE.occupants);
  const [consent, setConsent] = useState<MatchravConsent>(DEFAULT_MATCHRAV_CONSENT);
  const [trips, setTrips] = useState<MatchravTrip[]>([]);
  const [savedKg, setSavedKg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gpsBusy, setGpsBusy] = useState(false);
  const [fixtureStatus, setFixtureStatus] = useState(
    initialFixtures.length
      ? `${initialFixtures.length} upcoming matches`
      : initialClub
        ? "Loading fixtures…"
        : ""
  );
  const formRef = useRef<HTMLFormElement>(null);
  const bootstrappedClub = useRef(initialClub.trim());

  const fixture = fixtures.find((row) => row.id === fixtureId) ?? null;
  const outboundDistance = parseReturnMiles(miles);
  const inboundDistance = sameReturn
    ? outboundDistance
    : parseReturnMiles(returnMiles);
  const totalDistance = outboundDistance + inboundDistance;
  const chosenOutboundKg = estimateTravelKgCo2e(
    outboundMode,
    outboundDistance,
    occupants
  );
  const chosenReturnKg = estimateTravelKgCo2e(
    sameReturn ? outboundMode : returnMode,
    inboundDistance,
    occupants
  );
  const chosenKg = Math.round((chosenOutboundKg + chosenReturnKg) * 10) / 10;
  const comparisons = useMemo(
    () => compareRoutes(totalDistance, occupants),
    [totalDistance, occupants]
  );
  const lowestKg = Math.min(
    ...comparisons.filter((row) => row.practical).map((row) => row.kg),
    Number.POSITIVE_INFINITY
  );
  const fastest = Math.min(
    ...comparisons.filter((row) => row.practical && row.minutes > 0).map((row) => row.minutes),
    Number.POSITIVE_INFINITY
  );
  const latestPlanned = trips.find((row) => row.status === "planned") ?? null;

  useEffect(() => {
    setConsent(readMatchravConsent());
    setTrips(listMatchravTrips());
    const queryClub = new URLSearchParams(window.location.search).get("club");
    if (queryClub?.trim()) setClub(queryClub.trim());
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const supporter = await getOrCreateSupporter();
        if (!supporter || cancelled) return;
        const teams = await getSupportedTeams(supporter);
        if (cancelled) return;
        const names = teams
          .map((team) => team.name || team.displayName)
          .filter((name): name is string => Boolean(name?.trim()));
        setClubs((current) => {
          const selected = club.trim();
          if (selected && !names.includes(selected)) {
            return [selected, ...names];
          }
          return names.length ? names : current;
        });
        setClub((current) => current || names[0] || "");
      } catch {
        // Planner still works without a signed-in club list.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const name = club.trim();
    if (!name) {
      setFixtures([]);
      setFixtureId("");
      setStadium(null);
      setDestination("");
      setFixtureStatus("");
      return;
    }
    const localStadium = matchravStadiumForClub(name);
    setStadium(localStadium);
    if (
      bootstrappedClub.current &&
      name === bootstrappedClub.current &&
      initialFixtures.length > 0
    ) {
      bootstrappedClub.current = "";
      setFixtureStatus(`${initialFixtures.length} upcoming matches`);
      if (initialStadium) setStadium(initialStadium);
      return;
    }
    let cancelled = false;
    setFixtureStatus("Loading fixtures…");
    void (async () => {
      try {
        const response = await fetch(
          `/api/fan/matchrav-fixtures?club=${encodeURIComponent(name)}`
        );
        const payload = (await response.json()) as {
          fixtures?: UpcomingMatch[];
          stadium?: MatchravStadium | null;
        };
        if (cancelled) return;
        const nextFixtures = Array.isArray(payload.fixtures)
          ? payload.fixtures
          : [];
        setFixtures(nextFixtures);
        setFixtureId(nextFixtures[0]?.id ?? "");
        if (payload.stadium) setStadium(payload.stadium);
        setFixtureStatus(
          nextFixtures.length
            ? `${nextFixtures.length} upcoming matches`
            : "No upcoming matches listed yet. You can still plan the ground."
        );
      } catch {
        if (cancelled) return;
        setFixtures([]);
        setFixtureId("");
        setFixtureStatus("Could not load fixtures. Stadium details still apply.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [club]);

  useEffect(() => {
    setDestination(destinationForFixture(club, fixture, stadium));
  }, [club, fixture, stadium]);

  useEffect(() => {
    const computed = milesFromOriginToDestination(
      origin,
      destination,
      fixture,
      stadium
    );
    if (computed <= 0) return;
    const value = String(computed);
    setMiles(value);
    if (sameReturn) setReturnMiles(value);
  }, [origin, destination, fixture, stadium, sameReturn, outboundMode]);

  function persistConsent(next: MatchravConsent) {
    setConsent(next);
    writeMatchravConsent(next);
  }

  function useApproximateLocation() {
    if (!consent.allowGps || !navigator.geolocation) return;
    setGpsBusy(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin(
          `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
        );
        setGpsBusy(false);
      },
      () => {
        setError("Location was not available. Type a town or postcode instead.");
        setGpsBusy(false);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }

  function saveJourney() {
    const clubName = club.trim();
    setError(null);
    const trip = saveMatchravTrip(
      {
        club: clubName,
        matchId: fixture?.id,
        fixtureName: fixture ? fixtureHeadline(fixture) : "",
        venue: destination || stadiumLabel(stadium),
        matchDate: fixture?.date,
        origin,
        destination,
        outboundMiles: outboundDistance,
        returnMiles: inboundDistance,
        outboundMode,
        returnMode: sameReturn ? outboundMode : returnMode,
        occupants,
      },
      consent
    );
    if (!trip) {
      setError("Enter your club and an outbound distance to save this journey.");
      return;
    }
    saveStadiumTravelRecord({
      club: clubName,
      matchId: fixture?.id,
      fixtureName: fixture ? fixtureHeadline(fixture) : "",
      venue: destination || stadiumLabel(stadium),
      matchDate: fixture?.date,
      mode: outboundMode,
      miles: totalDistance,
      occupants,
    });
    setSavedKg(formatTravelKgCo2e(trip.totalKg));
    setTrips(listMatchravTrips());
    if (!consent.storeLocal) {
      setSavedKg(formatTravelKgCo2e(trip.totalKg));
    }
  }

  function confirmLatest(mode: TravelMode) {
    if (!latestPlanned) return;
    confirmMatchravTrip(latestPlanned.id, mode, consent);
    setTrips(listMatchravTrips());
  }

  return (
    <section
      className="px-4 pb-16 text-white sm:px-6"
      data-matchrav-account={MATCHRAV_ACCOUNT_STAMP}
      data-matchrav-planner={MATCHRAV_PLANNER_STAMP}
      data-matchrav-journey={MATCHRAV_JOURNEY_STAMP}
      data-matchrav-club={club || undefined}
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          {MATCHRAV_TAB_DETAIL}
        </p>
        <h1 className="mt-2 text-4xl font-black">{MATCHRAV_NAME}</h1>
        <p className="mt-3 max-w-2xl text-slate-300">{MATCHRAV_ACCOUNT_INTRO}</p>

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-2">
          <form
            ref={formRef}
            data-matchrav-plan
            className="rounded-2xl border border-emerald-400/25 bg-slate-900/80 p-5 sm:p-6"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              saveJourney();
            }}
          >
            <h2 className="text-xl font-black">Plan your journey</h2>
            <p className="mt-2 text-sm font-medium text-slate-300">
              Pick the supported club, the fixture and stadium, then enter where
              the trip starts.
            </p>

            <label className="mt-5 block text-sm font-bold">
              Club
              {clubs.length > 1 ? (
                <select
                  name="club"
                  value={club}
                  onChange={(event) => setClub(event.target.value)}
                  className={FIELD}
                >
                  {clubs.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="club"
                  value={club}
                  onChange={(event) => setClub(event.target.value)}
                  placeholder="Your club"
                  className={FIELD}
                />
              )}
            </label>

            <label className="mt-5 block text-sm font-bold" data-matchrav-fixture>
              Fixture
              <select
                name="fixture"
                value={fixtureId}
                onChange={(event) => setFixtureId(event.target.value)}
                className={FIELD}
              >
                {fixtures.length === 0 ? (
                  <option value="">No listed match — stadium only</option>
                ) : (
                  fixtures.map((row) => (
                    <option key={row.id} value={row.id}>
                      {formatMatchDate(row.date)} · {fixtureHeadline(row)}
                    </option>
                  ))
                )}
              </select>
            </label>
            {fixtureStatus ? (
              <p className="mt-2 text-xs font-semibold text-slate-400">
                {fixtureStatus}
              </p>
            ) : null}

            <div
              className="mt-5 rounded-xl border border-emerald-400/20 bg-slate-950/50 px-4 py-3"
              data-matchrav-stadium
            >
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-300">
                Stadium
              </p>
              <p className="mt-1 text-sm font-black">
                {stadium
                  ? stadium.venue || stadiumLabel(stadium)
                  : "Select a club to load the ground."}
              </p>
              {stadium && stadiumLabel(stadium) !== stadium.venue ? (
                <p className="mt-1 text-xs font-semibold text-slate-400">
                  {stadiumLabel(stadium)}
                </p>
              ) : null}
              {fixture ? (
                <p className="mt-1 text-xs font-semibold text-slate-400">
                  {formatMatchDate(fixture.date)} · {formatKickoff(fixture.kickoff)}
                  {fixture.competition ? ` · ${fixture.competition}` : ""}
                  {clubIsHome(fixture, club) ? " · Home" : " · Away"}
                  {fixture.venue?.trim() &&
                  fixture.venue.trim() !== (stadium?.venue || "")
                    ? ` · ${fixture.venue.trim()}`
                    : ""}
                </p>
              ) : null}
            </div>

            <label className="mt-5 block text-sm font-bold" data-matchrav-origin>
              Origin
              <input
                type="text"
                name="origin"
                value={origin}
                onChange={(event) => setOrigin(event.target.value)}
                placeholder="Town, area or postcode"
                className={FIELD}
              />
            </label>
            {consent.allowGps ? (
              <button
                type="button"
                onClick={useApproximateLocation}
                disabled={gpsBusy}
                className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-emerald-300"
              >
                {gpsBusy ? "Finding location…" : "Use approximate location"}
              </button>
            ) : (
              <p className="mt-2 text-xs font-semibold text-slate-400">
                GPS stays off until you allow it in Privacy.
              </p>
            )}

            <label className="mt-5 block text-sm font-bold">
              Destination
              <input
                type="text"
                name="destination"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                placeholder="Stadium"
                className={FIELD}
              />
            </label>

            <label className="mt-5 block text-sm font-bold" data-matchrav-miles>
              Outbound distance (miles)
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.1"
                value={miles}
                onChange={(event) => {
                  setMiles(event.target.value);
                  if (sameReturn) setReturnMiles(event.target.value);
                }}
                className={FIELD}
              />
            </label>
            {parseReturnMiles(miles) > 0 && origin.trim() && destination.trim() ? (
              <p className="mt-1 text-xs font-semibold text-slate-400">
                Estimated from origin to destination
                {outboundMode === "car" ? " for Car" : ""}.
              </p>
            ) : null}

            <label className="mt-4 flex items-center gap-3 text-sm font-bold">
              <input
                type="checkbox"
                checked={sameReturn}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setSameReturn(checked);
                  if (checked) {
                    setReturnMode(outboundMode);
                    setReturnMiles(miles);
                  }
                }}
              />
              Return the same way
            </label>

            {!sameReturn ? (
              <label className="mt-4 block text-sm font-bold">
                Return distance (miles)
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.1"
                  value={returnMiles}
                  onChange={(event) => setReturnMiles(event.target.value)}
                  className={FIELD}
                />
              </label>
            ) : null}

            <ModePicker
              legend="How will you travel there?"
              value={outboundMode}
              onChange={(mode) => {
                setOutboundMode(mode);
                if (sameReturn) setReturnMode(mode);
              }}
            />

            {!sameReturn ? (
              <ModePicker
                legend="How will you travel back?"
                value={returnMode}
                onChange={setReturnMode}
              />
            ) : null}

            {outboundMode === "car" || (!sameReturn && returnMode === "car") ? (
              <fieldset className="mt-5">
                <legend className="text-sm font-bold">
                  People sharing the car, including you
                </legend>
                <div
                  className="mt-3 flex flex-wrap items-center gap-3"
                  role="radiogroup"
                  aria-label="People sharing the car, including you"
                >
                  {CAR_OCCUPANT_CHOICES.map((count) => {
                    const checked = occupants === count;
                    return (
                      <button
                        key={count}
                        type="button"
                        role="radio"
                        aria-checked={checked}
                        onClick={() => setOccupants(count)}
                        className={`min-w-12 rounded-full border px-4 py-2 text-sm font-black ${
                          checked
                            ? "border-green-400 bg-green-500 text-slate-950"
                            : "border-emerald-400/40 bg-slate-950"
                        }`}
                      >
                        {count}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ) : null}

            <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
              Your estimated travel footprint
            </p>
            <p
              className="mt-1 text-4xl font-black"
              style={{ color: MARK_GREEN }}
              aria-live="polite"
            >
              {formatTravelKgCo2e(chosenKg)}{" "}
              <span className="text-xl font-black">kg CO2e</span>
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-300">
              Outbound {formatTravelKgCo2e(chosenOutboundKg)} kg · Return{" "}
              {formatTravelKgCo2e(chosenReturnKg)} kg · vs solo car save{" "}
              {formatTravelKgCo2e(
                Math.max(
                  0,
                  estimateTravelKgCo2e("car", totalDistance, 1) - chosenKg
                )
              )}{" "}
              kg
            </p>

            {error ? (
              <p data-matchrav-error className="mt-4 text-sm font-semibold text-red-300">
                {error}
              </p>
            ) : null}
            {savedKg ? (
              <p data-matchrav-saved className="mt-4 text-sm font-semibold text-emerald-300">
                {consent.storeLocal
                  ? `Saved ${savedKg} kg CO2e for this Match Day journey.`
                  : `Estimated ${savedKg} kg CO2e. Storage is off in Privacy.`}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="submit"
                data-matchrav-save
                disabled={outboundDistance <= 0}
                className="inline-flex items-center justify-center rounded-full bg-s4p-mark px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-black hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save this journey
              </button>
              <Link
                href={SUPPORTER_PROJECTS_PATH}
                className="inline-flex items-center justify-center rounded-full border border-emerald-400/40 px-5 py-3 text-sm font-black uppercase tracking-[0.12em]"
              >
                Fund climate action
              </Link>
            </div>
          </form>

          <aside
            data-matchrav-compare
            data-matchrav-routing
            className="rounded-2xl border border-emerald-400/25 bg-slate-900/80 p-5 sm:p-6"
          >
            <h2 className="text-xl font-black">Compare options</h2>
            <p className="mt-2 text-sm font-medium text-slate-300">
              Same round trip, different ways of getting there. Times are
              door-to-door averages, not live timetables.
            </p>
            <ul className="mt-5 space-y-2">
              {comparisons.map((row) => {
                const selected = row.id === outboundMode;
                const lowest = row.practical && row.kg === lowestKg;
                const quickest = row.practical && row.minutes === fastest;
                return (
                  <li
                    key={row.id}
                    data-matchrav-option={row.id}
                    data-matchrav-lowest={lowest ? "true" : "false"}
                    className={`rounded-xl border px-4 py-3 ${
                      selected
                        ? "border-green-400 bg-green-500/15"
                        : "border-emerald-400/20 bg-slate-950/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black">{row.label}</p>
                        <p className="mt-0.5 text-xs font-semibold text-slate-400">
                          {formatDuration(row.minutes)}
                          {!row.practical ? " · Not practical for this distance" : ""}
                          {lowest ? " · Lowest carbon" : ""}
                          {quickest ? " · Fastest" : ""}
                        </p>
                      </div>
                      <p className="text-lg font-black">
                        {formatTravelKgCo2e(row.kg)}
                        <span className="ml-1 text-xs font-semibold text-slate-400">
                          kg
                        </span>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
          <section
            data-matchrav-trips
            className="rounded-2xl border border-emerald-400/25 bg-slate-900/80 p-5 sm:p-6"
          >
            <h2 className="text-xl font-black">Journey savings and return</h2>
            <p className="mt-2 text-sm font-medium text-slate-300">
              Saved trips stay on this device unless you turn storage off.
            </p>
            {trips.length === 0 ? (
              <p className="mt-4 text-sm font-semibold text-slate-400">
                No journeys saved yet.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {trips.slice(0, 6).map((trip) => (
                  <li
                    key={trip.id}
                    className="rounded-xl border border-emerald-400/20 bg-slate-950/50 px-4 py-3"
                  >
                    <p className="text-sm font-black">
                      {trip.fixtureName || trip.club}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      {trip.origin || "Origin not set"} → {trip.destination || trip.venue}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-emerald-300">
                      {travelModeLabel(trip.outboundMode)} there ·{" "}
                      {travelModeLabel(trip.returnMode)} back ·{" "}
                      {formatTravelKgCo2e(trip.totalKg)} kg · saved{" "}
                      {formatTravelKgCo2e(trip.savedVsSoloCarKg)} kg vs solo car ·{" "}
                      {trip.status === "confirmed" ? "Confirmed" : "Planned"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section
            data-matchrav-confirm
            className="rounded-2xl border border-emerald-400/25 bg-slate-900/80 p-5 sm:p-6"
          >
            <h2 className="text-xl font-black">Travel mode confirmation</h2>
            <p className="mt-2 text-sm font-medium text-slate-300">
              After the match, confirm how you actually travelled so reporting
              is based on the real trip.
            </p>
            {latestPlanned ? (
              <>
                <p className="mt-4 text-sm font-black">
                  {latestPlanned.fixtureName || latestPlanned.club}
                </p>
                <ModePicker
                  legend="Confirmed mode"
                  value={latestPlanned.outboundMode}
                  onChange={confirmLatest}
                />
                <p className="mt-3 text-xs font-semibold text-slate-400">
                  Tap a mode to confirm this planned journey.
                </p>
              </>
            ) : (
              <p className="mt-4 text-sm font-semibold text-slate-400">
                Save a journey first, then confirm the mode you used.
              </p>
            )}
          </section>
        </div>

        <section
          data-matchrav-privacy
          className="mt-6 rounded-2xl border border-emerald-400/25 bg-slate-900/80 p-5 sm:p-6"
        >
          <h2 className="text-xl font-black">Privacy controls and consent</h2>
          <p className="mt-2 max-w-3xl text-sm font-medium text-slate-300">
            Matchrav does not need GPS. Journeys stay on this device unless you
            choose to share anonymous carbon totals for club operations.
          </p>
          <ul className="mt-4 space-y-3">
            <ConsentRow
              checked={consent.storeLocal}
              onChange={(storeLocal) => persistConsent({ ...consent, storeLocal })}
              title="Store journeys on this device"
              body="Needed to save trips, return plans and confirmations."
            />
            <ConsentRow
              checked={consent.shareAnonymous}
              onChange={(shareAnonymous) =>
                persistConsent({ ...consent, shareAnonymous })
              }
              title="Share anonymous carbon totals"
              body="No name, origin or exact location. S4P operations can count mode mix and saved kg."
            />
            <ConsentRow
              checked={consent.allowGps}
              onChange={(allowGps) => persistConsent({ ...consent, allowGps })}
              title="Allow approximate location"
              body="Optional. Only used if you tap Use approximate location to fill Origin."
            />
          </ul>
        </section>
      </div>
    </section>
  );
}

function ModePicker({
  legend,
  value,
  onChange,
}: {
  legend: string;
  value: TravelMode;
  onChange: (mode: TravelMode) => void;
}) {
  return (
    <fieldset className="mt-5">
      <legend className="text-sm font-bold">{legend}</legend>
      <div
        className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2"
        role="radiogroup"
        aria-label={legend}
      >
        {TRAVEL_MODES.map((row) => {
          const checked = value === row.id;
          return (
            <button
              key={row.id}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onChange(row.id)}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm font-semibold ${
                checked
                  ? "border-green-400 bg-green-500/15"
                  : "border-emerald-400/25 bg-slate-950/60"
              }`}
            >
              <span
                className="h-5 w-5 shrink-0 rounded-full border-2"
                style={{
                  borderColor: "#ffffff",
                  backgroundColor: checked ? MARK_GREEN : "transparent",
                }}
                aria-hidden
              />
              {row.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function ConsentRow({
  checked,
  onChange,
  title,
  body,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  title: string;
  body: string;
}) {
  return (
    <li>
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>
          <span className="block text-sm font-black">{title}</span>
          <span className="mt-0.5 block text-xs font-semibold text-slate-400">
            {body}
          </span>
        </span>
      </label>
    </li>
  );
}
