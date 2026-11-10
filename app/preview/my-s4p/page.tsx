"use client";

import { useEffect, useState } from "react";
import FanNav from "@/app/dashboard/supporter/components/FanNav";
import { CampaignMatchHeader } from "@/app/components/fan/CampaignMatchHeader";
import { FanClimateProjectPager } from "@/app/components/fan/FanClimateProjectPager";
import { loadFundedProjects } from "@/app/lib/climate-funding";
import {
  DEFAULT_WALLET_VOTE_GBP,
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
  const [used, setUsed] = useState<string[]>([]);

  useEffect(() => {
    setFunded(seedProjects());
  }, []);
  const lead = wallets.find((wallet) => wallet.kind === "lead") ?? null;

  return (
    <main className="min-h-screen bg-[#f6f4ea] p-8 text-slate-950">
      <div className="mx-auto max-w-[90rem]">
        <FanNav />
        <CampaignMatchHeader
          clubName="Hibernian"
          matchTitle="Hibernian v Hearts"
          sponsorName={lead?.brandName}
          sponsorLogoUrl={
            lead ? sponsorLogoSrc(lead.brandName, null) : null
          }
          kickoffAt="2026-11-24T20:00:00.000Z"
          venue="Easter Road Stadium"
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

        <div className="mt-10">
          <FanClimateProjectPager
            clubName="Hibernian"
            clubId={PREVIEW_CLUB}
            numbered={funded}
            details={PROJECTS}
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
            usedSponsorNames={used}
            voteError={error}
            voteNotice={notice}
            onFund={({ brandName, projectNumber }) => {
              const project = funded.find(
                (row) => String(row.number) === String(projectNumber)
              );
              if (!project) return false;
              setFunded((prev) =>
                prev.map((row) =>
                  row.id === project.id
                    ? {
                        ...row,
                        fundedGbp: row.fundedGbp + DEFAULT_WALLET_VOTE_GBP,
                        votesReceived: row.votesReceived + 1,
                      }
                    : row
                )
              );
              setWallets((prev) =>
                prev.map((wallet) =>
                  wallet.brandName === brandName
                    ? {
                        ...wallet,
                        allocatedGbp:
                          wallet.allocatedGbp + DEFAULT_WALLET_VOTE_GBP,
                      }
                    : wallet
                )
              );
              setUsed((prev) => [...prev, brandName]);
              setNotice(
                `FUND-IT moved ${formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)} from ${brandName}'s Carbon Wallet into ${project.name}.`
              );
              setError(null);
              return true;
            }}
          />
        </div>
      </div>
    </main>
  );
}
