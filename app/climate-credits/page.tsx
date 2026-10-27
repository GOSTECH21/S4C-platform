import Link from "next/link";
import { SolutionPage } from "@/app/components/home/SolutionPage";
import {
  CLIMATE_CREDITS_PATH,
  FAN_REGISTER_PATH,
  SUPPORTER_PROJECTS_PATH,
} from "@/app/lib/routes";

const STEPS = [
  {
    title: "A Match-Sponsorship is paid",
    copy: "The Lead Climate Sponsor enters one Match-Sponsorship amount for the Match and pays that amount plus a 5% Platform Fee via Stripe. That cash sits in the Climate Sponsorship Wallet.",
  },
  {
    title: "Supporters & Fans receive a share",
    copy: "Fans of that club take cash from the Carbon Wallet and put it onto Climate Projects. Credits appear on My S4P so you can see the Match-Sponsorship and where it went.",
  },
  {
    title: "You vote",
    copy: "Direct that Match-Sponsorship towards the Climate Projects you prefer. FUND-IT takes £0.20 once from each Carbon Wallet, up to 5 times.",
  },
];

export default function ClimateCreditsPage() {
  return (
    <SolutionPage
      kicker="Solutions"
      title="Climate Credits"
      intro="Climate Credits are the Match-Sponsorship brands commit to a Match. Supporters & Fans then FUND-IT that cash onto Climate Projects."
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
        <h2 className="text-3xl font-black">One Match-Sponsorship amount</h2>
        <p className="mt-4 max-w-3xl text-lg text-slate-300">
          The Lead Climate Sponsor specifies one Match-Sponsorship for the
          Match — for example £4,000. Stripe takes that amount plus a 5%
          Platform Fee (£200), total £4,200. The £4,000 sits in the Carbon
          Wallet for fans to FUND-IT onto the Club&apos;s chosen Climate
          Projects. The stipulated amount per Climate Project is a counter for
          brand exposure: every post to a fan is 1 eyeball and 5 exposures.
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
