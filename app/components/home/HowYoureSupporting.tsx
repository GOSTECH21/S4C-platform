"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import {
  useSelectMatch,
  type HomeUpcomingMatch,
} from "@/app/components/home/SelectMatchFixtures";
import {
  formatKickoff,
  formatMatchDate,
} from "@/app/lib/upcoming-matches";
import { loadClubChosenClimateProjects } from "@/app/services/sponsor-offers.service";
import type { ClimateProject } from "@/app/services/votes.service";
import {
  FAN_REGISTER_PATH,
  SUPPORTER_CAMPAIGN_PATH,
  fanLoginPath,
} from "@/app/lib/routes";
import { FUND_IT_LABEL } from "@/app/lib/sponsor-wallet";
import { identifySignedInKind } from "@/app/services/signed-in-role.service";
import { destinationForSignedInKind } from "@/app/lib/signed-in-role";
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

const MARK_GREEN = "#5bc662";
const MINT = "#0c5c2c";

const FALLBACK_PROJECTS: Array<{ name: string; category: string }> = [
  { name: "Sustainable Fan Travel Initiatives", category: "Travel" },
  { name: "Stadium Renewable Energy", category: "Energy" },
  { name: "Waste Reduction & Circular Economy", category: "Waste" },
  { name: "UK Reforestation & Woodland Creation", category: "Nature" },
  { name: "Community Climate Education", category: "Community" },
];

type SupportView = "intro" | "travel" | "projects";
type SupportKind = "attending" | "remote";

type HowYoureSupportingState = {
  view: SupportView;
  support: SupportKind | null;
  club: string;
  match: HomeUpcomingMatch | null;
  chooseAttending: () => void;
  chooseRemote: () => void;
  showProjects: () => void;
  backToIntro: () => void;
};

const HowYoureSupportingContext =
  createContext<HowYoureSupportingState | null>(null);

function clubPossessive(club: string) {
  if (!club) return "This club's";
  return club.endsWith("s") ? `${club}'` : `${club}'s`;
}

function useHowYoureSupporting() {
  const ctx = useContext(HowYoureSupportingContext);
  if (!ctx) {
    throw new Error("HowYoureSupportingProvider is required");
  }
  return ctx;
}

export function HowYoureSupportingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { club, resolvedClub, selectedMatch } = useSelectMatch();
  const shown = resolvedClub || club;
  const match = selectedMatch;
  const [view, setView] = useState<SupportView>("intro");
  const [support, setSupport] = useState<SupportKind | null>(null);

  useEffect(() => {
    setView("intro");
    setSupport(null);
  }, [shown]);

  const chooseAttending = useCallback(() => {
    setSupport("attending");
    setView("travel");
  }, []);

  const chooseRemote = useCallback(() => {
    setSupport("remote");
    setView("projects");
  }, []);

  const showProjects = useCallback(() => {
    setView("projects");
  }, []);

  const backToIntro = useCallback(() => {
    setView("intro");
    setSupport(null);
  }, []);

  const value = useMemo(
    () => ({
      view,
      support,
      club: shown,
      match,
      chooseAttending,
      chooseRemote,
      showProjects,
      backToIntro,
    }),
    [
      view,
      support,
      shown,
      match,
      chooseAttending,
      chooseRemote,
      showProjects,
      backToIntro,
    ]
  );

  return (
    <HowYoureSupportingContext.Provider value={value}>
      {children}
    </HowYoureSupportingContext.Provider>
  );
}

function stopCarouselSwipe(event: { stopPropagation: () => void }) {
  event.stopPropagation();
}

function pinHowS4pSlide() {
  const scroller = document.querySelector(
    "[data-how-s4p-scroller]"
  ) as HTMLElement | null;
  if (!scroller || scroller.clientWidth === 0) return;
  const slide = Math.round(scroller.scrollLeft / scroller.clientWidth);
  const left = Math.max(0, slide) * scroller.clientWidth;
  requestAnimationFrame(() => {
    scroller.scrollLeft = left;
  });
}

function keepHowS4pSlide(
  event: { stopPropagation: () => void }
) {
  event.stopPropagation();
  pinHowS4pSlide();
}

