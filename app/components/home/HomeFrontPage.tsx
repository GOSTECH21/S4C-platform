"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  formatStatCount,
  mergePlatformStats,
  PLATFORM_STATS_POLL_MS,
  type PlatformStats,
} from "@/app/lib/platform-stats";
import { HOME_STAKEHOLDERS } from "@/app/lib/home-stakeholders";
import { loadPlatformStats } from "@/app/services/platform-stats.service";

const STATS: Array<{
  key: keyof Pick<
    PlatformStats,
    "treesPlanted" | "co2Avoided" | "fansEngaged" | "teamsInvolved" | "climateProjects"
  >;
  label: string;
  suffix?: string;
  icon: "tree" | "clover" | "fans" | "stadium" | "globe";
}> = [
  { key: "treesPlanted", label: "Trees Planted", icon: "tree" },
  { key: "co2Avoided", label: "tCO₂e Avoided", suffix: " t", icon: "clover" },
  { key: "fansEngaged", label: "Fans Engaged", icon: "fans" },
  { key: "teamsInvolved", label: "Teams involved", icon: "stadium" },
  { key: "climateProjects", label: "Climate Projects", icon: "globe" },
];

function StatIcon({ name }: { name: (typeof STATS)[number]["icon"] | "leaf" }) {
  const common = "h-7 w-7 text-emerald-400";
  if (name === "tree") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M12 2c2.8 2.4 4.5 5 4.8 8.2A4.6 4.6 0 0 1 14 19h-1v3h-2v-3H10a4.6 4.6 0 0 1-2.8-8.8C7.5 7 9.2 4.4 12 2Z" />
      </svg>
    );
  }
  if (name === "clover") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M12 3.2c1.5-1.7 4.3-1.4 5.4.7 1.1 2.1-.3 4.4-2.5 5.1 2.2.7 3.6 3 2.5 5.1-1.1 2.1-3.9 2.4-5.4.7-1.5 1.7-4.3 1.4-5.4-.7-1.1-2.1.3-4.4 2.5-5.1C6.9 8.3 5.5 6 6.6 3.9 7.7 1.8 10.5 1.5 12 3.2Z" />
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

export default function HomeFrontPage() {
  const [stats, setStats] = useState<PlatformStats>(() => mergePlatformStats());

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      try {
        const fromApi = await fetch("/api/platform-stats", { cache: "no-store" });
        if (fromApi.ok) {
          const next = (await fromApi.json()) as PlatformStats;
          if (!cancelled) setStats(mergePlatformStats(next));
          return;
        }
      } catch {
        // Browser can still count what the anon key can read.
      }
      try {
        const next = await loadPlatformStats();
        if (!cancelled) setStats(next);
      } catch {
        if (!cancelled) setStats(mergePlatformStats());
      }
    }
    void refresh();
    const timer = window.setInterval(() => void refresh(), PLATFORM_STATS_POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="relative overflow-hidden bg-[#04140f] text-white">
      <div className="absolute inset-0">
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

      <div className="relative">
        <header className="flex items-start justify-between gap-4 px-5 py-4 md:px-10">
          <div>
            <p className="text-2xl font-black tracking-tight md:text-3xl">
              <span className="text-emerald-400">S4P</span>{" "}
              <span className="text-white">Score-4-our-Planet</span>
            </p>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-emerald-300/90">
              Every score protects our planet
            </p>
          </div>
          <p className="max-w-[9rem] text-right text-[0.65rem] font-black uppercase leading-tight tracking-[0.18em] text-emerald-200 md:max-w-none md:text-xs">
            Sport today
            <br />
            A brighter tomorrow
          </p>
        </header>

        <section className="grid items-center gap-6 px-5 pb-8 pt-2 md:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,1.35fr)_minmax(0,1.15fr)] lg:gap-4">
          <div>
            <h1 className="text-4xl font-black uppercase leading-[0.92] tracking-tight drop-shadow md:text-6xl lg:text-[4.4rem]">
              Every score
              <br />
              <span className="text-emerald-400">a brighter planet</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-emerald-50 md:text-base">
              Every <span className="font-black text-white">GOAL</span>; every{" "}
              <span className="font-black text-white">TRY</span>; every{" "}
              <span className="font-black text-white">TOUCHDOWN</span> on every{" "}
              <span className="font-black text-white">MATCH-DAY</span> creates a
              funded <span className="font-black text-white">IMPACT MOMENT</span>{" "}
              by Sponsors for addressing Match-Day Carbon Footprint.
            </p>
          </div>

          <div className="flex justify-center">
            <Image
              src="/images/home/s4p-mark.png"
              alt="S4P Score-4-our-Planet"
              width={720}
              height={660}
              className="h-auto w-[16rem] object-contain drop-shadow-2xl sm:w-[20rem] lg:w-[26rem] xl:w-[32rem]"
              priority
            />
          </div>

          <div className="relative min-h-[220px] overflow-hidden rounded-3xl lg:min-h-[360px] xl:min-h-[420px]">
            <Image
              src="/images/home/hero-athletes.png"
              alt="Different sports, a bigger impact"
              fill
              className="object-cover object-center"
              priority
            />
          </div>
        </section>

        <section className="mx-4 mb-10 md:mx-10">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[2rem] border border-emerald-400/20 bg-slate-950/80 sm:grid-cols-3 lg:grid-cols-6">
            {STATS.map((stat) => (
              <div key={stat.key} className="bg-slate-950/40 px-3 py-5 text-center">
                <div className="flex justify-center">
                  <StatIcon name={stat.icon} />
                </div>
                <p className="mt-2 text-xl font-black text-white md:text-2xl">
                  {formatStatCount(stats[stat.key])}
                  {stat.suffix ?? ""}
                </p>
                <p className="mt-1 text-[0.7rem] font-semibold uppercase tracking-wide text-slate-300">
                  {stat.label}
                </p>
              </div>
            ))}
            <div className="bg-slate-950/40 px-3 py-5 text-center">
              <div className="flex justify-center">
                <StatIcon name="leaf" />
              </div>
              <p className="mt-2 text-sm font-black uppercase leading-tight text-emerald-300 md:text-base">
                A Brighter
                <br />
                Tomorrow
              </p>
            </div>
          </div>
        </section>

        <section className="px-5 pb-16 md:px-10">
          <h2 className="text-center text-4xl font-black tracking-tight md:text-5xl">
            Are You……?
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-center text-sm text-slate-300 md:text-base">
            Join a global movement where sport creates climate action. Choose
            your role and be part of a cleaner, fairer, healthier planet.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
            {HOME_STAKEHOLDERS.map((card) => (
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
                  <Link
                    href={card.register}
                    className="mt-5 block rounded-xl bg-emerald-500 py-3 text-center text-sm font-bold text-slate-950 hover:bg-emerald-400"
                  >
                    {card.registerText}
                  </Link>
                  <Link
                    href={card.login}
                    className="mt-2 block text-center text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    {card.loginText}
                  </Link>
                </div>
              </article>
            ))}
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
      </div>
    </div>
  );
}
