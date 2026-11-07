/**
 * Mine published 2026/27 fixtures from ESPN scoreboards into app/data.
 * Re-run: node scripts/mine-published-fixtures.mjs
 */
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "app/data/published-fixtures.json");
const UA = "Mozilla/5.0 (compatible; S4P-fixture-miner/1.0)";

const MONTHS = {
  football: [
    "202608",
    "202609",
    "202610",
    "202611",
    "202612",
    "202701",
    "202702",
    "202703",
    "202704",
    "202705",
  ],
  nfl: ["202609", "202610", "202611", "202612", "202701", "202702"],
  nba: ["202610", "202611", "202612", "202701", "202702", "202703", "202704"],
  rugby: ["202609", "202610", "202611", "202612", "202701", "202702", "202703", "202704", "202705", "202706"],
};

const SOURCES = [
  {
    league: "Premier League",
    sport: "Football",
    country: "England",
    path: "soccer/eng.1",
    tz: "Europe/London",
    months: MONTHS.football,
  },
  {
    league: "EFL Championship",
    sport: "Football",
    country: "England",
    path: "soccer/eng.2",
    tz: "Europe/London",
    months: MONTHS.football,
  },
  {
    league: "EFL League One",
    sport: "Football",
    country: "England",
    path: "soccer/eng.3",
    tz: "Europe/London",
    months: MONTHS.football,
  },
  {
    league: "Women's Super League",
    sport: "Football",
    country: "England",
    path: "soccer/eng.w.1",
    tz: "Europe/London",
    months: MONTHS.football,
  },
  {
    league: "Scottish Premiership",
    sport: "Football",
    country: "Scotland",
    path: "soccer/sco.1",
    tz: "Europe/London",
    months: MONTHS.football,
  },
  {
    league: "Bundesliga",
    sport: "Football",
    country: "Germany",
    path: "soccer/ger.1",
    tz: "Europe/London",
    months: MONTHS.football,
  },
  {
    league: "La Liga",
    sport: "Football",
    country: "Spain",
    path: "soccer/esp.1",
    tz: "Europe/London",
    months: MONTHS.football,
  },
  {
    league: "Ligue 1",
    sport: "Football",
    country: "France",
    path: "soccer/fra.1",
    tz: "Europe/London",
    months: MONTHS.football,
  },
  {
    league: "Serie A",
    sport: "Football",
    country: "Italy",
    path: "soccer/ita.1",
    tz: "Europe/London",
    months: MONTHS.football,
  },
  {
    league: "NFL",
    sport: "NFL",
    country: "United States",
    path: "football/nfl",
    tz: "America/New_York",
    months: MONTHS.nfl,
  },
  {
    league: "Premiership Rugby",
    sport: "Rugby",
    country: "England",
    path: "rugby/267979",
    tz: "Europe/London",
    months: MONTHS.rugby,
  },
  {
    league: "Super League",
    sport: "Rugby",
    country: "England",
    path: "rugby/270563",
    tz: "Europe/London",
    months: MONTHS.rugby,
  },
  {
    league: "NBA",
    sport: "NBA",
    country: "United States",
    path: "basketball/nba",
    tz: "America/New_York",
    months: MONTHS.nba,
  },
];

const NAME_ALIASES = {
  "Heart of Midlothian": "Hearts",
  "Brighton & Hove Albion": "Brighton",
  "AFC Bournemouth": "Bournemouth",
  Internazionale: "Inter Milan",
  "AS Roma": "Roma",
  "Atlético Madrid": "Atletico Madrid",
  "Alavés": "Alaves",
  "Málaga": "Malaga",
  "Borussia Mönchengladbach": "Borussia Monchengladbach",
  "1. FC Köln": "FC Koln",
  "1 FC Köln": "FC Koln",
  "FC Schalke 04": "Schalke 04",
  "St. Mirren": "St Mirren",
  "St. Johnstone": "St Johnstone",
};

const WSL_KEEP_AS_IS = new Set(["London City Lionesses"]);

function canonicalName(name, league) {
  const trimmed = String(name ?? "").trim();
  const aliased = NAME_ALIASES[trimmed] || trimmed;
  if (
    league === "Women's Super League" &&
    aliased &&
    !WSL_KEEP_AS_IS.has(aliased) &&
    !/women$/i.test(aliased)
  ) {
    return `${aliased} Women`;
  }
  return aliased;
}

function localStamp(iso, timeZone) {
  const date = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    kickoff: `${get("hour")}:${get("minute")}`,
  };
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { "User-Agent": UA } });
  if (!response.ok) {
    throw new Error(`${response.status} ${url}`);
  }
  return response.json();
}

function rowsFromScoreboard(payload, source) {
  const rows = [];
  for (const event of payload.events ?? []) {
    const competition = event.competitions?.[0];
    if (!competition) continue;
    const home = competition.competitors?.find((row) => row.homeAway === "home");
    const away = competition.competitors?.find((row) => row.homeAway === "away");
    const homeName = canonicalName(home?.team?.displayName, source.league);
    const awayName = canonicalName(away?.team?.displayName, source.league);
    if (!homeName || !awayName) continue;
    const when = localStamp(competition.date || event.date, source.tz);
    if (!when.date.startsWith("2026") && !when.date.startsWith("2027")) continue;
    rows.push({
      league: source.league,
      sport: source.sport,
      country: source.country,
      date: when.date,
      kickoff: when.kickoff,
      homeName,
      awayName,
      venue: competition.venue?.fullName || "",
      source: "espn",
    });
  }
  return rows;
}

async function mineSource(source) {
  const seen = new Set();
  const rows = [];
  for (const month of source.months) {
    const url = `https://site.api.espn.com/apis/site/v2/sports/${source.path}/scoreboard?dates=${month}`;
    try {
      const payload = await fetchJson(url);
      for (const row of rowsFromScoreboard(payload, source)) {
        const key = `${row.date}|${row.homeName}|${row.awayName}`;
        if (seen.has(key)) continue;
        seen.add(key);
        rows.push(row);
      }
      process.stdout.write(`  ${source.league} ${month}: ${rows.length} total\n`);
    } catch (err) {
      process.stderr.write(
        `  skip ${source.league} ${month}: ${err instanceof Error ? err.message : err}\n`
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 40));
  }
  return rows;
}

const all = [];
for (const source of SOURCES) {
  process.stdout.write(`Mining ${source.league}...\n`);
  all.push(...(await mineSource(source)));
}

all.sort((left, right) => {
  if (left.date !== right.date) return left.date.localeCompare(right.date);
  if (left.league !== right.league) return left.league.localeCompare(right.league);
  if (left.kickoff !== right.kickoff) return left.kickoff.localeCompare(right.kickoff);
  return left.homeName.localeCompare(right.homeName);
});

const byLeague = {};
for (const row of all) {
  byLeague[row.league] = (byLeague[row.league] ?? 0) + 1;
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(
  OUT,
  JSON.stringify(
    {
      season: "2026/27",
      minedAt: new Date().toISOString(),
      source: "ESPN public scoreboard (published fixtures)",
      counts: byLeague,
      matches: all,
    },
    null,
    2
  )
);

console.log(`Wrote ${all.length} published Matches to ${OUT}`);
console.log(byLeague);
