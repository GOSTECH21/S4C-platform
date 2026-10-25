"use client";

import { hardNavigateOnClick } from "@/app/lib/hard-navigate";
import {
  CLUB_REGISTER_PATH,
  FAN_REGISTER_PATH,
} from "@/app/lib/routes";

const MARK_GREEN = "#5bc662";
const MINT = "#0c5c2c";

const CLUB_POINTS: Array<{
  title: string;
  icon: "bars" | "fans" | "channels" | "leaf";
}> = [
  { title: "Emissions measurement", icon: "bars" },
  { title: "Global fan engagement", icon: "fans" },
  { title: "Four funding channels", icon: "channels" },
  { title: "Transparent project reporting", icon: "leaf" },
];

function ClubPointIcon({
  name,
}: {
  name: (typeof CLUB_POINTS)[number]["icon"];
}) {
  const common = "mt-0.5 h-6 w-6 shrink-0";
  const stroke = {
    fill: "none",
    stroke: MARK_GREEN,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (name === "bars") {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden>
        <path {...stroke} d="M5 19V12M10 19V6M15 19V10M20 19V14" />
      </svg>
    );
  }
  if (name === "fans") {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden>
        <path {...stroke} d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle {...stroke} cx="9" cy="7" r="4" />
        <path {...stroke} d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path {...stroke} d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
  if (name === "channels") {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-hidden>
        <path
          {...stroke}
          d="M10 13a5 5 0 0 0 7.54.54l1.42-1.42a5 5 0 0 0-7.07-7.07L10.3 6.63"
        />
        <path
          {...stroke}
          d="M14 11a5 5 0 0 0-7.54-.54L5.04 11.9a5 5 0 0 0 7.07 7.07l1.71-1.71"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={common} aria-hidden>
      <path
        {...stroke}
        d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"
      />
      <path {...stroke} d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

export default function HomeJoinMission() {
  return (
    <section
      id="join-s4p-community"
      className="scroll-mt-24 px-4 pb-2 pt-4 md:px-8"
    >
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4">
        <article
          aria-labelledby="club-director-heading"
          className="s4p-navy-panel rounded-[1.75rem] border border-emerald-400/30 px-6 py-8 shadow-sm sm:px-10 sm:py-9"
        >
          <p
            className="text-xs font-black uppercase tracking-[0.22em]"
            style={{ color: MINT }}
          >
            For club sustainability &amp; commercial directors
          </p>
          <h2
            id="club-director-heading"
            className="mt-3 text-3xl font-black uppercase leading-tight tracking-tight sm:text-4xl"
          >
            Turn every score in a match into a sponsored climate action
          </h2>
          <p className="mt-4 max-w-4xl text-base font-semibold leading-7 sm:text-lg sm:leading-8">
            Turn match-day emissions into a measurable climate funding mission.
            Engage supporters worldwide, unlock new sponsorship opportunities
            and direct funding to approved environmental projects.
          </p>
          <ul className="mt-7 grid gap-4 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-5">
            {CLUB_POINTS.map((point) => (
              <li key={point.title} className="flex items-start gap-3">
                <ClubPointIcon name={point.icon} />
                <p className="font-black leading-tight">{point.title}</p>
              </li>
            ))}
          </ul>
          <a
            href={CLUB_REGISTER_PATH}
            onClick={(event) => hardNavigateOnClick(CLUB_REGISTER_PATH, event)}
            className="mt-8 flex w-full cursor-pointer items-center justify-center rounded-full bg-s4p-mark px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-black hover:brightness-110 sm:text-base"
          >
            Explore club partnership <span aria-hidden> →</span>
          </a>
        </article>

        <article
          aria-labelledby="fan-join-heading"
          className="s4p-navy-panel rounded-[1.75rem] border border-emerald-400/30 px-6 py-8 shadow-sm sm:px-10 sm:py-9"
        >
          <p
            className="text-xs font-black uppercase tracking-[0.22em]"
            style={{ color: MINT }}
          >
            Every fan counts
          </p>
          <h2
            id="fan-join-heading"
            className="mt-3 text-3xl font-black uppercase leading-tight tracking-tight sm:text-4xl"
          >
            Support your team. Help fund climate action.
          </h2>
          <p className="mt-4 max-w-4xl text-base font-semibold leading-7 sm:text-lg sm:leading-8">
            At the stadium or following from anywhere, join S4P for free, take
            part in match-day activities and direct eligible sponsor-funded
            contributions to climate projects.
          </p>
          <a
            href={FAN_REGISTER_PATH}
            onClick={(event) => hardNavigateOnClick(FAN_REGISTER_PATH, event)}
            className="mt-8 inline-flex w-full max-w-md cursor-pointer items-center justify-center rounded-full bg-s4p-mark px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-black hover:brightness-110 sm:text-base"
          >
            Join free <span aria-hidden> →</span>
          </a>
        </article>
      </div>
    </section>
  );
}
