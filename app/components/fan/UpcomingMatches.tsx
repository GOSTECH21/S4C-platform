import {
  clubIsHome,
  displayCompetition,
  formatKickoff,
  formatMatchDate,
  isCupCompetition,
  opponentName,
  sourceLabel,
  type UpcomingMatch,
} from "@/app/lib/upcoming-matches";

function CupBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${
        compact
          ? "bg-slate-950 text-green-300"
          : "bg-green-500/15 text-green-300"
      }`}
    >
      Cup
    </span>
  );
}

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
        const cup = isCupCompetition(match.competition);
        const competition = displayCompetition(match.competition);
        return (
          <li key={match.id} className="min-w-0">
            <p
              className={`flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                compact ? "text-slate-700" : "text-slate-400"
              }`}
            >
              <span>
                {formatMatchDate(match.date)} · {formatKickoff(match.kickoff)} ·{" "}
                {home ? "Home" : "Away"}
              </span>
              {cup && <CupBadge compact={compact} />}
            </p>
            <p className={`mt-1 font-semibold ${compact ? "text-slate-950" : "text-white"}`}>
              vs {opponent}
            </p>
            <p className={`text-sm ${compact ? "text-slate-700" : "text-slate-400"}`}>
              {[match.venue, competition].filter(Boolean).join(" · ")}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

type MatchItem = {
  clubId: string;
  clubName: string;
  match: UpcomingMatch;
};

export default function UpcomingMatches({
  items,
  cups,
  loading,
}: {
  items: MatchItem[];
  cups: MatchItem[];
  loading: boolean;
}) {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-2xl font-bold text-green-400">Upcoming matches</h2>
        <p className="mt-2 text-sm text-slate-400">
          Next fixtures for the teams you selected, including cup ties when they
          are on the club or public fixtures list.
        </p>

        {loading ? (
          <p className="mt-6 text-slate-400">Loading next matches...</p>
        ) : items.length === 0 ? (
          <p className="mt-6 text-slate-400">
            No upcoming matches found for your teams yet.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <FixtureCard key={`${item.clubId}-${item.match.id}`} {...item} />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-2xl font-bold text-green-400">Cup competitions</h2>
        <p className="mt-2 text-sm text-slate-400">
          Champions League, Europa League, Europa Conference League, FA Cup,
          Scottish Cup and Carabao Cup ties for your teams, when those matches
          have been published.
        </p>

        {loading ? (
          <p className="mt-6 text-slate-400">Loading cup ties...</p>
        ) : cups.length === 0 ? (
          <p className="mt-6 text-slate-400">
            No cup ties are on the fixtures list yet. They will appear here as
            soon as Champions League, Europa, FA Cup, Scottish Cup or Carabao
            Cup dates are published for your clubs.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {cups.map((item) => (
              <FixtureCard
                key={`cup-${item.clubId}-${item.match.id}`}
                {...item}
                showCup
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FixtureCard({
  clubName,
  match,
  showCup = false,
}: MatchItem & { showCup?: boolean }) {
  const home = clubIsHome(match, clubName);
  const cup = showCup || isCupCompetition(match.competition);
  const competition = displayCompetition(match.competition);
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-400">
          {clubName}
        </p>
        <span className="flex items-center gap-2">
          {cup && <CupBadge />}
          <span className="rounded-full bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-300">
            {home ? "H" : "A"}
          </span>
        </span>
      </div>
      <h3 className="mt-3 text-lg font-bold text-white">
        {match.homeName} vs {match.awayName}
      </h3>
      <p className="mt-1 text-slate-300">
        {formatMatchDate(match.date)} · {formatKickoff(match.kickoff)}
      </p>
      <p className="text-sm text-slate-400">
        {[match.venue, competition].filter(Boolean).join(" · ")}
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
}
