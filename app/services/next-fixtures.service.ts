import { supabase } from "../lib/supabase";
import {
  isCupCompetition,
  matchSortKey,
  namesLooselyMatch,
  namesMatch,
  normalizeClubName,
  type TeamRef,
  type UpcomingMatch,
} from "../lib/upcoming-matches";
import { clubInCurrentSeasonLeague } from "../lib/current-season";

const MONTHS: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; S4P-supporter-fixtures/1.0)",
  Accept: "text/html,application/json",
};

const CLUB_FIXTURE_PAGES: { match: RegExp; url: string; parser: "hearts" }[] = [
  {
    match: /heart/i,
    url: "https://www.heartsfc.co.uk/pages/first-team-fixtures",
    parser: "hearts",
  },
];

const BBC_FOOTBALL_SLUGS: Record<string, string> = {
  arsenal: "arsenal",
  liverpool: "liverpool",
  chelsea: "chelsea",
  "manchester united": "manchester-united",
  "manchester city": "manchester-city",
  "tottenham hotspur": "tottenham-hotspur",
  tottenham: "tottenham-hotspur",
  "west ham united": "west-ham-united",
  "aston villa": "aston-villa",
  "newcastle united": "newcastle-united",
  everton: "everton",
  fulham: "fulham",
  brentford: "brentford",
  "brighton hove albion": "brighton-and-hove-albion",
  brighton: "brighton-and-hove-albion",
  "crystal palace": "crystal-palace",
  "nottingham forest": "nottingham-forest",
  "wolverhampton wanderers": "wolverhampton-wanderers",
  "afc bournemouth": "afc-bournemouth",
  bournemouth: "afc-bournemouth",
  hearts: "heart-of-midlothian",
  "heart of midlothian": "heart-of-midlothian",
  "hearts of midlothian": "heart-of-midlothian",
  celtic: "celtic",
  rangers: "rangers",
  hibernian: "hibernian",
  aberdeen: "aberdeen",
  kilmarnock: "kilmarnock",
  dundee: "dundee",
  "dundee united": "dundee-united",
  "st mirren": "st-mirren",
  motherwell: "motherwell",
  "coventry city": "coventry-city",
  "hull city": "hull-city",
  "ipswich town": "ipswich-town",
  falkirk: "falkirk",
  "st johnstone": "st-johnstone",
  "ross county": "ross-county",
};

const BBC_RUGBY_SLUGS: Record<string, string> = {
  scotland: "scotland",
  "scotland rugby": "scotland",
  england: "england",
  "england rugby": "england",
  wales: "wales",
  ireland: "ireland",
  france: "france",
  italy: "italy",
};

const SEARCH_ALIASES: Record<string, string> = {
  hearts: "Heart of Midlothian",
  "hearts of midlothian": "Heart of Midlothian",
  "heart of midlothian": "Heart of Midlothian",
  scotland: "Scotland Rugby",
  "scotland rugby": "Scotland Rugby",
};

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function inferYear(monthIndex: number, day: number): number {
  const now = new Date();
  const year = now.getFullYear();
  const candidate = new Date(year, monthIndex, day);
  const floor = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  return candidate < floor ? year + 1 : year;
}

