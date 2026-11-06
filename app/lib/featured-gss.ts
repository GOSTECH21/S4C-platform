import { FEATURED_PROJECT_NAME } from "./sccan-catalog";

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

export function canonicalFeaturedGssName(
  name: string | null | undefined
): string {
  return isFeaturedGssName(name) ? FEATURED_PROJECT_NAME : String(name ?? "").trim();
}

export function canonicalFeaturedGssId(id: string | null | undefined): string {
  return String(id ?? "").replace(/::gss-(local|world)$/i, "");
}

/** One Global Schools Solar card — legacy local/international versions collapse here. */
export function expandFeaturedGssVersions<T extends { id: string; name: string }>(
  featured: T[]
): T[] {
  const rows = featured.filter((project) => isFeaturedGssName(project.name));
  if (rows.length === 0) return featured.slice(0, 1);
  const preferred =
    rows.find((project) => project.name.trim() === FEATURED_PROJECT_NAME) ??
    rows[0];
  return [
    {
      ...preferred,
      id: canonicalFeaturedGssId(preferred.id) || preferred.id,
      name: FEATURED_PROJECT_NAME,
    },
  ];
}

export function chosenFeaturedProject<T extends { id: string; name: string }>(
  projects: T[],
  chosenId?: string | null
): T | null {
  const featured = expandFeaturedGssVersions(featuredFromList(projects));
  if (featured.length === 0) return null;
  if (chosenId) {
    const wanted = canonicalFeaturedGssId(chosenId);
    const match = featured.find(
      (project) =>
        project.id === chosenId || canonicalFeaturedGssId(project.id) === wanted
    );
    if (match) return match;
  }
  return featured[0] ?? null;
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
  return [
    ...expandFeaturedGssVersions(featuredFromList(projects)),
    ...localFromList(projects),
  ];
}

/** Fan FUND-IT lists the one Featured GSS plus the club's partner projects. */
export function withFanGssChoices<T extends { id: string; name: string }>(
  projects: T[]
): T[] {
  return withFeaturedGssVersions(projects);
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
