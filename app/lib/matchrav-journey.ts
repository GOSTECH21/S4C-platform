/** Matchrav journey planning, routing estimates, trips, consent and ops. */

import {
  CLUB_STADIUM_SITES,
  milesBetweenPoints,
  pointForPostcode,
  stadiumSiteForClub,
  stadiumSiteForVenue,
  type GeoPoint,
  type StadiumSite,
} from "./project-site";
import {
  estimateTravelKgCo2e,
  flightHaulForOneWayMiles,
  flightKgPerMile,
  formatTravelKgCo2e,
  parseReturnMiles,
  TRAVEL_MODES,
  type TravelMode,
} from "./match-day-travel";
import { MATCHRAV_JOURNEY_STAMP } from "./matchrav";
import { SPORTING_CALENDAR_LEAGUES } from "./sporting-calendar-leagues";
import {
  clubIsHome,
  namesExactlyMatch,
  namesMatch,
  type UpcomingMatch,
} from "./upcoming-matches";

export { MATCHRAV_JOURNEY_STAMP };

export const MATCHRAV_CONSENT_KEY = "s4p.matchrav-consent";
export const MATCHRAV_TRIPS_KEY = "s4p.matchrav-trips";
export const MATCHRAV_ANALYTICS_KEY = "s4p.matchrav-analytics";

export type MatchravConsent = {
  storeLocal: boolean;
  shareAnonymous: boolean;
  allowGps: boolean;
};

export const DEFAULT_MATCHRAV_CONSENT: MatchravConsent = {
  storeLocal: true,
  shareAnonymous: false,
  allowGps: false,
};

const MODE_SPEED_MPH: Record<TravelMode, number> = {
  car: 28,
  train: 40,
  "local-bus": 11,
  coach: 32,
  flight: 180,
  "walk-cycle": 8,
};

const WALK_CYCLE_MAX_MILES = 12;
const FLIGHT_MIN_MILES = 80;

export type MatchravStadium = {
  club: string;
  venue: string;
  address: string;
  postcode: string;
  place: string;
  country: string;
  point: GeoPoint | null;
};

export type MatchravTrip = {
  id: string;
  club: string;
  matchId: string;
  fixtureName: string;
  venue: string;
  matchDate: string;
  origin: string;
  destination: string;
  outboundMiles: number;
  returnMiles: number;
  outboundMode: TravelMode;
  returnMode: TravelMode;
  occupants: number;
  outboundKg: number;
  returnKg: number;
  totalKg: number;
  savedVsSoloCarKg: number;
  status: "planned" | "confirmed";
  confirmedMode: TravelMode | null;
  ticketEvidence: MatchravTicketEvidence | null;
  createdAt: string;
  updatedAt: string;
};

export type MatchravTicketEvidence = {
  fileName: string;
  mimeType: string;
  dataUrl: string;
  uploadedAt: string;
};

export type MatchravAnalytics = {
  planned: number;
  confirmed: number;
  byMode: Record<TravelMode, number>;
  savedKg: number;
  clubs: Record<string, number>;
  updatedAt: string;
};

export type MatchravRouteOption = {
  id: TravelMode;
  label: string;
  miles: number;
  minutes: number;
  kg: number;
  practical: boolean;
};

function emptyAnalytics(): MatchravAnalytics {
  return {
    planned: 0,
    confirmed: 0,
    byMode: {
      car: 0,
      train: 0,
      "local-bus": 0,
      coach: 0,
      flight: 0,
      "walk-cycle": 0,
    },
    savedKg: 0,
    clubs: {},
    updatedAt: "",
  };
}

function clean(value: string | null | undefined): string {
  return String(value ?? "").trim();
}

