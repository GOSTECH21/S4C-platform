"use client";

import { useMemo, useState } from "react";
import {
  climateProjectGroupById,
  visibleClimateProjectGroups,
  votingPeriodLabel,
  type ClimateProjectGroup,
} from "@/app/lib/climate-project-groups";
import {
  projectsInClimateGroup,
  type ArchivedClimateProject,
} from "@/app/lib/climate-funding";
import { formatLongMatchDate } from "@/app/lib/s4p-climate-projects";
import { formatWalletGbp } from "@/app/lib/sponsor-wallet";

export function ClimateProjectGroupFolders({
  clubName,
  archive,
  currentWindowId = null,
}: {
  clubName: string;
  archive: ArchivedClimateProject[];
  currentWindowId?: string | null;
}) {
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const previous = useMemo(
    () =>
      currentWindowId
        ? archive.filter((row) => row.windowId !== currentWindowId)
        : archive,
    [archive, currentWindowId]
  );
  const counts = useMemo(() => {
    const next: Record<string, number> = {};
    for (const row of previous) {
      next[row.groupId] = (next[row.groupId] ?? 0) + 1;
    }
    return next;
  }, [previous]);
  const groups = visibleClimateProjectGroups(counts);
  const openGroup = climateProjectGroupById(openGroupId);
  const listed = openGroup
    ? projectsInClimateGroup(previous, openGroup.id)
    : [];

  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
          Climate Project Folders
        </p>
        <h2 className="mt-2 text-2xl font-black">Climate Project Folders</h2>
        <p className="mt-1 text-sm text-slate-400">
          Open a group to see every previous project {clubName}&apos;s
          Sustainability Director posted, and how much it received during its
          5-day Vote.
        </p>
      </div>

      {openGroup ? (
        <OpenedClimateGroup
          clubName={clubName}
          group={openGroup}
          projects={listed}
          onBack={() => setOpenGroupId(null)}
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <li key={group.id}>
              <button
                type="button"
                onClick={() => setOpenGroupId(group.id)}
                className="flex h-full w-full flex-col rounded-2xl border border-slate-800 bg-slate-900 p-5 text-left hover:border-green-500/40 hover:bg-slate-800"
              >
                <span className="text-3xl" aria-hidden>
                  📁
                </span>
                <span className="mt-3 text-lg font-black text-white">
                  {group.folderLabel}
                </span>
                <span className="mt-1 text-sm text-slate-400">{group.title}</span>
                <span className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-green-400">
                  {counts[group.id] ?? 0} posted
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function OpenedClimateGroup({
  clubName,
  group,
  projects,
  onBack,
}: {
  clubName: string;
  group: ClimateProjectGroup;
  projects: ArchivedClimateProject[];
  onBack: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-semibold text-green-300 hover:text-green-200"
      >
        ← Climate Project Folders
      </button>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
        {group.folderLabel}
      </p>
      <h3 className="mt-2 text-2xl font-black">{group.title}</h3>
      <p className="mt-1 text-sm text-slate-400">
        Previous {group.title.toLowerCase()} posted by {clubName}&apos;s
        Sustainability Director. Received is the total from that project&apos;s
        5-day Vote.
      </p>

      {projects.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-slate-700 bg-slate-950 p-6 text-slate-400">
          No previous {group.title.toLowerCase()} have been posted by{" "}
          {clubName}&apos;s Sustainability Director yet.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {projects.map((project) => (
            <li
              key={`${project.windowId}:${project.id}`}
              className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-bold text-white">{project.name}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {project.matchDate
                    ? `Match Day ${formatLongMatchDate(project.matchDate) ?? project.matchDate}`
                    : "Match Day project"}
                  {" · "}
                  {votingPeriodLabel(project.postedAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Received
                </p>
                <p className="text-xl font-black text-green-400">
                  {formatWalletGbp(project.fundedGbp)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
