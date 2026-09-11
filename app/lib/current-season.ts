/** Current 2026/27 league membership for the MVP demo catalog. */

export const CURRENT_SEASON = "2026/27";

export const CURRENT_SEASON_LEAGUES: Record<string, string[]> = {
  "Premier League": [
    "Arsenal",
    "Aston Villa",
    "Bournemouth",
    "Brentford",
    "Brighton & Hove Albion",
    "Chelsea",
    "Coventry City",
    "Crystal Palace",
    "Everton",
    "Fulham",
    "Hull City",
    "Ipswich Town",
    "Leeds United",
    "Liverpool",
    "Manchester City",
    "Manchester United",
    "Newcastle United",
    "Nottingham Forest",
    "Sunderland",
    "Tottenham Hotspur",
  ],
  "EFL Championship": [
    "Birmingham City",
    "Blackburn Rovers",
    "Bolton Wanderers",
    "Bristol City",
    "Burnley",
    "Cardiff City",
    "Charlton Athletic",
    "Derby County",
    "Lincoln City",
    "Middlesbrough",
    "Millwall",
    "Norwich City",
    "Portsmouth",
    "Preston North End",
    "Queens Park Rangers",
    "Sheffield United",
    "Southampton",
    "Stoke City",
    "Swansea City",
    "Watford",
    "West Bromwich Albion",
    "West Ham United",
    "Wolverhampton Wanderers",
    "Wrexham",
  ],
  "Scottish Premiership": [
    "Aberdeen",
    "Celtic",
    "Dundee",
    "Dundee United",
    "Falkirk",
    "Hearts",
    "Hibernian",
    "Kilmarnock",
    "Motherwell",
    "Rangers",
    "St Johnstone",
    "St Mirren",
  ],
  Bundesliga: [
    "Bayer Leverkusen",
    "Bayern Munich",
    "Borussia Dortmund",
    "Borussia Mönchengladbach",
    "Eintracht Frankfurt",
    "FC Augsburg",
    "FC Köln",
    "Freiburg",
    "Hamburger SV",
    "Hoffenheim",
    "Mainz 05",
    "RB Leipzig",
    "Schalke 04",
    "SC Paderborn",
    "SV Elversberg",
    "Union Berlin",
    "VfB Stuttgart",
    "Werder Bremen",
  ],
  "La Liga": [
    "Alavés",
    "Athletic Club",
    "Atlético Madrid",
    "Barcelona",
    "Celta Vigo",
    "Deportivo La Coruña",
    "Elche",
    "Espanyol",
    "Getafe",
    "Levante",
    "Málaga",
    "Osasuna",
    "Racing Santander",
    "Rayo Vallecano",
    "Real Betis",
    "Real Madrid",
    "Real Sociedad",
    "Sevilla",
    "Valencia",
    "Villarreal",
  ],
  "Ligue 1": [
    "Angers",
    "Auxerre",
    "Brest",
    "Le Havre",
    "Le Mans",
    "Lens",
    "Lille",
    "Lorient",
    "Lyon",
    "Marseille",
    "Monaco",
    "Nice",
    "Paris FC",
    "Paris Saint-Germain",
    "Rennes",
    "Strasbourg",
    "Toulouse",
    "Troyes",
  ],
  "Serie A": [
    "AC Milan",
    "Atalanta",
    "Bologna",
    "Cagliari",
    "Como",
    "Fiorentina",
    "Frosinone",
    "Genoa",
    "Inter Milan",
    "Juventus",
    "Lazio",
    "Lecce",
    "Monza",
    "Napoli",
    "Parma",
    "Roma",
    "Sassuolo",
    "Torino",
    "Udinese",
    "Venezia",
  ],
  "Six Nations": ["England", "France", "Ireland", "Italy", "Scotland", "Wales"],
  NFL: [
    "Arizona Cardinals",
    "Atlanta Falcons",
    "Baltimore Ravens",
    "Buffalo Bills",
    "Carolina Panthers",
    "Chicago Bears",
    "Cincinnati Bengals",
    "Cleveland Browns",
    "Dallas Cowboys",
    "Denver Broncos",
    "Detroit Lions",
    "Green Bay Packers",
    "Houston Texans",
    "Indianapolis Colts",
    "Jacksonville Jaguars",
    "Kansas City Chiefs",
    "Las Vegas Raiders",
    "Los Angeles Chargers",
    "Los Angeles Rams",
    "Miami Dolphins",
    "Minnesota Vikings",
    "New England Patriots",
    "New Orleans Saints",
    "New York Giants",
    "New York Jets",
    "Philadelphia Eagles",
    "Pittsburgh Steelers",
    "San Francisco 49ers",
    "Seattle Seahawks",
    "Tampa Bay Buccaneers",
    "Tennessee Titans",
    "Washington Commanders",
  ],
};

export const LEAGUE_SPORT: Record<string, string> = {
  "Premier League": "Football",
  "EFL Championship": "Football",
  "Scottish Premiership": "Football",
  Bundesliga: "Football",
  "La Liga": "Football",
  "Ligue 1": "Football",
  "Serie A": "Football",
  "Six Nations": "Rugby",
  NFL: "NFL",
};

export const LEAGUE_COUNTRY: Record<string, string> = {
  "Premier League": "England",
  "EFL Championship": "England",
  "Scottish Premiership": "Scotland",
  Bundesliga: "Germany",
  "La Liga": "Spain",
  "Ligue 1": "France",
  "Serie A": "Italy",
  "Six Nations": "Europe",
  NFL: "USA",
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
};

export function normalizeSeasonName(value: string): string {
  return value
    .toLowerCase()
    .replace(/fc\b/g, "")
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
  if (LEAGUE_ALIASES[normalized]) return LEAGUE_ALIASES[normalized];
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
  const shorter = a.length <= b.length ? a : b;
  const longer = a.length <= b.length ? b : a;
  const shortTokens = shorter.split(" ").filter(Boolean);
  return (
    shortTokens.length >= 2 &&
    longer.startsWith(`${shorter} `)
  );
}

export function clubInCurrentSeasonLeague(
  leagueName: string,
  clubName: string
): boolean {
  const league = canonicalLeagueName(leagueName);
  if (!league) return true;
  return CURRENT_SEASON_LEAGUES[league].some((name) =>
    seasonNamesMatch(name, clubName)
  );
}

export function isCurrentSeasonLeagueFixture(
  leagueName: string | null | undefined,
  homeName: string,
  awayName: string
): boolean {
  const league = canonicalLeagueName(leagueName);
  if (!league) return true;
  return (
    clubInCurrentSeasonLeague(league, homeName) &&
    clubInCurrentSeasonLeague(league, awayName)
  );
}

export function findClubOnRoster<T extends { name: string; competition_id?: string | null }>(
  clubs: T[],
  name: string
): T | undefined {
  const matches = clubs.filter((club) => seasonNamesMatch(club.name, name));
  if (matches.length === 0) return undefined;
  return [...matches].sort((left, right) => {
    const leftAssigned = left.competition_id ? 0 : 1;
    const rightAssigned = right.competition_id ? 0 : 1;
    if (leftAssigned !== rightAssigned) return leftAssigned - rightAssigned;
    return left.name.length - right.name.length;
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
