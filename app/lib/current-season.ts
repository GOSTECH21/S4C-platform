/** Live demo catalog: only the three clubs being demonstrated. */

export const CURRENT_SEASON = "2026/27";

export const DEMO_CLUB_NAMES = ["Arsenal", "Hearts", "Hibernian"] as const;

export const CURRENT_SEASON_LEAGUES: Record<string, string[]> = {
  "Premier League": ["Arsenal"],
  "Scottish Premiership": ["Hearts", "Hibernian"],
};

export const LEAGUE_SPORT: Record<string, string> = {
  "Premier League": "Football",
  "Scottish Premiership": "Football",
};

export const LEAGUE_COUNTRY: Record<string, string> = {
  "Premier League": "England",
  "Scottish Premiership": "Scotland",
};

const LEAGUE_ALIASES: Record<string, string> = {
  "premier league": "Premier League",
  "english premier league": "Premier League",
  epl: "Premier League",
  championship: "EFL Championship",
  "efl championship": "EFL Championship",
  "sky bet championship": "EFL Championship",
  "english championship": "EFL Championship",
  "scottish premiership": "Scottish Premiership",
  "scottish premier league": "Scottish Premiership",
  spfl: "Scottish Premiership",
  "cinch premiership": "Scottish Premiership",
  "william hill premiership": "Scottish Premiership",
  bundesliga: "Bundesliga",
  "la liga": "La Liga",
  "liga": "La Liga",
  "ligue 1": "Ligue 1",
  "serie a": "Serie A",
  "six nations": "Six Nations",
  "guinness six nations": "Six Nations",
  nfl: "NFL",
  "nfl regular season": "NFL",
  "national football league": "NFL",
  nba: "NBA",
  "national basketball association": "NBA",
  basketball: "NBA",
};

const CLUB_ALIASES: Record<string, string[]> = {
  hearts: ["heart of midlothian", "hearts of midlothian"],
  "heart of midlothian": ["hearts", "hearts of midlothian"],
  "hearts of midlothian": ["hearts", "heart of midlothian"],
  brighton: ["brighton hove albion"],
  "brighton hove albion": ["brighton"],
  "west ham": ["west ham united"],
  "west ham united": ["west ham"],
  wolves: ["wolverhampton wanderers"],
  "wolverhampton wanderers": ["wolves"],
  bournemouth: ["afc bournemouth"],
  "afc bournemouth": ["bournemouth"],
  tottenham: ["tottenham hotspur", "spurs"],
  "tottenham hotspur": ["tottenham", "spurs"],
  spurs: ["tottenham", "tottenham hotspur"],
  "manchester united": ["man utd", "man united"],
  "man utd": ["manchester united", "man united"],
  "man united": ["manchester united", "man utd"],
  "manchester city": ["man city"],
  "man city": ["manchester city"],
  "paris saint germain": ["psg", "paris sg"],
  psg: ["paris saint germain", "paris sg"],
  "bayern munich": ["bayern"],
  bayern: ["bayern munich"],
  "inter milan": ["inter"],
  inter: ["inter milan"],
  "fc koln": ["koln", "cologne", "1 fc koln"],
  koln: ["fc koln", "cologne"],
  cologne: ["fc koln", "koln"],
  "queens park rangers": ["qpr"],
  qpr: ["queens park rangers"],
  "st johnstone": ["saint johnstone"],
  "saint johnstone": ["st johnstone"],
  "st mirren": ["saint mirren"],
  "saint mirren": ["st mirren"],
  "new england patriots": ["patriots"],
  patriots: ["new england patriots"],
  "kansas city chiefs": ["chiefs"],
  chiefs: ["kansas city chiefs"],
  "san francisco 49ers": ["49ers", "niners"],
  "49ers": ["san francisco 49ers"],
  "washington commanders": ["commanders"],
  commanders: ["washington commanders"],
  "los angeles lakers": ["lakers", "la lakers"],
  lakers: ["los angeles lakers"],
  "boston celtics": ["celtics"],
  celtics: ["boston celtics"],
  "golden state warriors": ["warriors"],
  warriors: ["golden state warriors"],
  "new york knicks": ["knicks"],
  knicks: ["new york knicks"],
  "philadelphia 76ers": ["76ers", "sixers"],
  "76ers": ["philadelphia 76ers"],
  sixers: ["philadelphia 76ers"],
};

