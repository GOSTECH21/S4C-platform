import AppLayout from "../layout/AppLayout";
import CarbonImpactTable from "../components/dashboard/CarbonImpactTable";

export default function CarbonImpactTablePage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-5xl font-bold text-green-400">
            Climate Impact Table
          </h1>

          <p className="mt-3 text-lg text-slate-300">
            Ranking clubs by measurable climate impact.
          </p>

          <p className="text-slate-500">
            The Climate Impact Table reflects how sporting performance is being
            transformed into measurable climate action across Score for Climate.
          </p>
        </div>

        <CarbonImpactTable />
      </div>
    </AppLayout>
  );
}