function isoDate(monthName: string, day: number): string | null {
  const monthIndex = MONTHS[monthName.toLowerCase()];
  if (monthIndex == null) return null;
  const year = inferYear(monthIndex, day);
  const month = String(monthIndex + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${month}-${d}`;
}

function kickoffHhMm(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = value.match(/(\d{1,2}:\d{2})/);
  return match ? match[1].padStart(5, "0") : null;
}

function fixturePageFor(name: string): (typeof CLUB_FIXTURE_PAGES)[number] | null {
  return CLUB_FIXTURE_PAGES.find((entry) => entry.match.test(name)) ?? null;
}

function bbcSlug(team: TeamRef): { sport: "football" | "rugby-union"; slug: string } | null {
  const key = normalizeClubName(team.displayName || team.name);
  const sport = (team.sport ?? "").toLowerCase();
  if (sport.includes("rugby")) {
    const slug = BBC_RUGBY_SLUGS[key];
    return slug ? { sport: "rugby-union", slug } : null;
  }
  const mapped = BBC_FOOTBALL_SLUGS[key];
  if (mapped) return { sport: "football", slug: mapped };
  if (!sport || sport.includes("football") || sport.includes("soccer")) {
    const slug = key.replace(/\s+/g, "-");
    if (slug.length > 2) return { sport: "football", slug };
  }
  return null;
}

async function fetchText(url: string, revalidateSeconds: number): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: FETCH_HEADERS,
      next: { revalidate: revalidateSeconds },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

export function parseHeartsFixtureCards(
  html: string,
  sourceUrl: string
): UpcomingMatch[] {
  const chunks = html.split("lg:border-grey-100");
  const matches: UpcomingMatch[] = [];
  const seen = new Set<string>();
  const today = todayStamp();

  for (const chunk of chunks) {
    const ha = chunk.match(
      /class="h3 font-bold text-base-color text-\[23px\][^"]*"[^>]*>\s*([HA])\s*</
    );
    if (!ha) continue;

    const teams = [
      ...chunk.matchAll(
        /class="font-bold text-base-color uppercase[^"]*"[^>]*>\s*([^<]+)\s*</g
      ),
    ].map((row) => row[1].replace(/\s+/g, " ").trim());
    if (teams.length < 2) continue;

    const date = chunk.match(
      /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+(\d{1,2})(?:st|nd|rd|th)\s+(January|February|March|April|May|June|July|August|September|October|November|December)/
    );
    if (!date) continue;

    const time = chunk.match(/>(\d{1,2}:\d{2})(?:\s+\(UK\))?</);
    const venues = [
      ...chunk.matchAll(
        /class="text-xs text-center max-lg:hidden"[^>]*>\s*([^<]+)/g
      ),
    ].map((row) => row[1].replace(/\s+/g, " ").trim());
    const iso = isoDate(date[3], Number(date[2]));
    if (!iso || iso < today) continue;

    const homeName = teams[0];
    const awayName = teams[1];
    const key = `${iso}|${normalizeClubName(homeName)}|${normalizeClubName(awayName)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const alts = [...chunk.matchAll(/alt="([^"]+)"/g)].map((row) => row[1]);
    const competition =
      alts.find(
        (alt) =>
          !namesMatch(alt, homeName) &&
          !namesMatch(alt, awayName) &&
          !/logo|crest|badge/i.test(alt)
      ) ?? null;

    matches.push({
      id: `web-${key}`,
      date: iso,
      kickoff: kickoffHhMm(time?.[1] ?? null),
      homeName,
      awayName,
      venue: venues[0] || null,
      competition,
      source: "club-website",
      sourceUrl,
    });
  }

  return matches.sort((a, b) => matchSortKey(a).localeCompare(matchSortKey(b)));
}

type BbcEvent = {
  id?: string;
  startDateTime?: string;
  eventGroupingLabel?: string;
  status?: string;
  home?: { fullName?: string };
  away?: { fullName?: string };
  date?: { isoDate?: string; time?: string };
  venue?: { name?: string } | string | null;
};

function collectBbcEvents(value: unknown, bucket: BbcEvent[]): void {
  if (!value) return;
  if (Array.isArray(value)) {
    for (const item of value) collectBbcEvents(item, bucket);
    return;
  }
  if (typeof value !== "object") return;
  const row = value as BbcEvent & Record<string, unknown>;
  if (row.home && row.away && (row.startDateTime || row.date)) {
    bucket.push(row);
  }
  for (const nested of Object.values(row)) collectBbcEvents(nested, bucket);
}

export function parseBbcScoresFixtures(
  html: string,
  sourceUrl: string
): UpcomingMatch[] {
  const marker = "window.__INITIAL_DATA__=";
  const start = html.indexOf(marker);
  if (start < 0) return [];
  const fromAssign = html.slice(start + marker.length);
  const endScript = fromAssign.indexOf("</script>");
  const blob = (endScript >= 0 ? fromAssign.slice(0, endScript) : fromAssign)
    .trim()
    .replace(/;+\s*$/, "");

  let parsed: unknown;
  try {
    parsed = JSON.parse(blob);
    if (typeof parsed === "string") parsed = JSON.parse(parsed);
  } catch {
    return [];
  }

  const events: BbcEvent[] = [];
  collectBbcEvents(parsed, events);
  const today = todayStamp();
  const matches: UpcomingMatch[] = [];
  const seen = new Set<string>();

  for (const event of events) {
    const homeName = event.home?.fullName?.trim();
    const awayName = event.away?.fullName?.trim();
    const date = event.date?.isoDate ?? event.startDateTime?.slice(0, 10);
    if (!homeName || !awayName || !date || date < today) continue;
    if (event.status && /post|result|complete/i.test(event.status)) continue;

    const key = `${date}|${normalizeClubName(homeName)}|${normalizeClubName(awayName)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const venue =
      typeof event.venue === "string"
        ? event.venue
        : event.venue && typeof event.venue === "object"
          ? event.venue.name ?? null
          : null;

    matches.push({
      id: `list-${event.id ?? key}`,
      date,
      kickoff: kickoffHhMm(event.date?.time ?? event.startDateTime ?? null),
      homeName,
      awayName,
      venue,
      competition: event.eventGroupingLabel ?? null,
      source: "fixtures-list",
      sourceUrl,
    });
  }

  return matches.sort((a, b) => matchSortKey(a).localeCompare(matchSortKey(b)));
}

async function fetchClubWebsiteFixtures(team: TeamRef): Promise<UpcomingMatch[]> {
  const page = fixturePageFor(team.displayName) ?? fixturePageFor(team.name);
  if (!page) return [];
  const html = await fetchText(page.url, 3600);
  if (!html) return [];
  if (page.parser === "hearts") {
    return parseHeartsFixtureCards(html, page.url).slice(0, 24);
  }
  return [];
}

function monthKeys(count: number): string[] {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() + index, 1);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${date.getFullYear()}-${month}`;
  });
}

