export default function SupporterLeaderboard() {
  const supporters = [
    {
      rank: 1,
      name: "Sarah M.",
      credits: "£482",
      projects: 14,
      score: 98.7,
      badge: "🌍 Climate Hero",
    },
    {
      rank: 2,
      name: "James R.",
      credits: "£451",
      projects: 12,
      score: 96.4,
      badge: "☀️ Solar Champion",
    },
    {
      rank: 3,
      name: "Fiona D.",
      credits: "£438",
      projects: 11,
      score: 95.9,
      badge: "🌱 Green Leader",
    },
    {
      rank: 4,
      name: "Michael T.",
      credits: "£415",
      projects: 11,
      score: 94.8,
      badge: "⚽ Goal Chaser",
    },
    {
      rank: 5,
      name: "You",
      credits: "£396",
      projects: 10,
      score: 93.1,
      badge: "⭐ Rising Supporter",
    },
  ];

  return (
    <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-8">

      <p className="uppercase tracking-[0.3em] text-green-400">
        Supporter Leaderboard
      </p>

      <h2 className="mt-2 text-4xl font-black">
        Top Climate Supporters
      </h2>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-700">

        <table className="w-full">

          <thead className="bg-slate-800">

            <tr className="text-left">

              <th className="p-4">Rank</th>
              <th className="p-4">Supporter</th>
              <th className="p-4">Climate Credits</th>
              <th className="p-4">Projects</th>
              <th className="p-4">Impact Score</th>
              <th className="p-4">Achievement</th>

            </tr>

          </thead>

          <tbody>

            {supporters.map((supporter) => (

              <tr
                key={supporter.rank}
                className="border-t border-slate-800 hover:bg-slate-800/40"
              >

                <td className="p-4 font-bold">
                  #{supporter.rank}
                </td>

                <td className="p-4">
                  {supporter.name}
                </td>

                <td className="p-4 text-green-400">
                  {supporter.credits}
                </td>

                <td className="p-4">
                  {supporter.projects}
                </td>

                <td className="p-4">
                  {supporter.score}
                </td>

                <td className="p-4">
                  {supporter.badge}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </section>
  );
}