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
};

export function clubInCurrentSeasonLeague(
  leagueName: string,
  clubName: string
): boolean {
  const roster = CURRENT_SEASON_LEAGUES[leagueName];
  if (!roster) return true;
  const needle = normalizeSeasonName(clubName);
  return roster.some((name) => {
    const allowed = normalizeSeasonName(name);
    return (
      allowed === needle ||
      allowed.includes(needle) ||
      needle.includes(allowed)
    );
  });
}

export function normalizeSeasonName(value: string): string {
  return value
    .toLowerCase()
    .replace(/fc\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