async function fetchBbcFixtures(team: TeamRef): Promise<UpcomingMatch[]> {
  const mapped = bbcSlug(team);
  if (!mapped) return [];
  const base = `https://www.bbc.co.uk/sport/${mapped.sport}/teams/${mapped.slug}/scores-fixtures`;
  const urls =
    mapped.sport === "football"
      ? monthKeys(8).map((month) => `${base}/${month}`)
      : [base];

  const pages = await Promise.all(urls.map((url) => fetchText(url, 1800)));
  const matches: UpcomingMatch[] = [];
  const seen = new Set<string>();
  for (let index = 0; index < pages.length; index += 1) {
    const html = pages[index];
    if (!html) continue;
    for (const match of parseBbcScoresFixtures(html, urls[index])) {
      const key = matchKey(match);
      if (seen.has(key)) continue;
      seen.add(key);
      matches.push(match);
    }
  }
  return matches.sort((a, b) => matchSortKey(a).localeCompare(matchSortKey(b)));
}

async function fetchFeedFixtures(team: TeamRef): Promise<UpcomingMatch[]> {
  const sport = (team.sport ?? "").toLowerCase();
  const key = normalizeClubName(team.displayName || team.name);
  let query = SEARCH_ALIASES[key] ?? team.displayName.replace(/\s+FC$/i, "").trim();
  if (sport.includes("rugby") && !/rugby/i.test(query)) {
    query = `${query} Rugby`;
  }

  try {
    const search = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(query)}`,
      {
        headers: FETCH_HEADERS,
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!search.ok) return [];
    const searched = (await search.json()) as {
      teams?: {
        idTeam: string;
        strTeam: string;
        strSport?: string;
        strWebsite?: string;
      }[];
    };

    const wantedSport = sport.includes("rugby") ? "rugby" : sport.includes("football") ? "soccer" : "";
    const teamRow =
      (searched.teams ?? []).find((row) => {
        const sportOk =
          !wantedSport ||
          (row.strSport ?? "").toLowerCase().includes(wantedSport) ||
          (wantedSport === "soccer" &&
            (row.strSport ?? "").toLowerCase().includes("football"));
        return sportOk && namesMatch(row.strTeam, query);
      }) ??
      (searched.teams ?? []).find((row) => namesMatch(row.strTeam, query)) ??
      searched.teams?.[0];
    if (!teamRow) return [];

    const next = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id=${teamRow.idTeam}`,
      {
        headers: FETCH_HEADERS,
        next: { revalidate: 1800 },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!next.ok) return [];
    const payload = (await next.json()) as {
      events?: {
        idEvent: string;
        dateEvent: string;
        strTime?: string;
        strHomeTeam: string;
        strAwayTeam: string;
        strVenue?: string;
        strLeague?: string;
      }[];
    };

    const website = teamRow.strWebsite
      ? teamRow.strWebsite.startsWith("http")
        ? teamRow.strWebsite
        : `https://${teamRow.strWebsite}`
      : fixturePageFor(team.displayName)?.url ?? null;
    const today = todayStamp();

    return (payload.events ?? [])
      .filter((event) => event.dateEvent >= today)
      .slice(0, 5)
      .map((event) => ({
        id: `feed-${event.idEvent}`,
        date: event.dateEvent,
        kickoff: kickoffHhMm(event.strTime ?? null),
        homeName: event.strHomeTeam,
        awayName: event.strAwayTeam,
        venue: event.strVenue || null,
        competition: event.strLeague || null,
        source: "fixtures-list" as const,
        sourceUrl: website,
      }));
  } catch {
    return [];
  }
}

