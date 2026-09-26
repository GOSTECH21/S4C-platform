"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_WALLET_VOTE_GBP,
  formatWalletGbp,
  remainingGbp,
  type ClimateWallet,
  type NumberedClimateProject,
  type SponsorWalletKind,
} from "@/app/lib/sponsor-wallet";

export function MatchDayWalletVote({
  clubName,
  projects,
  sponsors,
  onVote,
  busy = false,
  votingOpen = true,
  votingMessage,
}: {
  clubName: string;
  projects: NumberedClimateProject[];
  sponsors: Array<{
    brandName: string;
    kind: SponsorWalletKind;
    remainingGbp: number;
    committedGbp?: number;
  }>;
  onVote: (brandName: string, projectNumber: string) => void;
  busy?: boolean;
  votingOpen?: boolean;
  votingMessage?: string;
}) {
  const [numbers, setNumbers] = useState<Record<string, string>>({});

  const wallets = useMemo(
    () =>
      sponsors.map((row) => ({
        ...row,
        remainingGbp: roundDisplay(row.remainingGbp),
      })),
    [sponsors]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black">Climate Project list</h2>
        <p className="mt-1 text-sm text-slate-400">
          {votingMessage ??
            `Look up a sponsor wallet, insert a project number (1–${projects.length || 5}) next to it, then press VOTE. Each vote takes ${formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)} from that wallet and puts it into the chosen ${clubName} Climate Project.`}
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
          No Climate Projects File has been submitted for this Match Day yet.
        </div>
      ) : (
        <ol className="grid gap-3 md:grid-cols-5">
          {projects.map((project) => (
            <li
              key={project.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-400">
                Project {project.number}
              </p>
              <h3 className="mt-2 font-bold leading-tight text-white">
                {project.name}
              </h3>
              <p className="mt-3 text-sm text-slate-400">Received</p>
              <p className="text-xl font-black text-green-400">
                {formatWalletGbp(project.fundedGbp)}
              </p>
            </li>
          ))}
        </ol>
      )}

      <div>
        <h2 className="text-2xl font-black">Sponsor Climate Wallets</h2>
        <p className="mt-1 text-sm text-slate-400">
          Insert the project number in the box next to a wallet, then press
          VOTE.
        </p>
      </div>

      {wallets.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
          No Sponsors File has been submitted for this Match Day yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full text-left">
            <caption className="sr-only">
              Sponsor wallets and remaining climate cash
            </caption>
            <thead className="bg-slate-900 text-xs uppercase tracking-[0.16em] text-slate-400">
              <tr>
                <th className="p-4">Sponsor</th>
                <th className="p-4">Kind</th>
                <th className="p-4 text-right">Remaining</th>
                <th className="p-4">Project number</th>
                <th className="p-4 text-right">Vote</th>
              </tr>
            </thead>
            <tbody>
              {wallets.map((row) => {
                const value = numbers[row.brandName] ?? "";
                const blocked =
                  busy || !votingOpen || row.remainingGbp < DEFAULT_WALLET_VOTE_GBP;
                return (
                  <tr
                    key={row.brandName}
                    className="border-t border-slate-800 bg-slate-950/60"
                  >
                    <td className="p-4 font-bold text-white">{row.brandName}</td>
                    <td className="p-4 text-sm text-slate-400">
                      {row.kind === "lead"
                        ? "Lead Climate Project Sponsor"
                        : "Local Business Climate Sponsor"}
                    </td>
                    <td className="p-4 text-right font-black text-green-400">
                      {formatWalletGbp(row.remainingGbp)} Remaining
                    </td>
                    <td className="p-4">
                      <label className="sr-only" htmlFor={`project-${row.brandName}`}>
                        Project number for {row.brandName}
                      </label>
                      <input
                        id={`project-${row.brandName}`}
                        type="number"
                        min={1}
                        max={projects.length || 5}
                        value={value}
                        onChange={(event) =>
                          setNumbers((prev) => ({
                            ...prev,
                            [row.brandName]: event.target.value,
                          }))
                        }
                        className="w-20 rounded-lg border border-slate-700 bg-slate-900 p-2 text-center text-white"
                        aria-label={`Insert a project number next to ${row.brandName}'s wallet`}
                      />
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        disabled={blocked || !value}
                        onClick={() => onVote(row.brandName, value)}
                        className={`rounded-xl px-4 py-2 text-sm font-bold ${
                          blocked || !value
                            ? "cursor-not-allowed bg-slate-800 text-slate-500"
                            : "bg-green-500 text-slate-950 hover:bg-green-400"
                        }`}
                      >
                        VOTE
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function walletRowsFromWallets(wallets: ClimateWallet[]) {
  return wallets.map((wallet) => ({
    brandName: wallet.brandName,
    kind: wallet.kind,
    remainingGbp: remainingGbp(wallet),
    committedGbp: remainingGbp(wallet) + wallet.allocatedGbp,
  }));
}

function roundDisplay(value: number): number {
  return Math.round((Number(value) || 0) * 100) / 100;
}
