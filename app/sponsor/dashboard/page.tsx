export default function SponsorDashboardPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          Sponsor Dashboard
        </h1>

        <p className="mt-2 text-lg text-slate-600">
          Welcome to Score-For-Our-Planet (S4P).
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Active Campaigns</p>
          <h2 className="mt-3 text-4xl font-bold">0</h2>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Supporters Reached</p>
          <h2 className="mt-3 text-4xl font-bold">0</h2>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            GSS Projects Supported
          </p>
          <h2 className="mt-3 text-4xl font-bold">0</h2>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Campaign Budget
          </p>
          <h2 className="mt-3 text-4xl font-bold">£0</h2>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-10 shadow-sm">
        <h2 className="text-2xl font-semibold">
          Create your first Sponsorship Campaign
        </h2>

        <p className="mt-4 max-w-2xl text-slate-600">
          Start sponsoring live sporting moments that reward
          supporters and help fund our Global Schools Solar (GSS)
          Programmes.
        </p>

        <button className="mt-8 rounded-lg bg-emerald-600 px-8 py-4 font-semibold text-white hover:bg-emerald-700">
          Create Campaign
        </button>
      </div>
    </div>
  );
}