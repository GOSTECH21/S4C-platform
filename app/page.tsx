import Link from "next/link";

const stats = [
  ["£2.45M", "Climate Credits Released"],
  ["148k", "Fans Registered"],
  ["63", "Partner Brands"],
  ["420", "Climate Projects"],
];

const sports = ["⚽ Football", "🏉 Rugby", "🏏 Cricket", "🏎 Formula 1", "🏀 Basketball", "🎾 Tennis"];

const partners = ["Budweiser", "Coca-Cola", "Guinness", "Gillette", "ScottishPower", "RBS"];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex max-w-6xl flex-col items-center justify-center px-6 pt-20 pb-12 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-green-400">
          Score-4-Climate
        </p>

        <h1 className="mt-6 max-w-5xl text-5xl font-black tracking-tight text-green-400 md:text-7xl">
          Where every score creates climate action
        </h1>

        <p className="mt-6 max-w-3xl text-lg text-slate-300 md:text-xl">
          Welcome to Score-4-Climate, the platform that enables sports fans and
          supporters to help their favourite club or team fight climate change.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register"
            className="rounded-xl bg-green-400 px-8 py-4 font-bold text-slate-950"
          >
            Register as a Fan
          </Link>
<Link
  href="/login"
  className="rounded-xl border border-slate-700 px-8 py-4 font-bold text-white"
>
  Already registered? Login
</Link>
          <Link
            href="/sponsor/register"
            className="rounded-xl border border-slate-700 px-8 py-4 font-bold text-white"
          >
            Register as a Sponsor
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-center text-4xl font-black text-green-400">
          How Score-4-Climate Works
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-5">
          {[            
  "Follow your favourite club",
  "When your team score a Goal; Brands sponsor that Goal.",
  "When Brands sponsors a Goal; you receive Climate Credits from them.",
  "Allocate your Climate Credits to verified climate projects.",
  "Verified climate projects help your club climb the Climate Impact League Table.",
          ].map((step, index) => (
            <div
              key={step}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center"
            >
              <p className="text-3xl font-black text-green-400">
                {index + 1}
              </p>
              <p className="mt-4 font-semibold">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-center text-4xl font-black text-green-400">
          Live Impact
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {stats.map(([value, label]) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center"
            >
              <p className="text-4xl font-black text-green-400">{value}</p>
              <p className="mt-3 text-slate-300">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-center text-4xl font-black text-green-400">
          Supported Sports
        </h2>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {sports.map((sport) => (
            <div
              key={sport}
              className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center text-xl font-bold"
            >
              {sport}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-center text-4xl font-black text-green-400">
          Partner Brands
        </h2>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {partners.map((partner) => (
            <div
              key={partner}
              className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center text-xl font-bold"
            >
              {partner}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12 text-center">
        <h2 className="text-4xl font-black text-green-400">
          Ready to change the world through sport?
        </h2>

        <p className="mt-4 text-slate-300">
          Join the platform turning goals, tries, wickets and sporting moments
          into measurable climate impact.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="rounded-xl bg-green-400 px-8 py-4 font-bold text-slate-950"
          >
            Join as a Fan
          </Link>

          <Link
            href="/sponsor/register"
            className="rounded-xl border border-slate-700 px-8 py-4 font-bold text-white"
          >
            Become a Sponsor
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-800 px-6 py-8 text-center text-sm text-slate-400">
        Score-4-Climate · Climate action powered by sport
      </footer>
    </main>
  );
}