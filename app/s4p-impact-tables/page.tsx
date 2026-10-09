import Link from "next/link";
import { HOME_PATH } from "@/app/lib/routes";
import {
  CILT_SCOPES,
  IMPACT_TABLE_FULL_LIMIT,
  IMPACT_TABLE_INTRO,
  IMPACT_TABLE_PAGE_SIZE,
  IMPACT_TABLES,
  ciltFilterOptions,
  climateImpactLeagueRowsFor,
  emptyImpactTables,
  impactTableHeading,
  impactTablePageCount,
  impactTablePageRows,
  impactTablesHref,
  parseCiltFilter,
  parseImpactTableId,
  parseImpactTablePage,
  type CiltFilter,
  type ImpactTableId,
  type ImpactTableRow,
} from "@/app/lib/s4p-impact-tables";
import { loadS4pImpactTables } from "@/app/services/s4p-impact-tables.service";

type PageProps = {
  searchParams: Promise<{
    tab?: string;
    page?: string;
    scope?: string;
    sport?: string;
    competition?: string;
    country?: string;
    season?: string;
  }>;
};

function filterChipClass(active: boolean) {
  return `rounded-full px-3 py-1.5 text-sm font-bold ${
    active
      ? "bg-emerald-500 text-slate-950"
      : "border border-slate-700 text-emerald-200 hover:bg-slate-800"
  }`;
}

