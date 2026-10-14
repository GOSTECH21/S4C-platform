import {
  FEATURED_GSS_LOCAL_NAME,
  FEATURED_GSS_WORLD_NAME,
  FEATURED_PROJECT_NAME,
} from "./sccan-catalog";

/** Share of each Lead FUND-IT that must reach Global Schools Solar / featured. */
export const LEAD_FEATURED_SHARE = 0.75;
/** Share of each Lead FUND-IT that must reach local Climate Projects. */
export const LEAD_LOCAL_SHARE = 0.25;

export function isFeaturedGssName(name: string | null | undefined): boolean {
  return /global\s+schools\s+solar/i.test((name ?? "").trim());
}

export function isFeaturedGssLocalName(name: string | null | undefined): boolean {
  const value = name ?? "";
  return (
    isFeaturedGssName(value) &&
    (/local school/i.test(value) || /local\s+global\s+schools\s+solar/i.test(value))
  );
}

export function isFeaturedGssWorldName(name: string | null | undefined): boolean {
  const value = name ?? "";
  return (
    isFeaturedGssName(value) &&
    (/anywhere in the world/i.test(value) || /international/i.test(value))
  );
}

export function expandFeaturedGssVersions<T extends { id: string; name: string }>(
  featured: T[]
): T[] {
  if (featured.length === 0) return [];
  const local = featured.find((project) => isFeaturedGssLocalName(project.name));
  const world = featured.find((project) => isFeaturedGssWorldName(project.name));
  const base = featured[0];
  return [
    local ?? {
      ...base,
      ...(world ? { id: `${base.id}::gss-local` } : {}),
      name: FEATURED_GSS_LOCAL_NAME,
    },
    world ?? {
      ...base,
      id: `${base.id}::gss-world`,
      name: FEATURED_GSS_WORLD_NAME,
    },
  ];
}

export function chosenFeaturedProject<T extends { id: string; name: string }>(
  projects: T[],
  chosenId?: string | null
): T | null {
  const featured = featuredFromList(projects);
  if (chosenId) {
    const match = featured.find((project) => project.id === chosenId);
    if (match) return match;
  }
  return featured.length === 1 ? featured[0] : null;
}

export function withChosenFeaturedProject<T extends { id: string; name: string }>(
  projects: T[],
  chosenId?: string | null
): T[] {
  const others = localFromList(projects);
  const chosen = chosenFeaturedProject(projects, chosenId);
  return chosen ? [chosen, ...others] : others;
}

export function withFeaturedGssVersions<T extends { id: string; name: string }>(
  projects: T[]
): T[] {
  return [...featuredFromList(projects), ...localFromList(projects)];
}

/** Fan FUND-IT lists both GSS versions even when the club posted only one. */
export function withFanGssChoices<T extends { id: string; name: string }>(
  projects: T[]
): T[] {
  return [
    ...expandFeaturedGssVersions(featuredFromList(projects)),
    ...localFromList(projects),
  ];
}

export function featuredFromList<T extends { name: string }>(projects: T[]): T[] {
  return projects.filter((project) => isFeaturedGssName(project.name));
}

export function localFromList<T extends { name: string }>(projects: T[]): T[] {
  return projects.filter((project) => !isFeaturedGssName(project.name));
}

export function featuredProgrammeName(): string {
  return FEATURED_PROJECT_NAME;
}
