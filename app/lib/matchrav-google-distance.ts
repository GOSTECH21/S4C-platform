/** Google Maps road miles for Matchrav. Crow-flies is not the reference. */

import type { TravelMode } from "./match-day-travel";
import type { GeoPoint } from "./project-site";

export const MATCHRAV_GOOGLE_MILES_STAMP = "matchrav-google-miles-v1";
export const MATCHRAV_DISTANCE_PATH = "/api/fan/matchrav-distance";
export const GOOGLE_MAPS_DISTANCE_LABEL = "Google Maps driving distance";
export const METERS_PER_STATUTE_MILE = 1609.344;
export const GOOGLE_DISTANCE_MATRIX_URL =
  "https://maps.googleapis.com/maps/api/distancematrix/json";
export const OSRM_ROUTE_URL = "https://router.project-osrm.org/route/v1";

export type MatchravDistanceSource = "google" | "osrm" | "straight";

export type MatchravDistanceResult = {
  miles: number;
  minutes: number | null;
  source: MatchravDistanceSource;
  label: string;
};

export type GoogleTravelMode = "driving" | "transit" | "walking" | "bicycling";

export function googleModeForTravel(
  mode: TravelMode | null | undefined
): GoogleTravelMode | null {
  if (mode === "flight") return null;
  if (mode === "walk-cycle") return "walking";
  if (mode === "train" || mode === "local-bus") return "transit";
  return "driving";
}

export function osrmProfileForTravel(
  mode: TravelMode | null | undefined
): "driving" | "walking" | "cycling" {
  if (mode === "walk-cycle") return "walking";
  return "driving";
}

export function metersToStatuteMiles(meters: number): number {
  const value = Number(meters);
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round((value / METERS_PER_STATUTE_MILE) * 10) / 10;
}

export function secondsToMinutes(seconds: number): number {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.max(1, Math.round(value / 60));
}

export function distanceLabel(source: MatchravDistanceSource): string {
  if (source === "google") return GOOGLE_MAPS_DISTANCE_LABEL;
  if (source === "osrm") return "Driving distance";
  return "Straight-line estimate";
}

type DistanceMatrixPayload = {
  status?: string;
  error_message?: string;
  rows?: Array<{
    elements?: Array<{
      status?: string;
      distance?: { value?: number; text?: string };
      duration?: { value?: number; text?: string };
    }>;
  }>;
};

export function milesFromGoogleDistanceMatrix(
  payload: DistanceMatrixPayload | null | undefined
): MatchravDistanceResult | null {
  if (!payload || payload.status !== "OK") return null;
  const element = payload.rows?.[0]?.elements?.[0];
  if (!element || element.status !== "OK") return null;
  const miles = metersToStatuteMiles(Number(element.distance?.value) || 0);
  if (!(miles > 0)) return null;
  const seconds = Number(element.duration?.value) || 0;
  return {
    miles,
    minutes: seconds > 0 ? secondsToMinutes(seconds) : null,
    source: "google",
    label: GOOGLE_MAPS_DISTANCE_LABEL,
  };
}

export function googleDistanceMatrixUrl({
  origin,
  destination,
  mode,
  apiKey,
}: {
  origin: string;
  destination: string;
  mode: GoogleTravelMode;
  apiKey: string;
}): string {
  const url = new URL(GOOGLE_DISTANCE_MATRIX_URL);
  url.searchParams.set("origins", origin);
  url.searchParams.set("destinations", destination);
  url.searchParams.set("mode", mode);
  url.searchParams.set("units", "imperial");
  url.searchParams.set("region", "uk");
  url.searchParams.set("key", apiKey);
  if (mode === "transit") url.searchParams.set("transit_mode", "train|bus");
  return url.toString();
}

type OsrmPayload = {
  code?: string;
  routes?: Array<{
    distance?: number;
    duration?: number;
  }>;
};

export function milesFromOsrmRoute(
  payload: OsrmPayload | null | undefined
): MatchravDistanceResult | null {
  if (!payload || payload.code !== "Ok") return null;
  const route = payload.routes?.[0];
  const miles = metersToStatuteMiles(Number(route?.distance) || 0);
  if (!(miles > 0)) return null;
  const seconds = Number(route?.duration) || 0;
  return {
    miles,
    minutes: seconds > 0 ? secondsToMinutes(seconds) : null,
    source: "osrm",
    label: "Driving distance",
  };
}

export function osrmRouteUrl({
  from,
  to,
  profile,
}: {
  from: GeoPoint;
  to: GeoPoint;
  profile: "driving" | "walking" | "cycling";
}): string {
  return `${OSRM_ROUTE_URL}/${profile}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`;
}

export async function requestMatchravDistance({
  origin,
  destination,
  mode,
  homeName,
  signal,
}: {
  origin: string;
  destination: string;
  mode: TravelMode;
  homeName?: string | null;
  signal?: AbortSignal;
}): Promise<MatchravDistanceResult | null> {
  const from = origin.trim();
  const to = destination.trim();
  if (!from || !to) return null;
  const params = new URLSearchParams({
    origin: from,
    destination: to,
    mode,
  });
  if (homeName?.trim()) params.set("homeName", homeName.trim());
  const response = await fetch(`${MATCHRAV_DISTANCE_PATH}?${params}`, {
    signal,
    cache: "no-store",
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as Partial<MatchravDistanceResult>;
  const miles = Number(payload.miles);
  if (!Number.isFinite(miles) || miles <= 0) return null;
  const source: MatchravDistanceSource =
    payload.source === "google" || payload.source === "osrm"
      ? payload.source
      : "straight";
  return {
    miles,
    minutes:
      payload.minutes == null || !Number.isFinite(Number(payload.minutes))
        ? null
        : Number(payload.minutes),
    source,
    label: payload.label || distanceLabel(source),
  };
}
