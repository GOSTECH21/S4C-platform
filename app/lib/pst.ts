/** Philanthropist Sponsors Table (PST): rank gifts by geographical area. */

import { leagueForSportingCalendarClub, sportingCalendarClubGroups } from "./calendar-clubs";
import { LEAGUE_COUNTRY, seasonNamesMatch } from "./current-season";
import { formatFundingGbp } from "./platform-stats";
import {
  philanthropistDisplayName,
  philanthropistFundingGbp,
  type PhilanthropistRecord,
} from "./philanthropist";
import { brandsMatch } from "./sponsor-dashboard";

export const PST_ALL_AREA = "All areas";

export type PstCatalogEntry = {
  name: string;
  organisation: string;
  clubName: string;
  giftGbp: number;
  country: string;
};

export type PstRow = {
  rank: number;
  name: string;
  organisation: string;
  country: string;
  clubs: string[];
  fundingGbp: number;
  funding: string;
  highlighted: boolean;
};

export const PST_CATALOG: PstCatalogEntry[] = [
  {
    name: "Priya Shah",
    organisation: "North Stand Gift",
    clubName: "Arsenal",
    giftGbp: 22000,
    country: "England",
  },
  {
    name: "Owen Mersey",
    organisation: "Mersey Climate Gift",
    clubName: "Liverpool",
    giftGbp: 18000,
    country: "England",
  },
  {
    name: "Alex Smith",
    organisation: "The Smith Foundation",
    clubName: "Brighton & Hove Albion",
    giftGbp: 17500,
    country: "England",
  },
  {
    name: "Moira Park",
    organisation: "Parkhead Foundation",
    clubName: "Celtic",
    giftGbp: 15000,
    country: "Scotland",
  },
  {
    name: "Alex Davies",
    organisation: "Davies Family Trust",
    clubName: "Rangers",
    giftGbp: 12500,
    country: "Scotland",
  },
  {
    name: "Helen Tyne",
    organisation: "Tyne Bridge Fund",
    clubName: "Newcastle United",
    giftGbp: 9000,
    country: "England",
  },
  {
    name: "Calum Forth",
    organisation: "Forth Valley Gift",
    clubName: "Hearts",
    giftGbp: 8500,
    country: "Scotland",
  },
  {
    name: "Rosa Cottage",
    organisation: "Cottage Trust",
    clubName: "Fulham",
    giftGbp: 6500,
    country: "England",
  },
  {
    name: "Jamie Leith",
    organisation: "Leith Climate Fund",
    clubName: "Hibernian",
    giftGbp: 4200,
    country: "Scotland",
  },
];

export function countryForClub(clubName: string | null | undefined): string {
  const raw = String(clubName ?? "").trim();
  if (!raw) return "International";
  for (const group of sportingCalendarClubGroups()) {
    if (group.clubs.some((club) => seasonNamesMatch(club, raw))) {
      return group.country || "International";
    }
  }
  const league = leagueForSportingCalendarClub(raw);
  if (league && LEAGUE_COUNTRY[league]) return LEAGUE_COUNTRY[league];
  return "International";
}

export function pstAreas(entries: PstCatalogEntry[] = PST_CATALOG): string[] {
  const areas = new Set<string>();
  for (const row of entries) {
    if (row.country.trim()) areas.add(row.country.trim());
  }
  return [...areas].sort((left, right) => left.localeCompare(right));
}

function keyFor(name: string, organisation: string): string {
  return `${organisation.trim().toLowerCase()}|${name.trim().toLowerCase()}`;
}

export function mergePstCatalog(
  live: PhilanthropistRecord[] = [],
  catalog: PstCatalogEntry[] = PST_CATALOG
): PstCatalogEntry[] {
  const byKey = new Map<string, PstCatalogEntry>();
  for (const row of catalog) {
    byKey.set(keyFor(row.name, row.organisation), { ...row });
  }
  for (const record of live) {
    const organisation =
      record.organisation.trim() || philanthropistDisplayName(record);
    const key = keyFor(record.name, organisation);
    const country = countryForClub(record.clubName);
    const fundingGbp = philanthropistFundingGbp(record);
    const existing = byKey.get(key);
    if (existing) {
      existing.giftGbp = Math.max(existing.giftGbp, fundingGbp);
      existing.clubName = record.clubName.trim() || existing.clubName;
      existing.country = country;
      continue;
    }
    byKey.set(key, {
      name: record.name.trim(),
      organisation,
      clubName: record.clubName.trim(),
      giftGbp: fundingGbp,
      country,
    });
  }
  return [...byKey.values()];
}

export function pstRowsForArea({
  area = PST_ALL_AREA,
  ownName,
  catalog,
}: {
  area?: string;
  ownName?: string | null;
  catalog?: PstCatalogEntry[];
} = {}): PstRow[] {
  const rows = catalog ?? PST_CATALOG;
  const needle = area.trim() && area !== PST_ALL_AREA ? area.trim() : "";
  const grouped = new Map<
    string,
    {
      name: string;
      organisation: string;
      country: string;
      clubs: Set<string>;
      fundingGbp: number;
    }
  >();
  for (const row of rows) {
    if (needle && row.country !== needle) continue;
    const organisation = row.organisation.trim() || row.name.trim();
    const key = keyFor(row.name, organisation);
    const current = grouped.get(key);
    if (current) {
      current.fundingGbp += row.giftGbp;
      if (row.clubName.trim()) current.clubs.add(row.clubName.trim());
      continue;
    }
    grouped.set(key, {
      name: row.name.trim(),
      organisation,
      country: row.country,
      clubs: new Set(row.clubName.trim() ? [row.clubName.trim()] : []),
      fundingGbp: row.giftGbp,
    });
  }
  return [...grouped.values()]
    .sort((left, right) => {
      if (right.fundingGbp !== left.fundingGbp) {
        return right.fundingGbp - left.fundingGbp;
      }
      return left.organisation.localeCompare(right.organisation);
    })
    .map((row, index) => ({
      rank: index + 1,
      name: row.name,
      organisation: row.organisation,
      country: row.country,
      clubs: [...row.clubs],
      fundingGbp: row.fundingGbp,
      funding: formatFundingGbp(row.fundingGbp),
      highlighted:
        brandsMatch(row.organisation, ownName) || brandsMatch(row.name, ownName),
    }));
}

export function pstOwnRow(rows: PstRow[], ownName: string | null | undefined): PstRow | null {
  const name = String(ownName ?? "").trim();
  if (!name) return null;
  return (
    rows.find(
      (row) => brandsMatch(row.organisation, name) || brandsMatch(row.name, name)
    ) ?? null
  );
}

export function pstPositionCopy(row: PstRow | null, area: string): string {
  const region = area.trim() && area !== PST_ALL_AREA ? area.trim() : "";
  if (!row) {
    return region
      ? `You are not yet ranked in ${region}.`
      : "You are not yet ranked on the Philanthropist Sponsors Table.";
  }
  if (region) return `You are #${row.rank} in ${region}`;
  return `You are #${row.rank} on the Philanthropist Sponsors Table`;
}
