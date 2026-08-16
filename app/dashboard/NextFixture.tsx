export default function NextFixture() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 mt-8">

      <p className="uppercase tracking-[0.3em] text-green-400 text-sm">
        Next Fixture
      </p>

      <h2 className="mt-3 text-4xl font-black">
        Hearts vs Aberdeen
      </h2>

      <p className="mt-2 text-slate-300">
        Saturday 23 August • 3:00 PM
      </p>

      <p className="text-slate-400">
        Tynecastle Park
      </p>

      <div className="mt-8">

        <h3 className="font-bold text-green-400">
          Climate Impact Activated
        </h3>

        <div className="mt-4 space-y-3">

          <div className="flex justify-between rounded-xl bg-slate-800 p-4">
            <span>🍺 Budweiser</span>
            <span>£2,500 per Hearts goal</span>
          </div>

          <div className="flex justify-between rounded-xl bg-slate-800 p-4">
            <span>⚡ ScottishPower</span>
            <span>£5,000 Clean Energy Bonus</span>
          </div>

          <div className="flex justify-between rounded-xl bg-slate-800 p-4">
            <span>🪒 Gillette</span>
            <span>£1,000 Climate Credit</span>
          </div>

        </div>

      </div>

    </div>
  );
}