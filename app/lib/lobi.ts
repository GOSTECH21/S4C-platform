/** Local Businesses Impact (LOBI): rank locals in a postcode area by monthly funding. */

import { brandsMatch } from "./climate-sponsors";
import { sameNamedFixture } from "./club-fixtures";
import {
  totalLocalPledge,
  type LocalSponsorRecord,
} from "./local-sponsor";
import { formatFundingGbp } from "./platform-stats";
import { normalizePostcode } from "./project-site";
import { rankImpactRows, type ImpactTableRow } from "./s4p-impact-tables";
import { matchDateKey } from "./sponsor-signed-home";

export const LOBI_SHORT_NAME = "LOBI";
export const LOBI_TITLE = "Local Businesses Impact (LOBI)";
export const LOBI_ENTITY_COLUMN = "Local Business";
export const LOBI_DESCRIPTION =
  "LOBI benchmarks Local Business Climate Sponsors in your postcode area by climate funding this month. A business that put £1,200 onto Hearts and Hibernian Matches ranks above one that spent £1,000.";

export type LobiFixtureDate = {
  fixtureName: string;
  date: string;
};

export type LobiRow = ImpactTableRow & {
  highlighted: boolean;
  postcodeArea: string;
};

export function postcodeArea(value: string | null | undefined): string {
  const normalized = normalizePostcode(value);
  const match = normalized.match(/^([A-Z]+)/);
  return match?.[1] ?? "";
}

export function monthKeyFromDate(
  value: string | Date | null | undefined
): string | null {
  const date = matchDateKey(value);
  return date ? date.slice(0, 7) : null;
}

export function inferredPostcodeArea(
  record: Pick<LocalSponsorRecord, "postcode" | "clubName">
): string {
  const fromRecord = postcodeArea(record.postcode);
  if (fromRecord) return fromRecord;
  const club = String(record.clubName ?? "").toLowerCase();
  if (club.includes("hearts") || club.includes("hibernian")) return "EH";
  if (club.includes("arsenal")) return "N";
  return "";
}

export function recordMonthKey(
  record: LocalSponsorRecord,
  fixtures: LobiFixtureDate[] = []
): string | null {
  for (const row of record.matchSponsorships ?? []) {
    const fixture = fixtures.find((item) =>
      sameNamedFixture(item.fixtureName, row.fixtureName)
    );
    const key = monthKeyFromDate(fixture?.date);
    if (key) return key;
  }
  return (
    monthKeyFromDate(record.submittedAt) ||
    monthKeyFromDate(record.signedAt) ||
    monthKeyFromDate(record.createdAt)
  );
}

export function localFundingInMonth(
  record: LocalSponsorRecord,
  monthKey: string,
  fixtures: LobiFixtureDate[] = []
): number {
  const matches = record.matchSponsorships ?? [];
  if (matches.length > 0) {
    let total = 0;
    let counted = false;
    for (const row of matches) {
      const fixture = fixtures.find((item) =>
        sameNamedFixture(item.fixtureName, row.fixtureName)
      );
      const key =
        monthKeyFromDate(fixture?.date) ||
        monthKeyFromDate(record.submittedAt) ||
        monthKeyFromDate(record.signedAt) ||
        monthKeyFromDate(record.createdAt);
      if (key === monthKey) {
        counted = true;
        total += Number(row.amountGbp) || 0;
      }
    }
    return counted ? total : 0;
  }
  if (recordMonthKey(record, fixtures) !== monthKey) return 0;
  return totalLocalPledge(record);
}

export function brandLocalFundingInMonth({
  records,
  brandName,
  monthKey,
  fixtures = [],
}: {
  records: LocalSponsorRecord[];
  brandName: string;
  monthKey: string;
  fixtures?: LobiFixtureDate[];
}): number {
  return records
    .filter((row) => brandsMatch(row.brandName, brandName))
    .reduce(
      (sum, row) => sum + localFundingInMonth(row, monthKey, fixtures),
      0
    );
}

export function lobiRowsForArea({
  records,
  area,
  monthKey,
  brandName,
  ownFundingGbp,
  fixtures = [],
}: {
  records: LocalSponsorRecord[];
  area: string;
  monthKey: string;
  brandName: string;
  ownFundingGbp?: number;
  fixtures?: LobiFixtureDate[];
}): LobiRow[] {
  const zone = area.trim().toUpperCase();
  const totals = new Map<string, { name: string; amount: number; area: string }>();
  for (const record of records) {
    const recordArea = inferredPostcodeArea(record);
    if (zone && recordArea !== zone) continue;
    const amount = localFundingInMonth(record, monthKey, fixtures);
    if (amount <= 0 && !brandsMatch(record.brandName, brandName)) continue;
    const current = totals.get(record.brandName.trim().toLowerCase());
    if (current) {
      current.amount += amount;
      continue;
    }
    totals.set(record.brandName.trim().toLowerCase(), {
      name: record.brandName.trim(),
      amount,
      area: recordArea,
    });
  }

  const ownName = brandName.trim();
  const ownKey = ownName.toLowerCase();
  const ownAmount = Math.max(
    Number(ownFundingGbp) || 0,
    totals.get(ownKey)?.amount ?? 0
  );
  if (ownName) {
    totals.set(ownKey, {
      name: ownName,
      amount: ownAmount,
      area: zone || totals.get(ownKey)?.area || "",
    });
  }

  return rankImpactRows(
    [...totals.values()].map((row) => ({
      name: row.name,
      metric: formatFundingGbp(row.amount),
      sortValue: row.amount,
      impactMoments: "0",
      funding: formatFundingGbp(row.amount),
      climateImpact: row.area || zone || "—",
    }))
  ).map((row) => ({
    ...row,
    highlighted: brandsMatch(row.name, brandName),
    postcodeArea:
      totals.get(row.name.trim().toLowerCase())?.area || zone || "—",
  }));
}
