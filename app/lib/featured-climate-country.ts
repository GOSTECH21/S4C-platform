import { FEATURED_PROJECT_NAME, selectableCatalogForCountry } from "./sccan-catalog";
import {
  LEAGUE_COUNTRY,
  canonicalLeagueName,
  leagueForClubName,
  normalizeSeasonName,
} from "./current-season";

export const UK_CLIMATE_REGION = "UK";
export const INTERNATIONAL_CLIMATE_REGION = "International";

export type ClimateCountryContext = {
  clubName?: string | null;
  country?: string | null;
  league?: string | null;
};

const UK_ALIASES = new Set([
  "uk",
  "u k",
  "united kingdom",
  "great britain",
  "britain",
  "gb",
  "england",
  "scotland",
  "wales",
  "northern ireland",
]);

const KNOWN_REGIONS: Record<string, string> = {
  italy: "Italy",
  spain: "Spain",
  france: "France",
  germany: "Germany",
  ireland: "Ireland",
  usa: "USA",
  "united states": "USA",
  "united states of america": "USA",
  mexico: "Mexico",
};

const SKIP_REGIONS = new Set(["international", "global", "worldwide", "europe"]);

const CATALOG_NATIONS: Record<string, string> = {
  england: "England",
  scotland: "Scotland",
  wales: "Wales",
  "northern ireland": "Northern Ireland",
  italy: "Italy",
  spain: "Spain",
  france: "France",
  germany: "Germany",
  ireland: "Ireland",
  usa: "USA",
  "united states": "USA",
  "united states of america": "USA",
};

const UK_AMBIGUOUS = new Set([
  "uk",
  "u k",
  "united kingdom",
  "great britain",
  "britain",
  "gb",
]);

function isFeaturedName(name: string | null | undefined): boolean {
  return new RegExp(`^${FEATURED_PROJECT_NAME}$`, "i").test((name ?? "").trim())
    || /global\s+schools\s+solar/i.test(name ?? "");
}

/** Map a stored country / league country onto the label fans and SDs should see. */
export function canonicalLocalClimateRegion(
  value: string | null | undefined
): string | null {
  const key = normalizeSeasonName(value ?? "");
  if (!key || SKIP_REGIONS.has(key)) return null;
  if (UK_ALIASES.has(key)) return UK_CLIMATE_REGION;
  return KNOWN_REGIONS[key] ?? null;
}

/**
 * Home region for Global Schools Solar: UK clubs share one UK label;
 * Serie A clubs such as AC Milan use Italy; other leagues use their country.
 */
export function localClimateRegionForClub(
  context: ClimateCountryContext
): string | null {
  const fromCountry = canonicalLocalClimateRegion(context.country);
  if (fromCountry) return fromCountry;

  const league =
    canonicalLeagueName(context.league) ??
    (context.clubName ? leagueForClubName(context.clubName) : null);

  if (league === "Six Nations") {
    const fromNation = canonicalLocalClimateRegion(context.clubName);
    if (fromNation) return fromNation;
  }

  if (league) {
    const fromLeague = canonicalLocalClimateRegion(LEAGUE_COUNTRY[league]);
    if (fromLeague) return fromLeague;
  }

  return canonicalLocalClimateRegion(context.clubName);
}

/**
 * Nation used for the SD's 10 local Climate Partner projects.
 * England and Scotland stay separate, so Arsenal and Hearts do not share a list.
 */
export function localCatalogCountryForClub(
  context: ClimateCountryContext
): string {
  const countryKey = normalizeSeasonName(context.country ?? "");
  if (countryKey && !UK_AMBIGUOUS.has(countryKey) && !SKIP_REGIONS.has(countryKey)) {
    const nation = CATALOG_NATIONS[countryKey];
    if (nation) return nation;
  }

  const league =
    canonicalLeagueName(context.league) ??
    (context.clubName ? leagueForClubName(context.clubName) : null);

  if (league === "Six Nations") {
    const fromNation = CATALOG_NATIONS[normalizeSeasonName(context.clubName ?? "")];
    if (fromNation) return fromNation;
  }

  if (league) {
    const fromLeague = CATALOG_NATIONS[normalizeSeasonName(LEAGUE_COUNTRY[league] ?? "")];
    if (fromLeague) return fromLeague;
  }

  return "England";
}

export function selectableCatalogForClub(context: ClimateCountryContext) {
  return selectableCatalogForCountry(localCatalogCountryForClub(context));
}

export function featuredClimateProjectCountryLabel(
  context: ClimateCountryContext = {}
): string {
  const local = localClimateRegionForClub(context);
  if (!local || local === INTERNATIONAL_CLIMATE_REGION) {
    return INTERNATIONAL_CLIMATE_REGION;
  }
  return `${local} and ${INTERNATIONAL_CLIMATE_REGION}`;
}

export function featuredClimateProjectCountryLabelForClubs(
  clubs: ClimateCountryContext[]
): string {
  const locals = [
    ...new Set(
      clubs
        .map((club) => localClimateRegionForClub(club))
        .filter((region): region is string => Boolean(region))
    ),
  ];
  if (locals.length === 0) return INTERNATIONAL_CLIMATE_REGION;
  return `${locals.join(", ")} and ${INTERNATIONAL_CLIMATE_REGION}`;
}

export function climateProjectCountryLabel(
  project: {
    name?: string | null;
    featured?: boolean | null;
    country?: string | null;
  },
  context: ClimateCountryContext = {}
): string | null {
  if (project.featured || isFeaturedName(project.name)) {
    return featuredClimateProjectCountryLabel(context);
  }
  return project.country ?? null;
}
