import { NextRequest } from "next/server";
import type { TravelMode } from "@/app/lib/match-day-travel";
import {
  MATCHRAV_GOOGLE_MILES_STAMP,
  distanceLabel,
  googleDistanceMatrixUrl,
  googleModeForTravel,
  milesFromGoogleDistanceMatrix,
  milesFromOsrmRoute,
  osrmProfileForTravel,
  osrmRouteUrl,
  type MatchravDistanceResult,
} from "@/app/lib/matchrav-google-distance";
import {
  destinationPoint,
  milesFromOriginToDestination,
  originPoint,
} from "@/app/lib/matchrav-journey";
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

async function readJson(url: string): Promise<unknown | null> {
  const response = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) return null;
  return response.json();
}

async function googleMiles(
  origin: string,
  destination: string,
  mode: TravelMode
): Promise<MatchravDistanceResult | null> {
  const key = googleKey();
  const googleMode = googleModeForTravel(mode);
  if (!key || !googleMode) return null;
  const tried = [googleMode];
  if (googleMode === "transit") tried.push("driving");
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
  return null;
}

async function osrmMiles(
  origin: string,
  destination: string,
  mode: TravelMode,
  fixture: UpcomingMatch | null
): Promise<MatchravDistanceResult | null> {
  const from = originPoint(origin);
  const to = destinationPoint(destination, fixture);
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
  fixture: UpcomingMatch | null
): MatchravDistanceResult | null {
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

  let result: MatchravDistanceResult | null = null;
  if (mode !== "flight") {
    result =
      (await googleMiles(origin, destination, mode)) ??
      (await osrmMiles(origin, destination, mode, fixture));
  }
  result = result ?? straightMiles(origin, destination, fixture);
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
