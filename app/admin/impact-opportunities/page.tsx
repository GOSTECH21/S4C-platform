"use client";

import { useEffect, useState } from "react";
import AppLayout from "../../layout/AppLayout";
import { getImpactOpportunities } from "../../services/impact-opportunities.service";

type ImpactOpportunity = {
  id: string;
  title: string;
  description: string;
  status: string;
  funding_target: number;
  amount_funded: number;
  created_at: string;
};

export default function ImpactOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<ImpactOpportunity[]>([]);

  async function loadOpportunities() {
    const data = await getImpactOpportunities();
    setOpportunities(data || []);
  }

  useEffect(() => {
    loadOpportunities();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-5xl font-bold text-green-400">
            Impact Opportunities
          </h1>

          <p className="mt-3 text-slate-300">
            Every score creates an opportunity for measurable climate action.
          </p>
        </div>

        <div className="space-y-4">
          {opportunities.map((opportunity) => (
            <div
              key={opportunity.id}
              className="rounded-xl border border-slate-800 bg-slate-900 p-6"
            >
              <h2 className="text-2xl font-bold">{opportunity.title}</h2>

              <p className="mt-2 text-slate-400">
                {opportunity.description}
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <div>Status: {opportunity.status}</div>
                <div>Funded: £{opportunity.amount_funded}</div>
                <div>Target: £{opportunity.funding_target}</div>
                <div>
                  Created: {new Date(opportunity.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}