"use client";

import { useMemo, useState } from "react";
import FanNav from "@/app/dashboard/supporter/components/FanNav";
import { MatchDayProjectCard } from "@/app/components/fan/MatchDayProjectCard";
import { ClimateProjectSponsors } from "@/app/components/fan/ClimateProjectSponsors";
import {
  applyLeadCommitment,
  allocateSplitWalletVote,
  allocateWalletVote,
  createLeadWallet,
  createLocalWallet,
  DEFAULT_WALLET_VOTE_GBP,
  formatWalletGbp,
  remainingGbp,
  type ClimateWallet,
  type NumberedClimateProject,
} from "@/app/lib/sponsor-wallet";

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
  const [funded, setFunded] = useState<NumberedClimateProject[]>(
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
  const lead = wallets.find((wallet) => wallet.kind === "lead") ?? null;
  const locals = wallets.filter((wallet) => wallet.kind === "local");

  const leadRow = lead
    ? {
        brandName: lead.brandName,
        kind: "lead" as const,
        remainingGbp: remainingGbp(lead),
      }
    : null;
  const localRows = useMemo(
    () =>
      locals.map((wallet) => ({
        brandName: wallet.brandName,
        kind: "local" as const,
        remainingGbp: remainingGbp(wallet),
      })),
    [locals]
  );

  function applyResult(
    result: ReturnType<typeof allocateWalletVote>,
    split: boolean
  ) {
    if (!result.ok) {
      setError(result.error);
      setNotice(null);
      return;
    }
    setError(null);
    setWallets((prev) =>
      prev.map((row) => (row.brandName === result.wallet.brandName ? result.wallet : row))
    );
    setFunded(result.projects);
    setNotice(
      split
        ? `Vote shared ${formatWalletGbp(result.amount)} from ${result.wallet.brandName}'s Carbon Wallet. Carbon Wallet now ${formatWalletGbp(remainingGbp(result.wallet))}.`
        : `Vote moved ${formatWalletGbp(result.amount)} from ${result.wallet.brandName}'s Carbon Wallet into Project ${result.project.number}. Carbon Wallet now ${formatWalletGbp(remainingGbp(result.wallet))}.`
    );
  }

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
            Climate Projects posted by the Sustainability Director disappear
            after 5 days. Bring every Carbon Wallet to {formatWalletGbp(0)}.
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
            Use the bold project number in Checkbox 1 when you Vote.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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

        <div className="mt-12">
          <ClimateProjectSponsors
            lead={leadRow}
            locals={localRows}
            projectCount={5}
            onLeadVote={({ projectNumber, split }) => {
              if (!lead) return;
              applyResult(
                split
                  ? allocateSplitWalletVote({ wallet: lead, projects: funded })
                  : allocateWalletVote({
                      wallet: lead,
                      projects: funded,
                      projectNumber: Number(projectNumber),
                    }),
                Boolean(split)
              );
            }}
            onLocalVote={(brandName, projectNumber) => {
              const wallet = wallets.find((row) => row.brandName === brandName);
              if (!wallet) return;
              applyResult(
                allocateWalletVote({
                  wallet,
                  projects: funded,
                  projectNumber: Number(projectNumber),
                  amount: DEFAULT_WALLET_VOTE_GBP,
                }),
                false
              );
            }}
          />
        </div>
      </div>
    </main>
  );
}
