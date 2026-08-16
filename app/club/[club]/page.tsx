import { getClubByName } from "../../services/clubs.service";
import GlobalSchoolsSolar from "../../dashboard/GlobalSchoolsSolar";
import NextFixture from "../../dashboard/NextFixture";
import ClimateImpactSeason from "../../dashboard/ClimateImpactSeason";
import ClimateTimeline from "../../dashboard/ClimateTimeline";
import SupporterLeaderboard from "../../dashboard/SupporterLeaderboard";
type Props = {
  params: Promise<{
    club: string;
  }>;
};

export default async function ClubDashboard({ params }: Props) {
  const { club } = await params;
  const clubName = club.replace(/-/g, " ");
const clubData = await getClubByName(clubName);
  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-12">
      <div className="mx-auto max-w-7xl">

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10">

          <p className="uppercase tracking-[0.3em] text-green-400">
            Club Dashboard
          </p>

          <h1 className="mt-3 text-6xl font-black capitalize">
            {clubName}
          </h1>

          <p className="mt-4 text-xl text-slate-300">
            Competing in the S4P Climate Impact League.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-4">

            <div>
              <p className="text-slate-400">Climate Rank</p>
              <p className="text-4xl font-black text-green-400">#3</p>
            </div>

            <div>
              <p className="text-slate-400">Impact Score</p>
              <p className="text-4xl font-black text-green-400">92.4</p>
            </div>

            <div>
              <p className="text-slate-400">Supporters</p>
              <p className="text-4xl font-black">14,820</p>
            </div>

            <div>
              <p className="text-slate-400">Climate Credits</p>
              <p className="text-4xl font-black">£1.84M</p>
            </div>

          </div>

          <div className="mt-10 flex gap-4">

            <button className="rounded-xl bg-green-400 px-6 py-3 font-bold text-slate-950">
              Follow Club
            </button>

            <button className="rounded-xl border border-slate-700 px-6 py-3">
              Fixtures
            </button>

            <button className="rounded-xl border border-slate-700 px-6 py-3">
              Sponsor Club
            </button>

          </div>

        </div>

      </div>
      <GlobalSchoolsSolar />
      <NextFixture />
      <ClimateImpactSeason />
      <ClimateTimeline />
      <SupporterLeaderboard />
    </main>
  );
}