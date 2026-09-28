import { climateImpactLeagueTable } from "./cilt";
import {
  CURRENT_SEASON,
  CURRENT_SEASON_LEAGUES,
  LEAGUE_COUNTRY,
  LEAGUE_SPORT,
} from "./current-season";
import { S4P_IMPACT_TABLES_PATH } from "./routes";

export const IMPACT_TABLE_TOP_COUNT = 5;
export const IMPACT_TABLE_FULL_LIMIT = 20;
export const IMPACT_TABLE_PAGE_SIZE = 5;

export const IMPACT_TABLE_INTRO =
  "See how Sports Clubs, Climate Sponsors and Fans are turning sporting moments into measurable climate action";

export type ImpactTableId = "cilt" | "cist" | "cift";
export type CiltScope = "global" | "sport" | "competition" | "country" | "season";

export type ImpactTableRow = {
  rank: number;
  name: string;
  metric: string;
  impactMoments: string;
  funding: string;
  climateImpact: string;
};

export type ImpactTableEntry = {
  name: string;
  metric: string;
  sortValue: number;
  impactMoments?: string;
  funding?: string;
  climateImpact?: string;
  sport?: string;
  competition?: string;
  country?: string;
  season?: string;
};

export type ImpactTableBoard = {
  id: ImpactTableId;
  shortName: "CILT" | "CIST" | "CIFT";
  title: string;
  topHeading: string;
  viewFullLabel: string;
  entityColumn: "Club" | "Sponsor" | "Fan";
  description: string;
  sponsoredBy: string | null;
  emptyLabel: string;
  rows: ImpactTableRow[];
};

export type CiltFilter = {
  scope: CiltScope;
  sport: string | null;
  competition: string | null;
  country: string | null;
  season: string | null;
};

export const IMPACT_TABLES: Array<{
  id: ImpactTableId;
  shortName: ImpactTableBoard["shortName"];
  title: string;
  topHeading: string;
  viewFullLabel: string;
  entityColumn: ImpactTableBoard["entityColumn"];
  description: string;
  emptyLabel: string;
}> = [
  {
    id: "cilt",
    shortName: "CILT",
    title: "Climate Impact League Table (CILT)",
    topHeading: "Top 5 Climate Impact League Table (CILT)",
    viewFullLabel: "View Full Climate Impact League Table →",
    entityColumn: "Club",
    description:
      "CILT ranks participating Sports Clubs by qualifying climate impact generated through S4P",
    emptyLabel: "No clubs have recorded climate impact yet.",
  },
  {
    id: "cist",
    shortName: "CIST",
    title: "Climate Impact Sponsorship Table (CIST)",
    topHeading: "Top 5 Climate Impact Sponsorship Table (CIST)",
    viewFullLabel: "View Full Climate Impact Sponsorship Table →",
    entityColumn: "Sponsor",
    description:
      "CIST recognises Climate Sponsors by qualifying climate funding contributed through S4P",
    emptyLabel: "No sponsors have recorded spend yet.",
  },
  {
    id: "cift",
    shortName: "CIFT",
    title: "Climate Impact Fans Table (CIFT)",
    topHeading: "Top 5 Climate Impact Fans Table (CIFT)",
    viewFullLabel: "View Full Climate Impact Fans Table →",
    entityColumn: "Fan",
    description:
      "CIFT recognises Fans & Supporters for participating in their Club's climate action",
    emptyLabel: "No fans have allocated sponsor-funded money yet.",
  },
];

export const CILT_SCOPES: Array<{ id: CiltScope; label: string }> = [
  { id: "global", label: "Global" },
  { id: "sport", label: "Sport" },
  { id: "competition", label: "Competition" },
  { id: "country", label: "Country" },
  { id: "season", label: "Season" },
];

/** Ready for a brand to sponsor each table later. */
export const IMPACT_TABLE_SPONSORS: Record<ImpactTableId, string | null> = {
  cilt: null,
  cist: null,
  cift: null,
};

export function impactTableMeta(id: ImpactTableId) {
  return IMPACT_TABLES.find((table) => table.id === id) ?? IMPACT_TABLES[0];
}

export function parseImpactTableId(value: string | null | undefined): ImpactTableId {
  if (value === "cist" || value === "cift" || value === "cilt") return value;
  return "cilt";
}

export function parseImpactTablePage(
  value: string | null | undefined,
  rowCount: number
): number {
  const pages = impactTablePageCount(rowCount);
  const page = Math.round(Number(value) || 1);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(pages, page);
}

export function impactTablePageCount(rowCount: number): number {
  const total = Math.min(IMPACT_TABLE_FULL_LIMIT, Math.max(0, rowCount));
  return Math.max(1, Math.ceil(total / IMPACT_TABLE_PAGE_SIZE));
}

export function impactTablePageRows<T>(rows: T[], page: number): T[] {
  const limited = rows.slice(0, IMPACT_TABLE_FULL_LIMIT);
  const safePage = parseImpactTablePage(String(page), limited.length);
  const start = (safePage - 1) * IMPACT_TABLE_PAGE_SIZE;
  return limited.slice(start, start + IMPACT_TABLE_PAGE_SIZE);
}

function firstParam(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim() ?? "";
  return trimmed || null;
}

function parseCiltScope(value: string | null): CiltScope {
  if (
    value === "sport" ||
    value === "competition" ||
    value === "country" ||
    value === "season" ||
    value === "global"
  ) {
    return value;
  }
  return "global";
}

