/** Implementation postcode / address for Climate Projects and stadium-radius matching. */

function clubKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(football club|f\.c\.|fc|afc)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clubsMatch(left: string, right: string): boolean {
  const a = clubKey(left);
  const b = clubKey(right);
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

/** Local-business copy still uses this 5-mile figure where it is mentioned. */
export const NEARBY_STADIUM_MILES = 5;
/** Climate Projects listed as “near my Stadium” for the Sustainability Director. */
export const STADIUM_NEARBY_PROJECT_MILES = 20;
export const STADIUM_NEARBY_PROJECT_COUNT = 20;
export const COUNTRY_PROJECT_LIST_SIZE = 20;
export const SITE_LOCATION_MARK = "|SITE:";

export type GeoPoint = { lat: number; lng: number };

export type ProjectSite = {
  postcode: string;
  address: string;
};

export type NearbyProject<T> = {
  project: T;
  postcode: string;
  address: string;
  miles: number;
  stadiumName: string;
  stadiumPostcode: string;
};

export type StadiumSite = ProjectSite & {
  name: string;
  point: GeoPoint;
  place?: string;
  country?: string;
};

/** Club home grounds — public stadium listings. */
export const CLUB_STADIUM_SITES: StadiumSite[] = [
  {
    name: "Hibernian",
    address: "Easter Road Stadium, 12 Albion Place, Edinburgh",
    postcode: "EH7 5QG",
    point: { lat: 55.96173, lng: -3.16589 },
    place: "Leith",
    country: "Scotland",
  },
  {
    name: "Hearts of Midlothian",
    address: "Tynecastle Park, McLeod Street, Edinburgh",
    postcode: "EH11 2NL",
    point: { lat: 55.93925, lng: -3.23245 },
    place: "Gorgie",
    country: "Scotland",
  },
  {
    name: "Arsenal",
    address: "Emirates Stadium, Hornsey Road, London",
    postcode: "N7 7AJ",
    point: { lat: 51.55488, lng: -0.10844 },
    place: "Islington",
    country: "England",
  },
  {
    name: "Swansea City",
    address: "Swansea.com Stadium, Landore, Swansea",
    postcode: "SA1 2FA",
    point: { lat: 51.6426, lng: -3.9351 },
    place: "Swansea",
    country: "Wales",
  },
  {
    name: "Chelsea",
    address: "Stamford Bridge, Fulham Road, London",
    postcode: "SW6 1HS",
    point: { lat: 51.4816, lng: -0.191 },
    place: "Fulham",
    country: "England",
  },
  {
    name: "Tottenham Hotspur",
    address: "Tottenham Hotspur Stadium, High Road, London",
    postcode: "N17 0BX",
    point: { lat: 51.6042, lng: -0.0662 },
    place: "Tottenham",
    country: "England",
  },
  {
    name: "West Ham United",
    address: "London Stadium, Queen Elizabeth Olympic Park",
    postcode: "E20 2ST",
    point: { lat: 51.5386, lng: -0.0166 },
    place: "Stratford",
    country: "England",
  },
  {
    name: "Crystal Palace",
    address: "Selhurst Park, Whitehorse Lane, London",
    postcode: "SE25 6PU",
    point: { lat: 51.3983, lng: -0.0855 },
    place: "Selhurst",
    country: "England",
  },
  {
    name: "Fulham",
    address: "Craven Cottage, Stevenage Road, London",
    postcode: "SW6 6HH",
    point: { lat: 51.4749, lng: -0.2216 },
    place: "Fulham",
    country: "England",
  },
  {
    name: "Liverpool",
    address: "Anfield, Anfield Road, Liverpool",
    postcode: "L4 0TH",
    point: { lat: 53.4308, lng: -2.9609 },
    place: "Anfield",
    country: "England",
  },
  {
    name: "Manchester City",
    address: "Etihad Stadium, Ashton New Road, Manchester",
    postcode: "M11 3FF",
    point: { lat: 53.4831, lng: -2.2004 },
    place: "East Manchester",
    country: "England",
  },
  {
    name: "Manchester United",
    address: "Old Trafford, Sir Matt Busby Way, Manchester",
    postcode: "M16 0RA",
    point: { lat: 53.4631, lng: -2.2913 },
    place: "Trafford",
    country: "England",
  },
  {
    name: "Newcastle United",
    address: "St James' Park, Strawberry Place, Newcastle",
    postcode: "NE1 4ST",
    point: { lat: 54.9756, lng: -1.6217 },
    place: "Newcastle",
    country: "England",
  },
  {
    name: "Brighton and Hove Albion",
    address: "American Express Stadium, Village Way, Brighton",
    postcode: "BN1 9BL",
    point: { lat: 50.8616, lng: -0.0837 },
    place: "Falmer",
    country: "England",
  },
  {
    name: "Aston Villa",
    address: "Villa Park, Trinity Road, Birmingham",
    postcode: "B6 6HE",
    point: { lat: 52.5092, lng: -1.885 },
    place: "Aston",
    country: "England",
  },
  {
    name: "Leeds United",
    address: "Elland Road, Leeds",
    postcode: "LS11 0ES",
    point: { lat: 53.7778, lng: -1.5721 },
    place: "Beeston",
    country: "England",
  },
  {
    name: "Sunderland",
    address: "Stadium of Light, Sunderland",
    postcode: "SR5 1SU",
    point: { lat: 54.9144, lng: -1.3884 },
    place: "Sunderland",
    country: "England",
  },
  {
    name: "Nottingham Forest",
    address: "City Ground, Nottingham",
    postcode: "NG2 5FJ",
    point: { lat: 52.9399, lng: -1.1328 },
    place: "West Bridgford",
    country: "England",
  },
  {
    name: "Celtic",
    address: "Celtic Park, Glasgow",
    postcode: "G40 3RE",
    point: { lat: 55.8497, lng: -4.2056 },
    place: "Parkhead",
    country: "Scotland",
  },
  {
    name: "Rangers",
    address: "Ibrox Stadium, Glasgow",
    postcode: "G51 2XD",
    point: { lat: 55.8532, lng: -4.3093 },
    place: "Ibrox",
    country: "Scotland",
  },
  {
    name: "Cardiff City",
    address: "Cardiff City Stadium, Leckwith Road, Cardiff",
    postcode: "CF11 8AZ",
    point: { lat: 51.4728, lng: -3.2031 },
    place: "Leckwith",
    country: "Wales",
  },
];

/**
 * Public listing postcodes for Climate Partner projects already on S4P.
 * Addresses come from the organisation's own site or Companies House / OSCR.
 */
export const LISTED_PROJECT_SITES: StadiumSite[] = [
  {
    name: "Bridgend Farmhouse",
    address: "41 Old Dalkeith Road, Edinburgh",
    postcode: "EH16 4TE",
    point: { lat: 55.92675, lng: -3.15375 },
  },
  {
    name: "Porty Community Energy",
    address: "16 Park Avenue, Portobello, Edinburgh",
    postcode: "EH15 1JT",
    point: { lat: 55.9526, lng: -3.114 },
  },
  {
    name: "Edinburgh Remakery",
    address: "13A Newkirkgate, Leith, Edinburgh",
    postcode: "EH6 6AD",
    point: { lat: 55.9708, lng: -3.1715 },
  },
  {
    name: "Wee Spoke Hub",
    address: "13 Guthrie Street, Edinburgh",
    postcode: "EH1 1JG",
    point: { lat: 55.94817, lng: -3.1885 },
  },
  {
    name: "Cargo Bike Movement",
    address: "141 Lauriston Place, Tollcross, Edinburgh",
    postcode: "EH3 9JN",
    point: { lat: 55.9445, lng: -3.202 },
  },
  {
    name: "Lauriston Agroecology Farm",
    address: "Lauriston Farm Road, Edinburgh",
    postcode: "EH4 5EX",
    point: { lat: 55.97205, lng: -3.27558 },
  },
  {
    name: "Clean Heat Edinburgh",
    address: "Edinburgh Climate Action, Edinburgh",
    postcode: "EH1 1BB",
    point: { lat: 55.9542, lng: -3.1883 },
  },
  {
    name: "Edinburgh Building Retrofit Collective",
    address: "Edinburgh city retrofit programme",
    postcode: "EH8 9AA",
    point: { lat: 55.9472, lng: -3.1868 },
  },
  {
    name: "Islington Clean Air Schools",
    address: "Islington Council, 222 Upper Street, London",
    postcode: "N1 1XR",
    point: { lat: 51.54433, lng: -0.10361 },
  },
  {
    name: "Southwark Community Solar",
    address: "London Bridge / Southwark, London",
    postcode: "SE1 2AA",
    point: { lat: 51.5045, lng: -0.0847 },
  },
  {
    name: "London Community Retrofit",
    address: "Holloway, London Borough of Islington",
    postcode: "N7 6PA",
    point: { lat: 51.5572, lng: -0.1175 },
  },
  {
    name: "360 Centre Cockenzie",
    address: "Former Cockenzie power station site, East Lothian",
    postcode: "EH32 0DQ",
    point: { lat: 55.9694, lng: -2.9648 },
  },
  {
    name: "South Seeds",
    address: "Glasgow Southside",
    postcode: "G41 2LG",
    point: { lat: 55.8384, lng: -4.2672 },
  },
  {
    name: "Fittie Community Hall and Garden",
    address: "Footdee, Aberdeen",
    postcode: "AB11 5DE",
    point: { lat: 57.1431, lng: -2.0718 },
  },
  {
    name: "Swansea Community Energy",
    address: "Landore, Swansea",
    postcode: "SA1 2AA",
    point: { lat: 51.6412, lng: -3.932 },
  },
  {
    name: "Gower Saltmarsh Restoration",
    address: "Loughor Estuary, Swansea",
    postcode: "SA4 3TN",
    point: { lat: 51.647, lng: -4.065 },
  },
  {
    name: "Port Talbot Clean Air Streets",
    address: "Port Talbot town centre",
    postcode: "SA13 1PJ",
    point: { lat: 51.5905, lng: -3.7812 },
  },
  {
    name: "Neath Canal Wildlife",
    address: "Neath Canal, Neath",
    postcode: "SA11 1RB",
    point: { lat: 51.663, lng: -3.804 },
  },
  {
    name: "Leeds Community Retrofit",
    address: "Beeston, Leeds",
    postcode: "LS11 6AD",
    point: { lat: 53.7785, lng: -1.557 },
  },
  {
    name: "Sheffield Street Trees",
    address: "Sheffield city parks",
    postcode: "S1 2HH",
    point: { lat: 53.381, lng: -1.47 },
  },
  {
    name: "Nottingham Heat Network",
    address: "Nottingham city centre",
    postcode: "NG1 5DT",
    point: { lat: 52.954, lng: -1.155 },
  },
  {
    name: "Leicester Active Travel",
    address: "Leicester city centre",
    postcode: "LE1 5WW",
    point: { lat: 52.636, lng: -1.133 },
  },
  {
    name: "Southampton Coastal Resilience",
    address: "Southampton Waterfront",
    postcode: "SO14 3QN",
    point: { lat: 50.897, lng: -1.404 },
  },
  {
    name: "Brighton Community Solar",
    address: "Brighton and Hove rooftops",
    postcode: "BN1 1GE",
    point: { lat: 50.822, lng: -0.137 },
  },
  {
    name: "Norwich Fen Restoration",
    address: "The Broads, Norwich",
    postcode: "NR1 1WR",
    point: { lat: 52.628, lng: 1.303 },
  },
  {
    name: "Exeter Community Energy",
    address: "Exeter community buildings",
    postcode: "EX1 1GP",
    point: { lat: 50.725, lng: -3.526 },
  },
  {
    name: "Sunderland Riverside Restoration",
    address: "River Wear, Sunderland",
    postcode: "SR1 1UN",
    point: { lat: 54.907, lng: -1.382 },
  },
  {
    name: "Stoke Canal Rewilding",
    address: "Trent and Mersey Canal, Stoke-on-Trent",
    postcode: "ST1 1JJ",
    point: { lat: 53.026, lng: -2.175 },
  },
];

const POINT_BY_POSTCODE = new Map<string, GeoPoint>();
const POINT_BY_OUTCODE = new Map<string, GeoPoint>();

function outwardCode(postcode: string | null | undefined): string {
  const key = normalizePostcode(postcode);
  if (!key) return "";
  const [outward] = key.split(" ");
  return outward ?? "";
}

function rememberPoint(postcode: string, point: GeoPoint) {
  const key = normalizePostcode(postcode);
  POINT_BY_POSTCODE.set(key, point);
  const outward = outwardCode(key);
  if (outward && !POINT_BY_OUTCODE.has(outward)) {
    POINT_BY_OUTCODE.set(outward, point);
  }
}

for (const row of CLUB_STADIUM_SITES) rememberPoint(row.postcode, row.point);
for (const row of LISTED_PROJECT_SITES) rememberPoint(row.postcode, row.point);

/** Nearby districts without a listed project, used for local-business postcodes. */
const EXTRA_OUTCODE_POINTS: Array<{ outcode: string; point: GeoPoint }> = [
  { outcode: "EH9", point: { lat: 55.9335, lng: -3.185 } },
  { outcode: "EH10", point: { lat: 55.925, lng: -3.21 } },
  { outcode: "EH12", point: { lat: 55.942, lng: -3.28 } },
  { outcode: "EH14", point: { lat: 55.918, lng: -3.25 } },
  { outcode: "N4", point: { lat: 51.571, lng: -0.104 } },
  { outcode: "N5", point: { lat: 51.56, lng: -0.099 } },
  { outcode: "N19", point: { lat: 51.565, lng: -0.127 } },
];
for (const row of EXTRA_OUTCODE_POINTS) {
  if (!POINT_BY_OUTCODE.has(row.outcode)) {
    POINT_BY_OUTCODE.set(row.outcode, row.point);
  }
}

const UK_POSTCODE =
  /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

export function normalizePostcode(value: string | null | undefined): string {
  const compact = String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  if (compact.length < 5) return compact;
  return `${compact.slice(0, -3)} ${compact.slice(-3)}`;
}

export function isUkPostcode(value: string | null | undefined): boolean {
  return UK_POSTCODE.test(normalizePostcode(value));
}

export function parseProjectSite(
  location: string | null | undefined
): ProjectSite | null {
  const raw = location ?? "";
  const index = raw.indexOf(SITE_LOCATION_MARK);
  if (index < 0) return null;
  const encoded = raw.slice(index + SITE_LOCATION_MARK.length).split("|")[0];
  try {
    const parsed = JSON.parse(decodeURIComponent(encoded)) as Partial<ProjectSite>;
    const postcode = normalizePostcode(parsed.postcode);
    if (!postcode) return null;
    return {
      postcode,
      address: String(parsed.address ?? "").trim(),
    };
  } catch {
    return null;
  }
}

export function listedSiteForProjectName(
  name: string | null | undefined
): StadiumSite | null {
  const key = (name ?? "").trim().toLowerCase();
  if (!key) return null;
  return (
    LISTED_PROJECT_SITES.find((row) => row.name.toLowerCase() === key) ?? null
  );
}

export function encodeLocationSite(
  baseLocation: string,
  site: ProjectSite | null | undefined
): string {
  const base = stripSiteMark(baseLocation);
  const postcode = normalizePostcode(site?.postcode);
  if (!postcode) return base;
  const payload: ProjectSite = {
    postcode,
    address: String(site?.address ?? "").trim(),
  };
  return `${base}${SITE_LOCATION_MARK}${encodeURIComponent(JSON.stringify(payload))}`;
}

export function stripSiteMark(location: string | null | undefined): string {
  const raw = location ?? "";
  const index = raw.indexOf(SITE_LOCATION_MARK);
  if (index < 0) return raw.trim();
  const after = raw.slice(index + SITE_LOCATION_MARK.length);
  const restIndex = after.indexOf("|");
  const rest = restIndex >= 0 ? after.slice(restIndex) : "";
  return `${raw.slice(0, index)}${rest}`.trim();
}

export function pointForPostcode(
  postcode: string | null | undefined
): GeoPoint | null {
  const key = normalizePostcode(postcode);
  if (!key) return null;
  return (
    POINT_BY_POSTCODE.get(key) ?? POINT_BY_OUTCODE.get(outwardCode(key)) ?? null
  );
}

export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function milesBetweenPoints(left: GeoPoint, right: GeoPoint): number {
  const earthMiles = 3958.7613;
  const dLat = toRadians(right.lat - left.lat);
  const dLng = toRadians(right.lng - left.lng);
  const lat1 = toRadians(left.lat);
  const lat2 = toRadians(right.lat);
  const chord =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthMiles * Math.asin(Math.min(1, Math.sqrt(chord)));
}

export function milesBetweenPostcodes(
  left: string | null | undefined,
  right: string | null | undefined
): number | null {
  const a = pointForPostcode(left);
  const b = pointForPostcode(right);
  if (!a || !b) return null;
  return milesBetweenPoints(a, b);
}

export function stadiumSiteForClub(
  clubName: string | null | undefined
): StadiumSite | null {
  const name = String(clubName ?? "").trim();
  if (!name) return null;
  return (
    CLUB_STADIUM_SITES.find((row) => clubsMatch(row.name, name)) ?? null
  );
}

export function siteForProject(project: {
  name?: string | null;
  location?: string | null;
  postcode?: string | null;
  address?: string | null;
}): ProjectSite | null {
  const fromFields = normalizePostcode(project.postcode);
  if (fromFields) {
    return {
      postcode: fromFields,
      address: String(project.address ?? "").trim(),
    };
  }
  const encoded = parseProjectSite(project.location);
  if (encoded) return encoded;
  const listed = listedSiteForProjectName(project.name);
  if (!listed) return null;
  return { postcode: listed.postcode, address: listed.address };
}

export function isWithinStadiumRadius(
  projectPostcode: string | null | undefined,
  clubName: string | null | undefined,
  miles = NEARBY_STADIUM_MILES
): boolean {
  const stadium = stadiumSiteForClub(clubName);
  if (!stadium) return false;
  const distance = milesBetweenPostcodes(projectPostcode, stadium.postcode);
  return distance != null && distance <= miles;
}

export function nearbyProjectsForClub<
  T extends {
    name?: string | null;
    location?: string | null;
    postcode?: string | null;
    address?: string | null;
  },
>(
  projects: T[],
  clubName: string | null | undefined,
  miles = NEARBY_STADIUM_MILES
): NearbyProject<T>[] {
  const stadium = stadiumSiteForClub(clubName);
  if (!stadium) return [];
  const rows: NearbyProject<T>[] = [];
  for (const project of projects) {
    const site = siteForProject(project);
    if (!site) continue;
    const distance = milesBetweenPostcodes(site.postcode, stadium.postcode);
    if (distance == null || distance > miles) continue;
    rows.push({
      project,
      postcode: site.postcode,
      address: site.address,
      miles: Math.round(distance * 10) / 10,
      stadiumName: stadium.address.split(",")[0] ?? stadium.name,
      stadiumPostcode: stadium.postcode,
    });
  }
  return rows.sort((left, right) => left.miles - right.miles);
}

export function orderProjectsByStadiumProximity<
  T extends {
    name?: string | null;
    location?: string | null;
    postcode?: string | null;
    address?: string | null;
  },
>(projects: T[], clubName: string | null | undefined): T[] {
  const nearbyNames = new Set(
    nearbyProjectsForClub(projects, clubName).map(
      (row) => (row.project.name ?? "").trim().toLowerCase()
    )
  );
  return [...projects].sort((left, right) => {
    const leftNear = nearbyNames.has((left.name ?? "").trim().toLowerCase());
    const rightNear = nearbyNames.has((right.name ?? "").trim().toLowerCase());
    if (leftNear !== rightNear) return leftNear ? -1 : 1;
    return (left.name ?? "").localeCompare(right.name ?? "");
  });
}

export function localBusinessNearStadiumMessage(
  clubName: string,
  miles = NEARBY_STADIUM_MILES
): string {
  const stadium = stadiumSiteForClub(clubName);
  const ground = stadium
    ? `${stadium.address.split(",")[0]} (${stadium.postcode})`
    : "the club stadium";
  return `Local Business Climate Sponsors must be within ${miles} miles of ${ground}.`;
}

export function assertLocalBusinessNearStadium({
  postcode,
  clubName,
  miles = NEARBY_STADIUM_MILES,
}: {
  postcode: string;
  clubName: string;
  miles?: number;
}): number {
  if (!isUkPostcode(postcode)) {
    throw new Error("Enter the UK postcode where this local business trades.");
  }
  const stadium = stadiumSiteForClub(clubName);
  if (!stadium) {
    throw new Error("Choose the local club whose stadium your business is near.");
  }
  const distance = milesBetweenPostcodes(postcode, stadium.postcode);
  if (distance == null) {
    throw new Error(
      `That postcode is not in the S4P stadium map yet. Use a postcode within ${miles} miles of ${stadium.postcode}.`
    );
  }
  if (distance > miles) {
    throw new Error(
      `${localBusinessNearStadiumMessage(clubName, miles)} ${normalizePostcode(postcode)} is ${distance.toFixed(1)} miles away.`
    );
  }
  return Math.round(distance * 10) / 10;
}

export function projectSiteListingErrors(input: {
  postcode?: string;
  address?: string;
}): string[] {
  const errors: string[] = [];
  if (!String(input.address ?? "").trim()) {
    errors.push("The address where the project is implemented is required.");
  }
  if (!normalizePostcode(input.postcode)) {
    errors.push("The postcode where the project is implemented is required.");
  } else if (!isUkPostcode(input.postcode) && String(input.postcode ?? "").trim().length < 3) {
    errors.push("Enter a valid postcode for the project site.");
  }
  return errors;
}

export function formatMilesFromStadium(miles: number): string {
  const value = Number.isInteger(miles) ? String(miles) : miles.toFixed(1);
  return `${value} mile${miles === 1 ? "" : "s"} from the stadium`;
}

export function nearbyProjectsCopy(clubName: string): string {
  const stadium = stadiumSiteForClub(clubName);
  const ground = stadium
    ? `${stadium.address.split(",")[0]} (${stadium.postcode})`
    : "your club stadium";
  return `Climate Projects near my Stadium lists ${STADIUM_NEARBY_PROJECT_COUNT} projects within ${STADIUM_NEARBY_PROJECT_MILES} miles of ${ground}.`;
}

export function registerPointForPostcode(postcode: string, point: GeoPoint) {
  rememberPoint(postcode, point);
}
