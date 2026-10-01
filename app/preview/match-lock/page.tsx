"use client";

import { useEffect, useState } from "react";
import { SeeMatchDetails } from "@/app/components/sponsor/SeeMatchDetails";
import { fixtureByIdOrName, type ClubFixture } from "@/app/lib/club-fixtures";
import { loadClubFixtures } from "@/app/services/club-fixtures.service";

export default function MatchLockPreviewPage() {
  const [fixtures, setFixtures] = useState<ClubFixture[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadClubFixtures("Arsenal")
      .then((rows) => {
        setFixtures(rows);
        setSelectedId(rows[0]?.id ?? "");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load fixtures.")
      )
      .finally(() => setLoading(false));
  }, []);

  const selected = fixtureByIdOrName(fixtures, selectedId);

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          Arsenal published fixtures
        </p>
        <h1 className="mt-2 text-4xl font-black">Match Day lock-in</h1>
        <section className="mt-8 rounded-3xl border border-green-500/30 bg-slate-900 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
            Match Day lock-in
          </p>
          <h2 className="mt-2 text-3xl font-black">
            Select the club whose Goals you will sponsor
          </h2>
          {error && <p className="mt-4 text-red-300">{error}</p>}
          {loading ? (
            <p className="mt-6 text-slate-400">Loading published fixtures...</p>
          ) : (
            <>
              <label className="mt-6 block text-sm text-slate-400">
                Match
                <select
                  value={selectedId}
                  onChange={(event) => setSelectedId(event.target.value)}
                  className="mt-2 w-full rounded-lg bg-slate-800 p-3 text-white"
                >
                  {fixtures.map((fixture) => (
                    <option key={fixture.id} value={fixture.id}>
                      {fixture.fixtureName}
                    </option>
                  ))}
                </select>
              </label>
              {selected && (
                <>
                  <p className="mt-4 text-2xl font-black">
                    Arsenal · {selected.fixtureName}
                  </p>
                  <SeeMatchDetails
                    date={selected.date}
                    venue={selected.venue}
                    kickoff={selected.kickoff}
                  />
                </>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
