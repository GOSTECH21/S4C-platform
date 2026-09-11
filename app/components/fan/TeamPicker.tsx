"use client";

import { useMemo, useState } from "react";
import {
  groupTeams,
  type TeamGroup,
  type TeamOption,
} from "@/app/services/teams.service";

const DEFAULT_OPEN = new Set([
  "Premier League",
  "Scottish Premiership",
  "Six Nations",
]);

export default function TeamPicker({
  catalog,
  selected,
  onChange,
  selectedOnly = false,
}: {
  catalog: TeamGroup[];
  selected: TeamOption[];
  onChange: (teams: TeamOption[]) => void;
  selectedOnly?: boolean;
}) {
  const [query, setQuery] = useState("");
  const selectedIds = new Set(selected.map((team) => team.id));

  const source = selectedOnly ? groupTeams(selected) : catalog;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return source;
    return source
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
  }, [source, query]);

  function toggle(team: TeamOption) {
    if (selectedIds.has(team.id)) {
      onChange(selected.filter((item) => item.id !== team.id));
      return;
    }
    onChange([...selected, team]);
  }

  if (selectedOnly && selected.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-8 text-slate-300">
        You have not selected any teams yet.
      </p>
    );
  }

  return (
    <div>
      {!selectedOnly && (
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search teams, leagues, or sports"
          className="w-full rounded-md bg-slate-800 p-3"
        />
      )}

      <div className={`${selectedOnly ? "" : "mt-6"} space-y-6`}>
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
                  open={
                    selectedOnly
                      ? false
                      : DEFAULT_OPEN.has(competition.name) || Boolean(query)
                  }
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                >
                  <summary className="cursor-pointer list-none font-semibold text-white">
                    {competition.name}
                    <span className="ml-2 text-sm font-normal text-slate-400">
                      {competition.teams.length}{" "}
                      {competition.teams.length === 1 ? "team" : "teams"}
                    </span>
                  </summary>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {competition.teams.map((team) => {
                      const active = selectedIds.has(team.id);
                      if (selectedOnly) {
                        return (
                          <div
                            key={team.id}
                            className="rounded-xl border border-green-400 bg-green-400 p-4 text-left font-semibold text-slate-950"
                          >
                            ✓ {team.displayName}
                          </div>
                        );
                      }
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
