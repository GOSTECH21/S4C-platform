"use client";

import { MATCH_DAY_FOLDER_NAME } from "@/app/lib/match-day-folder";
import { MATCH_DAY_PROJECT_COUNT } from "@/app/lib/partner-projects";
import { formatWalletGbp } from "@/app/lib/sponsor-wallet";
import type { MatchDayFolder } from "@/app/lib/match-day-folder";

export function MatchDayFolderPanel({
  clubName,
  matchDate,
  onMatchDateChange,
  folder,
  selectedCount,
  onSaveSponsors,
  onSaveProjects,
  onSubmit,
  busy = false,
  error,
  notice,
}: {
  clubName: string;
  matchDate: string;
  onMatchDateChange: (value: string) => void;
  folder: MatchDayFolder | null;
  selectedCount: number;
  onSaveSponsors: () => void;
  onSaveProjects: () => void;
  onSubmit: () => void;
  busy?: boolean;
  error?: string | null;
  notice?: string | null;
}) {
  const sponsorsFile = folder?.sponsorsFile ?? null;
  const projectsFile = folder?.projectsFile ?? null;
  const canSubmit = Boolean(sponsorsFile && projectsFile);

  return (
    <section className="mt-12 rounded-3xl border border-emerald-400/40 bg-slate-900 p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
        {MATCH_DAY_FOLDER_NAME}
      </p>
      <h2 className="mt-2 text-4xl font-black">{MATCH_DAY_FOLDER_NAME} folder</h2>
      <p className="mt-3 max-w-3xl text-slate-300">
        Three days before kick-off, identify every Climate Project Sponsor who
        wants to help {clubName} address this Match Day carbon footprint, and
        how much they have committed. Save that list, save the five Climate
        Projects fans should fund, then press SUBMIT so registered fans of{" "}
        {clubName} can take cash from those wallets.
      </p>

      <label className="mt-8 block max-w-sm text-sm text-slate-400">
        Match date
        <input
          type="date"
          value={matchDate}
          onChange={(event) => onMatchDateChange(event.target.value)}
          className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
        />
      </label>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-700 bg-slate-950 p-6">
          <h3 className="text-xl font-black">Sponsors File</h3>
          <p className="mt-2 text-sm text-slate-400">
            {sponsorsFile?.fileName ??
              "Save the sponsors and the cash in each Climate Sponsorship Wallet."}
          </p>
          {sponsorsFile?.sponsors.length ? (
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {sponsorsFile.sponsors.map((row) => (
                <li key={row.brandName} className="flex justify-between gap-3">
                  <span>
                    {row.brandName}
                    <span className="block text-xs text-slate-500">
                      {row.kind === "lead"
                        ? "Lead Climate Project Sponsor"
                        : "Local Business Climate Sponsor"}
                    </span>
                  </span>
                  <span className="font-semibold text-green-300">
                    {formatWalletGbp(row.committedGbp)} committed
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              No sponsors file saved yet. Lead wallets show the Day 1
              Commitment Fee; local wallets show the cash they paid in.
            </p>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={onSaveSponsors}
            className="mt-6 w-full rounded-xl border border-emerald-400/50 py-3 font-bold text-emerald-300 hover:bg-emerald-400/10 disabled:opacity-70"
          >
            Save Sponsors File
          </button>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-950 p-6">
          <h3 className="text-xl font-black">Climate Projects File</h3>
          <p className="mt-2 text-sm text-slate-400">
            {projectsFile?.fileName ??
              `Save the ${MATCH_DAY_PROJECT_COUNT} Climate Projects fans will fund from sponsor wallets.`}
          </p>
          {projectsFile?.projects.length ? (
            <ol className="mt-4 space-y-2 text-sm text-slate-300">
              {projectsFile.projects.map((project) => (
                <li key={project.id}>
                  {project.number}. {project.name}
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              {selectedCount >= MATCH_DAY_PROJECT_COUNT
                ? `Ready to save your ${MATCH_DAY_PROJECT_COUNT} chosen Climate Projects.`
                : `Choose ${MATCH_DAY_PROJECT_COUNT} Climate Projects first.`}
            </p>
          )}
          <button
            type="button"
            disabled={busy || selectedCount < MATCH_DAY_PROJECT_COUNT}
            onClick={onSaveProjects}
            className="mt-6 w-full rounded-xl border border-emerald-400/50 py-3 font-bold text-emerald-300 hover:bg-emerald-400/10 disabled:opacity-70"
          >
            Save Climate Projects File
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-6 text-sm font-semibold text-red-400">{error}</p>
      )}
      {notice && !error && (
        <p className="mt-6 text-sm font-semibold text-green-300">{notice}</p>
      )}

      <button
        type="button"
        disabled={busy || !canSubmit}
        onClick={onSubmit}
        className="mt-8 w-full rounded-xl bg-green-500 py-4 text-lg font-bold text-slate-950 hover:bg-green-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
      >
        {busy ? "Submitting..." : "SUBMIT"}
      </button>
      <p className="mt-3 text-center text-sm text-slate-500">
        SUBMIT posts both files so every registered {clubName} fan on S4P can
        see the project list and take cash from sponsor wallets.
      </p>
    </section>
  );
}
