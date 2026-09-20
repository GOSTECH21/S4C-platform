import Link from "next/link";
import { SolutionPage } from "@/app/components/home/SolutionPage";
import {
  CLIMATE_SPONSORSHIP_PATH,
  SPONSOR_REGISTER_PATH,
} from "@/app/lib/routes";
import { SPORT_CATEGORIES } from "@/app/lib/sports";

export default function ClimateSponsorshipPage() {
  return (
    <SolutionPage
      kicker="Solutions"
      title="Climate Sponsorship"
      intro="Brands fund sporting moments as Climate Credits. Every Goal, Try, Touchdown or 3-point scored during a Match can unlock sponsorship that fans then vote towards Climate Projects."
      currentPath={CLIMATE_SPONSORSHIP_PATH}
    >
      <div className="grid gap-6 md:grid-cols-2">
        {SPORT_CATEGORIES.map((sport) => (
          <div
            key={sport.name}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-8"
          >
            <p className="text-4xl">{sport.icon}</p>
            <h2 className="mt-4 text-2xl font-black">{sport.name}</h2>
            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-green-400">
              {sport.scoreLabel}
            </p>
            <p className="mt-4 text-slate-300">{sport.summary}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-3xl border border-green-500/30 bg-slate-900 p-10">
        <h2 className="text-3xl font-black">How a Match Day lock-in works</h2>
        <ol className="mt-6 space-y-4 text-lg text-slate-300">
          <li>1. The Sponsorship Manager chooses clubs for their Goal Sponsorship Network.</li>
          <li>2. 72 hours before kick-off they lock in one club and the Match (Premier League, Champions League, FA Cup).</li>
          <li>3. That club&apos;s Sustainability Director posts five Climate Projects for fans to vote on.</li>
          <li>4. The sponsor pays only for Goals scored by that club. £/Goal is the Sustainability Director&apos;s stipulated amount per Vote times fans who voted, never below the Minimum Amount they set for the enormity of the Match.</li>
        </ol>
        <Link
          href={SPONSOR_REGISTER_PATH}
          className="mt-8 inline-flex rounded-xl bg-green-500 px-6 py-3 font-bold text-slate-950"
        >
          Register as a Climate Sponsor
        </Link>
      </div>
    </SolutionPage>
  );
}
