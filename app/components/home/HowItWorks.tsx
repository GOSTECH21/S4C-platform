"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import "./how-s4p-works-ticker.css";

const MARK_GREEN = "#5bc662";
const ACCESS_JOIN_ID = "access-join";

const slides: Array<{
  src: string;
  alt: string;
  width: number;
  height: number;
  number: string;
  title: string;
  caption: string;
}> = [
  {
    src: "/images/home/access-join-phone.png",
    alt: "Access and join Score-For-Planet. Same passion. Cleaner planet. Scan the QR code to join, create an account, or log in.",
    width: 248,
    height: 662,
    number: "01",
    title: "Access & Join",
    caption:
      "Join in seconds. A free account gives you access to your club's matches, predictions and climate impact features.",
  },
  {
    src: "/images/home/select-match-phone.png",
    alt: "Select match. Choose your club and match from the calendar. Arsenal fixtures including Arsenal vs Chelsea at Emirates Stadium.",
    width: 247,
    height: 671,
    number: "02",
    title: "Select Match",
    caption:
      "Pick the upcoming match you want to take part in. See key details, kick-off time and the climate mission.",
  },
  {
    src: "/images/home/how-youre-supporting-phone.png",
    alt: "How you're supporting. Tell us if you're attending the match or watching remotely. Arsenal vs Chelsea at Emirates Stadium.",
    width: 252,
    height: 662,
    number: "03",
    title: "How You're Supporting",
    caption:
      "Both stadium and remote fans are part of the same match-day climate mission.",
  },
  {
    src: "/images/home/plan-your-travel-phone.png",
    alt: "Plan your travel. Simple input. No postcode. Just your estimated miles and travel type. Arsenal vs Chelsea travel footprint.",
    width: 244,
    height: 659,
    number: "04",
    title: "Plan Your Travel",
    caption:
      "Estimate your return distance, choose your transport type and see your estimated travel emissions. No tracking. No postcode.",
  },
  {
    src: "/images/home/match-day-climate-mission-phone.png",
    alt: "Match day climate mission. See the live carbon target, funding progress and all four sponsor channels. Arsenal vs Chelsea.",
    width: 256,
    height: 656,
    number: "05",
    title: "Match Day Climate Mission",
    caption:
      "See the live carbon target, progress and how each sponsor channel is contributing to the match-day climate mission.",
  },
  {
    src: "/images/home/choose-direct-impact-phone.png",
    alt: "Choose and direct your impact. Use your Fan Carbon Wallet to allocate sponsor-funded money to climate projects.",
    width: 255,
    height: 656,
    number: "06",
    title: "Choose & Direct Your Impact",
    caption:
      "Choose from five club-approved climate projects and direct your sponsor-funded money to the areas that matter most to you.",
  },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return reduced;
}

function SlideCard({
  slide,
  onCreateAccount,
  onLogin,
  priority = false,
}: {
  slide: (typeof slides)[number];
  onCreateAccount: () => void;
  onLogin: () => void;
  priority?: boolean;
}) {
  return (
    <article
      role="group"
      aria-label={`Step ${slide.number} of 06, ${slide.title}`}
      className="flex w-[min(58rem,90vw)] shrink-0 flex-row items-center gap-5 px-6 sm:gap-8 md:gap-12 md:px-12"
    >
      <div className="relative shrink-0">
        <Image
          src={slide.src}
          alt={slide.alt}
          width={slide.width}
          height={slide.height}
          className="h-[min(32rem,56vh)] w-auto max-w-[46vw]"
          unoptimized
          priority={priority}
        />
        {slide.number === "01" ? (
          <>
            <button
              type="button"
              aria-label="Create Account"
              onClick={onCreateAccount}
              className="absolute left-[10%] right-[10%] top-[85%] h-[7%] rounded-full"
            />
            <button
              type="button"
              aria-label="Log in"
              onClick={onLogin}
              className="absolute left-[18%] right-[18%] top-[92%] h-[6%]"
            />
          </>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black uppercase tracking-[0.2em]">
          <span style={{ color: MARK_GREEN }}>{slide.number}</span>
          <span className="text-black/40"> / 06</span>
        </p>
        <h3 className="mt-3 text-xl font-black uppercase leading-tight sm:text-2xl md:text-3xl">
          {slide.title}
        </h3>
        <p className="mt-4 max-w-xl text-base font-semibold leading-7 sm:text-lg sm:leading-8 md:text-2xl md:leading-10">
          {slide.caption}
        </p>
      </div>
    </article>
  );
}

export default function HowItWorks({
  onCreateAccount,
  onLogin,
}: {
  onCreateAccount: () => void;
  onLogin: () => void;
}) {
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const tape = reducedMotion ? slides : [...slides, ...slides];
  const tickerPaused = paused || hidden || reducedMotion;

  useEffect(() => {
    const sync = () => setHidden(document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  return (
    <section id="how-s4p-works" className="pb-8 md:pb-12">
      <div className="border-y border-emerald-400/20">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-5 px-5 py-5 md:px-10 xl:flex-row xl:items-center xl:justify-between xl:gap-8 xl:py-4 xl:pr-44">
          <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
            <Image
              src="/images/home/s4p-lockup.png"
              alt="S4P SCORE-FOR-PLANET"
              width={1087}
              height={458}
              className="h-[4.75rem] w-auto shrink-0 sm:h-20"
              unoptimized
            />
            <div className="hidden h-16 w-px shrink-0 border-l border-emerald-400/40 sm:block" />
            <div className="min-w-0">
              <h2 className="text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl xl:text-[2.4rem]">
                How S<span style={{ color: MARK_GREEN }}>4</span>P Works
              </h2>
              <p className="mt-2 text-sm font-bold uppercase leading-6 sm:text-base">
                Same passion. Cleaner planet.{" "}
                <span style={{ color: MARK_GREEN }}>
                  Every score counts. Every fan counts.
                </span>
              </p>
            </div>
          </div>
          <p className="shrink-0 -rotate-3 self-start rounded-md bg-s4p-mark px-4 py-3 text-center text-sm font-black uppercase leading-tight text-black shadow-sm xl:self-center xl:px-5 xl:text-base">
            A quick guide to
            <br />
            making a real difference
          </p>
        </div>
      </div>

      <div
        id={ACCESS_JOIN_ID}
        role="region"
        aria-roledescription="marquee"
        aria-label="How S4P Works ticker. Each phone sits on the left with its caption on the right."
        className={`s4p-ticker scroll-mt-24 pt-8 ${
          tickerPaused ? "s4p-ticker-paused" : ""
        }`}
      >
        <div
          className={`s4p-ticker-mask ${
            reducedMotion ? "overflow-x-auto" : "overflow-hidden"
          }`}
        >
          <div className="s4p-ticker-track flex w-max">
            {tape.map((slide, tapeIndex) => (
              <SlideCard
                key={`${tapeIndex}-${slide.number}`}
                slide={slide}
                onCreateAccount={onCreateAccount}
                onLogin={onLogin}
                priority={tapeIndex === 0}
              />
            ))}
          </div>
        </div>
        <div className="mt-5 flex flex-col items-center gap-2 px-5 pb-2">
          <button
            type="button"
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
            className="rounded-full border border-emerald-400/30 bg-s4p-paper px-5 py-2 text-sm font-black uppercase tracking-wide hover:bg-s4p-mark"
          >
            {paused ? "Play ticker" : "Pause ticker"}
          </button>
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-black/50">
            Hover to pause. Each step is on screen long enough to read.
          </p>
        </div>
      </div>
    </section>
  );
}
