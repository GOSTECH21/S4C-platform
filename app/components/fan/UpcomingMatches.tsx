import {
  clubIsHome,
  formatKickoff,
  formatMatchDate,
  opponentName,
  sourceLabel,
  type UpcomingMatch,
} from "@/app/lib/upcoming-matches";

export function MatchLines({
  matches,
  clubName,
  compact = false,
}: {
  matches: UpcomingMatch[];
  clubName: string;
  compact?: boolean;
}) {
  if (matches.length === 0) {
    return (
      <p className={compact ? "text-sm text-slate-600" : "text-sm text-slate-400"}>
        No upcoming matches found yet.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {matches.map((match) => {
        const home = clubIsHome(match, clubName);
        const opponent = opponentName(match, clubName);
        return (
          <li key={match.id} className="min-w-0">
            <p
              className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                compact ? "text-slate-700" : "text-slate-400"
              }`}
            >
              {formatMatchDate(match.date)} · {formatKickoff(match.kickoff)} ·{" "}
              {home ? "Home" : "Away"}
            </p>
            <p className={`mt-1 font-semibold ${compact ? "text-slate-950" : "text-white"}`}>
              vs {opponent}
            </p>
            <p className={`text-sm ${compact ? "text-slate-700" : "text-slate-400"}`}>
              {[match.venue, match.competition].filter(Boolean).join(" · ")}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

export default function UpcomingMatches({
  items,
  loading,
}: {
  items: { clubId: string; clubName: string; match: UpcomingMatch }[];
  loading: boolean;
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-2xl font-bold text-green-400">Upcoming matches</h2>
      <p className="mt-2 text-sm text-slate-400">
        Next fixtures for the teams you selected, taken from each club’s
        fixtures list when we can read it.
      </p>

      {loading ? (
        <p className="mt-6 text-slate-400">Loading next matches...</p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-slate-400">
          No upcoming matches found for your teams yet.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {items.map(({ clubId, clubName, match }) => {
            const home = clubIsHome(match, clubName);
            return (
              <article
                key={`${clubId}-${match.id}`}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-400">
                    {clubName}
                  </p>
                  <span className="rounded-full bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-300">
                    {home ? "H" : "A"}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-bold text-white">
                  {match.homeName} vs {match.awayName}
                </h3>
                <p className="mt-1 text-slate-300">
                  {formatMatchDate(match.date)} · {formatKickoff(match.kickoff)}
                </p>
                <p className="text-sm text-slate-400">
                  {[match.venue, match.competition].filter(Boolean).join(" · ")}
                </p>
                {match.sourceUrl ? (
                  <a
                    href={match.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm font-semibold text-green-300 hover:underline"
                  >
                    {sourceLabel(match.source)} →
                  </a>
                ) : (
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                    {sourceLabel(match.source)}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
