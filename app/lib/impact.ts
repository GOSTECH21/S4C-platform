export type ImpactProject = {
  estimated_co2?: number | null;
  funding_goal?: number | null;
  category?: string | null;
  country?: string | null;
};

// Rough, clearly-labelled equivalence factors used to translate estimated
// CO2 reductions into everyday terms for supporters.
const CO2_PER_TREE_TONNES_PER_YEAR = 0.021; // ~21 kg CO2 absorbed per tree per year
const CO2_PER_CAR_TONNES_PER_YEAR = 4.6; // ~4.6 tonnes CO2 emitted per car per year

export function treesEquivalentFromCo2(totalCo2: number): number {
  return Math.round(Math.max(0, Number(totalCo2) || 0) / CO2_PER_TREE_TONNES_PER_YEAR);
}

export type ImpactSummary = {
  projectCount: number;
  totalCo2: number;
  totalFunding: number;
  treesEquivalent: number;
  carsOffRoad: number;
  categories: string[];
  countries: string[];
};

export function summariseImpact(projects: ImpactProject[]): ImpactSummary {
  const totalCo2 = projects.reduce(
    (sum, p) => sum + (Number(p.estimated_co2) || 0),
    0
  );
  const totalFunding = projects.reduce(
    (sum, p) => sum + (Number(p.funding_goal) || 0),
    0
  );

  return {
    projectCount: projects.length,
    totalCo2,
    totalFunding,
    treesEquivalent: treesEquivalentFromCo2(totalCo2),
    carsOffRoad:
      Math.round((totalCo2 / CO2_PER_CAR_TONNES_PER_YEAR) * 10) / 10,
    categories: [
      ...new Set(
        projects.map((p) => p.category).filter((c): c is string => Boolean(c))
      ),
    ],
    countries: [
      ...new Set(
        projects.map((p) => p.country).filter((c): c is string => Boolean(c))
      ),
    ],
  };
}