export function parseCiltFilter(params: {
  scope?: string | string[];
  sport?: string | string[];
  competition?: string | string[];
  country?: string | string[];
  season?: string | string[];
}): CiltFilter {
  const sport = firstParam(params.sport);
  const competition = firstParam(params.competition);
  const country = firstParam(params.country);
  const season = firstParam(params.season);
  let scope = parseCiltScope(firstParam(params.scope));
  if (scope === "global") {
    if (competition) scope = "competition";
    else if (sport) scope = "sport";
    else if (country) scope = "country";
    else if (season) scope = "season";
  }
  return { scope, sport, competition, country, season };
}

export function impactTablesHref({
  tab,
  page = 1,
  filter,
}: {
  tab: ImpactTableId;
  page?: number;
  filter?: CiltFilter | null;
}): string {
  const params = new URLSearchParams();
  params.set("tab", tab);
  if (page > 1) params.set("page", String(page));
  if (tab === "cilt" && filter && filter.scope !== "global") {
    params.set("scope", filter.scope);
    if (filter.scope === "sport" && filter.sport) params.set("sport", filter.sport);
    if (filter.scope === "competition" && filter.competition) {
      params.set("competition", filter.competition);
    }
    if (filter.scope === "country" && filter.country) {
      params.set("country", filter.country);
    }
    if (filter.scope === "season" && filter.season) params.set("season", filter.season);
  }
  return `${S4P_IMPACT_TABLES_PATH}?${params.toString()}`;
}

export function ciltFilterOptions() {
  const sports = [...new Set(Object.values(LEAGUE_SPORT))].sort();
  const competitions = Object.keys(CURRENT_SEASON_LEAGUES);
  const countries = [...new Set(Object.values(LEAGUE_COUNTRY))]
    .filter((country) => country !== "Europe")
    .sort();
  return {
    sports,
    competitions,
    countries,
    seasons: [CURRENT_SEASON],
  };
}

export function impactTableHeading(tab: ImpactTableId, filter?: CiltFilter | null): string {
  const meta = impactTableMeta(tab);
  if (tab !== "cilt" || !filter || filter.scope === "global") return meta.title;
  if (filter.scope === "sport" && filter.sport) return `${filter.sport} CILT`;
  if (filter.scope === "competition" && filter.competition) {
    return `${filter.competition} CILT`;
  }
  if (filter.scope === "country" && filter.country) return `${filter.country} CILT`;
  if (filter.scope === "season" && filter.season) return `${filter.season} CILT`;
  return meta.title;
}

export function rankImpactRows(entries: ImpactTableEntry[]): ImpactTableRow[] {
  return [...entries]
    .filter((row) => row.name.trim())
    .sort((left, right) => {
      if (right.sortValue !== left.sortValue) return right.sortValue - left.sortValue;
      return left.name.localeCompare(right.name);
    })
    .slice(0, IMPACT_TABLE_FULL_LIMIT)
    .map((row, index) => ({
      rank: index + 1,
      name: row.name.trim(),
      metric: row.metric,
      impactMoments: row.impactMoments ?? "0",
      funding: row.funding ?? "£0",
      climateImpact: row.climateImpact ?? row.metric,
    }));
}

export function publicFanName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Fan";
  if (parts.length === 1) return parts[0];
  const last = parts[parts.length - 1];
  return `${parts[0]} ${last.charAt(0).toUpperCase()}.`;
}

export function climateImpactLeagueEntries(): ImpactTableEntry[] {
  const seen = new Set<string>();
  const entries: ImpactTableEntry[] = [];
  for (const league of Object.keys(CURRENT_SEASON_LEAGUES)) {
    for (const row of climateImpactLeagueTable(league, "")) {
      const key = row.club.trim().toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const climateImpact = `${row.tonnes.toLocaleString("en-GB")} tCO₂e`;
      entries.push({
        name: row.club,
        metric: climateImpact,
        sortValue: row.tonnes,
        impactMoments: "0",
        funding: "£0",
        climateImpact,
        sport: LEAGUE_SPORT[league] ?? "",
        competition: league,
        country: LEAGUE_COUNTRY[league] ?? "",
        season: CURRENT_SEASON,
      });
    }
  }
  return entries;
}

export function overallClimateImpactLeagueRows(): ImpactTableRow[] {
  return rankImpactRows(climateImpactLeagueEntries());
}

export function climateImpactLeagueRowsFor(filter: CiltFilter): ImpactTableRow[] {
  let entries = climateImpactLeagueEntries();
  if (filter.scope === "sport" && filter.sport) {
    entries = entries.filter((row) => row.sport === filter.sport);
  } else if (filter.scope === "competition" && filter.competition) {
    entries = entries.filter((row) => row.competition === filter.competition);
  } else if (filter.scope === "country" && filter.country) {
    entries = entries.filter((row) => row.country === filter.country);
  } else if (filter.scope === "season" && filter.season) {
    entries = entries.filter((row) => row.season === filter.season);
  }
  return rankImpactRows(entries);
}

export function emptyImpactTables(): ImpactTableBoard[] {
  return IMPACT_TABLES.map((meta) => ({
    ...meta,
    sponsoredBy: IMPACT_TABLE_SPONSORS[meta.id],
    rows: meta.id === "cilt" ? overallClimateImpactLeagueRows() : [],
  }));
}

export function impactTablesOrEmpty(
  tables: ImpactTableBoard[] | null | undefined
): ImpactTableBoard[] {
  return tables?.length ? tables : emptyImpactTables();
}
