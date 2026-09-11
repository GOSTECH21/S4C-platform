"use client";

import { useState } from "react";
import { groupTeams, type TeamOption } from "@/app/services/teams.service";

export default function MyTeamsList({ teams }: { teams: TeamOption[] }) {
  const [openLeague, setOpenLeague] = useState<string | null>(null);
  const groups = groupTeams(teams);

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
                    <div className="grid gap-3 px-4 pb-4 md:grid-cols-3">
                      {competition.teams.map((team) => (
                        <div
                          key={team.id}
                          className="rounded-xl border border-green-400 bg-green-400 p-4 font-semibold text-slate-950"
                        >
                          ✓ {team.displayName}
                        </div>
                      ))}
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