function formatMatchDateYear(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return formatMatchDate(date);
  return parsed.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function clubInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "FC";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function HowYoureSupportingPhone({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const { chooseAttending, chooseRemote, match } = useHowYoureSupporting();
  const fixture = match
    ? match.fixtureName.replace(" v ", " vs ")
    : "Choose a match";
  const homeName = match?.homeName || "";

  return (
    <>
      <Image
        src={src}
        alt={alt}
        width={252}
        height={585}
        className="h-auto w-full"
        unoptimized
      />
      <div
        id="match-day-banner"
        className="absolute z-20 overflow-hidden text-white"
        style={{
          top: "14.6%",
          left: "8.2%",
          right: "8%",
          height: "16.6%",
          borderRadius: "0.75rem",
          background:
            "linear-gradient(100deg, #0b2416 0%, #123b24 48%, #1c5a34 100%)",
        }}
        aria-label={
          match
            ? `${fixture}. ${formatMatchDateYear(match.date)} ${formatKickoff(match.kickoff)}. ${match.venue}`
            : "No match selected yet"
        }
      >
        <div className="flex h-full items-center gap-2 px-2.5">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-black"
            style={{ backgroundColor: MARK_GREEN }}
            aria-hidden
          >
            {clubInitials(homeName || "FC")}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-black leading-tight">
              {fixture}
            </p>
            {match ? (
              <>
                <p className="mt-0.5 truncate text-[8px] font-semibold leading-tight opacity-90">
                  {formatMatchDateYear(match.date)} ·{" "}
                  {formatKickoff(match.kickoff)}
                </p>
                <p className="truncate text-[8px] font-semibold leading-tight opacity-90">
                  {match.venue}
                </p>
              </>
            ) : (
              <p className="mt-0.5 text-[8px] font-semibold opacity-90">
                Pick a Match Day in Select Match
              </p>
            )}
          </div>
        </div>
      </div>
      <button
        type="button"
        aria-label="Continue — I'm attending the match"
        onPointerDown={stopCarouselSwipe}
        onClick={chooseAttending}
        className="absolute z-20 flex cursor-pointer items-center justify-center rounded-full bg-s4p-mark px-2 text-[11px] font-black text-black hover:brightness-110 [touch-action:manipulation]"
        style={{
          left: "9%",
          top: "62.4%",
          width: "35%",
          height: "5.4%",
        }}
      >
        Continue
      </button>
      <button
        type="button"
        aria-label="Continue — I'm watching remotely"
        onPointerDown={stopCarouselSwipe}
        onClick={chooseRemote}
        className="absolute z-20 flex cursor-pointer items-center justify-center rounded-full bg-s4p-mark px-2 text-[11px] font-black text-black hover:brightness-110 [touch-action:manipulation]"
        style={{
          left: "54.5%",
          top: "62.4%",
          width: "35%",
          height: "5.4%",
        }}
      >
        Continue
      </button>
    </>
  );
}

function LeafMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill={MARK_GREEN}
      aria-hidden
    >
      <path d="M20.4 3.2C12.8 3.6 7.2 7.4 5.2 14.2c-.4 1.4-.4 2.8 0 4.1-2 1-3.2 2.4-3.2 2.4s2.2.2 4.2-.6c1.6 1.2 3.6 1.9 5.8 1.9 6.8 0 11.2-6.2 10.6-13.2-.2-2.8-1.2-5-2.2-6.6Z" />
    </svg>
  );
}

function RadioDot({ checked }: { checked: boolean }) {
  return (
    <span
      className="mt-0.5 h-5 w-5 shrink-0 rounded-full border-2"
      style={{
        borderColor: "#111111",
        backgroundColor: checked ? "#111111" : "transparent",
      }}
      aria-hidden
    />
  );
}

