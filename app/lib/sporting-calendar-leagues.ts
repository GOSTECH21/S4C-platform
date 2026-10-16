/** Confirmed 2026/27 competition rosters (promotion and relegation applied) — not the three-club demo. */

export type CalendarSport = "Football" | "NFL" | "Rugby" | "NBA";

export type SportingTeam = {
  name: string;
  venue: string;
};

export type SportingLeagueDef = {
  name: string;
  sport: CalendarSport;
  country: string;
  kickoff: string;
  /** JS getUTCDay(): 0 Sunday … 6 Saturday. */
  weekday: number;
  startDate: string;
  /** How many single-leg rounds to play. Omit for a home-and-away round robin. */
  singleLegs?: number;
  teams: SportingTeam[];
};

function t(name: string, venue: string): SportingTeam {
  return { name, venue };
}

export const PREMIER_LEAGUE_TEAMS: SportingTeam[] = [
  t("Arsenal", "Emirates Stadium"),
  t("Aston Villa", "Villa Park"),
  t("Bournemouth", "Vitality Stadium"),
  t("Brentford", "Gtech Community Stadium"),
  t("Brighton", "American Express Stadium"),
  t("Chelsea", "Stamford Bridge"),
  t("Coventry City", "Coventry Building Society Arena"),
  t("Crystal Palace", "Selhurst Park"),
  t("Everton", "Hill Dickinson Stadium"),
  t("Fulham", "Craven Cottage"),
  t("Hull City", "MKM Stadium"),
  t("Ipswich Town", "Portman Road"),
  t("Leeds United", "Elland Road"),
  t("Liverpool", "Anfield"),
  t("Manchester City", "Etihad Stadium"),
  t("Manchester United", "Old Trafford"),
  t("Newcastle United", "St James' Park"),
  t("Nottingham Forest", "City Ground"),
  t("Sunderland", "Stadium of Light"),
  t("Tottenham Hotspur", "Tottenham Hotspur Stadium"),
];

export const CHAMPIONSHIP_TEAMS: SportingTeam[] = [
  t("Birmingham City", "St Andrew's"),
  t("Blackburn Rovers", "Ewood Park"),
  t("Bolton Wanderers", "Toughsheet Community Stadium"),
  t("Bristol City", "Ashton Gate"),
  t("Burnley", "Turf Moor"),
  t("Cardiff City", "Cardiff City Stadium"),
  t("Charlton Athletic", "The Valley"),
  t("Derby County", "Pride Park"),
  t("Lincoln City", "LNER Stadium"),
  t("Middlesbrough", "Riverside Stadium"),
  t("Millwall", "The Den"),
  t("Norwich City", "Carrow Road"),
  t("Portsmouth", "Fratton Park"),
  t("Preston North End", "Deepdale"),
  t("Queens Park Rangers", "Loftus Road"),
  t("Sheffield United", "Bramall Lane"),
  t("Southampton", "St Mary's Stadium"),
  t("Stoke City", "bet365 Stadium"),
  t("Swansea City", "Swansea.com Stadium"),
  t("Watford", "Vicarage Road"),
  t("West Bromwich Albion", "The Hawthorns"),
  t("West Ham United", "London Stadium"),
  t("Wolverhampton Wanderers", "Molineux Stadium"),
  t("Wrexham", "Racecourse Ground"),
];

export const LEAGUE_ONE_TEAMS: SportingTeam[] = [
  t("AFC Wimbledon", "Plough Lane"),
  t("Barnsley", "Oakwell"),
  t("Blackpool", "Bloomfield Road"),
  t("Bradford City", "Valley Parade"),
  t("Bromley", "Hayes Lane"),
  t("Burton Albion", "Pirelli Stadium"),
  t("Cambridge United", "Abbey Stadium"),
  t("Doncaster Rovers", "Eco-Power Stadium"),
  t("Huddersfield Town", "Kirklees Stadium"),
  t("Leicester City", "King Power Stadium"),
  t("Leyton Orient", "Brisbane Road"),
  t("Luton Town", "Kenilworth Road"),
  t("Mansfield Town", "One Call Stadium"),
  t("Milton Keynes Dons", "Stadium MK"),
  t("Notts County", "Meadow Lane"),
  t("Oxford United", "Kassam Stadium"),
  t("Peterborough United", "Weston Homes Stadium"),
  t("Plymouth Argyle", "Home Park"),
  t("Reading", "Select Car Leasing Stadium"),
  t("Sheffield Wednesday", "Hillsborough"),
  t("Stevenage", "Lamex Stadium"),
  t("Stockport County", "Edgeley Park"),
  t("Wigan Athletic", "DW Stadium"),
  t("Wycombe Wanderers", "Adams Park"),
];

