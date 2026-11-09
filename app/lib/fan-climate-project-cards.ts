/** Fan Climate Projects tab: one card per Match Day project, paired with its sponsor. */

import { isFeaturedGssName } from "./featured-gss";
import { MATCH_DAY_PROJECT_COUNT } from "./partner-projects";
import { FEATURED_GLOBAL_SCHOOLS_SOLAR } from "./sccan-catalog";
import {
  DEFAULT_WALLET_VOTE_GBP,
  FUND_IT_LABEL,
  formatWalletGbp,
  type NumberedClimateProject,
  type SponsorWalletKind,
} from "./sponsor-wallet";

export const FAN_CLIMATE_PROJECT_PAGE_COUNT = MATCH_DAY_PROJECT_COUNT;

export const FAN_CLIMATE_PAGER_STAMP = "fan-climate-cards-v1";

export const FUND_IT_HOW_IT_WORKS_TITLE = "How it works";

/**
 * Headings are shown to fans. `backend` is the allocation engine contract and
 * must not be rendered on the Climate Projects tab.
 */
export const FUND_IT_HOW_IT_WORKS = [
  {
    heading: "Fan selects FUND-IT",
    backend:
      "The system checks that the fan is eligible, the sponsor has sufficient unallocated funding, the allocation window is open and this sponsor's contribution has not already been used by that fan.",
  },
  {
    heading: "Fan confirms £0.20",
    backend:
      "S4P atomically reserves or allocates the contribution, prevents duplicate submissions and records the sponsor, supporter, club, project, match campaign and transaction reference.",
  },
  {
    heading: "Fan sees confirmation",
    backend:
      "The project allocation total updates, the sponsor's available balance reduces by £0.20, and the card changes from FUND-IT to Allocated ✓.",
  },
] as const;

export const FUND_IT_ALLOCATED_LABEL = "Allocated ✓";

export const READY_TO_ALLOCATE_LABEL = "Ready to allocate";

export function readyToAllocateCopy(projectName: string): string {
  const name = projectName.trim() || "this Climate Project";
  return `Your sponsor-funded 20p can be directed to ${name}. This is not a payment from your bank account.`;
}

export function fundItButtonLabel(): string {
  return `${FUND_IT_LABEL} · ${formatWalletGbp(DEFAULT_WALLET_VOTE_GBP)}`;
}

export type FanProjectDetail = {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  image_url?: string | null;
  location?: string | null;
  funding_goal?: number | null;
  estimated_co2?: number | null;
};

export type FanProjectSponsor = {
  brandName: string;
  kind: SponsorWalletKind;
  remainingGbp: number;
  committedGbp?: number;
  logoUrl?: string | null;
  sponsoredProjectId?: string | null;
  sponsoredProjectName?: string | null;
};

export type FanClimateProjectPage = {
  index: number;
  position: string;
  kind: "featured" | "local";
  badge: string;
  project: {
    id: string;
    name: string;
    number: number;
    fundedGbp: number;
    votesReceived: number;
    description: string;
    category: string | null;
    imageUrl: string | null;
    location: string | null;
    fundingGoal: number | null;
    estimatedCo2: number | null;
  } | null;
  sponsor: FanProjectSponsor | null;
};

export function climateProjectPageLabel(
  index: number,
  total = FAN_CLIMATE_PROJECT_PAGE_COUNT
): string {
  return `${index + 1}/${total}`;
}

export function fallbackHeroImage(
  name?: string | null,
  category?: string | null
): string {
  const blob = `${name ?? ""} ${category ?? ""}`.toLowerCase();
  if (/solar|photovoltaic|rooftop/.test(blob)) {
    return "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1400&q=80";
  }
  if (/tree|wood|forest|biodiversity|peat/.test(blob)) {
    return "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80";
  }
  if (/heat|pump|thermal|boiler/.test(blob)) {
    return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1400&q=80";
  }
  if (/water|river|coast|sea|flood/.test(blob)) {
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80";
  }
  if (/school|education|classroom/.test(blob)) {
    return "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1400&q=80";
  }
  return "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80";
}

