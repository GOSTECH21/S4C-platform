import { MATCH_DAY_PROJECT_COUNT } from "./partner-projects";
import {
  LOCAL_SPONSOR_MIN_GBP,
  LOCAL_SPONSORS_PER_MATCH,
  type LocalSponsorRecord,
  localSponsorsForClub,
} from "./local-sponsor";
import { localSlotScale } from "./dual-sponsor";
import { brandInitials } from "./climate-sponsors";

export type MatchDayLocalAssignment = {
  projectId: string;
  cardIndex: number;
  brandName: string;
  pledgeGbp: number;
  logoUrl?: string | null;
  tagline?: string | null;
  email?: string;
};

export type MatchDayLocalPlacement<T extends { id: string }> = {
  project: T;
  cardIndex: number;
  local: LocalSponsorRecord | null;
  scale: number;
};

export function rankLocalSponsorsByPledge(
  locals: LocalSponsorRecord[]
): LocalSponsorRecord[] {
  return [...locals]
    .sort((left, right) => {
      if (right.pledgeGbp !== left.pledgeGbp) {
        return right.pledgeGbp - left.pledgeGbp;
      }
      return left.createdAt.localeCompare(right.createdAt);
    })
    .slice(0, LOCAL_SPONSORS_PER_MATCH);
}

/** £500 → 1 exposure per posted fan; £1,500 → 3 exposures per posted fan. */
export function localExposureMultiplier(pledgeGbp: number): number {
  return Math.max(0, Number(pledgeGbp) || 0) / LOCAL_SPONSOR_MIN_GBP;
}

export function localBrandExposuresFromPosts(
  posts: number,
  pledgeGbp: number
): number {
  const eyeballs = Math.max(0, Number(posts) || 0);
  return Math.round(eyeballs * localExposureMultiplier(pledgeGbp) * 100) / 100;
}

export function assignLocalSponsorsToProjects<T extends { id: string }>(
  projects: T[],
  locals: LocalSponsorRecord[]
): MatchDayLocalPlacement<T>[] {
  const ranked = rankLocalSponsorsByPledge(locals);
  const maxPledge = ranked[0]?.pledgeGbp ?? LOCAL_SPONSOR_MIN_GBP;
  return projects.slice(0, MATCH_DAY_PROJECT_COUNT).map((project, index) => {
    const local = ranked[index] ?? null;
    return {
      project,
      cardIndex: index + 1,
      local,
      scale: local ? localSlotScale(local.pledgeGbp, maxPledge) : 1,
    };
  });
}

export function assignmentsFromPlacements<T extends { id: string }>(
  placements: MatchDayLocalPlacement<T>[]
): MatchDayLocalAssignment[] {
  return placements
    .filter((row) => row.local)
    .map((row) => ({
      projectId: row.project.id,
      cardIndex: row.cardIndex,
      brandName: row.local!.brandName,
      pledgeGbp: row.local!.pledgeGbp,
      logoUrl: row.local!.logoUrl ?? null,
      tagline: row.local!.tagline ?? null,
      email: row.local!.email,
    }));
}

export function localFromAssignment(
  assignment: MatchDayLocalAssignment,
  clubName: string
): LocalSponsorRecord {
  return {
    brandName: assignment.brandName,
    email: assignment.email ?? "",
    clubName,
    pledgeGbp: assignment.pledgeGbp,
    createdAt: "",
    logoUrl: assignment.logoUrl ?? null,
    tagline: assignment.tagline ?? null,
  };
}

export function placementsFromStoredAssignments<T extends { id: string }>(
  projects: T[],
  assignments: MatchDayLocalAssignment[] | null | undefined,
  clubName: string
): MatchDayLocalPlacement<T>[] | null {
  if (!assignments?.length) return null;
  const byProject = new Map(
    assignments.map((row) => [String(row.projectId), row])
  );
  const maxPledge = Math.max(
    LOCAL_SPONSOR_MIN_GBP,
    ...assignments.map((row) => Number(row.pledgeGbp) || 0)
  );
  return projects.slice(0, MATCH_DAY_PROJECT_COUNT).map((project, index) => {
    const stored = byProject.get(project.id);
    return {
      project,
      cardIndex: stored?.cardIndex ?? index + 1,
      local: stored ? localFromAssignment(stored, clubName) : null,
      scale: stored ? localSlotScale(stored.pledgeGbp, maxPledge) : 1,
    };
  });
}

