"use client";

import { useEffect, useState } from "react";
import FanNav from "@/app/dashboard/supporter/components/FanNav";
import Link from "next/link";
import { MatchDayProjectCard } from "@/app/components/fan/MatchDayProjectCard";
import { SUPPORTER_CLIMATE_SPONSORS_PATH } from "@/app/lib/routes";
import { loadFundedProjects } from "@/app/lib/climate-funding";
import {
  applyLeadCommitment,
  createLeadWallet,
  createLocalWallet,
  formatWalletGbp,
  type ClimateWallet,
  type NumberedClimateProject,
} from "@/app/lib/sponsor-wallet";
import {
  fanVotingWindowCopy,
  fanWalletDrainCopy,
} from "@/app/lib/voting-window";

const PROJECTS = [
  {
    id: "gss",
    name: "Global Schools Solar",
    description:
      "Install rooftop solar systems in schools around the world so classrooms can run on clean energy.",
    category: "Solar Energy",
  },
  {
    id: "wee",
    name: "Wee Spoke Hub",
    description:
      "A community bike workshop that teaches repair skills so more people can cycle, run by Shrub Coop in Edinburgh.",
    category: "Active Travel",
  },
  {
    id: "retrofit",
    name: "Edinburgh Building Retrofit Collective",
    description:
      "Impartial retrofit advice and bulk-buy home improvements so neighbours can warm homes and cut emissions together.",
    category: "Renewable Energy",
  },
  {
    id: "porty",
    name: "Porty Community Energy",
    description:
      "Portobello neighbours cutting carbon through low-carbon heat, bike storage and active-travel projects people actually want to join.",
    category: "Renewable Energy",
  },
  {
    id: "craigshill",
    name: "Growing Together Craigshill",
    description:
      "Intergenerational community growing in West Lothian, connecting all ages with soil, food and neighbourhood climate action.",
    category: "Sustainable Agriculture",
  },
];

const PREVIEW_CLUB = "preview-hibs";
const PREVIEW_FAN = "preview-fan";

function seedProjects(): NumberedClimateProject[] {
  return loadFundedProjects(
    PREVIEW_CLUB,
    PROJECTS.map((project, index) => ({
      id: project.id,
      name: project.name,
      number: index + 1,
      fundedGbp: 0,
      votesReceived: 0,
    }))
  );
}

function seedWallets(): ClimateWallet[] {
  return [
    createLeadWallet({
      clubName: "Hibernian",
      brandName: "American Express",
      commitmentFeeGbp: 3000,
      gbpPerGoal: 3000,
    }),
    createLocalWallet({
      clubName: "Hibernian",
      brandName: "Top Cellar",
      sponsorshipGbp: 750,
    }),
    createLocalWallet({
      clubName: "Hibernian",
      brandName: "Mash Tun",
      sponsorshipGbp: 500,
    }),
  ];
}

export default function MyS4PPreviewPage() {
  const [wallets, setWallets] = useState(seedWallets);
  const [funded, setFunded] = useState<NumberedClimateProject[]>(() =>
    PROJECTS.map((project, index) => ({
      id: project.id,
      name: project.name,
      number: index + 1,
      fundedGbp: 0,
      votesReceived: 0,
    }))
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFunded(seedProjects());
  }, []);
  const lead = wallets.find((wallet) => wallet.kind === "lead") ?? null;

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-[90rem]">
        <FanNav />
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
            Hibernian
          </p>
          <h1 className="mt-2 text-4xl font-black">Hibernian Climate Campaign</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">
            {fanVotingWindowCopy()} {fanWalletDrainCopy(formatWalletGbp(0))}
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-center text-red-300">
            {error}
          </div>
        )}
        {notice && !error && (
          <div className="mt-6 rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-center text-green-300">
            ✓ {notice}
          </div>
        )}

        {lead ? (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => {
                setWallets((prev) =>
                  prev.map((wallet) =>
                    wallet.kind === "lead"
                      ? applyLeadCommitment(wallet, {
                          goalsScored: wallet.goalsScored + 1,
                        })
                      : wallet
                  )
                );
                setNotice(
                  `Hibernian scored. American Express Carbon Wallet now includes ${formatWalletGbp(lead.gbpPerGoal)} Goals-scored Sponsorship Cash.`
                );
                setError(null);
              }}
              className="rounded-xl border border-emerald-400/40 px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-400/10"
            >
              Hibernian scored a goal
            </button>
          </div>
        ) : null}

        <section className="mt-10">
          <h2 className="text-3xl font-black">Climate Projects List</h2>
          <p className="mt-2 text-sm text-slate-400">
            Project titles are shown first. Open a project to read the details.
            To put £0.20 into a Climate Project, open Climate Project Sponsors,
            select the project by name, then press FUND-IT. You can FUND-IT up
            to 5 times — £0.20 once from each Carbon Wallet onto any Climate
            Project.
          </p>
          <div className="mt-6 space-y-2">
            {PROJECTS.map((project, index) => (
              <MatchDayProjectCard
                key={project.id}
                project={project}
                cardIndex={index + 1}
                clubName="Hibernian"
                showVote={false}
                showSponsors={false}
                fundedGbp={
                  funded.find((row) => row.id === project.id)?.fundedGbp ?? 0
                }
              />
            ))}
          </div>
        </section>

        <div className="mt-8 rounded-2xl border border-emerald-400/30 bg-emerald-500/5 p-6">
          <h3 className="text-xl font-black">Climate Project Sponsors</h3>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            The sponsor list and FUND-IT wallets are on a separate page.
            Choose a sponsor, pick the Climate Project from the drop-down,
            then press FUND-IT.
          </p>
          <Link
            href={SUPPORTER_CLIMATE_SPONSORS_PATH}
            className="mt-4 inline-flex rounded-xl bg-green-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-green-400"
          >
            Open Climate Project Sponsors
          </Link>
        </div>
      </div>
    </main>
  );
}