export function normalizeSeasonName(value: string): string {
  return value
    .toLowerCase()
    .replace(/\bassociation football club\b/g, " ")
    .replace(/\bfootball club\b/g, " ")
    .replace(/\bafc\b/g, " ")
    .replace(/\bfc\b/g, " ")
    .replace(/\bcf\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function canonicalLeagueName(
  leagueName: string | null | undefined
): string | null {
  if (!leagueName) return null;
  const trimmed = leagueName.trim();
  if (CURRENT_SEASON_LEAGUES[trimmed]) return trimmed;
  const normalized = normalizeSeasonName(trimmed);
  const aliased = LEAGUE_ALIASES[normalized];
  if (aliased && CURRENT_SEASON_LEAGUES[aliased]) return aliased;
  for (const name of Object.keys(CURRENT_SEASON_LEAGUES)) {
    if (normalizeSeasonName(name) === normalized) return name;
  }
  return null;
}

export function seasonNamesMatch(left: string, right: string): boolean {
  const a = normalizeSeasonName(left);
  const b = normalizeSeasonName(right);
  if (!a || !b) return false;
  if (a === b) return true;
  const leftNames = new Set([a, ...(CLUB_ALIASES[a] ?? [])]);
  const rightNames = new Set([b, ...(CLUB_ALIASES[b] ?? [])]);
  for (const name of leftNames) {
    if (rightNames.has(name)) return true;
  }
  return false;
}

export function isDemoClubName(name: string | null | undefined): boolean {
  return DEMO_CLUB_NAMES.some((club) => seasonNamesMatch(club, String(name ?? "")));
}

export function demoClubNamesOnly(names: string[]): string[] {
  return names.filter((name) => isDemoClubName(name));
}

export function clubInCurrentSeasonLeague(
  leagueName: string,
  clubName: string
): boolean {
  const league = canonicalLeagueName(leagueName);
  if (!league) return false;
  const clubs = CURRENT_SEASON_LEAGUES[league];
  if (!clubs) return false;
  return clubs.some((name) => seasonNamesMatch(name, clubName));
}

export function leagueForClubName(clubName: string): string | null {
  for (const [league, clubs] of Object.entries(CURRENT_SEASON_LEAGUES)) {
    if (clubs.some((club) => seasonNamesMatch(club, clubName))) return league;
  }
  return null;
}

export function currentSeasonTeamCount(): number {
  const names = new Set<string>();
  for (const clubs of Object.values(CURRENT_SEASON_LEAGUES)) {
    for (const name of clubs) names.add(normalizeSeasonName(name));
  }
  return names.size;
}

export function isCurrentSeasonLeagueFixture(
  _leagueName: string | null | undefined,
  homeName: string,
  awayName: string
): boolean {
  return isDemoClubName(homeName) || isDemoClubName(awayName);
}

export function findClubOnRoster<T extends { name: string; competition_id?: string | null }>(
  clubs: T[],
  name: string
): T | undefined {
  const matches = clubs.filter((club) => seasonNamesMatch(club.name, name));
  if (matches.length === 0) return undefined;
  const needle = normalizeSeasonName(name);
  const exact = matches.filter(
    (club) => normalizeSeasonName(club.name) === needle
  );
  const pool = exact.length > 0 ? exact : matches;
  return [...pool].sort((left, right) => {
    const leftAssigned = left.competition_id ? 0 : 1;
    const rightAssigned = right.competition_id ? 0 : 1;
    if (leftAssigned !== rightAssigned) return leftAssigned - rightAssigned;
    return right.name.length - left.name.length;
  })[0];
}

export function clubsInCurrentSeasonCompetition<T extends { name: string }>(
  clubs: T[],
  competitionName: string | null | undefined
): T[] {
  if (!competitionName) return clubs;
  return clubs.filter((club) =>
    clubInCurrentSeasonLeague(competitionName, club.name)
  );
}
