import Link from "next/link";
import { HOME_PATH, S4P_IMPACT_TABLES_PATH } from "@/app/lib/routes";
import {
  IMPACT_TABLE_FULL_LIMIT,
  IMPACT_TABLE_PAGE_SIZE,
  IMPACT_TABLES,
  emptyImpactTables,
  impactTablePageCount,
  impactTablePageRows,
  parseImpactTableId,
  parseImpactTablePage,
} from "@/app/lib/s4p-impact-tables";
import { loadS4pImpactTables } from "@/app/services/s4p-impact-tables.service";

type PageProps = {
  searchParams: Promise<{ tab?: string; page?: string }>;
};

export default async function S4pImpactTablesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  let tables = emptyImpactTables();
  try {
    tables = await loadS4pImpactTables();
  } catch {
    tables = emptyImpactTables();
  }

  const tab = parseImpactTableId(params.tab);
  const board = tables.find((table) => table.id === tab) ?? tables[0];
  const page = parseImpactTablePage(params.page, board.rows.length);
  const pages = impactTablePageCount(board.rows.length);
  const rows = impactTablePageRows(board.rows, page);
  const start = (page - 1) * IMPACT_TABLE_PAGE_SIZE + (rows.length ? 1 : 0);
  const end = (page - 1) * IMPACT_TABLE_PAGE_SIZE + rows.length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <Link href={HOME_PATH} className="text-2xl font-black text-green-400">
            S4P
          </Link>
          <Link href={HOME_PATH} className="text-sm font-semibold text-slate-300 hover:text-white">
            ← Back to home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-emerald-400">
          S4P Impact Tables
        </p>
        <h1 className="mt-3 text-center text-4xl font-black">{board.title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-center font-semibold text-amber-300">
          Top 20 {board.title} entries, shown five at a time. Click CILT, CIST or
          CIFT to switch tables.
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
                href={`${S4P_IMPACT_TABLES_PATH}?tab=${item.id}&page=1`}
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

        <div className="mt-10 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
          {rows.length === 0 ? (
            <p className="p-8 text-center font-semibold text-amber-300">{board.emptyLabel}</p>
          ) : (
            <ol>
              {rows.map((row) => (
                <li
                  key={`${board.id}-${row.rank}-${row.name}`}
                  className="flex items-baseline justify-between gap-4 border-b border-slate-800 px-6 py-4 last:border-b-0"
                >
                  <span className="min-w-0 truncate text-lg font-semibold">
                    <span className="mr-3 font-black text-emerald-400">
                      {row.rank}.
                    </span>
                    {row.name}
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-amber-300">
                    {row.metric}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <p className="mt-4 text-center text-sm font-semibold text-amber-300">
          {rows.length
            ? `Showing ${start}–${end} of ${Math.min(board.rows.length, IMPACT_TABLE_FULL_LIMIT)}`
            : "No entries yet"}
        </p>

        {pages > 1 ? (
          <nav
            aria-label="Impact table pages"
            className="mt-6 flex items-center justify-center gap-2"
          >
            {page > 1 ? (
              <Link
                href={`${S4P_IMPACT_TABLES_PATH}?tab=${board.id}&page=${page - 1}`}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold hover:bg-slate-800"
              >
                Previous
              </Link>
            ) : null}
            {Array.from({ length: pages }, (_, index) => index + 1).map((item) => (
              <Link
                key={item}
                href={`${S4P_IMPACT_TABLES_PATH}?tab=${board.id}&page=${item}`}
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
                href={`${S4P_IMPACT_TABLES_PATH}?tab=${board.id}&page=${page + 1}`}
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
