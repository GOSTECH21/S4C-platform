"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  formatFundingGbp,
  formatStatCount,
  mergePlatformStats,
  PLATFORM_STATS_POLL_MS,
  type PlatformStats,
} from "@/app/lib/platform-stats";
import { HOME_STAKEHOLDERS } from "@/app/lib/home-stakeholders";
import { loadPlatformStats } from "@/app/services/platform-stats.service";
import { listClimateWallets } from "@/app/services/sponsor-wallet.service";
import {
  WALLET_TAKE_EVENT,
  localWalletTakesGbp,
  withWalletTakes,
} from "@/app/lib/climate-wallet-takes";
import { SPONSORED_GOAL_EVENT } from "@/app/lib/sponsored-goal";
import S4pImpactTables from "@/app/components/home/S4pImpactTables";
import type { ImpactTableBoard } from "@/app/lib/s4p-impact-tables";

const JOIN_SECTION_ID = "are-you";

type JoinIntent = "login" | "register";

function joinIntentFromLocation(): JoinIntent | null {
  if (typeof window === "undefined") return null;
  const join = new URLSearchParams(window.location.search).get("join");
  if (join === "login" || join === "register") return join;
  if (window.location.hash === "#login") return "login";
  if (window.location.hash === "#register") return "register";
  return null;
}

const STATS: Array<{
  key: keyof PlatformStats;
  label: string;
  icon: "pound" | "bolt" | "fans" | "stadium" | "globe";
  format?: (value: number) => string;
}> = [
  {
    key: "fundingMobilisedGbp",
    label: "£ Climate Funding Mobilised",
    icon: "pound",
    format: formatFundingGbp,
  },
  { key: "impactMomentsCreated", label: "Impact Moments Created", icon: "bolt" },
  { key: "fansEngaged", label: "Fans Engaged", icon: "fans" },
  { key: "sportsTeams", label: "Sports Teams", icon: "stadium" },
  { key: "climateProjectsFunded", label: "Climate Projects Funded", icon: "globe" },
];

function StatIcon({ name }: { name: (typeof STATS)[number]["icon"] }) {
  const common = "h-7 w-7 text-s4p-mark";
  if (name === "pound") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M7 20h11v-2H9.4c.4-.7.6-1.5.6-2.4V13h7v-2h-7V8.6C10 6 11.6 4 14.2 4c1.4 0 2.6.5 3.4 1.3l1.3-1.5C17.7 2.6 16 2 14.2 2 10.4 2 8 4.8 8 8.6V11H5v2h3v2.6c0 1.2-.3 2.2-.8 2.4H5V20h2Z" />
      </svg>
    );
  }
  if (name === "bolt") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M13 2 4 14h7l-1 8 10-14h-7l1-6Z" />
      </svg>
    );
  }
  if (name === "fans") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 19c.4-3.2 3-5 5.5-5s5.1 1.8 5.5 5H2.5Zm9 0c.3-2.3 1.5-4.1 3.4-5.1 1 .7 2.3 1.1 3.6 1.1 2.5 0 5.1-1.8 5.5-5h-4.4c-.3 1.6-1.5 2.9-3.1 3.3-1.3.3-2.5-.1-3.4-.8-.4.7-.8 1.5-1.1 2.5H11.5Z" />
      </svg>
    );
  }
  if (name === "stadium") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M3 10c2.4-2 5.6-3 9-3s6.6 1 9 3v9h-2v-2.2c-2.1 1.4-4.5 2.2-7 2.2s-4.9-.8-7-2.2V19H3v-9Zm2.2 2.4V15c1.9 1.3 4.3 2 6.8 2s4.9-.7 6.8-2v-2.6C16.9 13.5 14.5 14 12 14s-4.9-.5-6.8-1.6Z" />
      </svg>
    );
  }
  if (name === "globe") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2c.6 0 1.8 1.4 2.5 4H9.5C10.2 5.4 11.4 4 12 4Zm-4.2 6h8.4A14 14 0 0 1 12 18.5 14 14 0 0 1 7.8 10ZM6.1 8h2.2C7.8 6.3 7 5 6.3 4.4 5.3 5.4 4.6 6.6 4.2 8h1.9Zm11.6 0h1.9c-.4-1.4-1.1-2.6-2.1-3.6C17 5 16.2 6.3 15.7 8h2ZM4.2 12h1.7a16 16 0 0 0 2.4 6.4A8 8 0 0 1 4.2 12Zm12.5 6.4A16 16 0 0 0 19.1 12h1.7a8 8 0 0 1-4.1 6.4Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
      <path d="M17 8c-2.2 0-3.5 1.6-5 3.8C10.5 9.6 9.2 8 7 8 4.5 8 3 10 3 12.4 3 17 9 20.5 12 22c3-1.5 9-5 9-9.6C21 10 19.5 8 17 8Z" />
    </svg>
  );
}