export const WSL_TEAMS: SportingTeam[] = [
  t("Arsenal Women", "Emirates Stadium"),
  t("Aston Villa Women", "Villa Park"),
  t("Birmingham City Women", "St Andrew's"),
  t("Brighton Women", "Broadfield Stadium"),
  t("Charlton Athletic Women", "The Valley"),
  t("Chelsea Women", "Kingsmeadow"),
  t("Crystal Palace Women", "VBS Community Stadium"),
  t("Everton Women", "Walton Hall Park"),
  t("Liverpool Women", "Anfield"),
  t("London City Lionesses", "Hayes Lane"),
  t("Manchester City Women", "Academy Stadium"),
  t("Manchester United Women", "Leigh Sports Village"),
  t("Tottenham Hotspur Women", "Brisbane Road"),
  t("West Ham United Women", "Chigwell Construction Stadium"),
];

export const SCOTTISH_PREMIERSHIP_TEAMS: SportingTeam[] = [
  t("Aberdeen", "Pittodrie Stadium"),
  t("Celtic", "Celtic Park"),
  t("Dundee", "Dens Park"),
  t("Dundee United", "Tannadice Park"),
  t("Falkirk", "Falkirk Stadium"),
  t("Hearts", "Tynecastle Park"),
  t("Hibernian", "Easter Road Stadium"),
  t("Kilmarnock", "Rugby Park"),
  t("Motherwell", "Fir Park"),
  t("Rangers", "Ibrox Stadium"),
  t("St Johnstone", "McDiarmid Park"),
  t("St Mirren", "St Mirren Park"),
];

export const BUNDESLIGA_TEAMS: SportingTeam[] = [
  t("FC Augsburg", "WWK Arena"),
  t("Bayer Leverkusen", "BayArena"),
  t("Bayern Munich", "Allianz Arena"),
  t("Borussia Dortmund", "Signal Iduna Park"),
  t("Borussia Monchengladbach", "Borussia-Park"),
  t("Eintracht Frankfurt", "Deutsche Bank Park"),
  t("TSG Hoffenheim", "PreZero Arena"),
  t("FC Koln", "RheinEnergieStadion"),
  t("RB Leipzig", "Red Bull Arena"),
  t("Mainz 05", "MEWA Arena"),
  t("SC Freiburg", "Europa-Park Stadion"),
  t("SC Paderborn", "Home Deluxe Arena"),
  t("Schalke 04", "Veltins-Arena"),
  t("SV Elversberg", "Waldstadion an der Kaiserlinde"),
  t("VfB Stuttgart", "MHPArena"),
  t("Union Berlin", "Stadion An der Alten Forsterei"),
  t("Werder Bremen", "Weserstadion"),
  t("Hamburger SV", "Volksparkstadion"),
];

export const LA_LIGA_TEAMS: SportingTeam[] = [
  t("Alaves", "Mendizorrotza"),
  t("Athletic Club", "San Mames"),
  t("Atletico Madrid", "Riyadh Air Metropolitano"),
  t("Barcelona", "Spotify Camp Nou"),
  t("Celta Vigo", "Balaidos"),
  t("Elche", "Martinez Valero"),
  t("Espanyol", "Stage Front Stadium"),
  t("Deportivo La Coruna", "Estadio Riazor"),
  t("Getafe", "Coliseum Alfonso Perez"),
  t("Levante", "Ciutat de Valencia"),
  t("Malaga", "La Rosaleda"),
  t("Osasuna", "El Sadar"),
  t("Rayo Vallecano", "Vallecas"),
  t("Real Betis", "Benito Villamarin"),
  t("Racing Santander", "Campos de Sport de El Sardinero"),
  t("Real Madrid", "Santiago Bernabeu"),
  t("Real Sociedad", "Reale Arena"),
  t("Sevilla", "Ramon Sanchez-Pizjuan"),
  t("Valencia", "Mestalla"),
  t("Villarreal", "Estadio de la Ceramica"),
];

