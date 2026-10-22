"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { HOME_STAKEHOLDERS } from "@/app/lib/home-stakeholders";
import HomeTopBanner from "@/app/components/home/HomeTopBanner";
import HowItWorks from "@/app/components/home/HowItWorks";

const JOIN_SECTION_ID = "are-you";
const ACCESS_JOIN_ID = "access-join";

type JoinIntent = "login" | "register";

function joinIntentFromLocation(): JoinIntent | null {
  if (typeof window === "undefined") return null;
  const join = new URLSearchParams(window.location.search).get("join");
  if (join === "login" || join === "register") return join;
  if (window.location.hash === "#login") return "login";
  if (window.location.hash === "#register") return "register";
  return null;
}

export default function HomeFrontPage() {
  const [joinIntent, setJoinIntent] = useState<JoinIntent>("register");

  function showJoin(intent: JoinIntent) {
    setJoinIntent(intent);
    window.requestAnimationFrame(() => {
      document
        .getElementById(JOIN_SECTION_ID)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  useEffect(() => {
    const fromLocation = joinIntentFromLocation();
    if (!fromLocation) return;
    setJoinIntent(fromLocation);
    window.requestAnimationFrame(() => {
      document
        .getElementById(JOIN_SECTION_ID)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return (
    <div className="relative text-white">
      <HomeTopBanner />
      <div className="relative flex flex-col">
        <div className="sticky top-0 z-50 flex justify-end px-5 py-3 md:px-10">
          <div
            role="tablist"
            aria-label="Login or Register"
            className="inline-flex rounded-xl border border-emerald-400/30 bg-slate-950/85 p-1 shadow-lg backdrop-blur"
          >
            <button
              type="button"
              role="tab"
              aria-selected={joinIntent === "login"}
              onClick={() => showJoin("login")}
              className={`rounded-lg px-5 py-2 text-sm font-bold ${
                joinIntent === "login"
                  ? "bg-s4p-mark text-slate-950"
                  : "text-white hover:bg-slate-800"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={joinIntent === "register"}
              onClick={() => showJoin("register")}
              className={`rounded-lg px-5 py-2 text-sm font-bold ${
                joinIntent === "register"
                  ? "bg-s4p-mark text-slate-950"
                  : "text-white hover:bg-slate-800"
              }`}
            >
              Register
            </button>
          </div>
        </div>

        <section
          id={ACCESS_JOIN_ID}
          className="scroll-mt-24 px-5 pb-10 pt-2 md:px-10"
        >
          <div className="relative mx-auto w-full max-w-[22rem]">
            <Image
              src="/images/home/access-join-phone.png"
              alt="Access and join Score-For-Planet. Same passion. Cleaner planet. Scan the QR code to join, create an account, or log in."
              width={248}
              height={662}
              className="h-auto w-full"
              unoptimized
              priority
            />
            <button
              type="button"
              aria-label="Create Account"
              onClick={() => showJoin("register")}
              className="absolute left-[10%] right-[10%] top-[85%] h-[7%] rounded-full"
            />
            <button
              type="button"
              aria-label="Log in"
              onClick={() => showJoin("login")}
              className="absolute left-[18%] right-[18%] top-[92%] h-[6%]"
            />
          </div>
          <p className="mx-auto mt-5 max-w-[22rem] text-center text-base font-semibold leading-7 sm:text-lg">
            Join in seconds. A free account gives you access to your club&apos;s
            matches, predictions and climate impact features.
          </p>
        </section>

        <HowItWorks />

        <section
          id={JOIN_SECTION_ID}
          className="scroll-mt-24 px-5 pb-16 md:px-10"
        >
          <h2 className="text-center text-4xl font-black tracking-tight md:text-5xl">
            Are You...?
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-center text-sm text-slate-300 md:text-base">
            {joinIntent === "login"
              ? "Choose your role to Login as a Fan, Club, Sponsor or Climate Projects Provider."
              : "Choose your role to Register as a Fan, Club, Sponsor or Climate Projects Provider."}
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
            {HOME_STAKEHOLDERS.map((card) => {
              const primaryHref =
                joinIntent === "login" ? card.login : card.register;
              const primaryText =
                joinIntent === "login"
                  ? card.loginButtonText
                  : card.registerText;
              const secondaryHref =
                joinIntent === "login" ? card.register : card.login;
              const secondaryText =
                joinIntent === "login"
                  ? card.registerText.replace(" →", "")
                  : card.loginText;
              return (
                <article
                  key={card.title}
                  className="flex h-full flex-col overflow-hidden rounded-3xl border border-emerald-400/25 bg-slate-900 shadow-xl"
                >
                  <div className="relative h-40">
                    <Image
                      src={card.image}
                      alt={card.imageAlt}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-black text-white">{card.title}</h3>
                    <p className="mt-3 flex-1 text-sm leading-6 text-slate-300">
                      {card.description}
                    </p>
                    <a
                      href={primaryHref}
                      className="mt-5 block rounded-xl bg-s4p-mark px-2 py-3 text-center text-[0.8rem] font-bold leading-snug text-slate-950 hover:brightness-110"
                    >
                      {primaryText}
                    </a>
                    <a
                      href={secondaryHref}
                      className="mt-2 block text-center text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      {secondaryText}
                    </a>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-12 grid gap-5 text-center text-sm text-slate-300 sm:grid-cols-2 lg:grid-cols-5">
            <p>
              <span className="font-black text-s4p-mint">Real Impact</span>
              <br />
              Funding verified climate projects
            </p>
            <p>
              <span className="font-black text-s4p-mint">Stronger Communities</span>
              <br />
              Local and global benefits
            </p>
            <p>
              <span className="font-black text-s4p-mint">Transparent &amp; Credible</span>
              <br />
              Track progress and outcomes
            </p>
            <p>
              <span className="font-black text-s4p-mint">A Healthier Planet</span>
              <br />
              For future generations
            </p>
            <p className="font-[Georgia,Times,serif] text-lg italic text-s4p-mint lg:text-xl">
              Every Score Counts.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
