import Link from "next/link";
import UserTypeCards from "@/app/components/home/UserTypeCards";
const stats = [
  ["£2.45M", "Climate Credits Released"],
  ["148k", "Fans Registered"],
  ["63", "Partner Brands"],
  ["420", "Climate Projects"],
];

const tier1Sports = [
  {
    icon: "⚽",
    name: "Football",
    event: "Goal",
    status: "Live",
  },
  {
    icon: "🏉",
    name: "Rugby Union",
    event: "Try",
    status: "Live",
  },
  {
    icon: "🏈",
    name: "NFL",
    event: "Touchdown",
    status: "Live",
  },
  {
    icon: "🏏",
    name: "Cricket",
    event: "Wicket",
    status: "Live",
  },
  {
    icon: "🎾",
    name: "Tennis",
    event: "Match Point",
    status: "Live",
  },
  {
    icon: "🏀",
    name: "Basketball",
    event: "Basket",
    status: "Live",
  },
];

const partners = ["Budweiser", "Coca-Cola", "Guinness", "Gillette", "ScottishPower", "RBS"];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex max-w-6xl flex-col items-center justify-center px-6 pt-20 pb-12 text-center">
        <div className="text-center">
  <h2 className="text-5xl font-black tracking-[0.3em] text-green-400">
    S4P
  </h2>

  <p className="mt-2 text-sm uppercase tracking-[0.25em] text-slate-400">
    Score-For-Our-Planet
  </p>

  <p className="mt-4 text-lg font-semibold text-green-300">
    Where Sport Creates Climate Action
  </p>
</div>

        <h1 className="mt-6 max-w-5xl text-5xl font-black tracking-tight text-green-400 md:text-7xl">
         Every Score = A better Planet
        </h1>

        <p className="mt-6 max-w-3xl text-lg text-slate-300 md:text-xl">
          Welcome to <strong>S4P (Score-4-Our-Planet)</strong>, where every goal,
try, basket, wicket, touchdown and finish line becomes an opportunity for fans,
clubs and sponsors to create measurable climate action.
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
      
<UserTypeCards />

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-center text-4xl font-black text-green-400">
          How S4P Works
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-5">
          {[            
  "Follow your favourite club",
  "Your team scores Brands sponsor the score",
 "Sponsorships are given to you as Climate Credits",
  "Put your Climate Credits into Verified Climate Projects",
  "Verified Projects help your club climb the Climate Impact League Table",
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

  <div className="mt-10 grid gap-6 md:grid-cols-3">
    {tier1Sports.map((sport) => (
      <div
        key={sport.name}
        className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center"
      >
        <div className="text-5xl">
          {sport.icon}
        </div>

        <h3 className="mt-4 text-2xl font-bold">
          {sport.name}
        </h3>

        <p className="mt-2 text-slate-300">
          {sport.event}
        </p>

        <span className="mt-4 inline-block rounded-full bg-green-500/20 px-3 py-1 text-sm font-semibold text-green-400">
          {sport.status}
        </span>
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