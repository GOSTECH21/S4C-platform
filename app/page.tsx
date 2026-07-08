import Navbar from "./layout/Navbar";
import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <Navbar />

    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-green-400">
          Score for Climate
        </p>

        <h1 className="max-w-4xl text-5xl font-black tracking-tight text-green-400 md:text-7xl">
          Every Goal Creates Climate Action
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-300 md:text-xl">
          S4C turns goals, fixtures, clubs, sponsors and supporters into measurable climate impact.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/admin/my-climate-credits"
            className="rounded-xl bg-green-400 px-8 py-4 font-bold text-slate-950 hover:bg-green-300"
          >
            View Climate Credits
          </Link>

          <Link
            href="/admin/match-centre"
            className="rounded-xl border border-slate-700 px-8 py-4 font-bold text-white hover:bg-slate-900"
          >
            Open Match Centre
          </Link>
        </div>

        <div className="mt-20 grid w-full gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-left">
            <h2 className="text-2xl font-bold text-green-400">⚽ Goals</h2>
            <p className="mt-3 text-slate-300">
              Every recorded goal can unlock sponsored climate credits.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-left">
            <h2 className="text-2xl font-bold text-green-400">🌱 Impact</h2>
            <p className="mt-3 text-slate-300">
              Supporters allocate credits to verified climate projects.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-left">
            <h2 className="text-2xl font-bold text-green-400">📊 Proof</h2>
            <p className="mt-3 text-slate-300">
              Clubs, sponsors and fans can track measurable climate outcomes.
            </p>
          </div>
        </div>
            </section>
    </main>
  </div>
  );
}
    