export function matchDayLocalPlacements<T extends { id: string }>({
  projects,
  clubName,
  stored,
}: {
  projects: T[];
  clubName: string;
  stored?: MatchDayLocalAssignment[] | null;
}): MatchDayLocalPlacement<T>[] {
  return (
    placementsFromStoredAssignments(projects, stored, clubName) ??
    assignLocalSponsorsToProjects(projects, localSponsorsForClub(clubName))
  );
}

function demoLogo(name: string, background: string, foreground = "#f8fafc"): string {
  const initials = brandInitials(name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="24" fill="${background}"/><text x="64" y="76" text-anchor="middle" font-family="Arial,sans-serif" font-size="42" font-weight="800" fill="${foreground}">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Example local businesses a Sustainability Director can attach 1-each. */
export function exampleLocalSponsorsForClub(
  clubName: string
): LocalSponsorRecord[] {
  const createdAt = new Date().toISOString();
  return [
    {
      brandName: "Braidview Garage",
      email: "",
      clubName,
      pledgeGbp: 1500,
      createdAt,
      tagline: "Keeping Edinburgh Moving. Cleaner.",
      logoUrl: demoLogo("Braidview Garage", "#0f172a"),
      source: "example",
    },
    {
      brandName: "Thistle Energy",
      email: "",
      clubName,
      pledgeGbp: 1250,
      createdAt,
      tagline: "Local Energy. Lasting Impact.",
      logoUrl: demoLogo("Thistle Energy", "#14532d"),
      source: "example",
    },
    {
      brandName: "Capital Homes Edinburgh",
      email: "",
      clubName,
      pledgeGbp: 1000,
      createdAt,
      tagline: "Building Greener Communities.",
      logoUrl: demoLogo("Capital Homes Edinburgh", "#1e3a5f"),
      source: "example",
    },
    {
      brandName: "McLeod & Sons Solicitors",
      email: "",
      clubName,
      pledgeGbp: 750,
      createdAt,
      tagline: "Local Advice. A Brighter Future.",
      logoUrl: demoLogo("McLeod & Sons Solicitors", "#3f3f46"),
      source: "example",
    },
    {
      brandName: "Edinburgh Roasters",
      email: "",
      clubName,
      pledgeGbp: 500,
      createdAt,
      tagline: "Good Coffee. A Greener Tomorrow.",
      logoUrl: demoLogo("Edinburgh Roasters", "#44403c"),
      source: "example",
    },
  ];
}

export function climateImpactTags(project: {
  name?: string | null;
  category?: string | null;
}): string[] {
  const key = `${project.name ?? ""} ${project.category ?? ""}`.toLowerCase();
  if (/solar|school/.test(key)) {
    return ["Clean Energy", "Stronger Communities", "Lower Emissions"];
  }
  if (/wood|forest|tree plant|biodiversity/.test(key)) {
    return ["Nature Restoration", "Biodiversity Protection", "Carbon Capture"];
  }
  if (/coast|ocean|beach|plastic/.test(key)) {
    return ["Cleaner Oceans", "Less Plastic Waste", "Healthier Ecosystems"];
  }
  if (/peat/.test(key)) {
    return ["Healthy Peatlands", "Carbon Storage", "Flood Resilience"];
  }
  if (/urban|neighbour|tree/.test(key)) {
    return ["Greener Neighbourhoods", "Cleaner Air", "Healthier Lives"];
  }
  if (project.category) return [project.category];
  return ["Climate Action"];
}

export function climateProjectHeroClass(project: {
  name?: string | null;
  category?: string | null;
}): string {
  const key = `${project.name ?? ""} ${project.category ?? ""}`.toLowerCase();
  if (/solar|school/.test(key)) return "from-amber-300 via-sky-400 to-emerald-700";
  if (/wood|forest/.test(key)) return "from-lime-300 via-emerald-700 to-slate-900";
  if (/coast|ocean|beach/.test(key)) return "from-sky-300 via-cyan-600 to-slate-900";
  if (/peat/.test(key)) return "from-amber-200 via-stone-600 to-emerald-950";
  if (/tree|urban|biodiversity/.test(key)) return "from-green-300 via-teal-700 to-slate-950";
  return "from-emerald-300 via-slate-700 to-slate-950";
}
