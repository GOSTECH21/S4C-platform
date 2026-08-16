export default function ClimateImpactSeason() {
  return (
    <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-8">

      <p className="uppercase tracking-[0.3em] text-green-400">
        Climate Impact This Season
      </p>

      <h2 className="mt-2 text-4xl font-black">
        Every Goal Creates Impact
      </h2>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">

        <div>
          <p className="text-slate-400">Goals Scored</p>
          <h3 className="text-3xl font-bold">26</h3>
        </div>

        <div>
          <p className="text-slate-400">Climate Credits</p>
          <h3 className="text-3xl font-bold">£1.84M</h3>
        </div>

        <div>
          <p className="text-slate-400">Projects</p>
          <h3 className="text-3xl font-bold">31</h3>
        </div>

        <div>
          <p className="text-slate-400">Supporters</p>
          <h3 className="text-3xl font-bold">14,820</h3>
        </div>

        <div>
          <p className="text-slate-400">Schools Powered</p>
          <h3 className="text-3xl font-bold">1</h3>
        </div>

        <div>
          <p className="text-slate-400">Trees Planted</p>
          <h3 className="text-3xl font-bold">18,400</h3>
        </div>

        <div>
          <p className="text-slate-400">Plastic Removed</p>
          <h3 className="text-3xl font-bold">46 t</h3>
        </div>

        <div>
          <p className="text-slate-400">CO₂ Avoided</p>
          <h3 className="text-3xl font-bold">58 t</h3>
        </div>

      </div>

    </section>
  );
}