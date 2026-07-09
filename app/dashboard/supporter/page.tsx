import Link from "next/link";

export default function SupporterDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
          Supporter Dashboard
        </p>

        <h1 className="mt-3 text-4xl font-black text-white md:text-5xl">
          Welcome to your climate impact hub
        </h1>

        <p className="mt-4 max-w-2xl text-slate-300">
          Track your claimed credits, funded projects and total climate impact.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Credits Claimed</p>
            <p className="mt-3 text-4xl font-black text-green-400">0</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Total Funding</p>
            <p className="mt-3 text-4xl font-black text-green-400">£0</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">CO₂ Saved</p>
            <p className="mt-3 text-4xl font-black text-green-400">0 kg</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Projects Supported</p>
            <p className="mt-3 text-4xl font-black text-green-400">0</p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-2xl font-bold text-green-400">
              My Climate Credits
            </h2>

            <p className="mt-3 text-slate-300">
              You do not have any claimed credits yet. Credits will appear here
              after you claim them from sponsored goals.
            </p>

            <Link
              href="/admin/match-centre"
              className="mt-6 inline-block rounded-lg bg-green-400 px-5 py-3 font-bold text-slate-950 hover:bg-green-300"
            >
              Go to Match Centre
            </Link>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-2xl font-bold text-green-400">
              Recent Activity
            </h2>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-400">
              No recent supporter activity yet.
            </div>
          </section>
        </div>

        <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-2xl font-bold text-green-400">
            Suggested Climate Projects
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <h3 className="font-bold">🌳 Kenya Reforestation</h3>
              <p className="mt-2 text-sm text-slate-400">
                Restore native woodland and support local communities.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <h3 className="font-bold">☀️ Solar Schools</h3>
              <p className="mt-2 text-sm text-slate-400">
                Fund clean solar energy for schools and community buildings.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <h3 className="font-bold">🌊 Ocean Plastic Recovery</h3>
              <p className="mt-2 text-sm text-slate-400">
                Remove plastic waste before it reaches the ocean.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}