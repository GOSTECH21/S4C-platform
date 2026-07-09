"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

type Preference = {
  sport: string;
  club: string;
};

const allFixtures = [
  {
    id: "1",
    sport: "Football",
    team: "Arsenal",
    opponent: "Liverpool",
    date: "2026-09-16",
    time: "16:30",
    status: "active",
    venue: "Emirates Stadium",
    opportunities: [
      "Arsenal goal activates £2500 Climate Impact sponsored by Budweiser",
      "Arsenal goal activates £3000 Climate Impact sponsored by Coca-Cola",
    ],
  },
  {
    id: "2",
    sport: "Football",
    team: "Chelsea",
    opponent: "Tottenham",
    date: "2026-09-20",
    time: "15:00",
    status: "upcoming",
    venue: "Stamford Bridge",
    opportunities: [],
  },
  {
    id: "3",
    sport: "Football",
    team: "Manchester United",
    opponent: "Everton",
    date: "2026-09-22",
    time: "17:30",
    status: "upcoming",
    venue: "Old Trafford",
    opportunities: [],
  },
  {
    id: "4",
    sport: "Rugby",
    team: "Scotland",
    opponent: "Ireland",
    date: "2026-09-24",
    time: "18:00",
    status: "active",
    venue: "Murrayfield",
    opportunities: [],
  },
  {
    id: "5",
    sport: "Cricket",
    team: "Australia",
    opponent: "England",
    date: "2026-09-26",
    time: "11:00",
    status: "upcoming",
    venue: "MCG",
    opportunities: [],
  },
];

export default function SupporterCalendarPage() {
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPreferences() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("supporter_preferences")
        .select("sport, club")
        .eq("user_id", user.id);

      if (error) {
        alert(error.message);
        return;
      }

      setPreferences(data || []);
      setLoading(false);
    }

    loadPreferences();
  }, []);

  const filteredFixtures = allFixtures.filter((fixture) =>
    preferences.some(
      (preference) =>
        preference.sport === fixture.sport &&
        preference.club === fixture.team
    )
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        Loading your fixtures...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/dashboard/supporter/preferences"
          className="text-sm font-semibold text-green-400 hover:underline"
        >
          ← Edit Teams & Sports
        </Link>

        <h1 className="mt-6 text-4xl font-black text-green-400">
          My Fixture Calendar
        </h1>

        <p className="mt-3 text-slate-300">
          Fixtures for the sports and clubs you follow.
        </p>

        {filteredFixtures.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-300">
              No fixtures found for your selected teams yet.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6">
            {filteredFixtures.map((fixture) => (
              <div
                key={fixture.id}
                className={`rounded-2xl border p-6 ${
                  fixture.status === "active"
                    ? "border-green-400 bg-green-950/30"
                    : "border-slate-800 bg-slate-900"
                }`}
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
                      {fixture.sport}
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                      {fixture.team} vs {fixture.opponent}
                    </h2>

                    <p className="mt-2 text-slate-300">
                      {fixture.date} · {fixture.time} · {fixture.venue}
                    </p>
                  </div>

                  <span
                    className={`h-fit rounded-full px-4 py-2 text-sm font-bold ${
                      fixture.status === "active"
                        ? "bg-green-400 text-slate-950"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {fixture.status === "active" ? "Active" : "Upcoming"}
                  </span>
                </div>

                {fixture.status === "active" && (
                  <div className="mt-6 rounded-xl border border-green-500/40 bg-slate-950 p-5">
                    <h3 className="font-bold text-green-400">
                      Impact Opportunities
                    </h3>

                    <ul className="mt-3 space-y-2 text-slate-300">
                      {fixture.opportunities.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>

                    <Link
  href={`/dashboard/supporter/goal-alert?sport=${fixture.sport}&team=${fixture.team}&score=${fixture.team}%201%20-%200%20${fixture.opponent}`}
  className="mt-5 inline-block rounded-lg bg-green-400 px-5 py-3 font-bold text-slate-950"
>
  Claim Credit
</Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}