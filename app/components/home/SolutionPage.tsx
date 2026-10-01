import Link from "next/link";
import type { ReactNode } from "react";
import Footer from "@/app/components/home/Footer";
import {
  CLIMATE_CREDITS_PATH,
  CLIMATE_IMPACT_LEAGUE_PATH,
  CLIMATE_SPONSORSHIP_PATH,
  GLOBAL_SCHOOLS_SOLAR_PATH,
  HOME_PATH,
} from "@/app/lib/routes";

const SOLUTION_LINKS = [
  { href: CLIMATE_SPONSORSHIP_PATH, label: "Climate Sponsorship" },
  { href: CLIMATE_CREDITS_PATH, label: "Climate Credits" },
  { href: CLIMATE_IMPACT_LEAGUE_PATH, label: "Climate Impact League Table" },
  { href: GLOBAL_SCHOOLS_SOLAR_PATH, label: "Global Schools Solar" },
];

export function SolutionPage({
  kicker,
  title,
  intro,
  currentPath,
  children,
}: {
  kicker: string;
  title: string;
  intro: string;
  currentPath: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href={HOME_PATH} className="text-2xl font-black text-green-400">
            S4P
          </Link>
          <Link
            href={HOME_PATH}
            className="text-sm font-semibold text-slate-300 hover:text-white"
          >
            ← Home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          {kicker}
        </p>
        <h1 className="mt-4 text-5xl font-black md:text-6xl">{title}</h1>
        <p className="mt-6 max-w-3xl text-xl leading-8 text-slate-300">{intro}</p>
        <nav className="mt-10 flex flex-wrap gap-3">
          {SOLUTION_LINKS.map((link) => {
            const active = link.href === currentPath;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                  active
                    ? "border-green-400 bg-green-400 text-slate-950"
                    : "border-slate-700 text-slate-300 hover:border-green-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">{children}</section>
      <Footer />
    </main>
  );
}
