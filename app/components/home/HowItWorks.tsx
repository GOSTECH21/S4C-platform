"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

const MARK_GREEN = "#5bc662";
const ACCESS_JOIN_ID = "access-join";
const DWELL_MS = 14000;
const SLIDE_COUNT = 6;

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

export default function HowItWorks({
  onCreateAccount,
  onLogin,
}: {
  onCreateAccount: () => void;
  onLogin: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const autoplay = !paused && !hidden && !reducedMotion;
  const startedAt = useRef(Date.now());
  const pausedAt = useRef<number | null>(null);

  const goTo = useCallback((next: number) => {
    startedAt.current = Date.now();
    setIndex((next + SLIDE_COUNT) % SLIDE_COUNT);
  }, []);

  useEffect(() => {
    const sync = () => setHidden(document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  useEffect(() => {
    if (paused || hidden) {
      pausedAt.current = Date.now();
      return;
    }
    if (pausedAt.current != null) {
      startedAt.current += Date.now() - pausedAt.current;
      pausedAt.current = null;
    }
  }, [hidden, paused]);

  useEffect(() => {
    if (!autoplay) return;
    const remaining = Math.max(800, DWELL_MS - (Date.now() - startedAt.current));
    const timer = window.setTimeout(() => goTo(index + 1), remaining);
    return () => window.clearTimeout(timer);
  }, [autoplay, goTo, index]);

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

      <div className="mx-auto max-w-[1400px] px-5 pb-4 pt-8 md:px-12 xl:px-16">
        <div
          id={ACCESS_JOIN_ID}
          role="region"
          aria-roledescription="carousel"
          aria-label="How S4P Works, one step at a time"
          tabIndex={0}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") {
              event.preventDefault();
              goTo(index + 1);
            }
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              goTo(index - 1);
            }
          }}
          className="scroll-mt-24 outline-none"
        >
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-1000 ease-in-out motion-reduce:transition-none"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {slides.map((slide, slideIndex) => (
                <article
                  key={slide.number}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Step ${slide.number} of 06, ${slide.title}`}
                  aria-hidden={slideIndex !== index}
                  className={`flex w-full shrink-0 justify-center px-1 md:px-6 ${
                    slideIndex === index ? "" : "pointer-events-none"
                  }`}
                >
                  <div className="flex w-full max-w-5xl flex-row items-center gap-5 sm:gap-8 md:gap-12">
                  <div className="relative shrink-0">
                    <Image
                      src={slide.src}
                      alt={slide.alt}
                      width={slide.width}
                      height={slide.height}
                      className="h-[min(34rem,60vh)] w-auto max-w-[46vw]"
                      unoptimized
                      priority={slideIndex === 0}
                    />
                    {slideIndex === 0 ? (
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
                    <div className="mt-6 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-emerald-400/25">
                      <div
                        key={index}
                        className={`h-full origin-left rounded-full bg-s4p-mark ${
                          slideIndex === index
                            ? `s4p-carousel-dwell${autoplay ? "" : " s4p-carousel-dwell-paused"}`
                            : "w-0"
                        }`}
                      />
                    </div>
                  </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 md:mt-8">
            <button
              type="button"
              aria-label="Previous step"
              onClick={() => goTo(index - 1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-400/30 bg-s4p-paper text-xl font-black hover:bg-s4p-mark"
            >
              ‹
            </button>
            <div className="flex items-center gap-2">
              {slides.map((slide, slideIndex) => (
                <button
                  key={slide.number}
                  type="button"
                  aria-label={`Go to step ${slide.number}, ${slide.title}`}
                  aria-current={slideIndex === index ? "true" : undefined}
                  onClick={() => goTo(slideIndex)}
                  className={`h-2.5 rounded-full transition-all ${
                    slideIndex === index
                      ? "w-8 bg-s4p-mark"
                      : "w-2.5 bg-emerald-400/40 hover:bg-emerald-400/70"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Next step"
              onClick={() => goTo(index + 1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-400/30 bg-s4p-paper text-xl font-black hover:bg-s4p-mark"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
