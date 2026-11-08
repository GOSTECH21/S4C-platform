"use client";

import { useEffect, useState } from "react";
import FanNav from "@/app/dashboard/supporter/components/FanNav";
import { CampaignMatchHeader } from "@/app/components/fan/CampaignMatchHeader";
import { ClimateProjectSponsors } from "@/app/components/fan/ClimateProjectSponsors";
import { MatchDayProjectCard } from "@/app/components/fan/MatchDayProjectCard";
import { loadFundedProjects } from "@/app/lib/climate-funding";
import {
  applyLeadCommitment,
  createLeadWallet,
  createLocalWallet,
  formatWalletGbp,
  remainingGbp,
  type ClimateWallet,
  type NumberedClimateProject,
} from "@/app/lib/sponsor-wallet";
import { FEATURED_GLOBAL_SCHOOLS_SOLAR } from "@/app/lib/sccan-catalog";
import { sponsorLogoSrc } from "@/app/services/teams.service";

const PROJECTS = [
  {
    id: "gss",
    name: FEATURED_GLOBAL_SCHOOLS_SOLAR.name,
    description: FEATURED_GLOBAL_SCHOOLS_SOLAR.description,
    category: FEATURED_GLOBAL_SCHOOLS_SOLAR.category,
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
    createLocalWallet({
      clubName: "Hibernian",
      brandName: "Scotmid Coop",
      sponsorshipGbp: 1149.8,
    }),
    createLocalWallet({
      clubName: "Hibernian",
      brandName: "Fountain Brewery",
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
    <main className="min-h-screen p-8 text-white">
      <div className="mx-auto max-w-[90rem]">
        <FanNav />
        <CampaignMatchHeader
          clubName="Hibernian"
          matchTitle="Hibernian v Hearts"
          sponsorName={lead?.brandName}
          sponsorLogoUrl={
            lead ? sponsorLogoSrc(lead.brandName, null) : null
          }
        />

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
                  `Hibernian scored. American Express Carbon Wallet still holds the ${formatWalletGbp(lead.commitmentFeeGbp)} Match-Sponsorship.`
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

        <div className="mt-10">
          <ClimateProjectSponsors
            lead={
              lead
                ? {
                    brandName: lead.brandName,
                    kind: "lead",
                    remainingGbp: remainingGbp(lead),
                    committedGbp: remainingGbp(lead) + lead.allocatedGbp,
                    logoUrl: sponsorLogoSrc(lead.brandName, null),
                  }
                : null
            }
            locals={wallets
              .filter((wallet) => wallet.kind === "local")
              .map((wallet) => ({
                brandName: wallet.brandName,
                kind: "local" as const,
                remainingGbp: remainingGbp(wallet),
                committedGbp: remainingGbp(wallet) + wallet.allocatedGbp,
                logoUrl: sponsorLogoSrc(wallet.brandName, null),
              }))}
            projects={funded.map((project) => ({
              number: project.number,
              name: project.name,
            }))}
            projectCount={funded.length || 5}
          />
        </div>
      </div>
    </main>
  );
}