function round1(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round(value * 10) / 10;
}

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `matchrav-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function parseLatLng(value: string | null | undefined): GeoPoint | null {
  const raw = clean(value);
  const match = raw.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

export function originPoint(origin: string | null | undefined): GeoPoint | null {
  return parseLatLng(origin) ?? pointForPostcode(origin);
}

export function calendarVenueForClub(clubName: string): string {
  const name = clean(clubName);
  if (!name) return "";
  for (const league of SPORTING_CALENDAR_LEAGUES) {
    const team = league.teams.find((row) => namesExactlyMatch(row.name, name));
    if (team?.venue && team.venue !== "TBC") return team.venue;
  }
  return "";
}

function stadiumFromSite(site: StadiumSite, venueHint = ""): MatchravStadium {
  const venue =
    clean(venueHint) || site.address.split(",")[0]?.trim() || site.name;
  return {
    club: site.name,
    venue,
    address: site.address,
    postcode: site.postcode,
    place: site.place,
    country: site.country,
    point: site.point,
  };
}

export function matchravStadiumForClub(clubName: string): MatchravStadium | null {
  const name = clean(clubName);
  if (!name) return null;
  const site = stadiumSiteForClub(name);
  const venue = site?.address.split(",")[0]?.trim() || calendarVenueForClub(name);
  if (!site && !venue) return null;
  if (site) return stadiumFromSite(site, venue);
  return {
    club: name,
    venue,
    address: venue,
    postcode: "",
    place: "",
    country: "",
    point: null,
  };
}

/** Ground where this fixture is played, not the supported club's home by default. */
export function matchravStadiumForMatch(
  club: string,
  fixture: UpcomingMatch | null,
  homeStadium: MatchravStadium | null
): MatchravStadium | null {
  const venue = fixture?.venue?.trim() || "";
  if (venue) {
    const site =
      stadiumSiteForVenue(venue) ?? stadiumSiteForClub(fixture?.homeName);
    if (site) return stadiumFromSite(site, venue);
    return {
      club: fixture?.homeName || clean(club),
      venue,
      address: venue,
      postcode: "",
      place: "",
      country: "",
      point: null,
    };
  }
  if (fixture && !clubIsHome(fixture, club)) {
    const site = stadiumSiteForClub(fixture.homeName);
    if (site) return stadiumFromSite(site);
  }
  return homeStadium;
}

export function stadiumLabel(stadium: MatchravStadium | null): string {
  if (!stadium) return "";
  if (stadium.address && stadium.postcode) {
    return `${stadium.address} (${stadium.postcode})`;
  }
  return stadium.address || stadium.venue;
}

export function destinationForFixture(
  club: string,
  fixture: UpcomingMatch | null,
  stadium: MatchravStadium | null
): string {
  const ground = matchravStadiumForMatch(club, fixture, stadium);
  return stadiumLabel(ground) || fixture?.venue?.trim() || stadiumLabel(stadium);
}

export function fixtureHeadline(fixture: UpcomingMatch): string {
  return `${fixture.homeName} vs ${fixture.awayName}`;
}

export function estimateMinutes(mode: TravelMode, miles: number): number {
  const distance = parseReturnMiles(miles);
  if (distance <= 0) return 0;
  const speed = MODE_SPEED_MPH[mode];
  return Math.max(1, Math.round((distance / speed) * 60));
}

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return "—";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest === 0) return hours === 1 ? "1 hr" : `${hours} hr`;
  return `${hours} hr ${rest} min`;
}

export function routeIsPractical(mode: TravelMode, miles: number): boolean {
  const distance = parseReturnMiles(miles);
  if (mode === "walk-cycle") return distance <= WALK_CYCLE_MAX_MILES;
  if (mode === "flight") return distance >= FLIGHT_MIN_MILES;
  return true;
}

export function compareRoutes(
  miles: number,
  occupants: number
): MatchravRouteOption[] {
  const distance = parseReturnMiles(miles);
  const flightOneWay = distance / 2;
  return TRAVEL_MODES.map((row) => ({
    id: row.id,
    label: row.label,
    miles: distance,
    minutes: estimateMinutes(row.id, distance),
    kg:
      row.id === "flight"
        ? round1(flightKgPerMile(flightHaulForOneWayMiles(flightOneWay)) * distance)
        : estimateTravelKgCo2e(row.id, distance, occupants),
    practical: routeIsPractical(row.id, distance),
  }));
}

export function soloCarKg(miles: number): number {
  return estimateTravelKgCo2e("car", miles, 1);
}

export function savedVsSoloCarKg(
  mode: TravelMode,
  miles: number,
  occupants: number
): number {
  const chosen = estimateTravelKgCo2e(mode, miles, occupants);
  return round1(Math.max(0, soloCarKg(miles) - chosen));
}

export function destinationPoint(
  destination: string,
  fixture: UpcomingMatch | null = null,
  homeStadium: MatchravStadium | null = null
): GeoPoint | null {
  const typed = clean(destination);
  const fromTyped =
    parseLatLng(typed) ??
    pointForPostcode(typed) ??
    stadiumSiteForVenue(typed)?.point ??
    null;
  if (fromTyped) return fromTyped;
  if (fixture) {
    const homeGround = stadiumSiteForClub(fixture.homeName)?.point ?? null;
    const awayGround = stadiumSiteForClub(fixture.awayName)?.point ?? null;
    const supported = clean(homeStadium?.club);
    if (supported && !clubIsHome(fixture, supported) && homeGround) {
      return homeGround;
    }
    if (homeGround && namesMatch(typed, fixture.homeName)) return homeGround;
    if (awayGround && namesMatch(typed, fixture.awayName)) return awayGround;
  }
  return homeStadium?.point ?? null;
}

export function milesFromOriginToStadium(
  origin: string,
  stadium: MatchravStadium | null
): number {
  return milesFromOriginToDestination(origin, stadiumLabel(stadium), null, stadium);
}

export function milesFromOriginToDestination(
  origin: string,
  destination: string,
  fixture: UpcomingMatch | null = null,
  homeStadium: MatchravStadium | null = null
): number {
  const from = originPoint(origin);
  const to = destinationPoint(destination, fixture, homeStadium);
  if (!from || !to) return 0;
  return round1(milesBetweenPoints(from, to));
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode can block localStorage.
  }
}

export function readMatchravConsent(): MatchravConsent {
  const stored = readJson<Partial<MatchravConsent> | null>(
    MATCHRAV_CONSENT_KEY,
    null
  );
  return {
    storeLocal: stored?.storeLocal !== false,
    shareAnonymous: Boolean(stored?.shareAnonymous),
    allowGps: Boolean(stored?.allowGps),
  };
}

export function writeMatchravConsent(consent: MatchravConsent): void {
  writeJson(MATCHRAV_CONSENT_KEY, consent);
}

export function listMatchravTrips(): MatchravTrip[] {
  const rows = readJson<MatchravTrip[]>(MATCHRAV_TRIPS_KEY, []);
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => ({
    ...row,
    ticketEvidence: row.ticketEvidence ?? null,
  }));
}

export function readMatchravAnalytics(): MatchravAnalytics {
  const stored = readJson<Partial<MatchravAnalytics> | null>(
    MATCHRAV_ANALYTICS_KEY,
    null
  );
  const base = emptyAnalytics();
  if (!stored) return base;
  return {
    ...base,
    ...stored,
    byMode: { ...base.byMode, ...(stored.byMode ?? {}) },
    clubs: stored.clubs ?? {},
  };
}

function bumpAnalytics(
  analytics: MatchravAnalytics,
  trip: MatchravTrip,
  kind: "planned" | "confirmed"
): MatchravAnalytics {
  const mode = trip.confirmedMode || trip.outboundMode;
  const clubs = { ...analytics.clubs };
  clubs[trip.club] = (clubs[trip.club] ?? 0) + (kind === "planned" ? 1 : 0);
  return {
    planned: analytics.planned + (kind === "planned" ? 1 : 0),
    confirmed: analytics.confirmed + (kind === "confirmed" ? 1 : 0),
    byMode: {
      ...analytics.byMode,
      [mode]: (analytics.byMode[mode] ?? 0) + 1,
    },
    savedKg: round1(analytics.savedKg + trip.savedVsSoloCarKg),
    clubs,
    updatedAt: new Date().toISOString(),
  };
}

export type MatchravTripInput = {
  club: string;
  matchId?: string | null;
  fixtureName?: string | null;
  venue?: string | null;
  matchDate?: string | null;
  origin: string;
  destination: string;
  outboundMiles: number;
  returnMiles: number;
  outboundMode: TravelMode;
  returnMode: TravelMode;
  occupants: number;
};

export function buildMatchravTrip(input: MatchravTripInput): MatchravTrip | null {
  const club = clean(input.club);
  const outboundMiles = parseReturnMiles(input.outboundMiles);
  const returnMiles = parseReturnMiles(input.returnMiles);
  if (!club || outboundMiles <= 0) return null;
  const occupants = input.occupants;
  const outboundKg = estimateTravelKgCo2e(
    input.outboundMode,
    outboundMiles,
    occupants
  );
  const returnKg = estimateTravelKgCo2e(
    input.returnMode,
    returnMiles,
    occupants
  );
  const totalMiles = outboundMiles + returnMiles;
  const totalKg = round1(outboundKg + returnKg);
  const chosenWeighted = totalKg;
  const solo = soloCarKg(totalMiles);
  const now = new Date().toISOString();
  return {
    id: newId(),
    club,
    matchId: clean(input.matchId),
    fixtureName: clean(input.fixtureName),
    venue: clean(input.venue),
    matchDate: clean(input.matchDate),
    origin: clean(input.origin),
    destination: clean(input.destination),
    outboundMiles,
    returnMiles,
    outboundMode: input.outboundMode,
    returnMode: input.returnMode,
    occupants,
    outboundKg,
    returnKg,
    totalKg: chosenWeighted,
    savedVsSoloCarKg: round1(Math.max(0, solo - chosenWeighted)),
    status: "planned",
    confirmedMode: null,
    ticketEvidence: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function saveMatchravTrip(
  input: MatchravTripInput,
  consent: MatchravConsent
): MatchravTrip | null {
  const trip = buildMatchravTrip(input);
  if (!trip) return null;
  if (!consent.storeLocal) return trip;
  const rows = listMatchravTrips();
  const key = `${trip.club}::${trip.matchId || trip.matchDate}::${trip.origin}`;
  const index = rows.findIndex(
    (row) => `${row.club}::${row.matchId || row.matchDate}::${row.origin}` === key
  );
  if (index >= 0) {
    trip.id = rows[index].id;
    trip.createdAt = rows[index].createdAt;
    trip.status = rows[index].status;
    trip.confirmedMode = rows[index].confirmedMode;
    trip.ticketEvidence = rows[index].ticketEvidence ?? null;
    rows[index] = trip;
  } else {
    rows.unshift(trip);
  }
  writeJson(MATCHRAV_TRIPS_KEY, rows.slice(0, 40));
  if (consent.shareAnonymous) {
    writeJson(
      MATCHRAV_ANALYTICS_KEY,
      bumpAnalytics(readMatchravAnalytics(), trip, "planned")
    );
  }
  return trip;
}

export const MATCHRAV_TICKET_MAX_BYTES = 2_000_000;
export const MATCHRAV_TICKET_ACCEPT = "image/*,application/pdf";

export function readMatchravTicketFile(file: File): Promise<MatchravTicketEvidence> {
  const mime = String(file.type || "").toLowerCase();
  const ok =
    mime.startsWith("image/") ||
    mime === "application/pdf" ||
    /\.(jpe?g|png|webp|gif|pdf)$/i.test(file.name);
  if (!ok) {
    return Promise.reject(
      new Error("Please upload a photo or PDF of your travel ticket.")
    );
  }
  if (file.size > MATCHRAV_TICKET_MAX_BYTES) {
    return Promise.reject(new Error("Travel ticket must be under 2 MB."));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        fileName: file.name || "travel-ticket",
        mimeType: mime || "application/octet-stream",
        dataUrl: String(reader.result ?? ""),
        uploadedAt: new Date().toISOString(),
      });
    reader.onerror = () =>
      reject(new Error("Could not read that travel ticket."));
    reader.readAsDataURL(file);
  });
}

export function attachMatchravTicket(
  tripId: string,
  evidence: MatchravTicketEvidence,
  consent: MatchravConsent
): MatchravTrip | null {
  const rows = listMatchravTrips();
  const index = rows.findIndex((row) => row.id === tripId);
  if (index < 0) return null;
  const next: MatchravTrip = {
    ...rows[index],
    ticketEvidence: evidence,
    updatedAt: new Date().toISOString(),
  };
  rows[index] = next;
  if (consent.storeLocal) writeJson(MATCHRAV_TRIPS_KEY, rows);
  return next;
}

export function confirmMatchravTrip(
  tripId: string,
  mode: TravelMode,
  consent: MatchravConsent
): MatchravTrip | null {
  const rows = listMatchravTrips();
  const index = rows.findIndex((row) => row.id === tripId);
  if (index < 0) return null;
  const next: MatchravTrip = {
    ...rows[index],
    status: "confirmed",
    confirmedMode: mode,
    updatedAt: new Date().toISOString(),
  };
  rows[index] = next;
  if (consent.storeLocal) writeJson(MATCHRAV_TRIPS_KEY, rows);
  if (consent.shareAnonymous) {
    writeJson(
      MATCHRAV_ANALYTICS_KEY,
      bumpAnalytics(readMatchravAnalytics(), next, "confirmed")
    );
  }
  return next;
}

export function matchravStadiumCoverage(): {
  stadiums: number;
  clubs: string[];
} {
  return {
    stadiums: CLUB_STADIUM_SITES.length,
    clubs: CLUB_STADIUM_SITES.map((row) => row.name),
  };
}

export function formatKg(value: number): string {
  return formatTravelKgCo2e(value);
}
