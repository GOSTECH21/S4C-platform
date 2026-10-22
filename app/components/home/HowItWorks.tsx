"use client";

import { useCallback, useState } from "react";
import Image from "next/image";

const MARK_GREEN = "#5bc662";
const ACCESS_JOIN_ID = "access-join";

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
  badge: string;
  title: string;
  caption: string;
  points: string[];
}> = [
  {
    src: "/images/home/access-join-phone.png",
    alt: "Access and join Score-For-Planet. Same passion. Cleaner planet. Scan the QR code to join, create an account, or log in.",
    width: 248,
    height: 662,
    number: "01",
    badge: "Step 1",
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
    alt: "Select match. Choose your club and match from the calendar. Arsenal fixtures including Arsenal vs Chelsea at Emirates Stadium.",
    width: 247,
    height: 671,
    number: "02",
    badge: "Step 2",
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
    height: 662,
    number: "03",
    badge: "Step 3",
    title: "How You're Supporting",
    caption:
      "Both stadium and remote fans are part of the same match-day climate mission.",
    points: [
      "Tell us if you are attending or watching remotely",
      "Stadium fans plan travel and help cut fan-travel emissions",
      "Remote fans join the same match-day climate mission",
    ],
  },
  {
    src: "/images/home/plan-your-travel-phone.png",
    alt: "Plan your travel. Simple input. No postcode. Just your estimated miles and travel type. Arsenal vs Chelsea travel footprint.",
    width: 244,
    height: 659,
    number: "04",
    badge: "Step 4",
    title: "Plan Your Travel",
    caption:
      "Estimate your return distance, choose your transport type and see your estimated travel emissions. No tracking. No postcode.",
    points: [
      "Enter your estimated return distance in miles",
      "Choose car, train, bus, coach or walk",
      "See your estimated travel emissions. No tracking. No postcode.",
    ],
  },
  {
    src: "/images/home/match-day-climate-mission-phone.png",
    alt: "Match day climate mission. See the live carbon target, funding progress and all four sponsor channels. Arsenal vs Chelsea.",
    width: 256,
    height: 656,
    number: "05",
    badge: "Step 5",
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
    width: 255,
    height: 656,
    number: "06",
    badge: "Final step",
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

function ArrowButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-emerald-400/40 bg-s4p-paper text-2xl font-black leading-none shadow-sm hover:bg-s4p-mark sm:h-14 sm:w-14 sm:text-3xl"
    >
      {children}
    </button>
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
  const step = steps[index];
  const isLast = index === steps.length - 1;

  const go = useCallback((next: number) => {
    setIndex((next + steps.length) % steps.length);
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
        className="mx-auto max-w-[1400px] scroll-mt-24 px-4 pb-4 pt-8 md:px-8"
      >
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="How S4P Works, one step at a time"
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
          className="s4p-navy-panel rounded-[1.75rem] border border-emerald-400/30 px-3 py-6 outline-none sm:px-6 sm:py-8 md:px-8"
        >
          <p className="mb-5 inline-flex items-center rounded-full bg-s4p-mark px-3 py-1 text-sm font-black text-black">
            {index + 1} of 6
          </p>
          <div className="flex items-center gap-3 md:gap-6">
            <ArrowButton label="Previous step" onClick={() => go(index - 1)}>
              ‹
            </ArrowButton>
            <div className="flex min-w-0 flex-1 flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-12">
              <div className="relative w-full max-w-[18rem] shrink-0 sm:max-w-[20rem]">
                <Image
                  src={step.src}
                  alt={step.alt}
                  width={step.width}
                  height={step.height}
                  className="h-auto w-full"
                  unoptimized
                  priority={index === 0}
                />
                {index === 0 ? (
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
                <p
                  className="text-xs font-black uppercase tracking-[0.22em]"
                  style={{ color: MARK_GREEN }}
                >
                  {step.badge}
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
                {isLast ? (
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
            </div>
            <ArrowButton label="Next step" onClick={() => go(index + 1)}>
              »
            </ArrowButton>
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
  );
}
