"use client";

import { useMemo, useState } from "react";
import type { TeamGroup, TeamOption } from "@/app/services/teams.service";
import { CURRENT_SEASON } from "@/app/lib/current-season";

const DEFAULT_OPEN = new Set([
  "Premier League",
  "Scottish Premiership",
  "Six Nations",
]);

export default function TeamPicker({
  catalog,
  selected,
  onChange,
}: {
  catalog: TeamGroup[];
  selected: TeamOption[];
  onChange: (teams: TeamOption[]) => void;
}) {
  const [query, setQuery] = useState("");
  const selectedIds = new Set(selected.map((team) => team.id));

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return catalog;
    return catalog
      .map((group) => ({
        ...group,
        competitions: group.competitions
          .map((competition) => ({
            ...competition,
            teams: competition.teams.filter((team) =>
              `${team.displayName} ${team.competition} ${group.sport}`
                .toLowerCase()
                .includes(needle)
            ),
          }))
          .filter((competition) => competition.teams.length > 0),
      }))
      .filter((group) => group.competitions.length > 0);
  }, [catalog, query]);

  function toggle(team: TeamOption) {
    if (selectedIds.has(team.id)) {
      onChange(selected.filter((item) => item.id !== team.id));
      return;
    }
    onChange([...selected, team]);
  }

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search teams, leagues, or sports"
        className="w-full rounded-md bg-slate-800 p-3"
      />

      {selected.length > 0 && (
        <p className="mt-3 text-sm text-slate-300">
          Supporting {selected.length} team{selected.length === 1 ? "" : "s"}:{" "}
          {selected.map((team) => team.displayName).join(", ")}
        </p>
      )}

      <div className="mt-6 space-y-6">
        {filtered.map((group) => (
          <section
            key={group.sport}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
            <h2 className="text-2xl font-bold text-green-400">{group.sport}</h2>
            <div className="mt-5 space-y-5">
              {group.competitions.map((competition) => (
                <details
                  key={competition.name}
                  open={DEFAULT_OPEN.has(competition.name) || Boolean(query)}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                >
                  <summary className="cursor-pointer list-none font-semibold text-white">
                    {competition.name}
                    <span className="ml-2 text-sm font-normal text-slate-400">
                      {CURRENT_SEASON} · {competition.teams.length} teams
                    </span>
                  </summary>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {competition.teams.map((team) => {
                      const active = selectedIds.has(team.id);
                      return (
                        <button
                          key={team.id}
                          type="button"
                          onClick={() => toggle(team)}
                          className={`rounded-xl border p-4 text-left font-semibold ${
                            active
                              ? "border-green-400 bg-green-400 text-slate-950"
                              : "border-slate-700 bg-slate-900 text-white"
                          }`}
                        >
                          {active ? "✓ " : ""}
                          {team.displayName}
                        </button>
                      );
                    })}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