function matchKey(match: UpcomingMatch): string {
  return `${match.date}|${normalizeClubName(match.homeName)}|${normalizeClubName(match.awayName)}`;
}

function sourceRank(source: UpcomingMatch["source"]): number {
  if (source === "club-website") return 0;
  if (source === "fixtures-list") return 1;
  return 2;
}

function sameFixture(a: UpcomingMatch, b: UpcomingMatch): boolean {
  if (a.date !== b.date) return false;
  return (
    (namesLooselyMatch(a.homeName, b.homeName) &&
      namesLooselyMatch(a.awayName, b.awayName)) ||
    (namesLooselyMatch(a.homeName, b.awayName) &&
      namesLooselyMatch(a.awayName, b.homeName))
  );
}

function mergeByPreferredSource(groups: UpcomingMatch[][]): UpcomingMatch[] {
  const merged: UpcomingMatch[] = [];
  for (const group of groups) {
    for (const match of group) {
      const index = merged.findIndex((existing) => sameFixture(existing, match));
      if (index < 0) {
        merged.push(match);
        continue;
      }
      const existing = merged[index];
      if (sourceRank(match.source) < sourceRank(existing.source)) {
        merged[index] = {
          ...match,
          venue: match.venue || existing.venue,
          competition: match.competition || existing.competition,
        };
      } else if (!existing.venue && match.venue) {
        merged[index] = { ...existing, venue: match.venue };
      } else if (
        !isCupCompetition(existing.competition) &&
        isCupCompetition(match.competition)
      ) {
        merged[index] = { ...existing, competition: match.competition };
      }
    }
  }
  return merged.sort((a, b) => matchSortKey(a).localeCompare(matchSortKey(b)));
}

