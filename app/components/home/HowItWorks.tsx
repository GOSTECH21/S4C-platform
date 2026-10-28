"use client";
/* s4p-predict-for-planet-v2 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import SelectMatchFixtures, {
  SelectMatchPhone,
  SelectMatchProvider,
} from "@/app/components/home/SelectMatchFixtures";
import {
  HowYoureSupportingPanel,
  HowYoureSupportingPhone,
  HowYoureSupportingProvider,
} from "@/app/components/home/HowYoureSupporting";
import {
  PredictForPlanetPanel,
  PredictForPlanetPhone,
} from "@/app/components/home/PredictForPlanet";
import {
  p4pHowItWorksCaption,
  p4pHowItWorksPoints,
} from "@/app/lib/predict-for-planet";

const MARK_GREEN = "#5bc662";
const MINT = "#0c5c2c";
const ACCESS_JOIN_ID = "access-join";
const STEP_TAB_CLASS =
  "inline-flex items-center rounded-full bg-s4p-mark px-3 py-1 text-sm font-black text-black";

const ACCESS_JOIN_HOTSPOTS: Array<{
  label: string;
  intent: "register" | "login";
  className: string;
}> = [
  {
    label: "Scan QR to join",
    intent: "register",
    className: "left-[20%] top-[36%] h-[32%] w-[60%] rounded-lg",
  },
  {
    label: "Join via website",
    intent: "register",
    className: "left-[11%] top-[73.5%] h-[10%] w-[19%] rounded-xl",
  },
  {
    label: "Join via App Store",
    intent: "register",
    className: "left-[30.5%] top-[73.5%] h-[10%] w-[19%] rounded-xl",
  },
  {
    label: "Join via Google Play",
    intent: "register",
    className: "left-[50%] top-[73.5%] h-[10%] w-[19%] rounded-xl",
  },
  {
    label: "Join via TV or broadcast",
    intent: "register",
    className: "left-[69.5%] top-[73.5%] h-[10%] w-[19%] rounded-xl",
  },
  {
    label: "Create Account",
    intent: "register",
    className: "left-[12%] top-[84.2%] h-[5.8%] w-[76%] rounded-full",
  },
  {
    label: "Log in",
    intent: "login",
    className: "left-[28%] top-[90.6%] h-[4%] w-[44%] rounded-md",
  },
];

const PROJECTS: Array<{ title: string; icon: "bus" | "solar" | "recycle" | "tree" | "people" }> =
  [
    { title: "Sustainable Fan Travel Initiatives", icon: "bus" },
    { title: "Stadium Renewable Energy", icon: "solar" },
    { title: "Waste Reduction & Circular Economy", icon: "recycle" },
    { title: "UK Reforestation & Woodland Creation", icon: "tree" },
    { title: "Community Climate Education", icon: "people" },
  ];

const steps: Array<{
  src: string;
  alt: string;
  width: number;
  height: number;
  number: string;
  title: string;
  caption: string;
  points: string[];
}> = [
  {
    src: "/images/home/access-join-phone.png",
    alt: "Access and join Score-For-Planet. Same passion. Cleaner planet. Scan the QR code to join, create an account, or log in.",
    width: 248,
    height: 584,
    number: "01",
    title: "Access & Join",
    caption:
      "Join in seconds. A free account gives you access to your club's matches, predictions and climate impact features.",
    points: [
      "Create a free account in seconds",
      "Join by QR, website, app or TV",
      "Open your club's matches, predictions and climate impact features",
    ],
  },
  {
    src: "/images/home/select-match-phone.png",
    alt: "Select match. Choose your club and see their next 10 upcoming league and cup matches.",
    width: 247,
    height: 589,
    number: "02",
    title: "Select Match",
    caption:
      "Pick the upcoming match you want to take part in. See key details, kick-off time and the climate mission.",
    points: [
      "Choose your club from My Club",
      "Pick an upcoming fixture from the calendar",
      "See kick-off time, venue and the climate mission",
    ],
  },
  {
    src: "/images/home/how-youre-supporting-phone.png",
    alt: "How you're supporting. Tell us if you're attending the match or watching remotely. Arsenal vs Chelsea at Emirates Stadium.",
    width: 252,
    height: 585,
    number: "03",
    title: "How You're Supporting",
    caption:
      "Both stadium and remote fans are part of the same match-day climate mission.",
    points: [
      "Tell us if you are attending or watching remotely",
      "Stadium and remote fans both join Predict-For Planet during the match",
      "Remote fans join the same match-day climate mission",
    ],
  },
  {
    src: "/images/home/plan-your-travel-phone.png",
    alt: "Predict-For Planet. Choose what is likely to happen in the next 5-minute slot of the match. One prediction per slot.",
    width: 244,
    height: 581,
    number: "04",
    title: "Predict-For Planet",
    caption: p4pHowItWorksCaption(),
    points: p4pHowItWorksPoints(),
  },
  {
    src: "/images/home/match-day-climate-mission-phone.png",
    alt: "Match day climate mission. See the live carbon target, funding progress and all four sponsor channels. Arsenal vs Chelsea.",
    width: 254,
    height: 582,
    number: "05",
    title: "Match Day Climate Mission",
    caption:
      "See the live carbon target, progress and how each sponsor channel is contributing to the match-day climate mission.",
    points: [
      "See the live carbon target and funding progress",
      "Split fan travel and other match-day emissions",
      "See how each sponsor channel is contributing",
    ],
  },
  {
    src: "/images/home/choose-direct-impact-phone.png",
    alt: "Choose and direct your impact. Use your Fan Carbon Wallet to allocate sponsor-funded money to climate projects.",
    width: 251,
    height: 581,
    number: "06",
    title: "Direct Your Impact",
    caption:
      "Use your Fan Carbon Wallet to allocate sponsor-funded money to the club's approved climate projects. Choose from five club-approved climate projects and direct your sponsor-funded money to the areas that matter most to you.",
    points: [
      "See all your unlocked contributions in one place",
      "Choose from five club-approved climate projects",
      "Help tackle fan travel and stadium emissions",
      "Make a real, measurable difference",
    ],
  },
];

function StepArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-how-s4p-arrow={direction}
      aria-label={
        direction === "left"
          ? "Show the previous How S4P Works step"
          : "Show the following How S4P Works step"
      }
      disabled={disabled}
      onClick={onClick}
      className={`absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-s4p-mark text-black shadow-sm hover:brightness-110 disabled:pointer-events-none disabled:opacity-50 lg:inline-flex ${
        direction === "left" ? "left-0" : "right-0"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        aria-hidden
      >
        {direction === "left" ? (
          <path
            d="M15 6 9 12l6 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M9 6l6 6-6 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  );
}

function ProjectIcon({
  name,
}: {
  name: (typeof PROJECTS)[number]["icon"];
}) {
  const common = "h-8 w-8";
  if (name === "bus") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill={MARK_GREEN} aria-hidden>
        <path d="M6 4h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1.2l.7 1.6H16l-.7-1.6H8.7L8 19.6H5.5L6.2 18H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v6h12V6H6Zm1.6 8.2a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Zm8.8 0a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z" />
      </svg>
    );
  }
  if (name === "solar") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill={MARK_GREEN} aria-hidden>
        <path d="M11 2h2v3h-2V2ZM4.6 5.2 6 6.6 4 8.6 2.6 7.2 4.6 5.2Zm14.8 0 2 2L19.4 8.6 18 6.6l1.4-1.4ZM12 6.5A5.5 5.5 0 1 1 6.5 12 5.5 5.5 0 0 1 12 6.5ZM2 11h3v2H2v-2Zm17 0h3v2h-3v-2ZM4 15.4 6 17.4 4.6 18.8 2.6 16.8 4 15.4Zm16 0 1.4 1.4-2 2-1.4-1.4 2-2ZM11 19h2v3h-2v-3Z" />
      </svg>
    );
  }
  if (name === "recycle") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill={MARK_GREEN} aria-hidden>
        <path d="M12 3 8.2 9.4h2.1l1.7-2.9 3.7 6.3H12v2.2h8.4L16.2 7.4 14.8 8l1.4 2.4-2.2-3.7L12 3ZM5.4 11.2 3.6 14.3 2 13.4l2.6 4.6 7.2.1-1.1-2H7.2l1.5-2.6-3.3-2.3Z" />
      </svg>
    );
  }
  if (name === "tree") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill={MARK_GREEN} aria-hidden>
        <path d="M12 2.4 7 9h2.8L6.4 14H9v7.6h2.2v-4.2h1.6v4.2H15V14h2.6l-3.4-5H17L12 2.4Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={common} fill={MARK_GREEN} aria-hidden>
      <path d="M8.2 9.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Zm7.6 0a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8ZM3.6 19c.4-2.8 2.6-4.7 5.1-4.7 1 0 1.9.3 2.7.8-.4.7-.7 1.5-.8 2.4l-.2 1.5H3.6Zm9.2 0 .2-1.6c.2-1.6 1-3 2.2-3.9 1 .5 2.1.8 3.3.8 2.5 0 4.6-1.7 5.1-4.5h-3.8c-.3 1.2-1.3 2.1-2.5 2.4-1 .2-1.9-.1-2.5-.7-.4.7-.6 1.5-.7 2.3L13 19h-.2Z" />
    </svg>
  );
}

export default function HowItWorks({
  onCreateAccount,
  onLogin,
}: {
  onCreateAccount: () => void;
  onLogin: () => void;
}) {
  const [index, setIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const go = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(steps.length - 1, next));
    const scroller = scrollerRef.current;
    if (!scroller) {
      setIndex(clamped);
      return;
    }
    scroller.scrollTo({
      left: clamped * scroller.clientWidth,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    function onScroll() {
      const el = scrollerRef.current;
      if (!el || el.clientWidth === 0) return;
      const next = Math.round(el.scrollLeft / el.clientWidth);
      setIndex(Math.max(0, Math.min(steps.length - 1, next)));
    }
    function pinToNearestSlide() {
      const el = scrollerRef.current;
      if (!el || el.clientWidth === 0) return;
      const slide = Math.max(
        0,
        Math.min(
          steps.length - 1,
          Math.round(el.scrollLeft / el.clientWidth)
        )
      );
      const left = slide * el.clientWidth;
      if (Math.abs(el.scrollLeft - left) > 2) {
        el.scrollLeft = left;
      }
    }
    scroller.addEventListener("scroll", onScroll, { passive: true });
    scroller.addEventListener("focusin", pinToNearestSlide);
    scroller.addEventListener("pointerup", pinToNearestSlide);
    const resize = new ResizeObserver(() => pinToNearestSlide());
    resize.observe(scroller);
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      scroller.removeEventListener("focusin", pinToNearestSlide);
      scroller.removeEventListener("pointerup", pinToNearestSlide);
      resize.disconnect();
    };
  }, []);

  return (
    <SelectMatchProvider active>
      <HowYoureSupportingProvider>
      <section id="how-s4p-works" className="overflow-x-hidden pb-8 md:pb-12">
      <div className="border-y border-emerald-400/20">
        <div className="mx-auto max-w-[1600px] px-5 py-5 md:px-10 xl:py-5">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl xl:text-[2.4rem]">
              How S<span style={{ color: MARK_GREEN }}>4</span>P Works
            </h2>
            <p className="mt-2 text-sm font-bold uppercase leading-6 tracking-tight sm:text-base">
              Same passion. Cleaner planet.
            </p>
            <p
              className="mt-1 text-base font-black uppercase leading-6 tracking-tight sm:text-lg"
              style={{ color: MINT }}
            >
              Every score counts. Every fan counts.
            </p>
          </div>
        </div>
      </div>

      <div
        id={ACCESS_JOIN_ID}
        className="mx-auto max-w-[1400px] scroll-mt-24 px-4 pb-4 pt-8 md:px-8"
      >
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="How S4P Works steps"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") {
              event.preventDefault();
              go(index + 1);
            }
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              go(index - 1);
            }
          }}
          className="s4p-navy-panel overflow-hidden rounded-[1.75rem] border border-emerald-400/30 px-3 py-6 outline-none sm:px-6 sm:py-8 md:px-8"
        >
          <p className="mb-5 text-center text-sm font-semibold">
            Explore the six steps below.
          </p>
          <div className="relative lg:px-16">
          <StepArrow
            direction="left"
            disabled={index === 0}
            onClick={() => go(index - 1)}
          />
          <div
            ref={scrollerRef}
            data-how-s4p-scroller
            className="w-full min-w-0 snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div
              className="flex"
              style={{ width: `${steps.length * 100}%` }}
            >
            {steps.map((step, stepIndex) => (
              <article
                key={step.number}
                className="max-w-none shrink-0 snap-start snap-always"
                style={{ flex: `0 0 ${100 / steps.length}%` }}
                aria-label={`Step ${stepIndex + 1} of ${steps.length}. ${step.title}`}
              >
                <div className="flex min-w-0 flex-col items-center gap-8 px-1 lg:flex-row lg:items-center lg:gap-12">
                  <div className="relative w-full max-w-[18rem] shrink-0 overflow-hidden sm:max-w-[20rem]">
                    {stepIndex === 1 ? (
                      <SelectMatchPhone src={step.src} alt={step.alt} />
                    ) : stepIndex === 2 ? (
                      <HowYoureSupportingPhone src={step.src} alt={step.alt} />
                    ) : stepIndex === 3 ? (
                      <PredictForPlanetPhone src={step.src} alt={step.alt} />
                    ) : (
                      <Image
                        src={step.src}
                        alt={step.alt}
                        width={step.width}
                        height={step.height}
                        className="h-auto w-full"
                        unoptimized
                        priority={stepIndex === 0}
                      />
                    )}
                    {stepIndex === 0
                      ? ACCESS_JOIN_HOTSPOTS.map((spot) => (
                          <button
                            key={spot.label}
                            type="button"
                            aria-label={spot.label}
                            onClick={
                              spot.intent === "login"
                                ? onLogin
                                : onCreateAccount
                            }
                            className={`absolute z-10 cursor-pointer hover:ring-2 hover:ring-[#5bc662] ${spot.className}`}
                          />
                        ))
                      : null}
                  </div>
                  {stepIndex === 2 ? (
                    <HowYoureSupportingPanel
                      badge={`Step ${stepIndex + 1} of ${steps.length}`}
                      title={step.title}
                      number={step.number}
                      caption={step.caption}
                      points={step.points}
                    />
                  ) : stepIndex === 3 ? (
                    <PredictForPlanetPanel
                      badge={`Step ${stepIndex + 1} of ${steps.length}`}
                      title={step.title}
                      number={step.number}
                      caption={step.caption}
                      points={step.points}
                    />
                  ) : (
                  <div className="min-w-0 flex-1">
                    <p className={STEP_TAB_CLASS}>
                      Step {stepIndex + 1} of {steps.length}
                    </p>
                    <h3 className="mt-2 text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl md:text-5xl">
                      {step.number.replace(/^0/, "")}. {step.title}
                    </h3>
                    <p className="mt-4 max-w-xl text-base font-semibold leading-7 sm:text-lg sm:leading-8">
                      {step.caption}
                    </p>
                    <ul className="mt-5 space-y-3">
                      {step.points.map((point) => (
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
                    {stepIndex === 0 ? (
                      <button
                        type="button"
                        onClick={onCreateAccount}
                        className="mt-6 inline-flex items-center rounded-full bg-s4p-mark px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-black hover:brightness-110"
                      >
                        Create your free account <span aria-hidden> →</span>
                      </button>
                    ) : null}
                    {stepIndex === 1 ? <SelectMatchFixtures /> : null}
                    {stepIndex === steps.length - 1 ? (
                      <>
                        <p
                          className="mt-5 max-w-xs text-sm font-black uppercase leading-6"
                          style={{ color: MARK_GREEN }}
                        >
                          Fans fund it. Fans direct it. Real change happens.
                        </p>
                        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
                          {PROJECTS.map((project) => (
                            <div
                              key={project.title}
                              className="flex flex-col items-center rounded-2xl border border-emerald-400/30 bg-s4p-paper px-2 py-3 text-center"
                            >
                              <ProjectIcon name={project.icon} />
                              <p className="mt-2 text-[0.7rem] font-black leading-tight">
                                {project.title}
                              </p>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : null}
                  </div>
                  )}
                </div>
              </article>
            ))}
            </div>
          </div>
          <StepArrow
            direction="right"
            disabled={index === steps.length - 1}
            onClick={() => go(index + 1)}
          />
          </div>
          <div className="mt-6 flex items-center justify-center gap-2">
            {steps.map((item, stepIndex) => (
              <button
                key={item.number}
                type="button"
                aria-label={`Go to step ${item.number}, ${item.title}`}
                aria-current={stepIndex === index ? "true" : undefined}
                onClick={() => go(stepIndex)}
                className={`h-2.5 rounded-full ${
                  stepIndex === index
                    ? "w-8 bg-s4p-mark"
                    : "w-2.5 bg-emerald-400/40 hover:bg-emerald-400/70"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      </section>
      </HowYoureSupportingProvider>
    </SelectMatchProvider>
  );
}