function PlanMatchDayTravelSheet() {
  const { club, match, showProjects, backToIntro } = useHowYoureSupporting();
  const [mode, setMode] = useState<TravelMode>(TRAVEL_EXAMPLE.mode);
  const [miles, setMiles] = useState(String(TRAVEL_EXAMPLE.miles));
  const [occupants, setOccupants] = useState(TRAVEL_EXAMPLE.occupants);
  const kg = estimateTravelKgCo2e(mode, miles, occupants);
  const distance = parseReturnMiles(miles);

  function saveAndContinue() {
    saveStadiumTravelRecord({
      club,
      matchId: match?.id,
      fixtureName: match?.fixtureName,
      venue: match?.venue,
      matchDate: match?.date,
      mode,
      miles: distance,
      occupants,
    });
    showProjects();
  }

  return (
    <div
      id="plan-match-day-travel"
      onPointerDown={keepHowS4pSlide}
      onFocusCapture={pinHowS4pSlide}
      className="w-full max-w-xl rounded-[1.6rem] border border-emerald-400/30 bg-s4p-paper px-5 py-6 sm:px-6 [touch-action:manipulation] [overflow-anchor:none]"
    >
      <div className="flex items-center gap-2">
        <LeafMark />
        <h3 className="text-xl font-black tracking-tight sm:text-2xl">
          Plan Your Match-Day Travel
        </h3>
      </div>
      <p className="mt-2 text-sm font-semibold leading-6 sm:text-base">
        No postcode. No GPS tracking. Just a simple estimate of your journey to
        the stadium and back.
      </p>
      {match ? (
        <p className="mt-2 text-sm font-semibold">
          Match Day: {match.fixtureName.replace(" v ", " vs ")}
          {match.venue ? ` · ${match.venue}` : ""}
        </p>
      ) : (
        <p className="mt-2 text-sm font-semibold">{club}</p>
      )}

      <fieldset className="mt-5">
        <legend className="text-sm font-bold">How will you travel?</legend>
        <div className="mt-2 space-y-2" role="radiogroup" aria-label="How will you travel?">
          {TRAVEL_MODES.map((row) => {
            const checked = mode === row.id;
            return (
              <button
                key={row.id}
                type="button"
                role="radio"
                aria-checked={checked}
                onPointerDown={keepHowS4pSlide}
                onClick={() => {
                  setMode(row.id);
                  pinHowS4pSlide();
                }}
                className="flex w-full cursor-pointer items-center gap-3 text-left text-sm font-semibold [touch-action:manipulation]"
              >
                <RadioDot checked={checked} />
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
          onFocus={pinHowS4pSlide}
          onChange={(event) => {
            setMiles(event.target.value);
            pinHowS4pSlide();
          }}
          className="mt-2 w-full rounded-full border border-emerald-400/40 bg-s4p-paper px-4 py-3 text-base font-semibold"
        />
      </label>

      {mode === "car" ? (
        <fieldset className="mt-5">
          <legend className="text-sm font-bold">
            People sharing the car, including you
          </legend>
          <div
            className="mt-3 flex flex-wrap items-center gap-4"
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
                  onPointerDown={keepHowS4pSlide}
                  onClick={() => {
                    setOccupants(count);
                    pinHowS4pSlide();
                  }}
                  className="flex cursor-pointer items-center gap-2 text-sm font-semibold [touch-action:manipulation]"
                >
                  <RadioDot checked={checked} />
                  {count}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <p className="mt-6 text-xs font-black uppercase tracking-[0.18em]">
        Your estimated travel footprint
      </p>
      <p
        className="mt-1 text-4xl font-black"
        style={{ color: MARK_GREEN }}
        aria-live="polite"
      >
        {formatTravelKgCo2e(kg)}{" "}
        <span className="text-xl font-black">kg CO2e</span>
      </p>
      <p className="mt-1 text-sm font-semibold">
        Based on your stated return journey and transport choice.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          id="save-match-day-travel"
          disabled={distance <= 0}
          onClick={saveAndContinue}
          className="inline-flex items-center rounded-full bg-s4p-mark px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-black hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          See climate projects <span aria-hidden> →</span>
        </button>
        <button
          type="button"
          onClick={backToIntro}
          className="inline-flex items-center rounded-full border border-emerald-400/40 px-5 py-3 text-sm font-black uppercase tracking-[0.12em]"
        >
          Back
        </button>
      </div>
    </div>
  );
}

async function goAllocateSponsorFunding() {
  const kind = await identifySignedInKind();
  if (kind === "fan") {
    window.location.href = SUPPORTER_CAMPAIGN_PATH;
    return;
  }
  if (kind) {
    const dest = destinationForSignedInKind(kind);
    if (dest && kind !== "fan") {
      window.location.replace(dest);
      return;
    }
  }
  window.location.href = fanLoginPath(SUPPORTER_CAMPAIGN_PATH);
}

function ClubClimateProjectsSheet() {
  const { club, support, match, backToIntro } = useHowYoureSupporting();
  const [projects, setProjects] = useState<ClimateProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromClub, setFromClub] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      setProjects([]);
      setFromClub(false);
      setLoading(false);
    }, 8000);
    void loadClubChosenClimateProjects(club)
      .then((uploaded) => {
        if (cancelled) return;
        window.clearTimeout(timer);
        const list = uploaded?.projects ?? [];
        setProjects(list);
        setFromClub(list.length > 0);
      })
      .catch(() => {
        if (cancelled) return;
        window.clearTimeout(timer);
        setProjects([]);
        setFromClub(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [club]);

  const shown =
    projects.length > 0
      ? projects.map((project) => ({
          name: project.name,
          category: project.category || project.country || "",
        }))
      : FALLBACK_PROJECTS;

  return (
    <div
      id="club-climate-projects"
      onPointerDown={keepHowS4pSlide}
      className="w-full max-w-xl rounded-[1.6rem] border border-emerald-400/30 bg-s4p-paper px-5 py-6 sm:px-6 [touch-action:manipulation] [overflow-anchor:none]"
    >
      <p
        className="text-xs font-black uppercase tracking-[0.22em]"
        style={{ color: MARK_GREEN }}
      >
        {clubPossessive(club)} Climate Projects
      </p>
      <h3 className="mt-2 text-2xl font-black uppercase tracking-tight sm:text-3xl">
        Allocate sponsor funding
      </h3>
      <p className="mt-3 text-sm font-semibold leading-6 sm:text-base">
        {support === "remote"
          ? "You're watching remotely — you still join the same match-day climate mission. Take monies from Sponsors and put them onto the Climate Projects the Sustainability Director chose."
          : "Your stadium trip is on the Match Day travel record. Take monies from Sponsors and allocate them to the Climate Projects the club Sustainability Director selected."}
      </p>
      {match ? (
        <p className="mt-2 text-sm font-semibold">
          {match.fixtureName.replace(" v ", " vs ")}
          {match.venue ? ` · ${match.venue}` : ""}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-5 text-sm font-semibold">
          Loading {clubPossessive(club)} Climate Projects...
        </p>
      ) : (
        <ul className="mt-5 space-y-2">
          {shown.map((project) => (
            <li
              key={project.name}
              className="rounded-2xl border border-emerald-400/30 bg-s4p-paper px-4 py-3"
            >
              <p className="text-sm font-black">{project.name}</p>
              {project.category ? (
                <p className="mt-1 text-xs font-semibold" style={{ color: MINT }}>
                  {project.category}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {!loading && !fromClub ? (
        <p className="mt-4 text-sm font-semibold leading-6">
          Waiting for the Sustainability Director to post this Match Day five.
          These are the kinds of projects clubs choose — FUND-IT still takes you
          to My S4P so you can allocate sponsor funding when the list is live.
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          id="allocate-sponsor-funding"
          onClick={() => void goAllocateSponsorFunding()}
          className="inline-flex items-center rounded-full bg-s4p-mark px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-black hover:brightness-110"
        >
          {FUND_IT_LABEL} <span aria-hidden> →</span>
        </button>
        <a
          href={FAN_REGISTER_PATH}
          className="inline-flex items-center rounded-full border border-emerald-400/40 px-5 py-3 text-sm font-black uppercase tracking-[0.12em]"
        >
          Register as a fan
        </a>
        <button
          type="button"
          onClick={backToIntro}
          className="inline-flex items-center rounded-full border border-emerald-400/40 px-5 py-3 text-sm font-black uppercase tracking-[0.12em]"
        >
          Back
        </button>
      </div>
    </div>
  );
}

export function HowYoureSupportingPanel({
  badge,
  title,
  number,
  caption,
  points,
}: {
  badge: string;
  title: string;
  number: string;
  caption: string;
  points: string[];
}) {
  const { view, chooseAttending, chooseRemote } = useHowYoureSupporting();
  if (view === "travel") {
    return (
      <div className="min-w-0 flex-1">
        <PlanMatchDayTravelSheet />
      </div>
    );
  }
  if (view === "projects") {
    return (
      <div className="min-w-0 flex-1">
        <ClubClimateProjectsSheet />
      </div>
    );
  }

  return (
    <div className="min-w-0 flex-1">
      <p
        className="text-xs font-black uppercase tracking-[0.22em]"
        style={{ color: MARK_GREEN }}
      >
        {badge}
      </p>
      <h3 className="mt-2 text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl md:text-5xl">
        {number.replace(/^0/, "")}. {title}
      </h3>
      <p className="mt-4 max-w-xl text-base font-semibold leading-7 sm:text-lg sm:leading-8">
        {caption}
      </p>
      <ul className="mt-5 space-y-3">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-3">
            <span
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-sm font-black text-black"
              style={{ backgroundColor: MARK_GREEN }}
              aria-hidden
            >
              ✓
            </span>
            <span className="text-sm font-semibold leading-6 sm:text-base">
              {point}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex max-w-xl flex-col gap-3 sm:flex-row">
        <button
          type="button"
          id="continue-attending-match"
          onPointerDown={stopCarouselSwipe}
          onClick={chooseAttending}
          className="inline-flex items-center justify-center rounded-full bg-s4p-mark px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-black hover:brightness-110 [touch-action:manipulation]"
        >
          I&apos;m attending the match <span aria-hidden> →</span>
        </button>
        <button
          type="button"
          id="continue-watching-remotely"
          onPointerDown={stopCarouselSwipe}
          onClick={chooseRemote}
          className="inline-flex items-center justify-center rounded-full bg-s4p-mark px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-black hover:brightness-110 [touch-action:manipulation]"
        >
          I&apos;m watching remotely <span aria-hidden> →</span>
        </button>
      </div>
    </div>
  );
}
