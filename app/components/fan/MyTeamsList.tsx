"use client";

import { useState } from "react";
import { groupTeams, type TeamOption } from "@/app/services/teams.service";
import { MatchLines } from "@/app/components/fan/UpcomingMatches";
import {
  isCupCompetition,
  type UpcomingMatch,
} from "@/app/lib/upcoming-matches";

export default function MyTeamsList({
  teams,
  fixtures,
}: {
  teams: TeamOption[];
  fixtures: Record<string, UpcomingMatch[]>;
}) {
  const groups = groupTeams(teams);
  const firstKey = groups[0]
    ? `${groups[0].sport}:${groups[0].competitions[0]?.name}`
    : null;
  const [openLeague, setOpenLeague] = useState<string | null>(firstKey);

  if (teams.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-8 text-slate-300">
        You have not selected any teams yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section
          key={group.sport}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
        >
          <h2 className="text-2xl font-bold text-green-400">{group.sport}</h2>
          <div className="mt-5 space-y-3">
            {group.competitions.map((competition) => {
              const key = `${group.sport}:${competition.name}`;
              const expanded = openLeague === key;
              return (
                <div
                  key={key}
                  className="rounded-xl border border-slate-800 bg-slate-950"
                >
                  <button
                    type="button"
                    onClick={() => setOpenLeague(expanded ? null : key)}
                    className="flex w-full items-center justify-between px-4 py-4 text-left font-semibold text-white"
                  >
                    <span>{competition.name}</span>
                    <span className="text-sm font-normal text-slate-400">
                      {competition.teams.length}{" "}
                      {competition.teams.length === 1 ? "team" : "teams"}
                    </span>
                  </button>
                  {expanded && (
                    <div className="grid gap-3 px-4 pb-4 md:grid-cols-2">
                      {competition.teams.map((team) => {
                        const matches = fixtures[team.id] ?? [];
                        const cups = matches.filter((match) =>
                          isCupCompetition(match.competition)
                        );
                        return (
                          <div
                            key={team.id}
                            className="rounded-xl border border-green-400 bg-green-400 p-4 text-slate-950"
                          >
                            <p className="font-semibold">✓ {team.displayName}</p>
                            <div className="mt-3 border-t border-green-700/30 pt-3">
                              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-800">
                                Next matches
                              </p>
                              <MatchLines
                                matches={matches.slice(0, 4)}
                                clubName={team.displayName}
                                compact
                              />
                            </div>
                            {cups.length > 0 && (
                              <div className="mt-3 border-t border-green-700/30 pt-3">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-800">
                                  Cup competitions
                                </p>
                                <MatchLines
                                  matches={cups.slice(0, 6)}
                                  clubName={team.displayName}
                                  compact
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