export const LIGUE_1_TEAMS: SportingTeam[] = [
  t("Angers", "Stade Raymond Kopa"),
  t("Auxerre", "Stade de l'Abbe-Deschamps"),
  t("Brest", "Stade Francis-Le Ble"),
  t("Le Havre", "Stade Oceane"),
  t("Lens", "Stade Bollaert-Delelis"),
  t("Lille", "Stade Pierre-Mauroy"),
  t("Lorient", "Stade du Moustoir"),
  t("Le Mans", "Stade Marie-Marvingt"),
  t("Lyon", "Groupama Stadium"),
  t("Marseille", "Orange Velodrome"),
  t("Monaco", "Stade Louis II"),
  t("Nice", "Allianz Riviera"),
  t("Paris FC", "Stade Jean-Bouin"),
  t("Paris Saint-Germain", "Parc des Princes"),
  t("Rennes", "Roazhon Park"),
  t("Strasbourg", "Stade de la Meinau"),
  t("Toulouse", "Stadium de Toulouse"),
  t("Troyes", "Stade de l'Aube"),
];

export const SERIE_A_TEAMS: SportingTeam[] = [
  t("Atalanta", "Gewiss Stadium"),
  t("Bologna", "Renato Dall'Ara"),
  t("Cagliari", "Unipol Domus"),
  t("Como", "Stadio Giuseppe Sinigaglia"),
  t("Fiorentina", "Stadio Artemio Franchi"),
  t("Frosinone", "Stadio Benito Stirpe"),
  t("Genoa", "Luigi Ferraris"),
  t("Inter Milan", "San Siro"),
  t("Juventus", "Allianz Stadium"),
  t("Lazio", "Stadio Olimpico"),
  t("Lecce", "Via del Mare"),
  t("AC Milan", "San Siro"),
  t("Monza", "Stadio Brianteo"),
  t("Napoli", "Stadio Diego Armando Maradona"),
  t("Parma", "Stadio Ennio Tardini"),
  t("Roma", "Stadio Olimpico"),
  t("Sassuolo", "Mapei Stadium"),
  t("Torino", "Stadio Olimpico Grande Torino"),
  t("Udinese", "Bluenergy Stadium"),
  t("Venezia", "Stadio Pier Luigi Penzo"),
];

export const NFL_TEAMS: SportingTeam[] = [
  t("Arizona Cardinals", "State Farm Stadium"),
  t("Atlanta Falcons", "Mercedes-Benz Stadium"),
  t("Baltimore Ravens", "M&T Bank Stadium"),
  t("Buffalo Bills", "Highmark Stadium"),
  t("Carolina Panthers", "Bank of America Stadium"),
  t("Chicago Bears", "Soldier Field"),
  t("Cincinnati Bengals", "Paycor Stadium"),
  t("Cleveland Browns", "Huntington Bank Field"),
  t("Dallas Cowboys", "AT&T Stadium"),
  t("Denver Broncos", "Empower Field at Mile High"),
  t("Detroit Lions", "Ford Field"),
  t("Green Bay Packers", "Lambeau Field"),
  t("Houston Texans", "NRG Stadium"),
  t("Indianapolis Colts", "Lucas Oil Stadium"),
  t("Jacksonville Jaguars", "EverBank Stadium"),
  t("Kansas City Chiefs", "GEHA Field at Arrowhead"),
  t("Las Vegas Raiders", "Allegiant Stadium"),
  t("Los Angeles Chargers", "SoFi Stadium"),
  t("Los Angeles Rams", "SoFi Stadium"),
  t("Miami Dolphins", "Hard Rock Stadium"),
  t("Minnesota Vikings", "U.S. Bank Stadium"),
  t("New England Patriots", "Gillette Stadium"),
  t("New Orleans Saints", "Caesars Superdome"),
  t("New York Giants", "MetLife Stadium"),
  t("New York Jets", "MetLife Stadium"),
  t("Philadelphia Eagles", "Lincoln Financial Field"),
  t("Pittsburgh Steelers", "Acrisure Stadium"),
  t("San Francisco 49ers", "Levi's Stadium"),
  t("Seattle Seahawks", "Lumen Field"),
  t("Tampa Bay Buccaneers", "Raymond James Stadium"),
  t("Tennessee Titans", "Nissan Stadium"),
  t("Washington Commanders", "Northwest Stadium"),
];

