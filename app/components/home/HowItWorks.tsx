"use client";

import Image from "next/image";

const MARK_GREEN = "#5bc662";
const ACCESS_JOIN_ID = "access-join";

const steps: Array<{
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

function StepCard({
  step,
  onCreateAccount,
  onLogin,
  priority = false,
}: {
  step: (typeof steps)[number];
  onCreateAccount: () => void;
  onLogin: () => void;
  priority?: boolean;
}) {
  return (
    <article
      aria-label={`Step ${step.number} of 06, ${step.title}`}
      className="flex flex-row items-center gap-3 xl:gap-4"
    >
      <div className="relative w-[38%] max-w-[11rem] shrink-0">
        <Image
          src={step.src}
          alt={step.alt}
          width={step.width}
          height={step.height}
          className="h-auto w-full"
          unoptimized
          priority={priority}
        />
        {step.number === "01" ? (
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
        <p className="text-xs font-black uppercase tracking-[0.18em]">
          <span style={{ color: MARK_GREEN }}>{step.number}</span>
          <span className="text-black/40"> / 06</span>
        </p>
        <h3 className="mt-1 text-sm font-black uppercase leading-tight xl:text-base">
          {step.title}
        </h3>
        <p className="mt-2 text-sm font-semibold leading-6 xl:text-[0.95rem] xl:leading-7">
          {step.caption}
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
        className="mx-auto max-w-[1800px] scroll-mt-24 px-5 pb-4 pt-8 md:px-10 xl:px-12"
      >
        <div className="grid grid-cols-1 items-start gap-x-8 gap-y-10 lg:grid-cols-3">
          {steps.map((step, index) => (
            <StepCard
              key={step.number}
              step={step}
              onCreateAccount={onCreateAccount}
              onLogin={onLogin}
              priority={index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
