"use client";

import {
  formatRemainingAmount,
  rankClimateProjectsByVotes,
  remainingAmountAfterVotes,
  stipulatedVoteAmount,
  votePoolAmount,
  type ClimateProjectVoteRow,
} from "@/app/lib/climate-projects-leaderboard";
import { formatStipulatedRate } from "@/app/lib/sponsorship-auction";

function rankTone(rank: number): string {
  if (rank === 1) return "bg-amber-400 text-slate-950";
  if (rank === 2) return "bg-slate-300 text-slate-950";
  if (rank === 3) return "bg-amber-700 text-white";
  return "bg-slate-800 text-slate-200";
}

export function ClimateProjectsLeaderboard({
  clubName,
  projects,
  votedIds,
  requiredVotes,
  totalAmount,
  amountPerVote,
  onVote,
  busy = false,
}: {
  clubName: string;
  projects: ClimateProjectVoteRow[];
  votedIds: Set<string>;
  requiredVotes: number;
  totalAmount: number;
  amountPerVote: number;
  onVote: (projectId: string) => void;
  busy?: boolean;
}) {
  const ranked = rankClimateProjectsByVotes(projects);
  const votesCast = votedIds.size;
  const remainingVotes = Math.max(0, requiredVotes - votesCast);
  const remainingAmount = remainingAmountAfterVotes({
    totalAmount: votePoolAmount(totalAmount),
    votes: votesCast,
    amountPerVote,
  });
  const cost = stipulatedVoteAmount(amountPerVote);

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-black">Climate Projects Leaderboard</h2>
          <p className="mt-1 text-sm text-slate-400">
            Each Vote reduces the remaining amount by{" "}
            {formatStipulatedRate(amountPerVote)}, as stipulated by {clubName}.
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
            Remaining amount
          </p>
          <p className="text-2xl font-black text-green-400">
            {formatRemainingAmount(remainingAmount)}
          </p>
          <p className="text-xs text-slate-500">
            {remainingVotes} of {requiredVotes} votes left
          </p>
        </div>
      </div>

      {ranked.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
          No climate projects are posted for this Match Day yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full text-left">
            <caption className="sr-only">
              Climate Projects Leaderboard by votes
            </caption>
            <thead className="bg-slate-900 text-xs uppercase tracking-[0.16em] text-slate-400">
              <tr>
                <th className="p-4">Voted Ranking</th>
                <th className="p-4">Climate Project</th>
                <th className="p-4 text-right">Votes</th>
                <th className="p-4 text-right">Vote</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((row) => {
                const alreadyVoted = votedIds.has(row.id);
                const blocked =
                  busy ||
                  alreadyVoted ||
                  remainingVotes <= 0 ||
                  (cost > 0 && remainingAmount < cost);
                return (
                  <tr
                    key={row.id}
                    className="border-t border-slate-800 bg-slate-950/60 hover:bg-slate-900"
                  >
                    <td className="p-4">
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${rankTone(row.rank)}`}
                      >
                        {row.rank}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-white">{row.name}</td>
                    <td className="p-4 text-right text-lg font-black text-green-400">
                      {row.votesReceived.toLocaleString("en-GB")}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        aria-label={`Vote for ${row.name}`}
                        disabled={blocked}
                        onClick={() => onVote(row.id)}
                        className={`rounded-xl px-4 py-2 text-sm font-bold ${
                          alreadyVoted
                            ? "bg-slate-800 text-green-300"
                            : blocked
                              ? "cursor-not-allowed bg-slate-800 text-slate-500"
                              : "bg-green-500 text-slate-950 hover:bg-green-400"
                        }`}
                      >
                        {alreadyVoted ? "Voted" : "Vote"}
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