export const TOP_14_TEAMS: SportingTeam[] = [
  t("Bayonne", "Stade Jean Dauger"),
  t("Bordeaux Begles", "Stade Chaban-Delmas"),
  t("Castres", "Stade Pierre Fabre"),
  t("Clermont", "Stade Marcel Michelin"),
  t("La Rochelle", "Stade Marcel-Deflandre"),
  t("Lyon", "Matmut Stadium de Gerland"),
  t("Montpellier", "Septeo Stadium"),
  t("Pau", "Stade du Hameau"),
  t("Perpignan", "Stade Aime Giral"),
  t("Racing 92", "Paris La Defense Arena"),
  t("Stade Francais", "Stade Jean Bouin"),
  t("Toulon", "Stade Mayol"),
  t("Toulouse", "Stade Ernest-Wallon"),
  t("Vannes", "Stade de la Rabine"),
];

export const SIX_NATIONS_TEAMS: SportingTeam[] = [
  t("England", "Twickenham"),
  t("France", "Stade de France"),
  t("Ireland", "Aviva Stadium"),
  t("Italy", "Stadio Olimpico"),
  t("Scotland", "Scottish Gas Murrayfield"),
  t("Wales", "Principality Stadium"),
];

export const RUGBY_CHAMPIONSHIP_TEAMS: SportingTeam[] = [
  t("Argentina", "Estadio Mario Alberto Kempes"),
  t("Australia", "Allianz Stadium"),
  t("New Zealand", "Eden Park"),
  t("South Africa", "Ellis Park"),
];

export const NATIONS_CHAMPIONSHIP_TEAMS: SportingTeam[] = [
  t("Argentina", "Estadio Mario Alberto Kempes"),
  t("Australia", "Allianz Stadium"),
  t("England", "Twickenham"),
  t("Fiji", "HFC Bank Stadium"),
  t("France", "Stade de France"),
  t("Ireland", "Aviva Stadium"),
  t("Italy", "Stadio Olimpico"),
  t("Japan", "National Stadium"),
  t("New Zealand", "Eden Park"),
  t("Scotland", "Scottish Gas Murrayfield"),
  t("South Africa", "Ellis Park"),
  t("Wales", "Principality Stadium"),
];

export const PREMIERSHIP_RUGBY_TEAMS: SportingTeam[] = [
  t("Bath", "Recreation Ground"),
  t("Bristol Bears", "Ashton Gate"),
  t("Exeter Chiefs", "Sandy Park"),
  t("Gloucester", "Kingsholm Stadium"),
  t("Harlequins", "Twickenham Stoop"),
  t("Leicester Tigers", "Mattioli Woods Welford Road"),
  t("Newcastle Red Bulls", "Kingston Park"),
  t("Northampton Saints", "cinch Stadium at Franklin's Gardens"),
  t("Sale Sharks", "Salford Community Stadium"),
  t("Saracens", "StoneX Stadium"),
];

export const SUPER_LEAGUE_TEAMS: SportingTeam[] = [
  t("Bradford Bulls", "Odsal Stadium"),
  t("Castleford Tigers", "The Jungle"),
  t("Catalans Dragons", "Stade Gilbert Brutus"),
  t("Huddersfield Giants", "John Smith's Stadium"),
  t("Hull FC", "MKM Stadium"),
  t("Hull KR", "Sewell Group Craven Park"),
  t("Leeds Rhinos", "Headingley Stadium"),
  t("Leigh Leopards", "Leigh Sports Village"),
  t("St Helens", "Totally Wicked Stadium"),
  t("Toulouse Olympique", "Stade Ernest-Argeles"),
  t("Wakefield Trinity", "DIY Kitchens Stadium"),
  t("Warrington Wolves", "Halliwell Jones Stadium"),
  t("Wigan Warriors", "DW Stadium"),
  t("York Knights", "York Community Stadium"),
];

