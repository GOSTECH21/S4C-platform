"use client";

import { useMemo, useState } from "react";
import FanNav from "@/app/dashboard/supporter/components/FanNav";
import { MatchDayProjectCard } from "@/app/components/fan/MatchDayProjectCard";
import { ClimateProjectSponsors } from "@/app/components/fan/ClimateProjectSponsors";
import { MatchDayFolderPanel } from "@/app/components/club/MatchDayFolderPanel";
import {
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
import {
  buildProjectsFile,
  buildSponsorsFile,
  emptyMatchDayFolder,
  saveProjectsIntoFolder,
  saveSponsorsIntoFolder,
  sponsorRowsFromWallets,
  submitMatchDayFolder,
  type MatchDayFolder,
} from "@/app/lib/match-day-folder";

const MATCH_DATE = "2026-10-10";

const INITIAL_PROJECTS: NumberedClimateProject[] = [
  { id: "gss", name: "Global Schools Solar", number: 1, fundedGbp: 0, votesReceived: 0 },
  { id: "wee", name: "Wee Spoke Hub", number: 2, fundedGbp: 0, votesReceived: 0 },
  { id: "retrofit", name: "Edinburgh Building Retrofit Collective", number: 3, fundedGbp: 0, votesReceived: 0 },
  { id: "porty", name: "Porty Community Energy", number: 4, fundedGbp: 0, votesReceived: 0 },
  { id: "craigshill", name: "Growing Together Craigshill", number: 5, fundedGbp: 0, votesReceived: 0 },
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
  ];
}

export default function WalletVotePreviewPage() {
  const [wallets, setWallets] = useState(seedWallets);
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [folder, setFolder] = useState<MatchDayFolder>(() => {
    const empty = emptyMatchDayFolder({
      clubId: "hibs",
      clubName: "Hibernian",
      matchDate: MATCH_DATE,
    });
    return saveProjectsIntoFolder(
      saveSponsorsIntoFolder(
        empty,
        buildSponsorsFile({
          matchDate: MATCH_DATE,
          sponsors: sponsorRowsFromWallets(seedWallets()),
        })
      ),
      buildProjectsFile({ matchDate: MATCH_DATE, projects: INITIAL_PROJECTS })
    );
  });
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const submitted = Boolean(folder.submittedAt);

  const sponsors = useMemo(
    () =>
      wallets.map((wallet) => ({
        brandName: wallet.brandName,
        kind: wallet.kind,
        remainingGbp: remainingGbp(wallet),
        committedGbp: remainingGbp(wallet) + wallet.allocatedGbp,
      })),
    [wallets]
  );

  function vote(brandName: string, projectNumber: string, split = false) {
    const wallet = wallets.find((row) => row.brandName === brandName);
    if (!wallet) return;
    const result = split
      ? allocateSplitWalletVote({ wallet, projects })
      : allocateWalletVote({
          wallet,
          projects,
          projectNumber: Number(projectNumber),
        });
    if (!result.ok) {
      setError(result.error);
      setNotice(null);
      return;
    }
    setError(null);
    setWallets((prev) =>
      prev.map((row) => (row.brandName === result.wallet.brandName ? result.wallet : row))
    );
    setProjects(result.projects);
    setNotice(
      split
        ? `${result.wallet.brandName}'s Carbon Wallet now ${formatWalletGbp(remainingGbp(result.wallet))}; each project received ${formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)}.`
        : `${result.wallet.brandName}'s Carbon Wallet now ${formatWalletGbp(remainingGbp(result.wallet))}; Project ${result.project.number} has received ${formatWalletGbp(result.project.fundedGbp)}.`
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl space-y-12">
        <FanNav />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
            Preview
          </p>
          <h1 className="mt-2 text-4xl font-black">Wallet vote · 10th October 2026</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Top Cellar pays £750 + 10% into the Climate Sponsorship Wallet.
            Insert 2 next to that wallet and press VOTE: the wallet shows
            £749.90 Remaining and Project 2 receives £0.10.
          </p>
        </div>

        <MatchDayFolderPanel
          clubName="Hibernian"
          matchDate={MATCH_DATE}
          onMatchDateChange={() => undefined}
          folder={folder}
          selectedCount={5}
          onSaveSponsors={() =>
            setFolder((prev) =>
              saveSponsorsIntoFolder(
                prev,
                buildSponsorsFile({
                  matchDate: MATCH_DATE,
                  sponsors: sponsorRowsFromWallets(wallets),
                })
              )
            )
          }
          onSaveProjects={() =>
            setFolder((prev) =>
              saveProjectsIntoFolder(
                prev,
                buildProjectsFile({ matchDate: MATCH_DATE, projects })
              )
            )
          }
          onSubmit={() => {
            try {
              setFolder((prev) => submitMatchDayFolder(prev));
              setError(null);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Could not submit.");
            }
          }}
        />

        {submitted && (
          <section>
            {error && (
              <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
                {error}
              </div>
            )}
            {notice && !error && (
              <div className="mb-4 rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-green-300">
                ✓ {notice}
              </div>
            )}
            <section className="mt-10">
              <h2 className="text-3xl font-black">Climate Projects List</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {projects.map((project) => (
                  <MatchDayProjectCard
                    key={project.id}
                    project={project}
                    cardIndex={project.number}
                    clubName="Hibernian"
                    showVote={false}
                    showSponsors={false}
                    fundedGbp={project.fundedGbp}
                  />
                ))}
              </div>
            </section>
            <div className="mt-12">
              <ClimateProjectSponsors
                lead={
                  sponsors
                    .filter((row) => row.kind === "lead")
                    .map((row) => ({
                      brandName: row.brandName,
                      kind: "lead" as const,
                      remainingGbp: row.remainingGbp,
                    }))[0] ?? null
                }
                locals={sponsors
                  .filter((row) => row.kind === "local")
                  .map((row) => ({
                    brandName: row.brandName,
                    kind: "local" as const,
                    remainingGbp: row.remainingGbp,
                  }))}
                projectCount={projects.length}
                onLeadVote={({ projectNumber, split }) =>
                  vote("American Express", projectNumber ?? "", split)
                }
                onLocalVote={(brandName, projectNumber) =>
                  vote(brandName, projectNumber)
                }
              />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
