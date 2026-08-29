type DashboardSummaryProps = {
  totalCreditsClaimed: number;
  totalFunding: number;
  availableCredits: number;
  totalProjects: number;
};

export default function DashboardSummary({
  totalCreditsClaimed,
  totalFunding,
  availableCredits,
  totalProjects,
}: DashboardSummaryProps) {
  return (
    <div className="mt-10 grid gap-6 md:grid-cols-4">

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-sm text-slate-400">
          Credits Claimed
        </p>

        <p className="mt-3 text-4xl font-black text-green-400">
          {totalCreditsClaimed.toLocaleString()}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-sm text-slate-400">
          Climate Funding
        </p>

        <p className="mt-3 text-4xl font-black text-green-400">
          £{totalFunding.toLocaleString()}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-sm text-slate-400">
          Available Credits
        </p>

        <p className="mt-3 text-4xl font-black text-green-400">
          {availableCredits.toLocaleString()}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-sm text-slate-400">
          Sponsored Projects
        </p>

        <p className="mt-3 text-4xl font-black text-green-400">
          {totalProjects.toLocaleString()}
        </p>
      </div>

    </div>
  );
}