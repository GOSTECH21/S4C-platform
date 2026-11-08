"use client";

import { useMemo, useState } from "react";
import {
  ADMIN_BACKEND_STAMP,
  type AdminBackendSnapshot,
  type AdminClubRecord,
  type AdminRole,
  type AdminSponsorAccount,
  type AdminSupporterRecord,
} from "@/app/lib/admin-backend";
import { setAdminParticipantPresence } from "@/app/services/admin-backend.service";

const SEGMENTS = [
  { id: "clubs", label: "Clubs" },
  { id: "supporters", label: "Supporters" },
  { id: "lead", label: "Lead Climate Sponsors" },
  { id: "local", label: "Local Business Climate Sponsors" },
] as const;

function StatusBadge({ status }: { status: "on-platform" | "removed" }) {
  const on = status === "on-platform";
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
        on
          ? "bg-emerald-500/15 text-emerald-300"
          : "bg-red-500/15 text-red-300"
      }`}
    >
      {on ? "On platform" : "Removed"}
    </span>
  );
}

function KeepDelete({
  status,
  busy,
  onKeep,
  onDelete,
}: {
  status: "on-platform" | "removed";
  busy: boolean;
  onKeep: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        data-admin-keep="true"
        disabled={busy || status === "on-platform"}
        onClick={onKeep}
        className="rounded-full border border-emerald-400/40 px-4 py-2 text-sm font-semibold text-emerald-200 disabled:opacity-40"
      >
        Keep
      </button>
      <button
        type="button"
        data-admin-delete="true"
        disabled={busy || status === "removed"}
        onClick={onDelete}
        className="rounded-full border border-red-400/40 px-4 py-2 text-sm font-semibold text-red-200 disabled:opacity-40"
      >
        Delete
      </button>
    </div>
  );
}

function LineList({
  label,
  items,
  empty,
}: {
  label: string;
  items: string[];
  empty: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      {items.length === 0 ? (
        <p className="mt-1 text-sm text-slate-500">{empty}</p>
      ) : (
        <ul className="mt-1 space-y-1 text-sm text-slate-200">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AdminBackendHome({
  snapshot,
  persist = true,
  onChange,
}: {
  snapshot: AdminBackendSnapshot;
  persist?: boolean;
  onChange?: (next: AdminBackendSnapshot) => void;
}) {
  const [open, setOpen] = useState<string>("clubs");
  const [busyId, setBusyId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      clubs: snapshot.clubs.filter((row) => row.status === "on-platform").length,
      supporters: snapshot.supporters.filter((row) => row.status === "on-platform")
        .length,
      lead: snapshot.lead.filter((row) => row.status === "on-platform").length,
      local: snapshot.local.filter((row) => row.status === "on-platform").length,
    }),
    [snapshot]
  );

  async function setPresence(
    row: {
      id: string;
      role: AdminRole;
      email?: string;
      brandName?: string;
      directorId?: string;
      supporterId?: string;
      sponsorId?: string;
    },
    keep: boolean
  ) {
    setBusyId(row.id);
    if (persist) {
      await setAdminParticipantPresence({ ...row, keep });
    }
    const status = keep ? "on-platform" : "removed";
    const next: AdminBackendSnapshot = {
      ...snapshot,
      clubs: snapshot.clubs.map((item) =>
        item.id === row.id ? { ...item, status } : item
      ),
      supporters: snapshot.supporters.map((item) =>
        item.id === row.id ? { ...item, status } : item
      ),
      lead: snapshot.lead.map((item) =>
        item.id === row.id ? { ...item, status } : item
      ),
      local: snapshot.local.map((item) =>
        item.id === row.id ? { ...item, status } : item
      ),
    };
    onChange?.(next);
    setBusyId(null);
  }

  return (
    <div data-admin-backend={ADMIN_BACKEND_STAMP} className="space-y-8">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Clubs" value={counts.clubs} />
        <StatCard label="Supporters" value={counts.supporters} />
        <StatCard label="Lead Climate Sponsors" value={counts.lead} />
        <StatCard label="Local Business Climate Sponsors" value={counts.local} />
      </section>

      {SEGMENTS.map((segment) => {
        const count =
          segment.id === "clubs"
            ? snapshot.clubs.length
            : segment.id === "supporters"
              ? snapshot.supporters.length
              : segment.id === "lead"
                ? snapshot.lead.length
                : snapshot.local.length;
        const isOpen = open === segment.id;
        return (
          <details
            key={segment.id}
            data-admin-segment={segment.id}
            open={isOpen}
            onToggle={(event) => {
              if ((event.target as HTMLDetailsElement).open) setOpen(segment.id);
            }}
            className="rounded-3xl border border-slate-700 bg-slate-900"
          >
            <summary className="cursor-pointer list-none px-5 py-4 text-xl font-black sm:px-8 sm:text-2xl">
              {segment.label}
              <span className="ml-3 text-sm font-semibold uppercase tracking-[0.2em] text-green-400">
                {count}
              </span>
            </summary>
            <div className="space-y-4 border-t border-slate-800 px-5 py-5 sm:px-8">
              {segment.id === "clubs" &&
                (snapshot.clubs.length === 0 ? (
                  <p className="text-slate-500">No clubs registered yet.</p>
                ) : (
                  snapshot.clubs.map((club) => (
                    <ClubCard
                      key={club.id}
                      club={club}
                      busy={busyId === club.id}
                      onKeep={() => void setPresence(club, true)}
                      onDelete={() => void setPresence(club, false)}
                    />
                  ))
                ))}
              {segment.id === "supporters" &&
                (snapshot.supporters.length === 0 ? (
                  <p className="text-slate-500">No supporters registered yet.</p>
                ) : (
                  snapshot.supporters.map((fan) => (
                    <SupporterCard
                      key={fan.id}
                      fan={fan}
                      busy={busyId === fan.id}
                      onKeep={() => void setPresence(fan, true)}
                      onDelete={() => void setPresence(fan, false)}
                    />
                  ))
                ))}
              {segment.id === "lead" &&
                (snapshot.lead.length === 0 ? (
                  <p className="text-slate-500">
                    No Lead Climate Sponsor accounts yet.
                  </p>
                ) : (
                  snapshot.lead.map((row) => (
                    <SponsorCard
                      key={row.id}
                      account={row}
                      busy={busyId === row.id}
                      onKeep={() => void setPresence(row, true)}
                      onDelete={() => void setPresence(row, false)}
                    />
                  ))
                ))}
              {segment.id === "local" &&
                (snapshot.local.length === 0 ? (
                  <p className="text-slate-500">
                    No Local Business Climate Sponsor accounts yet.
                  </p>
                ) : (
                  snapshot.local.map((row) => (
                    <SponsorCard
                      key={row.id}
                      account={row}
                      busy={busyId === row.id}
                      onKeep={() => void setPresence(row, true)}
                      onDelete={() => void setPresence(row, false)}
                    />
                  ))
                ))}
            </div>
          </details>
        );
      })}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-950 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
    </div>
  );
}

function ClubCard({
  club,
  busy,
  onKeep,
  onDelete,
}: {
  club: AdminClubRecord;
  busy: boolean;
  onKeep: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="rounded-2xl border border-slate-700 bg-slate-950 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-2xl font-black">{club.clubName}</h3>
          <p className="mt-1 font-semibold">{club.directorName}</p>
          <p className="text-sm text-slate-400">{club.email || "No email"}</p>
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          <StatusBadge status={club.status} />
          <KeepDelete
            status={club.status}
            busy={busy}
            onKeep={onKeep}
            onDelete={onDelete}
          />
        </div>
      </div>
      {club.matches.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          No matches put up for sponsorship yet.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {club.matches.map((match) => (
            <div
              key={match.matchLabel}
              className="grid gap-4 rounded-xl border border-slate-800 p-4 md:grid-cols-2"
            >
              <p className="md:col-span-2 text-lg font-bold">{match.matchLabel}</p>
              <LineList
                label="Climate Projects"
                items={match.projectNames}
                empty="No Climate Project list for this match."
              />
              <LineList
                label="Invitations sent"
                items={match.invited}
                empty="No invitations sent yet."
              />
              <LineList
                label="Sponsors who proceeded"
                items={match.proceeded}
                empty="No sponsors have proceeded yet."
              />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function SupporterCard({
  fan,
  busy,
  onKeep,
  onDelete,
}: {
  fan: AdminSupporterRecord;
  busy: boolean;
  onKeep: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="rounded-2xl border border-slate-700 bg-slate-950 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-xl font-black">{fan.fullName}</h3>
          <p className="text-sm text-slate-400">{fan.email}</p>
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          <StatusBadge status={fan.status} />
          <KeepDelete
            status={fan.status}
            busy={busy}
            onKeep={onKeep}
            onDelete={onDelete}
          />
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <LineList
          label="Team they support"
          items={fan.teams}
          empty="No team recorded yet."
        />
        <LineList
          label="Climate Projects funded"
          items={fan.fundedProjects.map(
            (row) =>
              `${row.projectName} — ${row.clubName}${
                row.gbp ? ` (£${row.gbp.toFixed(2)})` : ""
              }`
          )}
          empty="No Climate Project funding recorded yet."
        />
        <LineList
          label="P4P interactions"
          items={fan.p4p.map(
            (row) => `${row.fixtureName} — ${row.projectName}`
          )}
          empty="No P4P interactions recorded yet."
        />
        <LineList
          label="Matchrav"
          items={fan.matchrav.map(
            (row) => `${row.fixtureName || row.clubName} — ${row.kg} kg`
          )}
          empty="No Matchrav journeys recorded yet."
        />
      </div>
    </article>
  );
}

function SponsorCard({
  account,
  busy,
  onKeep,
  onDelete,
}: {
  account: AdminSponsorAccount;
  busy: boolean;
  onKeep: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="rounded-2xl border border-slate-700 bg-slate-950 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-xl font-black">{account.brandName}</h3>
          <p className="font-semibold">{account.contactName || "No contact name"}</p>
          <p className="text-sm text-slate-400">{account.email || "No email"}</p>
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          <StatusBadge status={account.status} />
          <KeepDelete
            status={account.status}
            busy={busy}
            onKeep={onKeep}
            onDelete={onDelete}
          />
        </div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <LineList
          label="Teams"
          items={account.teams}
          empty="No teams recorded yet."
        />
        <LineList
          label="Climate Projects sponsored"
          items={account.projectLog.map((row) =>
            row.projectNames.length
              ? `${row.clubName} — ${row.matchLabel}: ${row.projectNames.join(", ")}`
              : `${row.clubName} — ${row.matchLabel}`
          )}
          empty="No Climate Project log for this account yet."
        />
      </div>
    </article>
  );
}
