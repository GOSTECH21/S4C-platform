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
  return /local school/i.test(name ?? "") && isFeaturedGssName(name);
}

export function isFeaturedGssWorldName(name: string | null | undefined): boolean {
  return /anywhere in the world/i.test(name ?? "") && isFeaturedGssName(name);
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
      id: `${base.id}::gss-local`,
      name: FEATURED_GSS_LOCAL_NAME,
    },
    world ?? {
      ...base,
      id: `${base.id}::gss-world`,
      name: FEATURED_GSS_WORLD_NAME,
    },
  ];
}

export function withFeaturedGssVersions<T extends { id: string; name: string }>(
  projects: T[]
): T[] {
  const featured = projects.filter((project) => isFeaturedGssName(project.name));
  const locals = projects.filter((project) => !isFeaturedGssName(project.name));
  return [...expandFeaturedGssVersions(featured), ...locals];
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
