"use client";

import { useMemo, useState } from "react";
import FanNav from "@/app/dashboard/supporter/components/FanNav";
import { MatchDayProjectCard } from "@/app/components/fan/MatchDayProjectCard";
import { ClimateProjectSponsors } from "@/app/components/fan/ClimateProjectSponsors";
import { MatchDayFolderPanel } from "@/app/components/club/MatchDayFolderPanel";
import {
  allocateWalletVote,
  createLeadWallet,
  createLocalWallet,
  DEFAULT_WALLET_VOTE_GBP,
  FUND_IT_LABEL,
  formatWalletGbp,
  walletVoteNotice,
  type ClimateWallet,
  type NumberedClimateProject,
} from "@/app/lib/sponsor-wallet";
import {
  FEATURED_GSS_LOCAL_NAME,
  FEATURED_GSS_WORLD_NAME,
} from "@/app/lib/sccan-catalog";
import {
  applyRemainingToSponsorsFile,
  buildProjectsFile,
  buildSponsorsFile,
  emptyMatchDayFolder,
  saveProjectsIntoFolder,
  saveSponsorsIntoFolder,
  sponsorRowsFromWallets,
  submitMatchDayFolder,
  withLiveWalletRemaining,
  type MatchDayFolder,
} from "@/app/lib/match-day-folder";

const MATCH_DATE = "2026-10-10";

const INITIAL_PROJECTS: NumberedClimateProject[] = [
  { id: "gss-local", name: FEATURED_GSS_LOCAL_NAME, number: 1, fundedGbp: 0, votesReceived: 0 },
  { id: "gss-world", name: FEATURED_GSS_WORLD_NAME, number: 2, fundedGbp: 0, votesReceived: 0 },
  { id: "wee", name: "Wee Spoke Hub", number: 3, fundedGbp: 0, votesReceived: 0 },
  { id: "retrofit", name: "Edinburgh Building Retrofit Collective", number: 4, fundedGbp: 0, votesReceived: 0 },
  { id: "porty", name: "Porty Community Energy", number: 5, fundedGbp: 0, votesReceived: 0 },
  { id: "trees", name: "Edinburgh Tree Planting", number: 6, fundedGbp: 0, votesReceived: 0 },
];

function seedWallets(): ClimateWallet[] {
  return [
    createLeadWallet({
      clubName: "Hibernian",
      brandName: "Puma",
      commitmentFeeGbp: 2500,
      gbpPerGoal: 3500,
    }),
    createLocalWallet({
      clubName: "Hibernian",
      brandName: "Top Cellar",
      sponsorshipGbp: 750,
    }),
    createLocalWallet({
      clubName: "Hibernian",
      brandName: "Malmaison Hotel Leith",
      sponsorshipGbp: 1200,
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
    return submitMatchDayFolder(
      saveProjectsIntoFolder(
        saveSponsorsIntoFolder(
          empty,
          buildSponsorsFile({
            matchDate: MATCH_DATE,
            sponsors: sponsorRowsFromWallets(
              seedWallets().filter((wallet) => wallet.kind === "lead"),
              "Hibernian"
            ),
            clubName: "Hibernian",
          })
        ),
        buildProjectsFile({ matchDate: MATCH_DATE, projects: INITIAL_PROJECTS })
      )
    );
  });
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usedSponsorNames, setUsedSponsorNames] = useState<string[]>([]);
  const submitted = Boolean(folder.submittedAt);

  const sponsors = useMemo(
    () =>
      withLiveWalletRemaining(folder.sponsorsFile?.sponsors ?? [], wallets),
    [folder.sponsorsFile, wallets]
  );

  function vote(brandName: string, projectNumber: string) {
    const wallet = wallets.find((row) => row.brandName === brandName);
    if (!wallet) return;
    const result = allocateWalletVote({
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
    setFolder((prev) =>
      prev.sponsorsFile
        ? {
            ...prev,
            sponsorsFile: applyRemainingToSponsorsFile(
              prev.sponsorsFile,
              result.wallet
            ),
          }
        : prev
    );
    setProjects(result.projects);
    setUsedSponsorNames((prev) =>
      prev.includes(result.wallet.brandName)
        ? prev
        : [...prev, result.wallet.brandName]
    );
    setNotice(walletVoteNotice(result));
  }

  return (
    <main className="min-h-screen p-8 text-white">
      <div className="mx-auto max-w-6xl space-y-12">
        <FanNav />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
            Preview
          </p>
          <h1 className="mt-2 text-4xl font-black">Wallet vote · 10th October 2026</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Malmaison Hotel Leith starts at £1,200 even when it is missing from
            the Sponsors File. Select Edinburgh Tree Planting next to that wallet
            and press {FUND_IT_LABEL}: the Carbon Wallet shows{" "}
            {formatWalletGbp(1200 - DEFAULT_WALLET_VOTE_GBP)} and Edinburgh Tree
            Planting receives {formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)}.
            Lead wallets fund a Global Schools Solar version (75%) and split 25%
            across local Climate Projects.
          </p>
        </div>

        <MatchDayFolderPanel
          clubName="Hibernian"
          matchDate={MATCH_DATE}
          onMatchDateChange={() => undefined}
          folder={folder}
          selectedCount={6}
          onSaveSponsors={() =>
            setFolder((prev) =>
              saveSponsorsIntoFolder(
                prev,
                buildSponsorsFile({
                  matchDate: MATCH_DATE,
                  sponsors: sponsorRowsFromWallets(wallets, "Hibernian"),
                  clubName: "Hibernian",
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
              <p className="mt-2 text-sm text-slate-400">
                Project titles are shown first. Open a project for details. Select
                a Climate Project by name next to a sponsor, then press FUND-IT.
              </p>
              <div className="mt-6 space-y-2">
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
                projects={projects.map((project) => ({
                  number: project.number,
                  name: project.name,
                }))}
                projectCount={projects.length}
                usedSponsorNames={usedSponsorNames}
                onVote={({ brandName, projectNumber }) =>
                  vote(brandName, projectNumber ?? "")
                }
              />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
