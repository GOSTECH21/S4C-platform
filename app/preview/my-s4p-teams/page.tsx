"use client";

import { useMemo, useState } from "react";
import FanNav from "@/app/dashboard/supporter/components/FanNav";
import TeamPicker from "@/app/components/fan/TeamPicker";
import { FAN_REGISTER_TEAMS_COPY } from "@/app/lib/fan-register-copy";
import {
  fanRegisterCatalog,
  type TeamOption,
} from "@/app/services/teams.service";

const PREVIEW_NAMES = ["Real Madrid", "Everton"];

export default function MyS4pTeamsPreviewPage() {
  const catalog = useMemo(() => fanRegisterCatalog(), []);
  const seeded = useMemo(
    () =>
      catalog
        .flatMap((group) =>
          group.competitions.flatMap((competition) => competition.teams)
        )
        .filter((team) => PREVIEW_NAMES.includes(team.displayName)),
    [catalog]
  );
  const [selected, setSelected] = useState<TeamOption[]>(seeded);

  return (
    <main className="min-h-screen p-4 text-white sm:p-10">
      <div className="mx-auto max-w-5xl">
        <FanNav />
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          My Teams
        </p>
        <h1 className="mt-3 text-3xl font-black">Add or change teams</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          {FAN_REGISTER_TEAMS_COPY}
        </p>
        <button
          type="button"
          className="mt-6 rounded-lg border border-green-500/40 px-5 py-3 font-bold text-green-300"
        >
          Show my teams
        </button>
        <div className="mt-8">
          <TeamPicker
            catalog={catalog}
            selected={selected}
            onChange={setSelected}
            showScorePrice={false}
            openCompetitions={new Set()}
            catalogAccordion
          />
        </div>
      </div>
    </main>
  );
}
