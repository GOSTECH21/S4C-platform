export default function GlobalSchoolsSolar() {
  return (
    <section className="mt-10 rounded-3xl border border-green-500/30 bg-slate-900 p-8">

      <div className="flex items-center gap-3">
        <span className="text-4xl">☀️</span>

        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-green-400">
            Signature Initiative
          </p>

          <h2 className="text-4xl font-black text-white">
            Global Schools Solar
          </h2>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">

        <div>

          <h3 className="text-2xl font-bold text-green-400">
            Tynecastle High School
          </h3>

          <p className="mt-2 text-slate-300">
            Edinburgh, Scotland
          </p>

          <p className="mt-6 text-slate-300">
            Every Hearts goal this season releases Climate Credits that
            supporters allocate towards installing rooftop solar at
            Tynecastle High School.
          </p>

        </div>

        <div>

          <p className="text-sm uppercase tracking-wider text-slate-400">
            Funding Progress
          </p>

          <div className="mt-3 h-5 overflow-hidden rounded-full bg-slate-800">

            <div
              className="h-full bg-green-400"
              style={{ width: "76%" }}
            />

          </div>

          <div className="mt-3 flex justify-between text-sm text-slate-300">

            <span>£72,500 Raised</span>

            <span>£95,000 Target</span>

          </div>

        </div>

      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-4">

        <div className="rounded-xl bg-slate-950 p-5">
          <p className="text-slate-400">Students</p>
          <p className="mt-2 text-3xl font-black">1,250</p>
        </div>

        <div className="rounded-xl bg-slate-950 p-5">
          <p className="text-slate-400">Teachers</p>
          <p className="mt-2 text-3xl font-black">105</p>
        </div>

        <div className="rounded-xl bg-slate-950 p-5">
          <p className="text-slate-400">Solar Capacity</p>
          <p className="mt-2 text-3xl font-black">120 kW</p>
        </div>

        <div className="rounded-xl bg-slate-950 p-5">
          <p className="text-slate-400">CO₂ Saved</p>
          <p className="mt-2 text-3xl font-black">58 t</p>
        </div>

      </div>

      <div className="mt-10 flex gap-4">

        <button className="rounded-xl bg-green-400 px-6 py-3 font-bold text-slate-950">
          Support This School
        </button>

        <button className="rounded-xl border border-slate-700 px-6 py-3">
          View All GSS Projects
        </button>

      </div>

    </section>
  );
}