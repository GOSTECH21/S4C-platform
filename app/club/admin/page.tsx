"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClubNav from "@/app/components/club/ClubNav";
import ClubAddressBookPanel from "@/app/components/club/ClubAddressBookPanel";
import { CLUB_LOGIN_PATH } from "@/app/lib/routes";
import {
  loadClubAddressBooks,
  type ClubAddressBookContact,
} from "@/app/lib/club-address-book";
import {
  loadClubSession,
  type ClubAccount,
  type ClubProfile,
} from "@/app/services/club-match-day.service";
import { clearClubProjectsAndSponsors } from "@/app/services/clear-club-data.service";

export default function ClubAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState<ClubProfile | null>(null);
  const [account, setAccount] = useState<ClubAccount | null>(null);
  const [leadContacts, setLeadContacts] = useState<ClubAddressBookContact[]>([]);
  const [localContacts, setLocalContacts] = useState<ClubAddressBookContact[]>(
    []
  );
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const session = await loadClubSession();
      if (!session) {
        router.replace(CLUB_LOGIN_PATH);
        return;
      }
      setClub(session.club);
      setAccount(session.account);
      const books = loadClubAddressBooks(session.club.id);
      setLeadContacts(books.lead);
      setLocalContacts(books.local);
      setLoading(false);
    }
    void load();
  }, [router]);

  async function startClubAfresh() {
    if (!club) return;
    const ok = window.confirm(
      `Remove every Climate Project and every sponsor attached to ${club.name}? Shared catalog projects stay in the library. This lets you start ${club.name} Match Day from a blank slate.`
    );
    if (!ok) return;
    setClearing(true);
    setError(null);
    try {
      await clearClubProjectsAndSponsors(club.name);
      window.location.reload();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not clear this club's projects and sponsors."
      );
      setClearing(false);
    }
  }

  if (loading || !club || !account) {
    return (
      <main className="flex min-h-screen items-center justify-center text-white">
        Loading My Admin...
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 text-white sm:p-10">
      <div className="mx-auto max-w-7xl">
        <ClubNav />
        {error ? (
          <p className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
            {error}
          </p>
        ) : null}

        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
              My Admin
            </p>
            <h1 className="mt-2 text-4xl font-black">{club.name}</h1>
            <p className="mt-2 text-slate-400">
              Welcome to your Score-4-Our-Planet Club Dashboard
            </p>
          </div>
          <button
            type="button"
            onClick={() => void startClubAfresh()}
            disabled={clearing}
            className="rounded-xl border border-amber-400/50 px-5 py-3 font-semibold text-amber-200 disabled:opacity-50"
          >
            {clearing ? "Clearing…" : "Start this club afresh"}
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <AdminCard title="Status" value={account.status} />
          <AdminCard title="Supporters" value={account.supporter_base} />
          <AdminCard title="Attendance" value={account.average_attendance} />
          <AdminCard title="Country" value={club.country} />
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

        <div className="mt-10 grid gap-8 xl:grid-cols-2">
          <ClubAddressBookPanel
            clubId={club.id}
            kind="lead"
            contacts={leadContacts}
            onChange={setLeadContacts}
          />
          <ClubAddressBookPanel
            clubId={club.id}
            kind="local"
            contacts={localContacts}
            onChange={setLocalContacts}
          />
        </div>
      </div>
    </main>
  );
}

function AdminCard({
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
