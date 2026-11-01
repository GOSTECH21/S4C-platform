"use client";

import { hardNavigateOnClick } from "@/app/lib/hard-navigate";
import {
  CLUB_REGISTER_PATH,
  FAN_REGISTER_PATH,
} from "@/app/lib/routes";

const MINT = "#0c5c2c";

export default function HomeJoinMission({
  onPlayP4P,
}: {
  onPlayP4P: () => void;
}) {
  return (
    <section
      id="join-s4p-community"
      className="scroll-mt-24 px-4 pb-2 pt-4 md:px-8"
    >
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4">
        <article
          aria-labelledby="club-director-heading"
          data-club-director-copy="club-sponsorship-copy-v1"
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
            className="mt-3 text-[1.45rem] font-black uppercase leading-snug tracking-tight sm:text-4xl"
          >
            Turn Match Day Scores into sponsorship for Climate Projects
          </h2>
          <p className="mt-4 max-w-4xl text-base font-semibold leading-7 sm:text-lg sm:leading-8">
            Give your club a new way to engage supporters, attract global and
            local sponsors, fund approved climate projects and demonstrate
            measurable progress.
          </p>
          <p className="mt-4 max-w-4xl text-base font-semibold leading-7 sm:text-lg sm:leading-8">
            From scoring moments to live fan predictions, S4P creates new
            commercial opportunities around every match.
          </p>
          <a
            href={CLUB_REGISTER_PATH}
            onClick={(event) => hardNavigateOnClick(CLUB_REGISTER_PATH, event)}
            data-club-cta="club-cta-one-line-v1"
            className="mt-8 flex w-full cursor-pointer items-center justify-center whitespace-nowrap rounded-full bg-s4p-mark px-3 py-3.5 text-[0.72rem] font-black uppercase tracking-[0.06em] text-black hover:brightness-110 sm:px-6 sm:py-4 sm:text-base sm:tracking-[0.18em]"
          >
            Explore club partnership <span aria-hidden> →</span>
          </a>
        </article>

        <article
          aria-labelledby="fan-join-heading"
          data-fan-join-copy="fan-p4p-tabs-v1"
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
            Over 50% of a Match Day carbon emissions is from fans travelling to
            a Stadium to watch their team play. Help them address Match Day
            emissions; join S4P for free. Play{" "}
            <span className="whitespace-nowrap">Predict-4-Planet (P4P)</span>{" "}
            in-game entertainment to generate sponsored-funding for Climate Projects.
          </p>
          <div
            data-fan-join-tabs="fan-p4p-tabs-v1"
            className="mt-8 grid grid-cols-2 gap-2"
          >
            <a
              href={FAN_REGISTER_PATH}
              data-fan-join-tab="join-free"
              onClick={(event) => hardNavigateOnClick(FAN_REGISTER_PATH, event)}
              className="flex w-full cursor-pointer items-center justify-center whitespace-nowrap rounded-full bg-s4p-mark px-3 py-3.5 text-[0.72rem] font-black uppercase tracking-[0.06em] text-black hover:brightness-110 sm:px-4 sm:text-sm sm:tracking-[0.12em]"
            >
              Join free
            </a>
            <button
              type="button"
              data-fan-join-tab="play-p4p"
              onClick={onPlayP4P}
              className="flex w-full cursor-pointer items-center justify-center whitespace-nowrap rounded-full bg-s4p-mark px-3 py-3.5 text-[0.72rem] font-black uppercase tracking-[0.06em] text-black hover:brightness-110 sm:px-4 sm:text-sm sm:tracking-[0.12em]"
            >
              Play P4P
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