export const NBA_TEAMS: SportingTeam[] = [
  t("Atlanta Hawks", "State Farm Arena"),
  t("Boston Celtics", "TD Garden"),
  t("Brooklyn Nets", "Barclays Center"),
  t("Charlotte Hornets", "Spectrum Center"),
  t("Chicago Bulls", "United Center"),
  t("Cleveland Cavaliers", "Rocket Arena"),
  t("Dallas Mavericks", "American Airlines Center"),
  t("Denver Nuggets", "Ball Arena"),
  t("Detroit Pistons", "Little Caesars Arena"),
  t("Golden State Warriors", "Chase Center"),
  t("Houston Rockets", "Toyota Center"),
  t("Indiana Pacers", "Gainbridge Fieldhouse"),
  t("LA Clippers", "Intuit Dome"),
  t("Los Angeles Lakers", "Crypto.com Arena"),
  t("Memphis Grizzlies", "FedExForum"),
  t("Miami Heat", "Kaseya Center"),
  t("Milwaukee Bucks", "Fiserv Forum"),
  t("Minnesota Timberwolves", "Target Center"),
  t("New Orleans Pelicans", "Smoothie King Center"),
  t("New York Knicks", "Madison Square Garden"),
  t("Oklahoma City Thunder", "Paycom Center"),
  t("Orlando Magic", "Kia Center"),
  t("Philadelphia 76ers", "Xfinity Mobile Arena"),
  t("Phoenix Suns", "Mortgage Matchup Center"),
  t("Portland Trail Blazers", "Moda Center"),
  t("Sacramento Kings", "Golden 1 Center"),
  t("San Antonio Spurs", "Frost Bank Center"),
  t("Toronto Raptors", "Scotiabank Arena"),
  t("Utah Jazz", "Delta Center"),
  t("Washington Wizards", "Capital One Arena"),
];