export function climateProjectBlurb(project: {
  name?: string | null;
  description?: string | null;
  category?: string | null;
}): string {
  const written = String(project.description ?? "").trim();
  if (written) return written;
  if (isFeaturedGssName(project.name)) {
    return FEATURED_GLOBAL_SCHOOLS_SOLAR.description;
  }
  const name = String(project.name ?? "").trim() || "this Climate Project";
  if (/rooftop solar|community rooftop/i.test(name)) {
    return "Help bring cleaner energy to community buildings through your club's climate programme.";
  }
  return `Help fund ${name} through your club's climate programme.`;
}

function enrichProject(
  numbered: NumberedClimateProject,
  details: FanProjectDetail[]
): NonNullable<FanClimateProjectPage["project"]> {
  const detail =
    details.find((row) => row.id === numbered.id) ??
    details.find((row) => row.name === numbered.name);
  const description = climateProjectBlurb({
    name: numbered.name,
    description: detail?.description,
    category: detail?.category,
  });
  const category = detail?.category ?? (isFeaturedGssName(numbered.name)
    ? FEATURED_GLOBAL_SCHOOLS_SOLAR.category
    : null);
  return {
    id: numbered.id,
    name: numbered.name,
    number: numbered.number,
    fundedGbp: numbered.fundedGbp,
    votesReceived: numbered.votesReceived,
    description,
    category,
    imageUrl: detail?.image_url ?? null,
    location: detail?.location ?? null,
    fundingGoal: detail?.funding_goal ?? null,
    estimatedCo2: detail?.estimated_co2 ?? null,
  };
}

function brandKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Page 1 is the Featured project (Global Schools Solar) with the Lead sponsor.
 * Pages 2–5 are the club's local/partner projects, each with the Local Business
 * Climate Sponsor who chose that project (or the next unused local wallet).
 */
export function pairFanClimateProjectPages({
  numbered,
  details = [],
  lead,
  locals = [],
}: {
  numbered: NumberedClimateProject[];
  details?: FanProjectDetail[];
  lead: FanProjectSponsor | null;
  locals?: FanProjectSponsor[];
}): FanClimateProjectPage[] {
  const listed = numbered.slice(0, FAN_CLIMATE_PROJECT_PAGE_COUNT);
  const featured =
    listed.find((row) => isFeaturedGssName(row.name)) ?? listed[0] ?? null;
  const localSlots: Array<NumberedClimateProject | null> = Array.from(
    { length: FAN_CLIMATE_PROJECT_PAGE_COUNT - 1 },
    (_, index) =>
      listed.filter((row) => row.id !== featured?.id)[index] ?? null
  );

  const localWallets = locals.filter((row) => row.kind !== "lead");
  const byProject = new Map<string, FanProjectSponsor>();
  const used = new Set<string>();

  for (const sponsor of localWallets) {
    const chosenId = String(sponsor.sponsoredProjectId ?? "").trim();
    if (!chosenId || byProject.has(chosenId)) continue;
    if (featured && chosenId === featured.id) continue;
    if (!localSlots.some((row) => row?.id === chosenId)) continue;
    byProject.set(chosenId, sponsor);
    used.add(brandKey(sponsor.brandName));
  }

  const leftover = localWallets.filter(
    (row) => !used.has(brandKey(row.brandName))
  );
  let leftoverIndex = 0;
  for (const project of localSlots) {
    if (!project || byProject.has(project.id)) continue;
    const next = leftover[leftoverIndex];
    if (!next) continue;
    leftoverIndex += 1;
    byProject.set(project.id, next);
  }

  return [
    {
      index: 0,
      position: climateProjectPageLabel(0),
      kind: "featured",
      badge: "Featured climate project",
      project: featured ? enrichProject(featured, details) : null,
      sponsor: lead,
    },
    ...localSlots.map((project, slot) => ({
      index: slot + 1,
      position: climateProjectPageLabel(slot + 1),
      kind: "local" as const,
      badge: "Local climate project",
      project: project ? enrichProject(project, details) : null,
      sponsor: project ? byProject.get(project.id) ?? null : null,
    })),
  ];
}

export function howItWorksHeadings(): string[] {
  return FUND_IT_HOW_IT_WORKS.map((step) => step.heading);
}
