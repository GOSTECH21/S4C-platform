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
    copy: "Whenever your Team scores — a Goal, a Try, a Touchdown or a 3-point — extra Climate Credits are added to the Base Match Sponsorship, up to the posted Maximum.",
  },
  {
    title: "Supporters & Fans receive a share",
    copy: "The funding is split with the people who follow that club. Credits appear on My S4P so you can see the Base Match Sponsorship, the amount added for each Goal, and the Maximum the sponsor can pay.",
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
        <h2 className="text-3xl font-black">Base plus Goals, up to a Maximum</h2>
        <p className="mt-4 max-w-3xl text-lg text-slate-300">
          The Sustainability Director inserts a Base Match Sponsorship (the
          Minimum Payment, for example £3,000), the amount payable per Goal
          scored (for example another £3,000), and an &quot;Up to a Maximum
          of&quot; cap. A 0–0 still pays the base; 1–0 pays base plus one Goal;
          2–0 adds another Goal, never above the cap. The stipulated amount per
          Climate Project is a counter for brand exposure: every post to a fan
          is 1 eyeball and 5 exposures, even if the fan chooses 3 of the 5
          Climate Projects.
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