export const SPORTING_CALENDAR_LEAGUES: SportingLeagueDef[] = [
  {
    name: "Premier League",
    sport: "Football",
    country: "England",
    kickoff: "15:00",
    weekday: 6,
    startDate: "2026-08-15",
    teams: PREMIER_LEAGUE_TEAMS,
  },
  {
    name: "EFL Championship",
    sport: "Football",
    country: "England",
    kickoff: "15:00",
    weekday: 6,
    startDate: "2026-08-08",
    teams: CHAMPIONSHIP_TEAMS,
  },
  {
    name: "EFL League One",
    sport: "Football",
    country: "England",
    kickoff: "15:00",
    weekday: 6,
    startDate: "2026-08-08",
    teams: LEAGUE_ONE_TEAMS,
  },
  {
    name: "Women's Super League",
    sport: "Football",
    country: "England",
    kickoff: "14:00",
    weekday: 0,
    startDate: "2026-09-06",
    teams: WSL_TEAMS,
  },
  {
    name: "Scottish Premiership",
    sport: "Football",
    country: "Scotland",
    kickoff: "15:00",
    weekday: 6,
    startDate: "2026-08-01",
    teams: SCOTTISH_PREMIERSHIP_TEAMS,
  },
  {
    name: "Bundesliga",
    sport: "Football",
    country: "Germany",
    kickoff: "15:30",
    weekday: 6,
    startDate: "2026-08-22",
    teams: BUNDESLIGA_TEAMS,
  },
  {
    name: "La Liga",
    sport: "Football",
    country: "Spain",
    kickoff: "16:00",
    weekday: 6,
    startDate: "2026-08-15",
    teams: LA_LIGA_TEAMS,
  },
  {
    name: "Ligue 1",
    sport: "Football",
    country: "France",
    kickoff: "17:00",
    weekday: 6,
    startDate: "2026-08-15",
    teams: LIGUE_1_TEAMS,
  },
  {
    name: "Serie A",
    sport: "Football",
    country: "Italy",
    kickoff: "18:00",
    weekday: 6,
    startDate: "2026-08-22",
    teams: SERIE_A_TEAMS,
  },
  {
    name: "Champions League",
    sport: "Football",
    country: "Europe",
    kickoff: "20:00",
    weekday: 2,
    startDate: "2026-09-08",
    singleLegs: 1,
    teams: [],
  },
  {
    name: "Europa Cup",
    sport: "Football",
    country: "Europe",
    kickoff: "20:00",
    weekday: 3,
    startDate: "2026-09-16",
    singleLegs: 1,
    teams: [],
  },
  {
    name: "Europa Conference League",
    sport: "Football",
    country: "Europe",
    kickoff: "20:00",
    weekday: 3,
    startDate: "2026-10-15",
    singleLegs: 1,
    teams: [],
  },
  {
    name: "FA Cup",
    sport: "Football",
    country: "England",
    kickoff: "15:00",
    weekday: 6,
    startDate: "2026-11-07",
    singleLegs: 1,
    teams: [],
  },
  {
    name: "Carabao Cup",
    sport: "Football",
    country: "England",
    kickoff: "20:00",
    weekday: 2,
    startDate: "2026-08-06",
    singleLegs: 1,
    teams: [],
  },
  {
    name: "Scottish Cup",
    sport: "Football",
    country: "Scotland",
    kickoff: "15:00",
    weekday: 6,
    startDate: "2026-08-01",
    singleLegs: 1,
    teams: [],
  },
  {
    name: "Italian Cup",
    sport: "Football",
    country: "Italy",
    kickoff: "20:00",
    weekday: 2,
    startDate: "2026-08-09",
    singleLegs: 1,
    teams: [],
  },
  {
    name: "German Cup",
    sport: "Football",
    country: "Germany",
    kickoff: "20:00",
    weekday: 2,
    startDate: "2026-08-15",
    singleLegs: 1,
    teams: [],
  },
  {
    name: "French Cup",
    sport: "Football",
    country: "France",
    kickoff: "20:00",
    weekday: 6,
    startDate: "2026-11-14",
    singleLegs: 1,
    teams: [],
  },
  {
    name: "Spanish Cup",
    sport: "Football",
    country: "Spain",
    kickoff: "21:00",
    weekday: 3,
    startDate: "2026-10-27",
    singleLegs: 1,
    teams: [],
  },
  {
    name: "NFL",
    sport: "NFL",
    country: "United States",
    kickoff: "18:00",
    weekday: 0,
    startDate: "2026-09-13",
    singleLegs: 18,
    teams: NFL_TEAMS,
  },
  {
    name: "Premiership Rugby",
    sport: "Rugby",
    country: "England",
    kickoff: "15:00",
    weekday: 6,
    startDate: "2026-09-05",
    teams: PREMIERSHIP_RUGBY_TEAMS,
  },
  {
    name: "Top 14",
    sport: "Rugby",
    country: "France",
    kickoff: "16:35",
    weekday: 6,
    startDate: "2026-09-05",
    teams: TOP_14_TEAMS,
  },
  {
    name: "Six Nations",
    sport: "Rugby",
    country: "Europe",
    kickoff: "14:10",
    weekday: 6,
    startDate: "2027-02-05",
    singleLegs: 5,
    teams: SIX_NATIONS_TEAMS,
  },
  {
    name: "The Rugby Championship",
    sport: "Rugby",
    country: "International",
    kickoff: "08:00",
    weekday: 6,
    startDate: "2027-07-10",
    singleLegs: 6,
    teams: RUGBY_CHAMPIONSHIP_TEAMS,
  },
  {
    name: "Nations Championship",
    sport: "Rugby",
    country: "International",
    kickoff: "15:00",
    weekday: 6,
    startDate: "2026-07-04",
    singleLegs: 6,
    teams: NATIONS_CHAMPIONSHIP_TEAMS,
  },
  {
    name: "Super League",
    sport: "Rugby",
    country: "England",
    kickoff: "15:00",
    weekday: 6,
    startDate: "2026-02-14",
    teams: SUPER_LEAGUE_TEAMS,
  },
  {
    name: "NBA",
    sport: "NBA",
    country: "United States",
    kickoff: "00:00",
    weekday: 2,
    startDate: "2026-10-27",
    teams: NBA_TEAMS,
  },
];

export const CUP_COMPETITION_NAMES = [
  "Champions League",
  "Europa Cup",
  "Europa Conference League",
  "FA Cup",
  "Carabao Cup",
  "Scottish Cup",
  "Italian Cup",
  "German Cup",
  "French Cup",
  "Spanish Cup",
] as const;

export type CupCompetitionName = (typeof CUP_COMPETITION_NAMES)[number];

export function isCupCompetitionName(
  name: string | null | undefined
): boolean {
  const needle = String(name ?? "").trim();
  return (CUP_COMPETITION_NAMES as readonly string[]).includes(needle);
}

export const SPORTING_CALENDAR_LEAGUE_ORDER = SPORTING_CALENDAR_LEAGUES.map(
  (league) => league.name
);

export function sportingLeagueByName(
  name: string | null | undefined
): SportingLeagueDef | null {
  const needle = String(name ?? "").trim().toLowerCase();
  if (!needle) return null;
  return (
    SPORTING_CALENDAR_LEAGUES.find(
      (league) => league.name.toLowerCase() === needle
    ) ?? null
  );
}

export function venueForTeam(
  league: SportingLeagueDef,
  teamName: string
): string {
  return (
    league.teams.find((team) => team.name === teamName)?.venue ?? "TBC"
  );
}
