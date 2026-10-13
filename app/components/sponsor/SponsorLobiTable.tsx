import {
  LOBI_DESCRIPTION,
  LOBI_ENTITY_COLUMN,
  LOBI_SHORT_NAME,
  LOBI_TITLE,
  type LobiRow,
} from "@/app/lib/lobi";

export function SponsorLobiTable({
  rows,
  area,
}: {
  rows: LobiRow[];
  area: string;
}) {
  const zone = area.trim().toUpperCase() || "your";
  return (
    <section className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
        {LOBI_SHORT_NAME}
      </p>
      <h2 className="mt-2 text-3xl font-black">{LOBI_TITLE}</h2>
      <p className="mt-3 max-w-3xl text-slate-300">
        Your position is highlighted. {LOBI_DESCRIPTION} This table is the{" "}
        {zone} postcode area.
      </p>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-700">
        <table className="w-full min-w-[32rem] text-left">
          <thead className="bg-slate-950 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Pos</th>
              <th className="px-4 py-3 font-semibold">{LOBI_ENTITY_COLUMN}</th>
              <th className="px-4 py-3 text-right font-semibold">
                Climate Funding
              </th>
              <th className="px-4 py-3 text-right font-semibold">Postcode</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-3.5 text-slate-400" colSpan={4}>
                  No Local Business Climate Sponsors in this postcode area yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={`${row.rank}-${row.name}`}
                  className={
                    row.highlighted
                      ? "bg-green-500/20 ring-1 ring-inset ring-green-400"
                      : "border-t border-slate-800"
                  }
                >
                  <td className="px-4 py-3.5 font-black text-green-400">
                    {row.rank}
                  </td>
                  <td className="px-4 py-3.5 font-semibold">{row.name}</td>
                  <td className="px-4 py-3.5 text-right font-semibold">
                    {row.funding}
                  </td>
                  <td className="px-4 py-3.5 text-right text-slate-300">
                    {row.postcodeArea}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
