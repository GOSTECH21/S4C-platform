/** Climate Project Folders: group every SD-posted project by climate theme. */

import { catalogCategoryForName } from "./sccan-catalog";
import { formatLongMatchDate } from "./s4p-climate-projects";
import { addDays, VOTING_PERIOD_DAYS } from "./voting-window";

export type ClimateProjectGroup = {
  id: string;
  folderLabel: string;
  title: string;
  categories: string[];
};

export const CLIMATE_PROJECT_GROUPS: ClimateProjectGroup[] = [
  {
    id: "renewable-energy",
    folderLabel: "Renewable Folder",
    title: "Renewable Energy Projects",
    categories: ["Solar Energy", "Renewable Energy", "Clean Cooking"],
  },
  {
    id: "renewable-agriculture",
    folderLabel: "Renewable Agriculture Folder",
    title: "Renewable Agriculture Projects",
    categories: ["Sustainable Agriculture"],
  },
  {
    id: "reforestation",
    folderLabel: "Reforestation Folder",
    title: "Reforestation Projects",
    categories: ["Biodiversity"],
  },
  {
    id: "active-travel",
    folderLabel: "Active Travel Folder",
    title: "Active Travel Projects",
    categories: ["Active Travel"],
  },
  {
    id: "ocean-cleanup",
    folderLabel: "Ocean Cleanup Folder",
    title: "Ocean Cleanup Projects",
    categories: ["Ocean Cleanup"],
  },
  {
    id: "education",
    folderLabel: "Education Folder",
    title: "Education Projects",
    categories: ["Education"],
  },
  {
    id: "resilience",
    folderLabel: "Resilience Folder",
    title: "Resilience Projects",
    categories: ["Resilience"],
  },
  {
    id: "community",
    folderLabel: "Community Folder",
    title: "Community Climate Action Projects",
    categories: ["Community Climate Action"],
  },
  {
    id: "recycling",
    folderLabel: "Recycling Folder",
    title: "Recycling Projects",
    categories: ["Recycling"],
  },
  {
    id: "other",
    folderLabel: "Other Climate Projects Folder",
    title: "Other Climate Projects",
    categories: [],
  },
];

export function climateProjectGroupById(
  id: string | null | undefined
): ClimateProjectGroup | null {
  if (!id) return null;
  return CLIMATE_PROJECT_GROUPS.find((group) => group.id === id) ?? null;
}

export function climateProjectGroupFor(
  name: string,
  category?: string | null
): ClimateProjectGroup {
  const resolved = (category || catalogCategoryForName(name) || "").trim();
  const match = CLIMATE_PROJECT_GROUPS.find((group) =>
    group.categories.some(
      (entry) => entry.toLowerCase() === resolved.toLowerCase()
    )
  );
  if (match) return match;

  const key = `${name} ${resolved}`.toLowerCase();
  if (/solar|renewable|energy|wind|heat|cookstove/.test(key)) {
    return climateProjectGroupById("renewable-energy")!;
  }
  if (/farm|agricult|grow|food|soil/.test(key)) {
    return climateProjectGroupById("renewable-agriculture")!;
  }
  if (/forest|reforest|tree|woodland|peat|biodiversity/.test(key)) {
    return climateProjectGroupById("reforestation")!;
  }
  if (/bike|cycle|travel|walk|spoke/.test(key)) {
    return climateProjectGroupById("active-travel")!;
  }
  if (/ocean|coast|beach|plastic/.test(key)) {
    return climateProjectGroupById("ocean-cleanup")!;
  }
  if (/educat|school|train/.test(key)) {
    return climateProjectGroupById("education")!;
  }
  if (/resilien|adapt/.test(key)) {
    return climateProjectGroupById("resilience")!;
  }
  if (/recycl/.test(key)) {
    return climateProjectGroupById("recycling")!;
  }
  return climateProjectGroupById("other")!;
}

export function visibleClimateProjectGroups(
  counts: Record<string, number> = {}
): ClimateProjectGroup[] {
  return CLIMATE_PROJECT_GROUPS.filter(
    (group) => group.id !== "other" || (counts[group.id] ?? 0) > 0
  );
}

export function votingPeriodLabel(postedAt: string): string {
  const start = new Date(postedAt);
  if (Number.isNaN(start.getTime())) return "5-day Vote";
  const end = addDays(start, VOTING_PERIOD_DAYS);
  const from = formatLongMatchDate(start);
  const to = formatLongMatchDate(end);
  if (from && to) return `${from} – ${to}`;
  return "5-day Vote";
}
