"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import {
  loadClubSession,
  loadClubProjectBoard,
  fileRecordDownloadName,
  type ClubAccount,
  type ClubFileRecord,
  type ClubProfile,
} from "@/app/services/club-match-day.service";
import type { ClimateProject } from "@/app/services/votes.service";
import { isFeaturedClimateProject } from "@/app/services/votes.service";
import {
  ciltLeagueForClub,
  ciltPositionLabel,
  climateImpactLeagueTable,
} from "@/app/lib/cilt";
import {
  MATCH_DAY_CHOICE_COUNT,
  MATCH_DAY_LEAD_HOURS,
  MATCH_DAY_PROJECT_COUNT,
} from "@/app/lib/partner-projects";
import { formatMoney } from "@/app/lib/sponsorship-auction";
import {
  CLUB_LOGIN_PATH,
  CLUB_REGISTER_PATH,
  CLUB_SELECT_PROJECTS_PATH,
} from "@/app/lib/routes";

export default function ClubDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState<ClubProfile | null>(null);
  const [account, setAccount] = useState<ClubAccount | null>(null);
  const [voted, setVoted] = useState<ClimateProject[]>([]);
  const [funded, setFunded] = useState<ClimateProject[]>([]);
  const [selected, setSelected] = useState<ClimateProject[]>([]);
  const [minAmount, setMinAmount] = useState<number | null>(null);
  const [records, setRecords] = useState<ClubFileRecord[]>([]);
  const [unlinked, setUnlinked] = useState(false);

  useEffect(() => {
    async function load() {
      const session = await loadClubSession();
      if (!session) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.replace(CLUB_LOGIN_PATH);
          return;
        }
        setUnlinked(true);
        setLoading(false);
        return;
      }
      setAccount(session.account);
      setClub(session.club);

      const board = await loadClubProjectBoard(session.club.id, session.club.name);
      setVoted(board.voted);
      setFunded(board.funded);
      setSelected(board.selected);
      setMinAmount(board.minAmount);
      setRecords(board.records);
      setLoading(false);
    }

    load();
  }, [router]);

  const extraTonnes = useMemo(
    () =>
      [...funded, ...voted].reduce(
        (sum, project) => sum + (Number(project.estimated_co2) || 0),
        0
      ),
    [funded, voted]
  );
  const ciltLeague = club ? ciltLeagueForClub(club.name) : null;
  const cilt =
    club && ciltLeague
      ? climateImpactLeagueTable(ciltLeague, club.name, extraTonnes)
      : [];
  const clubRow = cilt.find((row) => row.isClub);

  function downloadFileRecord() {
    if (!club) return;
    const payload = {
      club: club.name,
      country: club.country,
      savedAt: new Date().toISOString(),
      thisMatchDay: {
        minAmount,
        selected,
        voted,
        funded,
      },
      records,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileRecordDownloadName(club.name);
    link.click();
    URL.revokeObjectURL(url);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push(CLUB_LOGIN_PATH);
  }

  if (unlinked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="max-w-lg rounded-2xl bg-slate-900 p-8 text-center">
          <h1 className="text-3xl font-black">Club account not linked yet</h1>
          <p className="mt-4 text-slate-300">
            You are signed in, but this email is not attached to a club
            Sustainability Director profile yet. Complete club registration
            and you will land on the dashboard.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href={CLUB_REGISTER_PATH}
              className="rounded-xl bg-green-500 px-6 py-3 font-bold text-slate-950"
            >
              Complete club registration
            </a>
            <button
              onClick={logout}
              className="rounded-xl border border-slate-600 px-6 py-3 font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (loading || !club || !account) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading Dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black">{club.name}</h1>
            <p className="mt-2 text-slate-400">
              Welcome to your Score-4-Our-Planet Club Dashboard
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-xl bg-red-500 px-5 py-3 font-semibold"
          >
            Logout
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <DashboardCard title="Status" value={account.status} />
          <DashboardCard title="Supporters" value={account.supporter_base} />
          <DashboardCard title="Attendance" value={account.average_attendance} />
          <DashboardCard title="Country" value={club.country} />
        </div>

        <div className="mt-10 rounded-2xl bg-slate-900 p-8">
          <h2 className="mb-6 text-2xl font-bold">Club Representative</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Info label="Name">
              {account.first_name} {account.last_name}
            </Info>
            <Info label="Role">{account.job_title}</Info>
            <Info label="Email">{account.email}</Info>
            <Info label="Phone">{account.phone}</Info>
          </div>
        </div>

        <section className="mt-12 rounded-3xl border border-slate-700 bg-slate-900 p-10">
          <div className="text-center">
            <h2 className="text-4xl font-black md:text-5xl">
              Select Your {MATCH_DAY_PROJECT_COUNT} Climate Projects for this
              Match Day
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-xl text-slate-300">
              Global Schools Solar is included in every Match Day five. Choose{" "}
              {MATCH_DAY_CHOICE_COUNT} Climate Partner projects (UK and
              international) for supporters to vote on. {MATCH_DAY_LEAD_HOURS}{" "}
              hours before kick-off, attach the minimum sponsorship amount per
              Goal scored by {club.name} players.
            </p>
          </div>

          <button
            className="mt-10 w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white hover:bg-blue-500"
            onClick={() => router.push(CLUB_SELECT_PROJECTS_PATH)}
          >
            Select Your {MATCH_DAY_PROJECT_COUNT} Climate Projects for this
            Match Day
          </button>

          <div className="mt-10 text-left">
            <h3 className="text-2xl font-black">
              This Match Day — Selected Climate Projects
            </h3>
            {minAmount != null && (
              <p className="mt-2 text-sm text-green-300">
                Minimum sponsorship: {formatMoney(minAmount)}/Goal
              </p>
            )}
            <ProjectGrid
              projects={selected}
              empty={`No projects selected for this Match Day yet. Global Schools Solar will be included automatically once you choose ${MATCH_DAY_CHOICE_COUNT} Climate Partner projects.`}
              badge="Selected"
            />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-black">Voted-For Projects</h2>
          <p className="mt-2 text-slate-400">
            Climate projects supporters have voted for on your match-day
            campaign.
          </p>
          <ProjectGrid
            projects={voted}
            empty="No supporter votes yet. Once fans vote on My S4P, those projects appear here."
            badge="Voted"
          />
        </section>

        <section className="mt-12 rounded-3xl border border-slate-700 bg-slate-900 p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
                Match Day File Record
              </p>
              <h2 className="mt-2 text-3xl font-black">
                Selected and voted projects, kept for lookback
              </h2>
              <p className="mt-2 max-w-2xl text-slate-400">
                Every confirmed Match Day selection and every voted project is
                stored in this club file record so the Sustainability Director
                can look back later.
              </p>
            </div>
            <button
              onClick={downloadFileRecord}
              className="rounded-xl border border-green-500 px-5 py-3 font-semibold text-green-400"
            >
              Download file record
            </button>
          </div>

          {records.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-950 p-8 text-slate-400">
              No file records yet. Confirm {MATCH_DAY_PROJECT_COUNT} Match Day
              projects to create the first record.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="rounded-2xl border border-slate-700 bg-slate-950 p-6"
                >
                  <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                    <h3 className="text-xl font-bold">{record.matchLabel}</h3>
                    <p className="text-sm text-slate-400">
                      {new Date(record.savedAt).toLocaleString("en-GB")}
                    </p>
                  </div>
                  {record.minAmount != null && (
                    <p className="mt-2 text-sm text-green-300">
                      Minimum sponsorship: {formatMoney(record.minAmount)}/Goal
                    </p>
                  )}
                  <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Selected
                  </p>
                  <ul className="mt-2 space-y-1 text-slate-300">
                    {record.selected.map((project) => (
                      <li key={project.id}>• {project.name}</li>
                    ))}
                  </ul>
                  <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Voted
                  </p>
                  {record.voted.length === 0 ? (
                    <p className="mt-2 text-slate-500">No votes recorded yet.</p>
                  ) : (
                    <ul className="mt-2 space-y-1 text-slate-300">
                      {record.voted.map((project) => (
                        <li key={project.id}>• {project.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-12">
          <h2 className="text-3xl font-black">Funded Projects</h2>
          <p className="mt-2 text-slate-400">
            Projects unlocked when {club.name} players score and the locked
            sponsorship is paid.
          </p>
          <ProjectGrid
            projects={funded}
            empty="No projects have been funded from Goals yet."
            funded
          />
        </section>

        <section className="mt-12 rounded-3xl border border-slate-700 bg-slate-900 p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-400">
                S4P Climate Impact League Table
              </p>
              <h2 className="mt-2 text-3xl font-black">
                CILT · {ciltLeague ?? "League"}
              </h2>
              <p className="mt-2 max-w-2xl text-slate-400">
                {ciltLeague
                  ? `${
                      ciltLeague === "Scottish Premiership"
                        ? "Scottish Premier League"
                        : ciltLeague
                    } clubs ranked by tonnes of carbon avoided, reduced or offset from Goals scored and fan votes.`
                  : "Clubs ranked by tonnes of carbon avoided, reduced or offset from sponsorship funded by Goals scored."}
              </p>
            </div>
            {clubRow && (
              <div className="rounded-2xl bg-green-500 px-6 py-4 text-slate-950">
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                  {club.name} position
                </p>
                <p className="text-3xl font-black">
                  {ciltPositionLabel(clubRow)}
                </p>
                <p className="text-sm font-semibold">
                  {clubRow.tonnes.toLocaleString("en-GB")} t CO₂
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800">
            <div className="grid grid-cols-12 bg-slate-950 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span className="col-span-2">Pos</span>
              <span className="col-span-7">Club</span>
              <span className="col-span-3 text-right">t CO₂</span>
            </div>
            {cilt.map((row) => (
              <div
                key={row.club}
                className={`grid grid-cols-12 border-t border-slate-800 px-5 py-4 ${
                  row.isClub ? "bg-green-500 text-slate-950" : "bg-slate-950/40"
                }`}
              >
                <strong className="col-span-2">{row.position}</strong>
                <span className="col-span-7 font-semibold">{row.club}</span>
                <span className="col-span-3 text-right font-black">
                  {row.tonnes.toLocaleString("en-GB")}
                </span>
              </div>
            ))}
            {cilt.length === 0 && (
              <div className="border-t border-slate-800 px-5 py-6 text-slate-400">
                This club is not yet ranked in a CILT league table.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function ProjectGrid({
  projects,
  empty,
  funded = false,
  badge,
}: {
  projects: ClimateProject[];
  empty: string;
  funded?: boolean;
  badge?: string;
}) {
  if (projects.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-8 text-slate-400">
        {empty}
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-6 md:grid-cols-2">
      {projects.map((project) => (
        <div
          key={project.id}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-xl font-bold">{project.name}</h3>
            {(funded || badge || isFeaturedClimateProject(project)) && (
              <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-400">
                {funded
                  ? "Funded"
                  : isFeaturedClimateProject(project)
                    ? "Featured"
                    : badge}
              </span>
            )}
          </div>
          {project.country && (
            <p className="mt-1 text-sm text-slate-400">📍 {project.country}</p>
          )}
          <p className="mt-3 text-slate-300">{project.description}</p>
          {project.estimated_co2 != null && (
            <p className="mt-4 text-sm font-semibold text-green-400">
              {project.estimated_co2.toLocaleString("en-GB")} t CO₂
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function DashboardCard({
  title,
  value,
}: {
  title: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="rounded-2xl bg-slate-900 p-6">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-3 text-3xl font-black text-green-400">{value ?? "—"}</p>
    </div>
  );
}

function Info({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-lg">{children}</p>
    </div>
  );
}
