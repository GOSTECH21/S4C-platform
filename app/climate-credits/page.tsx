import Link from "next/link";
import { SolutionPage } from "@/app/components/home/SolutionPage";
import {
  CLIMATE_CREDITS_PATH,
  FAN_REGISTER_PATH,
  SUPPORTER_PROJECTS_PATH,
} from "@/app/lib/routes";

const STEPS = [
  {
    title: "A score is recorded",
    copy: "Whenever your Team scores — a Goal, a Try, a Touchdown or a 3-point — the Match Day sponsorship is released as Climate Credits.",
  },
  {
    title: "Supporters & Fans receive a share",
    copy: "The funding is split with the people who follow that club. Credits appear on My S4P so you can see the live Sponsorship/Goal amount rise from the £1,000 minimum.",
  },
  {
    title: "You vote",
    copy: "Direct your Climate Credits towards the Climate Projects you prefer. The project with the most votes receives the Match Day sponsorship funding.",
  },
];

export default function ClimateCreditsPage() {
  return (
    <SolutionPage
      kicker="Solutions"
      title="Climate Credits"
      intro="Climate Credits are the funding sponsors commit to sporting moments. Supporters & Fans receive a share whenever their Team scores, then vote those credits onto Climate Projects."
      currentPath={CLIMATE_CREDITS_PATH}
    >
      <div className="grid gap-6 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <div
            key={step.title}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-8"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">
              0{index + 1}
            </p>
            <h2 className="mt-4 text-2xl font-black">{step.title}</h2>
            <p className="mt-4 text-slate-300">{step.copy}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-3xl border border-green-500/30 bg-slate-900 p-10">
        <h2 className="text-3xl font-black">From £1,000/Goal (Min)</h2>
        <p className="mt-4 max-w-3xl text-lg text-slate-300">
          Sponsorship/Goal opens at £1,000 (Min) and can rise toward the peak
          the Sustainability Director proposes — for example 500,000 votes at
          £0.01 becomes £5,000/Goal. Your vote both chooses the project and
          helps that amount grow.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href={FAN_REGISTER_PATH}
            className="rounded-xl bg-green-500 px-6 py-3 font-bold text-slate-950"
          >
            Register as a Fan
          </Link>
          <Link
            href={SUPPORTER_PROJECTS_PATH}
            className="rounded-xl border border-slate-600 px-6 py-3 font-semibold"
          >
            Vote on Climate Projects
          </Link>
        </div>
      </div>
    </SolutionPage>
  );
}