function selectDisplayedFixtures(matches: UpcomingMatch[]): UpcomingMatch[] {
  const cups = matches.filter((match) => isCupCompetition(match.competition));
  const league = matches.filter((match) => !isCupCompetition(match.competition));
  const chosen = new Map<string, UpcomingMatch>();
  for (const match of [...league.slice(0, 4), ...cups.slice(0, 12)]) {
    chosen.set(matchKey(match), match);
  }
  return [...chosen.values()].sort((a, b) =>
    matchSortKey(a).localeCompare(matchSortKey(b))
  );
}

function enrichVenues(
  matches: UpcomingMatch[],
  extras: UpcomingMatch[]
): UpcomingMatch[] {
  const byKey = new Map(extras.map((match) => [matchKey(match), match]));
  return matches.map((match) => {
    if (match.venue) return match;
    const extra = byKey.get(matchKey(match));
    return extra?.venue ? { ...match, venue: extra.venue } : match;
  });
}

async function fetchS4pFixtures(
  team: TeamRef,
  clubs: { id: string; name: string }[]
): Promise<UpcomingMatch[]> {
  const clubIds = new Set<string>([team.id]);
  for (const row of clubs) {
    if (namesMatch(row.name, team.name) || namesMatch(row.name, team.displayName)) {
      clubIds.add(row.id);
    }
  }
  const ids = [...clubIds];
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("fixtures")
    .select(
      `id, fixture_date, kickoff_time, venue, home_club_id, away_club_id,
       home_club:clubs!fixtures_home_club_id_fkey(name),
       away_club:clubs!fixtures_away_club_id_fkey(name),
       competitions(name)`
    )
    .or(`home_club_id.in.(${ids.join(",")}),away_club_id.in.(${ids.join(",")})`)
    .gte("fixture_date", todayStamp())
    .order("fixture_date")
    .limit(8);

  if (error || !data) return [];

  return data
    .map((row) => {
      const home = (row as unknown as { home_club: { name: string } | null })
        .home_club?.name;
      const away = (row as unknown as { away_club: { name: string } | null })
        .away_club?.name;
      const competition = (
        row as unknown as { competitions: { name: string } | null }
      ).competitions?.name;
      return {
        id: `s4p-${row.id}`,
        date: row.fixture_date as string,
        kickoff: kickoffHhMm((row.kickoff_time as string | null) ?? null),
        homeName: home ?? "Home",
        awayName: away ?? "Away",
        venue: (row.venue as string | null) ?? null,
        competition: competition ?? null,
        source: "s4p" as const,
        sourceUrl:
          fixturePageFor(team.displayName)?.url ??
          fixturePageFor(team.name)?.url ??
          null,
      };
    })
    .filter((match) => {
      if (!match.competition) return true;
      if (isCupCompetition(match.competition)) return true;
      return (
        clubInCurrentSeasonLeague(match.competition, match.homeName) &&
        clubInCurrentSeasonLeague(match.competition, match.awayName)
      );
    });
}

export async function getUpcomingFixturesForTeams(
  teams: TeamRef[]
): Promise<Record<string, UpcomingMatch[]>> {
  const unique = teams
    .filter((team) => team.id && (team.displayName || team.name))
    .slice(0, 20);
  const result: Record<string, UpcomingMatch[]> = {};
  if (unique.length === 0) return result;

  const { data: clubs } = await supabase.from("clubs").select("id, name");
  const clubRows = (clubs ?? []) as { id: string; name: string }[];

  await Promise.all(
    unique.map(async (team) => {
      const [fromSite, fromBbc, fromFeed, fromDb] = await Promise.all([
        fetchClubWebsiteFixtures(team),
        fetchBbcFixtures(team),
        fetchFeedFixtures(team),
        fetchS4pFixtures(team, clubRows),
      ]);
      const extras = [...fromBbc, ...fromFeed, ...fromDb];
      const live = mergeByPreferredSource([fromSite, fromBbc, fromFeed]);
      if (live.length > 0) {
        result[team.id] = selectDisplayedFixtures(enrichVenues(live, extras));
      } else {
        result[team.id] = selectDisplayedFixtures(fromDb);
      }
    })
  );

  return result;
}
