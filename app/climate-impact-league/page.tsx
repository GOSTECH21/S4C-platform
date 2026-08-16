import { leagueTable } from "../services/climate-impact-league.service";

export default function ClimateImpactLeaguePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-12">
      <div className="mx-auto max-w-6xl">

        <h1 className="text-5xl font-black text-green-400 text-center">
          🏆 Climate Impact League
        </h1>

        <p className="mt-4 text-center text-slate-300">
          Clubs competing to create the greatest climate impact through sport.
        </p>

        <div className="mt-10 space-y-6">
          {leagueTable.map((club) => (
            <div
              key={club.rank}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold">
                    #{club.rank} {club.club}
                  </h2>

                  <p className="mt-2 text-slate-300">
                    Climate Credits: £{club.credits.toLocaleString()}
                  </p>

                  <p className="text-slate-300">
                    Projects Funded: {club.projects}
                  </p>

                  <p className="text-slate-300">
                    Global Schools Solar: {club.gss}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-green-400 text-4xl font-black">
                    {club.impact}
                  </p>

                  <p className="text-slate-400">
                    Impact Score
                  </p>
                </div>
              </div>

              {club.club === "Hearts" && (
                <div className="mt-6 rounded-xl bg-green-900/30 border border-green-600 p-4">
                  <h3 className="text-green-400 font-bold">
                    🌞 Global Schools Solar Pilot
                  </h3>

                  <p className="text-slate-300 mt-2">
                    Tynecastle High School, Edinburgh
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}