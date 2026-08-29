"use client";

import { useEffect, useState } from "react";
import AppLayout from "../../layout/AppLayout";
import {
    getSupporterAllocations,
} from "../../services/supporter-portfolio.service";

export default function SupporterPortfolioPage() {

    const [portfolio, setPortfolio] = useState<any[]>([]);
    const [allocations, setAllocations] = useState<any[]>([]);

    useEffect(() => {

        async function load() {

            const supporterId =
                "2f1039c7-dea5-4146-8ced-1822716a5723";
const allocationData = await getSupporterAllocations(supporterId);
setAllocations(allocationData || []);
            

            setPortfolio([]);
        }

        load();

    }, []);
    
const totalCredits = portfolio.length;

const totalFunding = portfolio.reduce(
  (sum, claim) => sum + (claim.sponsor_climate_credits?.credit_value || 0),
  0
);

const totalCarbon = allocations.reduce(
  (sum, allocation) =>
    sum + (allocation.climate_assets?.expected_co2e_avoided_tonnes || 0),
  0
);

const totalProjects = new Set(
  allocations.map((allocation) => allocation.climate_asset_id)
).size;
    return (

<AppLayout>

<div className="space-y-8">

<div>

<h1 className="text-5xl font-bold text-green-400">
My Climate Portfolio
</h1>

<p className="mt-3 text-slate-300">
Your personal climate impact.
</p>
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">

    <div className="rounded-xl bg-slate-900 p-6 border border-slate-800">
        <p className="text-slate-400">Credits Claimed</p>
        <h2 className="mt-2 text-4xl font-bold text-green-400">
            {totalCredits}
        </h2>
    </div>

    <div className="rounded-xl bg-slate-900 p-6 border border-slate-800">
        <p className="text-slate-400">Total Funding</p>
        <h2 className="mt-2 text-4xl font-bold text-green-400">
            £{totalFunding}
        </h2>
    </div>

    <div className="rounded-xl bg-slate-900 p-6 border border-slate-800">
        <p className="text-slate-400">CO₂ Saved</p>
        <h2 className="mt-2 text-4xl font-bold text-green-400">
            {totalCarbon} kg
        </h2>
    </div>

    <div className="rounded-xl bg-slate-900 p-6 border border-slate-800">
        <p className="text-slate-400">Projects Supported</p>
        <h2 className="mt-2 text-4xl font-bold text-green-400">
            {totalProjects}
        </h2>
    </div>

</div>
</div>

</div>

</AppLayout>

    );

}