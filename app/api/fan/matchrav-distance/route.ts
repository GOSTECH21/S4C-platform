import { NextRequest } from "next/server";
import type { TravelMode } from "@/app/lib/match-day-travel";
import {
  MATCHRAV_GOOGLE_MILES_STAMP,
  distanceLabel,
  googleDestinationQueries,
  googleDistanceMatrixUrl,
  googleLatLng,
  googleModeForTravel,
  milesFromGoogleDistanceMatrix,
  milesFromOsrmRoute,
  nominatimSearchUrl,
  osrmProfileForTravel,
  osrmRouteUrl,
  pointFromNominatimSearch,
  type MatchravDistanceResult,
} from "@/app/lib/matchrav-google-distance";
import {
  destinationPoint,
  milesFromOriginToDestination,
  originPoint,
} from "@/app/lib/matchrav-journey";
import type { GeoPoint } from "@/app/lib/project-site";
import type { UpcomingMatch } from "@/app/lib/upcoming-matches";

const TRAVEL_MODES: TravelMode[] = [
  "car",
  "train",
  "local-bus",
  "coach",
  "flight",
  "walk-cycle",
];

function asMode(value: string): TravelMode {
  return TRAVEL_MODES.includes(value as TravelMode)
    ? (value as TravelMode)
    : "car";
}

function googleKey(): string {
  return String(process.env.GOOGLE_MAPS_API_KEY ?? "").trim();
}

function fixtureHint(
  homeName: string,
  destination: string
): UpcomingMatch | null {
  const home = homeName.trim();
  if (!home) return null;
  return {
    id: "distance-hint",
    date: "",
    kickoff: null,
    homeName: home,
    awayName: "",
    venue: destination,
    competition: null,
    source: "s4p",
    sourceUrl: null,
  };
}

function parseCoord(value: string | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const next = Number(raw);
  return Number.isFinite(next) ? next : null;
}

function hintPoint(lat: string | null, lng: string | null): GeoPoint | null {
  const nextLat = parseCoord(lat);
  const nextLng = parseCoord(lng);
  if (nextLat == null || nextLng == null) return null;
  if (Math.abs(nextLat) > 90 || Math.abs(nextLng) > 180) return null;
  if (nextLat === 0 && nextLng === 0) return null;
  return { lat: nextLat, lng: nextLng };
}

async function readJson(url: string): Promise<unknown | null> {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "User-Agent": "ScoreForPlanet-Matchrav/1.0",
    },
  });
  if (!response.ok) return null;
  return response.json();
}

async function googleMiles(
  origin: string,
  destinations: string[],
  mode: TravelMode
): Promise<MatchravDistanceResult | null> {
  const key = googleKey();
  const googleMode = googleModeForTravel(mode);
  if (!key || !googleMode || destinations.length === 0) return null;
  const tried = [googleMode];
  if (googleMode === "transit") tried.push("driving");
  for (const destination of destinations) {
    for (const travelMode of tried) {
      const payload = await readJson(
        googleDistanceMatrixUrl({
          origin,
          destination,
          mode: travelMode,
          apiKey: key,
        })
      );
      const result = milesFromGoogleDistanceMatrix(
        payload as Parameters<typeof milesFromGoogleDistanceMatrix>[0]
      );
      if (result) return result;
    }
  }
  return null;
}

async function geocodePoint(queries: string[]): Promise<GeoPoint | null> {
  for (const query of queries) {
    const payload = await readJson(nominatimSearchUrl(query));
    const point = pointFromNominatimSearch(
      payload as Parameters<typeof pointFromNominatimSearch>[0]
    );
    if (point) return point;
  }
  return null;
}

async function osrmMiles(
  origin: string,
  dest: GeoPoint | null,
  mode: TravelMode
): Promise<MatchravDistanceResult | null> {
  const from = originPoint(origin);
  const to = dest;
  if (!from || !to) return null;
  const payload = await readJson(
    osrmRouteUrl({
      from,
      to,
      profile: osrmProfileForTravel(mode),
    })
  );
  return milesFromOsrmRoute(payload as Parameters<typeof milesFromOsrmRoute>[0]);
}

function straightMiles(
  origin: string,
  destination: string,
  fixture: UpcomingMatch | null,
  dest: GeoPoint | null
): MatchravDistanceResult | null {
  const from = originPoint(origin);
  const to = dest ?? destinationPoint(destination, fixture);
  if (from && to) {
    const miles = milesFromOriginToDestination(
      `${from.lat},${from.lng}`,
      `${to.lat},${to.lng}`,
      fixture
    );
    if (miles > 0) {
      return {
        miles,
        minutes: null,
        source: "straight",
        label: distanceLabel("straight"),
      };
    }
  }
  const miles = milesFromOriginToDestination(origin, destination, fixture);
  if (!(miles > 0)) return null;
  return {
    miles,
    minutes: null,
    source: "straight",
    label: distanceLabel("straight"),
  };
}

export async function GET(request: NextRequest) {
  const origin = String(request.nextUrl.searchParams.get("origin") ?? "").trim();
  const destination = String(
    request.nextUrl.searchParams.get("destination") ?? ""
  ).trim();
  const mode = asMode(
    String(request.nextUrl.searchParams.get("mode") ?? "car").trim()
  );
  const fixture = fixtureHint(
    String(request.nextUrl.searchParams.get("homeName") ?? ""),
    destination
  );
  const destHint = hintPoint(
    request.nextUrl.searchParams.get("destLat"),
    request.nextUrl.searchParams.get("destLng")
  );
  const googleDestinations = googleDestinationQueries(
    destination,
    String(request.nextUrl.searchParams.get("homeName") ?? "")
  );
  const knownDest = destHint ?? destinationPoint(destination, fixture);
  const destLatLng = googleLatLng(knownDest);
  if (destLatLng) googleDestinations.push(destLatLng);
  if (!origin || !destination) {
    return Response.json(
      {
        miles: 0,
        minutes: null,
        source: "straight",
        stamp: MATCHRAV_GOOGLE_MILES_STAMP,
      },
      { status: 400 }
    );
  }

  let dest = knownDest;
  let result: MatchravDistanceResult | null = null;
  if (mode !== "flight") {
    result = await googleMiles(origin, googleDestinations, mode);
  }
  if (!result) {
    dest = dest ?? (await geocodePoint(googleDestinations));
    if (mode !== "flight") result = await osrmMiles(origin, dest, mode);
  }
  result = result ?? straightMiles(origin, destination, fixture, dest);
  if (!result) {
    return Response.json({
      miles: 0,
      minutes: null,
      source: "straight",
      stamp: MATCHRAV_GOOGLE_MILES_STAMP,
    });
  }
  return Response.json({
    ...result,
    stamp: MATCHRAV_GOOGLE_MILES_STAMP,
  });
}
