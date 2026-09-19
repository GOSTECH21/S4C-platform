"use client";

import { useEffect, useMemo, useState } from "react";
import AppLayout from "../layout/AppLayout";
import { groupFansByClub, type RegisteredFan } from "@/app/lib/s4p-admin";
import { loadStaffParticipantRoster } from "@/app/services/s4p-admin.service";
import { supabase } from "@/app/lib/supabase";
import { ADMIN_LOGIN_PATH } from "@/app/lib/routes";

type Director = {
  id: string;
  fullName: string;
  email: string;
  clubName: string;
};

type SponsorRow = {
  id: string;
  brandName: string;
  contactName: string;
  jobTitle: string;
};

export default function S4PAdminHomePage() {
  const [fans, setFans] = useState<RegisteredFan[]>([]);
  const [memberships, setMemberships] = useState<RegisteredFan[]>([]);
  const [directors, setDirectors] = useState<Director[]>([]);
  const [sponsors, setSponsors] = useState<SponsorRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaffParticipantRoster()
      .then((roster) => {
        setFans(roster.fans);
        setMemberships(roster.memberships);
        setDirectors(roster.directors);
        setSponsors(roster.sponsors);
        setError(roster.directorError || roster.sponsorError);
      })
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : "Could not load registered participants."
        )
      )
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo(
    () => groupFansByClub(memberships.length > 0 ? memberships : fans),
    [fans, memberships]
  );

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = ADMIN_LOGIN_PATH;
  }

  return (
    <AppLayout>
      <div className="space-y-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
              S4P Admin Database
            </p>
            <h1 className="mt-2 text-4xl font-black">Registered participants</h1>
            <p className="mt-3 max-w-3xl text-slate-300">
              Authorized S4P staff can see the name and email captured when a
              Fan, Sustainability Director or Sponsorship Manager registers —
              grouped so you can count how many fans support each club.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-xl border border-slate-600 px-5 py-3 font-semibold"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-400">Loading registrations...</p>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Registered fans" value={String(fans.length)} />
              <StatCard
                label="Club Sustainability Directors"
                value={String(directors.length)}
              />
              <StatCard
                label="Sponsorship Managers"
                value={String(sponsors.length)}
              />
            </section>

            <section className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
              <h2 className="text-3xl font-black">Fans by club</h2>
              <p className="mt-2 text-slate-400">
                Totals use the club each fan chose at registration.
              </p>
              {groups.length === 0 ? (
                <p className="mt-6 text-slate-500">No fans registered yet.</p>
              ) : (
                <div className="mt-8 space-y-6">
                  {groups.map((group) => (
                    <div
                      key={group.clubName}
                      className="rounded-2xl border border-slate-700 bg-slate-950 p-6"
                    >
                      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-baseline">
                        <h3 className="text-2xl font-bold">{group.clubName}</h3>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-400">
                          {group.count} fan{group.count === 1 ? "" : "s"}
                        </p>
                      </div>
                      <ul className="mt-4 space-y-2">
                        {group.members.map((fan) => (
                          <li
                            key={`${fan.id}-${fan.clubName}`}
                            className="flex flex-col justify-between gap-1 border-b border-slate-800 py-2 last:border-b-0 md:flex-row"
                          >
                            <span className="font-semibold">{fan.fullName}</span>
                            <span className="text-slate-400">{fan.email}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
                <h2 className="text-2xl font-black">
                  Club Sustainability Directors
                </h2>
                {directors.length === 0 ? (
                  <p className="mt-4 text-slate-500">No club accounts yet.</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {directors.map((row) => (
                      <li key={row.id} className="rounded-xl bg-slate-950 p-4">
                        <p className="font-semibold">{row.fullName}</p>
                        <p className="text-sm text-slate-400">{row.email}</p>
                        <p className="mt-1 text-sm text-green-300">
                          {row.clubName}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
                <h2 className="text-2xl font-black">Sponsorship Managers</h2>
                {sponsors.length === 0 ? (
                  <p className="mt-4 text-slate-500">No sponsor accounts yet.</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {sponsors.map((row) => (
                      <li key={row.id} className="rounded-xl bg-slate-950 p-4">
                        <p className="font-semibold">{row.brandName}</p>
                        <p className="text-sm text-slate-400">
                          {row.contactName}
                        </p>
                        <p className="mt-1 text-sm text-green-300">
                          {row.jobTitle}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </AppLayout>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
    </div>
  );
}
