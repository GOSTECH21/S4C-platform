"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  MATCHRAV_ACCOUNT_INTRO,
  MATCHRAV_ACCOUNT_STAMP,
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
  type TravelMode,
} from "@/app/lib/match-day-travel";
import { SUPPORTER_PROJECTS_PATH } from "@/app/lib/routes";
import { getOrCreateSupporter } from "@/app/services/votes.service";
import { getSupportedTeams } from "@/app/services/teams.service";

const MARK_GREEN = "#5bc662";

export default function FanMatchravPanel() {
  const [club, setClub] = useState("");
  const [clubs, setClubs] = useState<string[]>([]);
  const [mode, setMode] = useState<TravelMode>(TRAVEL_EXAMPLE.mode);
  const [miles, setMiles] = useState(String(TRAVEL_EXAMPLE.miles));
  const [occupants, setOccupants] = useState(TRAVEL_EXAMPLE.occupants);
  const [savedKg, setSavedKg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const distance = parseReturnMiles(miles);
  const chosenKg = estimateTravelKgCo2e(mode, miles, occupants);

  const comparisons = useMemo(
    () =>
      TRAVEL_MODES.map((row) => ({
        ...row,
        kg: estimateTravelKgCo2e(row.id, miles, occupants),
      })),
    [miles, occupants]
  );
  const lowestKg = Math.min(...comparisons.map((row) => row.kg));

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
        setClubs(names);
        setClub((current) => current || names[0] || "");
      } catch {
        // Planner still works without a signed-in club list.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function saveJourney(form?: HTMLFormElement | null) {
    const named = form
      ? String(new FormData(form).get("club") || "").trim()
      : "";
    const clubName = named || club.trim();
    setError(null);
    const record = saveStadiumTravelRecord({
      club: clubName,
      mode,
      miles: distance,
      occupants,
    });
    if (!record) {
      setError("Enter your club and a return distance to save this journey.");
      return;
    }
    setSavedKg(formatTravelKgCo2e(record.kgCo2e));
  }

  return (
    <section
      className="px-4 pb-16 text-white sm:px-6"
      data-matchrav-account={MATCHRAV_ACCOUNT_STAMP}
      data-matchrav-planner={MATCHRAV_PLANNER_STAMP}
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
              saveJourney(event.currentTarget);
            }}
          >
            <h2 className="text-xl font-black">Plan your journey</h2>
            <p className="mt-2 text-sm font-medium text-slate-300">
              No postcode. No GPS. Estimate the trip to the stadium and back.
            </p>

            <label className="mt-5 block text-sm font-bold">
              Club
              {clubs.length > 1 ? (
                <select
                  name="club"
                  value={club}
                  onChange={(event) => setClub(event.target.value)}
                  className="mt-2 w-full rounded-full border border-emerald-400/40 bg-slate-950 px-4 py-3 text-base font-semibold text-white"
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
                  className="mt-2 w-full rounded-full border border-emerald-400/40 bg-slate-950 px-4 py-3 text-base font-semibold text-white"
                />
              )}
            </label>

            <fieldset className="mt-5">
              <legend className="text-sm font-bold">How will you travel?</legend>
              <div
                className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2"
                role="radiogroup"
                aria-label="How will you travel?"
              >
                {TRAVEL_MODES.map((row) => {
                  const checked = mode === row.id;
                  return (
                    <button
                      key={row.id}
                      type="button"
                      role="radio"
                      aria-checked={checked}
                      onClick={() => setMode(row.id)}
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
                          backgroundColor: checked ? "#5bc662" : "transparent",
                        }}
                        aria-hidden
                      />
                      {row.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <label className="mt-5 block text-sm font-bold">
              Estimated total return distance (miles)
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.1"
                value={miles}
                onChange={(event) => setMiles(event.target.value)}
                className="mt-2 w-full rounded-full border border-emerald-400/40 bg-slate-950 px-4 py-3 text-base font-semibold text-white"
              />
            </label>

            {mode === "car" ? (
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

            {error ? (
              <p data-matchrav-error className="mt-4 text-sm font-semibold text-red-300">
                {error}
              </p>
            ) : null}
            {savedKg ? (
              <p data-matchrav-saved className="mt-4 text-sm font-semibold text-emerald-300">
                Saved {savedKg} kg CO2e for this Match Day journey.
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                data-matchrav-save
                disabled={distance <= 0}
                onClick={() => saveJourney(formRef.current)}
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
            className="rounded-2xl border border-emerald-400/25 bg-slate-900/80 p-5 sm:p-6"
          >
            <h2 className="text-xl font-black">Compare options</h2>
            <p className="mt-2 text-sm font-medium text-slate-300">
              Same return distance, different ways of getting there.
            </p>
            <ul className="mt-5 space-y-2">
              {comparisons.map((row) => {
                const selected = row.id === mode;
                const lowest = row.kg === lowestKg;
                return (
                  <li
                    key={row.id}
                    data-matchrav-option={row.id}
                    data-matchrav-lowest={lowest ? "true" : "false"}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                      selected
                        ? "border-green-400 bg-green-500/15"
                        : "border-emerald-400/20 bg-slate-950/50"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-black">{row.label}</p>
                      {lowest ? (
                        <p className="mt-0.5 text-xs font-semibold text-emerald-300">
                          Lowest estimated carbon
                        </p>
                      ) : null}
                    </div>
                    <p className="text-lg font-black">
                      {formatTravelKgCo2e(row.kg)}
                      <span className="ml-1 text-xs font-semibold text-slate-400">
                        kg
                      </span>
                    </p>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