export default function HomeFrontPage({
  children,
  impactTables,
  initialStats,
}: {
  children?: ReactNode;
  impactTables?: ImpactTableBoard[];
  initialStats?: PlatformStats;
}) {
  const [stats, setStats] = useState<PlatformStats>(() =>
    mergePlatformStats(initialStats)
  );
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
    let cancelled = false;
    async function refresh() {
      const localTakes = localWalletTakesGbp(listClimateWallets());
      try {
        const live = await loadPlatformStats();
        if (!cancelled) {
          setStats(withWalletTakes(live, localTakes));
        }
        return;
      } catch {
        // Fall through to the API if the browser cannot read the roster tables.
      }
      try {
        const fromApi = await fetch("/api/platform-stats", { cache: "no-store" });
        if (fromApi.ok) {
          const next = (await fromApi.json()) as PlatformStats;
          if (!cancelled) {
            setStats(withWalletTakes(mergePlatformStats(next), localTakes));
          }
          return;
        }
      } catch {
        // Keep the server-rendered bar if refresh fails.
      }
      if (!cancelled) {
        setStats(withWalletTakes(mergePlatformStats(initialStats), localTakes));
      }
    }
    void refresh();
    const timer = window.setInterval(() => void refresh(), PLATFORM_STATS_POLL_MS);
    window.addEventListener(WALLET_TAKE_EVENT, refresh);
    window.addEventListener(SPONSORED_GOAL_EVENT, refresh);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener(WALLET_TAKE_EVENT, refresh);
      window.removeEventListener(SPONSORED_GOAL_EVENT, refresh);
    };
  }, [initialStats]);

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
    <div className="relative bg-[#04140f] text-white">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/images/home/hero.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#04140f]/95 via-[#04140f]/80 to-[#04140f]/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#04140f]/30 via-transparent to-[#04140f]" />
      </div>

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
        <section className="order-1 grid items-center gap-6 px-5 pb-4 pt-4 md:px-10 md:pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,1.35fr)_minmax(0,1.15fr)] lg:gap-4 lg:pb-8">
          <div>
            <h1 className="text-4xl font-black uppercase leading-[0.92] tracking-tight drop-shadow md:text-6xl lg:text-[4.4rem]">
              Every score
              <br />
              <span className="text-s4p-mark">a brighter planet</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-emerald-50 md:text-base">
              Every <span className="font-black text-white">GOAL</span>, every{" "}
              <span className="font-black text-white">TRY</span>, every{" "}
              <span className="font-black text-white">TOUCHDOWN</span> &amp; every{" "}
              <span className="font-black text-white">WICKET</span> can unlock a
              Sponsor-funded{" "}
              <span className="font-black text-white">IMPACT MOMENT</span>
              {" "}
              to help address a Club&apos;s Match-Day Carbon Footprints
            </p>
          </div>

          <div className="flex flex-col items-center justify-center">
            <Image
              src="/images/home/s4p-mark.png"
              alt="S4P Score-4-our-Planet"
              width={720}
              height={660}
              className="h-auto w-[16rem] object-contain drop-shadow-2xl sm:w-[20rem] lg:w-[26rem] xl:w-[30rem]"
              priority
            />
            <p className="mt-1 max-w-xl text-center text-[1.05rem] font-semibold leading-snug text-white md:mt-1.5 md:text-[1.2rem] lg:max-w-2xl lg:text-[1.35rem]">
              <span className="block">Turning Match-Day Sporting Moments into</span>
              <span className="block text-s4p-mark">Funded Climate Action</span>
            </p>
          </div>

          <div className="hidden lg:block">
            <S4pImpactTables boards={impactTables} />
          </div>
        </section>

        <div className="order-2 lg:order-4">{children}</div>

        <p className="order-3 mx-4 mb-12 px-3 text-center text-2xl font-black uppercase leading-[1.3] tracking-[0.1em] sm:text-3xl md:mx-10 md:mb-16 md:text-[2.15rem] lg:order-2 lg:mb-20 lg:text-4xl">
          <span className="block">
            <span className="text-s4p-mark">Sport</span>
            <span className="text-white"> creates the moment.</span>
          </span>
          <span className="block">
            <span className="text-s4p-mark">Sponsors</span>
            <span className="text-white"> fund it. </span>
            <span className="text-s4p-mark">Fans</span>
            <span className="text-white"> direct the </span>
            <span className="text-s4p-mark">Impact</span>
          </span>
        </p>

        <section className="order-4 mx-4 md:mx-10 lg:order-3">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[2rem] border border-emerald-400/20 bg-slate-950/80 sm:grid-cols-3 lg:grid-cols-5">
            {STATS.map((stat) => (
              <div key={stat.key} className="bg-slate-950/40 px-3 py-5 text-center">
                <div className="flex justify-center">
                  <StatIcon name={stat.icon} />
                </div>
                <p className="mt-2 text-xl font-black text-white md:text-2xl">
                  {stat.format
                    ? stat.format(stats[stat.key])
                    : formatStatCount(stats[stat.key])}
                </p>
                <p className="mt-1 text-[0.7rem] font-semibold uppercase tracking-wide text-slate-300">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id={JOIN_SECTION_ID}
          className="order-5 scroll-mt-24 px-5 pb-16 md:px-10"
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
                className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-700/80 bg-[#07150f] shadow-xl"
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
                    className="mt-5 block rounded-xl bg-emerald-500 px-2 py-3 text-center text-[0.8rem] font-bold leading-snug text-slate-950 hover:bg-emerald-400"
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
              <span className="font-black text-emerald-300">Real Impact</span>
              <br />
              Funding verified climate projects
            </p>
            <p>
              <span className="font-black text-emerald-300">Stronger Communities</span>
              <br />
              Local and global benefits
            </p>
            <p>
              <span className="font-black text-emerald-300">Transparent &amp; Credible</span>
              <br />
              Track progress and outcomes
            </p>
            <p>
              <span className="font-black text-emerald-300">A Healthier Planet</span>
              <br />
              For future generations
            </p>
            <p className="font-[Georgia,Times,serif] text-lg italic text-emerald-200 lg:text-xl">
              Every Score Counts.
            </p>
          </div>
        </section>

        <div className="order-6 mx-4 mb-12 mt-2 md:mx-10 lg:hidden">
          <S4pImpactTables boards={impactTables} />
        </div>
      </div>
    </div>
  );
}
