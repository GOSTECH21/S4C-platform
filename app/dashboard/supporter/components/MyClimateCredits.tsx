"use client";

type Props = {
  loading: boolean;
  claims: any[];
};

export default function MyClimateCredits({
  loading,
  claims,
}: Props) {
    
  return (
    <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <h2 className="mb-6 text-2xl font-bold text-green-400">
        🌱 My Climate Credits
      </h2>

      {loading ? (

        <p className="text-slate-400">
          Loading...
        </p>

      ) : claims.length === 0 ? (

        <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center">

          <div className="text-5xl">
            🌱
          </div>

          <h3 className="mt-4 text-xl font-bold">
            No Climate Credits Yet
          </h3>

          <p className="mt-2 text-slate-400">
            Claim your first climate credit to begin your impact portfolio.
          </p>

        </div>

      ) : (

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

         {claims.map((claim: any) => {

 
  return (
            
            <div
              key={claim.id}
              className="rounded-2xl border border-slate-800 bg-slate-950 p-6"
            >

              <h3 className="text-lg font-bold text-white">
                {claim.sponsor_climate_credits?.credit_name}
              </h3>

              <div className="mt-6 space-y-3">

                <div className="flex justify-between">
                  <span className="text-slate-400">
                    Campaign
                  </span>

                  <span className="text-right text-white">
                    {claim.sponsor_climate_credits?.credit_name}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">
                    Climate Value
                  </span>

                  <span className="font-bold text-green-400">
                    £{Number(
  claim.sponsor_climate_credits?.total_value ?? 0
).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">
                    Status
                  </span>

                  <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                    {claim.claim_status}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">
                    Claimed
                  </span>

                  <span className="text-white">
                    {new Date(claim.created_at).toLocaleDateString()}
                  </span>
                </div>

              </div>

            </div>

);

})}

        </div>

      )}

    </div>
  );
}