function CiltFilters({ tab, filter }: { tab: ImpactTableId; filter: CiltFilter }) {
  const options = ciltFilterOptions();
  const values =
    filter.scope === "sport"
      ? options.sports
      : filter.scope === "competition"
        ? options.competitions
        : filter.scope === "country"
          ? options.countries
          : filter.scope === "season"
            ? options.seasons
            : [];
  const selected =
    filter.scope === "sport"
      ? filter.sport
      : filter.scope === "competition"
        ? filter.competition
        : filter.scope === "country"
          ? filter.country
          : filter.scope === "season"
            ? filter.season
            : null;

  return (
    <div className="mt-8">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
        Filter CILT
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {CILT_SCOPES.map((scope) => (
          <Link
            key={scope.id}
            href={impactTablesHref({
              tab,
              filter: { ...filter, scope: scope.id },
            })}
            className={filterChipClass(filter.scope === scope.id)}
          >
            {scope.label}
          </Link>
        ))}
      </div>
      {values.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {values.map((value) => (
            <Link
              key={value}
              href={impactTablesHref({
                tab,
                filter: {
                  ...filter,
                  sport: filter.scope === "sport" ? value : filter.sport,
                  competition:
                    filter.scope === "competition" ? value : filter.competition,
                  country: filter.scope === "country" ? value : filter.country,
                  season: filter.scope === "season" ? value : filter.season,
                },
              })}
              className={filterChipClass(selected === value)}
            >
              {value}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SimpleRows({
  rows,
  emptyLabel,
}: {
  rows: ImpactTableRow[];
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="p-8 text-center font-semibold text-amber-300">{emptyLabel}</p>
    );
  }
  return (
    <ol>
      {rows.map((row) => (
        <li
          key={`${row.rank}-${row.name}`}
          className="flex items-baseline justify-between gap-4 border-b border-slate-800 px-6 py-4 last:border-b-0"
        >
          <span className="min-w-0 truncate text-lg font-semibold">
            <span className="mr-3 font-black text-s4p-mark">{row.rank}.</span>
            {row.name}
          </span>
          <span className="shrink-0 text-sm font-semibold text-amber-300">
            {row.metric}
          </span>
        </li>
      ))}
    </ol>
  );
}

function FullRows({
  rows,
  entityColumn,
  emptyLabel,
}: {
  rows: ImpactTableRow[];
  entityColumn: string;
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="p-8 text-center font-semibold text-amber-300">{emptyLabel}</p>
    );
  }
  return (
    <table className="w-full text-left">
      <thead className="bg-slate-950/70 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        <tr>
          <th className="px-4 py-3 font-semibold">Pos</th>
          <th className="px-4 py-3 font-semibold">{entityColumn}</th>
          <th className="px-4 py-3 text-right font-semibold">Impact Moments</th>
          <th className="px-4 py-3 text-right font-semibold">Climate Funding</th>
          <th className="px-4 py-3 text-right font-semibold">Climate Impact</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={`${row.rank}-${row.name}`}
            className="border-t border-slate-800"
          >
            <td className="px-4 py-3.5 font-black text-s4p-mark">{row.rank}</td>
            <td className="px-4 py-3.5 font-semibold">{row.name}</td>
            <td className="px-4 py-3.5 text-right font-semibold text-amber-300">
              {row.impactMoments}
            </td>
            <td className="px-4 py-3.5 text-right font-semibold text-amber-300">
              {row.funding}
            </td>
            <td className="px-4 py-3.5 text-right font-semibold text-amber-300">
              {row.climateImpact}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function S4pImpactTablesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  let tables = emptyImpactTables();
  try {
    tables = await loadS4pImpactTables();
  } catch {
    tables = emptyImpactTables();
  }

  const tab = parseImpactTableId(params.tab);
  const filter = parseCiltFilter(params);
  const board = tables.find((table) => table.id === tab) ?? tables[0];
  const rankedRows =
    tab === "cilt" ? climateImpactLeagueRowsFor(filter) : board.rows;
  const page = parseImpactTablePage(params.page, rankedRows.length);
  const pages = impactTablePageCount(rankedRows.length);
  const rows = impactTablePageRows(rankedRows, page);
  const start = (page - 1) * IMPACT_TABLE_PAGE_SIZE + (rows.length ? 1 : 0);
  const end = (page - 1) * IMPACT_TABLE_PAGE_SIZE + rows.length;
  const heading = impactTableHeading(tab, filter);

  return (
    <main className="min-h-screen text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href={HOME_PATH} className="text-2xl font-black text-green-400">
            S4P
          </Link>
          <Link href={HOME_PATH} className="text-sm font-semibold text-slate-300 hover:text-white">
            ← Back to home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-s4p-mark">
          S4P Impact Tables
        </p>
        <h1 className="mt-3 text-center text-4xl font-black">{heading}</h1>
        <p className="mx-auto mt-4 max-w-3xl text-center font-semibold text-amber-300">
          {IMPACT_TABLE_INTRO}
        </p>
        <p className="mx-auto mt-3 max-w-3xl text-center text-sm font-semibold text-amber-200">
          {board.description}
        </p>

        <div
          role="tablist"
          aria-label="S4P Impact Tables"
          className="mt-8 flex items-center justify-center gap-1 text-sm font-black"
        >
          {IMPACT_TABLES.map((item, index) => (
            <span key={item.id} className="flex items-center gap-1">
              {index > 0 ? (
                <span className="px-1 text-slate-500" aria-hidden>
                  |
                </span>
              ) : null}
              <Link
                href={impactTablesHref({ tab: item.id })}
                scroll={false}
                className={`rounded-md px-3 py-2 ${
                  board.id === item.id
                    ? "bg-emerald-500 text-slate-950"
                    : "text-emerald-200 hover:bg-slate-800"
                }`}
              >
                {item.shortName}
              </Link>
            </span>
          ))}
        </div>

        {tab === "cilt" ? <CiltFilters tab={tab} filter={filter} /> : null}

        <div className="mt-10 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
          <div className="md:hidden">
            <SimpleRows rows={rows} emptyLabel={board.emptyLabel} />
          </div>
          <div className="hidden md:block">
            <FullRows
              rows={rows}
              entityColumn={board.entityColumn}
              emptyLabel={board.emptyLabel}
            />
          </div>
        </div>

        <p className="mt-4 text-center text-sm font-semibold text-amber-300">
          {rows.length
            ? `Showing ${start}–${end} of ${Math.min(rankedRows.length, IMPACT_TABLE_FULL_LIMIT)}`
            : "No entries yet"}
        </p>

        {pages > 1 ? (
          <nav
            aria-label="Impact table pages"
            className="mt-6 flex items-center justify-center gap-2"
          >
            {page > 1 ? (
              <Link
                href={impactTablesHref({ tab, page: page - 1, filter })}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold hover:bg-slate-800"
              >
                Previous
              </Link>
            ) : null}
            {Array.from({ length: pages }, (_, index) => index + 1).map((item) => (
              <Link
                key={item}
                href={impactTablesHref({ tab, page: item, filter })}
                className={`rounded-lg px-3 py-2 text-sm font-bold ${
                  item === page
                    ? "bg-emerald-500 text-slate-950"
                    : "border border-slate-700 hover:bg-slate-800"
                }`}
              >
                {item}
              </Link>
            ))}
            {page < pages ? (
              <Link
                href={impactTablesHref({ tab, page: page + 1, filter })}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold hover:bg-slate-800"
              >
                Next
              </Link>
            ) : null}
          </nav>
        ) : null}

        {board.sponsoredBy ? (
          <p className="mt-8 text-center text-xs uppercase tracking-[0.2em] text-slate-500">
            Table sponsored by {board.sponsoredBy}
          </p>
        ) : null}
      </section>
    </main>
  );
}
