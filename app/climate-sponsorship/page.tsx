import Link from "next/link";
import { SolutionPage } from "@/app/components/home/SolutionPage";
import {
  CLIMATE_SPONSORSHIP_PATH,
  SPONSOR_GAME_TIME_PATH,
  SPONSOR_REGISTER_PATH,
} from "@/app/lib/routes";
import {
  FAN_CARBON_WALLET_LABEL,
  GAME_TIME_DURATION_MINUTES,
  GAME_TIME_SLOT_MINUTES,
  P4P_ACCURACY_GBP,
  P4P_CORRECT_TOTAL_GBP,
  P4P_ENGAGEMENT_GBP,
  P4P_WINDOW_MINUTES,
  formatP4pGbp,
} from "@/app/lib/predict-for-planet";
import { SPORT_CATEGORIES } from "@/app/lib/sports";

export default function ClimateSponsorshipPage() {
  return (
    <SolutionPage
      kicker="Solutions"
      title="Climate Sponsorship"
      intro="Brands fund a Match-Sponsorship. Fans then FUND-IT that cash towards Climate Projects — £0.20 once from each Carbon Wallet, up to 5 times."
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
        <h2 className="text-3xl font-black">How a Match-Sponsorship works</h2>
        <ol className="mt-6 space-y-4 text-lg text-slate-300">
          <li>
            1. The Club Sustainability Director sends their chosen Match Day
            Climate Projects to the Match-Sponsors.
          </li>
          <li>
            2. The Sponsorship Director sees those Projects on the Invitations
            tab.
          </li>
          <li>
            3. The Sponsorship Manager logs in, sees the Projects, and accepts
            the Invitation to Sponsor.
          </li>
          <li>
            4. They enter one fixed Match-Sponsorship amount for this Match
            Day. That S4P Lead Sponsor has exclusive rights to scoring-triggered
            climate funding for a five-day campaign.
          </li>
          <li>
            5. They complete payment of that Match-Sponsorship plus a 5%
            Platform Fee via Stripe. 80% is the Fan Participation Pool for
            eligible fan-directed allocations. 20% is the Score Impact Pool,
            unlocked by a confirmed score from the sponsored team in £1,000–£1,500
            tranches. Further scores after that pool is unlocked still count in
            S4P statistics but do not add sponsor liabilities. If the match
            finishes 0–0, the 20% stays committed and is allocated under the
            post-match rule so 100% of the Match-Sponsorship is complete.
          </li>
        </ol>
        <Link
          href={SPONSOR_REGISTER_PATH}
          className="mt-8 inline-flex rounded-xl bg-green-500 px-6 py-3 font-bold text-slate-950"
        >
          Register as a Climate Sponsor
        </Link>
      </div>

      <div className="mt-12 rounded-3xl border border-green-500/30 bg-slate-900 p-10">
        <h2 className="text-3xl font-black">How Game-Time Sponsorship works</h2>
        <p className="mt-4 text-lg text-slate-300">
          A Global Brand buys fan engagement, not a 5-day Match-Sponsorship.
          They put an amount on a Game-Time Carbon Wallet for one{" "}
          {GAME_TIME_SLOT_MINUTES}-minute slot. The Game lasts{" "}
          {GAME_TIME_DURATION_MINUTES} minutes.
        </p>
        <ol className="mt-6 space-y-4 text-lg text-slate-300">
          <li>
            1. Fans open Predict-For Planet and choose what is likely to happen
            in the next {P4P_WINDOW_MINUTES}-minute slot — Handball offence, Foul
            committed, Corner awarded, Yellow card issued, Red card issued,
            Penalty awarded, or VAR referee review. Goal scored is exclusive to
            Score-For-Planet.
          </li>
          <li>
            2. One prediction per {P4P_WINDOW_MINUTES}-minute slot per fan.
            Participating earns {formatP4pGbp(P4P_ENGAGEMENT_GBP)} in the fan&apos;s{" "}
            {FAN_CARBON_WALLET_LABEL} for their chosen Climate Project.
          </li>
          <li>
            3. If that event is awarded in the slot, the fan earns another{" "}
            {formatP4pGbp(P4P_ACCURACY_GBP)} (total {formatP4pGbp(P4P_CORRECT_TOTAL_GBP)}). Both
            amounts leave the Game-Time Carbon Wallet until it reads{" "}
            {formatP4pGbp(0)}.
          </li>
        </ol>
        <Link
          href={SPONSOR_GAME_TIME_PATH}
          className="mt-8 inline-flex rounded-xl bg-green-500 px-6 py-3 font-bold text-slate-950"
        >
          Buy a Game-Time slot
        </Link>
      </div>
    </SolutionPage>
  );
}
