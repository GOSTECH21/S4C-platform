"use client";

type ClimateCredit = {
  id: string;
  credit_name: string;
  credits_issued: number;
  credits_claimed: number;
  total_value: number;
  status: string;
};

type Props = {
  loading: boolean;
  credits: ClimateCredit[];
  onClaim: (id: string) => void;
};

export default function AvailableClimateCredits({
  loading,
  credits,
  onClaim,
}: Props) {
  return (
    <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <h2 className="mb-6 text-2xl font-bold text-green-400">
        🌱 Available Climate Credits
      </h2>

      {loading ? (

        <p className="text-slate-400">
          Loading...
        </p>

      ) : credits.length === 0 ? (

        <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center">

          <div className="text-5xl">
            🌱
          </div>

          <h3 className="mt-4 text-xl font-bold">
            No Climate Credits Available
          </h3>

          <p className="mt-2 text-slate-400">
            New sponsored climate credits will appear here.
          </p>

        </div>

      ) : (

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {credits.map((credit) => {

            const remaining =
              credit.credits_issued - credit.credits_claimed;

            return (

              <div
                key={credit.id}
                className="rounded-2xl border border-slate-800 bg-slate-950 p-6 transition-all duration-300 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20"
              >

                <div className="flex items-center justify-between">

                  <h3 className="text-lg font-bold text-white">
                    {credit.credit_name}
                  </h3>

                  <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                    🟢 Available
                  </span>

                </div>

                <div className="mt-6 space-y-4">

                  <div className="flex justify-between">

                    <span className="text-slate-400">
                      Remaining
                    </span>

                    <span className="font-bold text-white">
                      {remaining.toLocaleString()}
                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span className="text-slate-400">
                      Claimed
                    </span>

                    <span className="font-bold text-white">
                      {credit.credits_claimed.toLocaleString()}
                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span className="text-slate-400">
                      Climate Value
                    </span>

                    <span className="font-bold text-green-400">
                      £{credit.total_value.toLocaleString()}
                    </span>

                  </div>

                </div>

                <button
                  onClick={() => onClaim(credit.id)}
                  disabled={remaining <= 0}
                  className="mt-8 w-full rounded-xl bg-green-500 py-3 font-bold text-slate-950 transition hover:bg-green-400 disabled:bg-slate-700 disabled:text-slate-500"
                >
                  {remaining > 0
                    ? "Claim Climate Credit"
                    : "Sold Out"}
                </button>

              </div>

            );

          })}

        </div>

      )}

    </div>
  );
}