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
  icon: string;
}> = [
  { key: "treesPlanted", label: "Trees Planted", icon: "🌳" },
  { key: "co2Avoided", label: "tCO₂e Avoided", suffix: " t", icon: "♣" },
  { key: "fansEngaged", label: "Fans Engaged", icon: "👤" },
  { key: "teamsInvolved", label: "Teams involved", icon: "👥" },
  { key: "climateProjects", label: "Climate Projects", icon: "♻" },
];

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
    <div className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0">
        <Image
          src="/images/home/hero.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/80 via-slate-950/75 to-slate-950" />
      </div>

      <div className="relative">
        <header className="flex items-start justify-between gap-4 px-6 py-5 md:px-10">
          <div className="flex items-center gap-3">
            <Image
              src="/images/s4p-logo.png"
              alt="Score-4-our-Planet"
              width={64}
              height={64}
              className="h-14 w-14 rounded-full object-cover"
            />
            <div>
              <p className="text-lg font-black tracking-tight text-emerald-300 md:text-xl">
                Score-4-our-Planet
              </p>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-emerald-200/80">
                Every score protects our planet
              </p>
            </div>
          </div>
          <p className="max-w-[9rem] text-right text-[0.65rem] font-black uppercase leading-tight tracking-[0.18em] text-emerald-200 md:max-w-none md:text-xs">
            Sport today
            <br />
            A brighter tomorrow
          </p>
        </header>

        <section className="grid items-center gap-8 px-6 pb-8 pt-4 md:grid-cols-[1.1fr_0.9fr] md:px-10 lg:grid-cols-[1.2fr_auto_1fr]">
          <div>
            <h1 className="text-4xl font-black uppercase leading-[0.95] tracking-tight text-white drop-shadow md:text-6xl lg:text-7xl">
              Every score
              <br />
              a brighter planet
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

          <div className="hidden justify-center lg:flex">
            <Image
              src="/images/s4p-logo.png"
              alt="S4P"
              width={220}
              height={220}
              className="h-44 w-44 rounded-full object-cover shadow-2xl ring-4 ring-emerald-400/40"
            />
          </div>

          <div className="text-right">
            <p className="text-2xl font-black uppercase leading-tight tracking-tight text-white md:text-4xl">
              Different sports
              <br />
              a bigger impact
            </p>
          </div>
        </section>

        <section className="mx-4 mb-10 overflow-hidden rounded-3xl border border-emerald-400/20 bg-slate-950/70 px-3 py-4 backdrop-blur md:mx-10 md:px-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {STATS.map((stat) => (
              <div
                key={stat.key}
                className="rounded-2xl bg-slate-900/80 px-3 py-4 text-center"
              >
                <p className="text-lg">{stat.icon}</p>
                <p className="mt-1 text-xl font-black text-emerald-300 md:text-2xl">
                  {formatStatCount(stats[stat.key])}
                  {stat.suffix ?? ""}
                </p>
                <p className="mt-1 text-[0.7rem] font-semibold uppercase tracking-wide text-slate-300">
                  {stat.label}
                </p>
              </div>
            ))}
            <div className="rounded-2xl bg-slate-900/80 px-3 py-4 text-center">
              <p className="text-lg">🌿</p>
              <p className="mt-1 text-sm font-black uppercase leading-tight text-emerald-300 md:text-base">
                A Brighter
                <br />
                Tomorrow
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 pb-16 md:px-10">
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
                className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 shadow-xl"
              >
                <div className="relative h-40">
                  <Image
                    src={card.image}
                    alt={card.imageAlt}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
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

          <div className="mt-12 grid gap-4 text-center text-sm text-slate-300 sm:grid-cols-2 lg:grid-cols-4">
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
          </div>
          <p className="mt-6 text-center text-lg font-black italic text-emerald-200">
            Every Score Counts.
          </p>
        </section>
      </div>
    </div>
  );
}
