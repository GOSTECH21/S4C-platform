"use client";

import { useMemo, useState } from "react";
import FanNav from "@/app/dashboard/supporter/components/FanNav";
import TeamPicker from "@/app/components/fan/TeamPicker";
import {
  FAN_REGISTER_TEAMS_COPY,
  FAN_REGISTER_TEAMS_INTRO,
} from "@/app/lib/fan-register-copy";
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
  const [open, setOpen] = useState(false);

  return (
    <main className="min-h-screen p-4 text-white sm:p-10">
      <div className="mx-auto max-w-5xl">
        <FanNav />
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          My Teams
        </p>
        <div
          data-saved-teams-accordion="saved-teams-accordion-v1"
          className="mt-3 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950"
        >
          <h3>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="preview-saved-teams-picker"
              onClick={() => setOpen((value) => !value)}
              className="flex w-full items-center justify-between gap-3 p-4 text-left sm:p-5"
            >
              <span className="text-base font-semibold text-slate-200 sm:text-lg">
                {FAN_REGISTER_TEAMS_INTRO}
              </span>
              <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                {open ? "Hide" : "Change teams"}
              </span>
            </button>
          </h3>
          {open ? (
            <div id="preview-saved-teams-picker" className="px-4 pb-5 sm:px-5">
              <h2 className="text-3xl font-black">Add or change teams</h2>
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
              <button
                type="button"
                className="mt-8 w-full rounded-lg bg-green-400 py-4 font-bold text-slate-950"
              >
                Save My Teams
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
