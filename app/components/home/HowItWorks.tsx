"use client";

import type { ReactNode } from "react";
import Image from "next/image";

const MARK_GREEN = "#5bc662";
const ACCESS_JOIN_ID = "access-join";

function PhoneStep({
  id,
  src,
  alt,
  width,
  height,
  caption,
  priority = false,
  children,
}: {
  id?: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
  priority?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      id={id}
      className={`flex flex-col items-center${id ? " scroll-mt-24" : ""}`}
    >
      <div className="relative w-full max-w-[22rem]">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="h-auto w-full"
          unoptimized
          priority={priority}
        />
        {children}
      </div>
      <p className="mt-5 max-w-[22rem] text-center text-base font-semibold leading-7 sm:text-lg">
        {caption}
      </p>
    </div>
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

      <div className="mx-auto max-w-[1800px] px-6 pb-4 pt-10 md:px-12 xl:px-16">
        <div className="grid grid-cols-1 items-start gap-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 xl:gap-x-6 xl:gap-y-12">
          <PhoneStep
            id={ACCESS_JOIN_ID}
            src="/images/home/access-join-phone.png"
            alt="Access and join Score-For-Planet. Same passion. Cleaner planet. Scan the QR code to join, create an account, or log in."
            width={248}
            height={662}
            caption="Join in seconds. A free account gives you access to your club's matches, predictions and climate impact features."
            priority
          >
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
          </PhoneStep>

          <PhoneStep
            src="/images/home/select-match-phone.png"
            alt="Select match. Choose your club and match from the calendar. Arsenal fixtures including Arsenal vs Chelsea at Emirates Stadium."
            width={247}
            height={671}
            caption="Pick the upcoming match you want to take part in. See key details, kick-off time and the climate mission."
          />

          <PhoneStep
            src="/images/home/how-youre-supporting-phone.png"
            alt="How you're supporting. Tell us if you're attending the match or watching remotely. Arsenal vs Chelsea at Emirates Stadium."
            width={252}
            height={662}
            caption="Both stadium and remote fans are part of the same match-day climate mission."
          />

          <PhoneStep
            src="/images/home/plan-your-travel-phone.png"
            alt="Plan your travel. Simple input. No postcode. Just your estimated miles and travel type. Arsenal vs Chelsea travel footprint."
            width={244}
            height={659}
            caption="Estimate your return distance, choose your transport type and see your estimated travel emissions. No tracking. No postcode."
          />

          <PhoneStep
            src="/images/home/match-day-climate-mission-phone.png"
            alt="Match day climate mission. See the live carbon target, funding progress and all four sponsor channels. Arsenal vs Chelsea."
            width={256}
            height={656}
            caption="See the live carbon target, progress and how each sponsor channel is contributing to the match-day climate mission."
          />

          <PhoneStep
            src="/images/home/choose-direct-impact-phone.png"
            alt="Choose and direct your impact. Use your Fan Carbon Wallet to allocate sponsor-funded money to climate projects."
            width={255}
            height={656}
            caption="Choose from five club-approved climate projects and direct your sponsor-funded money to the areas that matter most to you."
          />
        </div>
      </div>
    </section>
  );
}
