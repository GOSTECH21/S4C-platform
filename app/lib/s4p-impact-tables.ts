import { climateImpactLeagueTable } from "./cilt";
import { CURRENT_SEASON_LEAGUES } from "./current-season";

export const IMPACT_TABLE_TOP_COUNT = 5;
export const IMPACT_TABLE_FULL_LIMIT = 20;
export const IMPACT_TABLE_PAGE_SIZE = 5;

export type ImpactTableId = "cilt" | "cist" | "cift";

export type ImpactTableRow = {
  rank: number;
  name: string;
  metric: string;
};

export type ImpactTableBoard = {
  id: ImpactTableId;
  shortName: "CILT" | "CIST" | "CIFT";
  title: string;
  topHeading: string;
  viewFullLabel: string;
  sponsoredBy: string | null;
  emptyLabel: string;
  rows: ImpactTableRow[];
};

export const IMPACT_TABLES: Array<{
  id: ImpactTableId;
  shortName: ImpactTableBoard["shortName"];
  title: string;
  topHeading: string;
  viewFullLabel: string;
  emptyLabel: string;
}> = [
  {
    id: "cilt",
    shortName: "CILT",
    title: "Climate Impact League Table",
    topHeading: "Top CILT",
    viewFullLabel: "View Full Climate Impact League Table →",
    emptyLabel: "No clubs have recorded climate impact yet.",
  },
  {
    id: "cist",
    shortName: "CIST",
    title: "Climate Impact Sponsorship Table",
    topHeading: "Top CIST",
    viewFullLabel: "View Full Climate Impact Sponsorship Table →",
    emptyLabel: "No sponsors have recorded spend yet.",
  },
  {
    id: "cift",
    shortName: "CIFT",
    title: "Climate Impact Fans Table",
    topHeading: "Top CIFT",
    viewFullLabel: "View Full Climate Impact Fans Table →",
    emptyLabel: "No fans have allocated sponsor-funded money yet.",
  },
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

export function rankImpactRows(
  entries: Array<{ name: string; metric: string; sortValue: number }>
): ImpactTableRow[] {
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
    }));
}

export function publicFanName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Fan";
  if (parts.length === 1) return parts[0];
  const last = parts[parts.length - 1];
  return `${parts[0]} ${last.charAt(0).toUpperCase()}.`;
}

export function overallClimateImpactLeagueRows(): ImpactTableRow[] {
  const seen = new Set<string>();
  const entries: Array<{ name: string; metric: string; sortValue: number }> = [];
  for (const league of Object.keys(CURRENT_SEASON_LEAGUES)) {
    for (const row of climateImpactLeagueTable(league, "")) {
      const key = row.club.trim().toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      entries.push({
        name: row.club,
        metric: `${row.tonnes.toLocaleString("en-GB")} tCO₂e`,
        sortValue: row.tonnes,
      });
    }
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
