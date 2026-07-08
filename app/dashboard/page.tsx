import CarbonImpactTable from "../components/dashboard/CarbonImpactTable";
import AppLayout from "../layout/AppLayout";
import StatCard from "../components/dashboard/StatCard";

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-10">

        <div>
          <h1 className="text-5xl font-bold text-green-400">
            S4C Dashboard
          </h1>

          <p className="mt-3 text-slate-300">
            Every Score Matters.
          </p>

          <p className="text-slate-500">
            Turning sporting moments into measurable climate action.
          </p>
        </div>

        <section>

          <h2 className="mb-6 text-2xl font-semibold">
            Today's Impact
          </h2>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            <StatCard
              title="Scores Today"
              value="28"
              icon="⚽"
            />

            <StatCard
              title="Impact Opportunities"
              value="28"
              icon="🌍"
            />

            <StatCard
              title="Climate Assets Active"
              value="9"
              icon="☀️"
            />

            <StatCard
              title="Active Fans"
              value="18,422"
              icon="👥"
            />

          </div>

        </section>

<section>
    <CarbonImpactTable />
</section>
      </div>
    </AppLayout>
  );
}