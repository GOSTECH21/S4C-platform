import Link from "next/link";
import { SolutionPage } from "@/app/components/home/SolutionPage";
import { climateImpactLeagueTable } from "@/app/lib/cilt";
import { CLUB_REGISTER_PATH, CLIMATE_IMPACT_LEAGUE_PATH } from "@/app/lib/routes";

const LEAGUES = ["Premier League", "Scottish Premiership", "La Liga"] as const;

export default function ClimateImpactLeagueTablePage() {
  return (
    <SolutionPage
      kicker="Solutions"
      title="Climate Impact League Table"
      intro="Clubs compete on climate impact as well as points. The table ranks every club in a league by tonnes of CO₂e linked to Climate Credits, fan votes and funded Climate Projects — including Global Schools Solar."
      currentPath={CLIMATE_IMPACT_LEAGUE_PATH}
    >
      <div className="space-y-12">
        {LEAGUES.map((league) => {
          const rows = climateImpactLeagueTable(league, "");
          return (
            <section
              key={league}
              className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900"
            >
              <div className="border-b border-slate-800 px-8 py-6">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
                  Current season
                </p>
                <h2 className="mt-2 text-3xl font-black">{league}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-sm uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-8 py-4">Pos</th>
                      <th className="px-4 py-4">Club</th>
                      <th className="px-8 py-4 text-right">tCO₂e</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.club} className="border-t border-slate-800">
                        <td className="px-8 py-3 font-bold text-green-400">
                          {row.position}
                        </td>
                        <td className="px-4 py-3 font-semibold">{row.club}</td>
                        <td className="px-8 py-3 text-right text-slate-300">
                          {row.tonnes.toLocaleString("en-GB")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-12 rounded-3xl border border-green-500/30 bg-slate-900 p-10">
        <h2 className="text-3xl font-black">Get your club on the table</h2>
        <p className="mt-4 max-w-3xl text-lg text-slate-300">
          Sustainability Directors post five Climate Projects each Match Day.
          Fan votes and Climate Sponsor funding move the club up the Climate
          Impact League Table.
        </p>
        <Link
          href={CLUB_REGISTER_PATH}
          className="mt-8 inline-flex rounded-xl bg-green-500 px-6 py-3 font-bold text-slate-950"
        >
          Register your club
        </Link>
      </div>
    </SolutionPage>
  );
}
