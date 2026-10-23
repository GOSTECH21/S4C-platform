/** Stadium-fan match-day travel estimates. No postcode. No GPS. */

export const STADIUM_TRAVEL_STORAGE = "s4p.stadium-travel-records";
export const FAN_TRAVEL_SESSION_KEY = "s4p.fan-travel-session";

export type TravelMode = "car" | "train" | "local-bus" | "coach" | "walk-cycle";

export const TRAVEL_MODES: Array<{ id: TravelMode; label: string }> = [
  { id: "car", label: "Car" },
  { id: "train", label: "Train" },
  { id: "local-bus", label: "Local bus" },
  { id: "coach", label: "Coach" },
  { id: "walk-cycle", label: "Walk or cycle" },
];

export const CAR_OCCUPANT_CHOICES = [1, 2, 3, 4] as const;

/**
 * Screenshot lock: Car, 30 return miles, 2 people in the car = 6.8 kg CO2e.
 * That is 0.4533… kg CO2e per vehicle-mile, split across occupants.
 */
export const TRAVEL_EXAMPLE = {
  mode: "car" as const,
  miles: 30,
  occupants: 2,
  kgCo2e: 6.8,
};

const CAR_VEHICLE_KG_PER_MILE =
  (TRAVEL_EXAMPLE.kgCo2e * TRAVEL_EXAMPLE.occupants) / TRAVEL_EXAMPLE.miles;

/** kg CO2e per person-mile for non-car modes (DEFRA-style averages). */
const PERSON_MILE_KG: Record<Exclude<TravelMode, "car">, number> = {
  train: 0.056,
  "local-bus": 0.164,
  coach: 0.043,
  "walk-cycle": 0,
};

export type StadiumTravelRecord = {
  id: string;
  sessionId: string;
  supporterId?: string | null;
  club: string;
  matchId: string;
  fixtureName: string;
  venue: string;
  matchDate: string;
  mode: TravelMode;
  miles: number;
  occupants: number;
  kgCo2e: number;
  createdAt: string;
  updatedAt: string;
};

export type StadiumTravelInput = {
  club: string;
  matchId?: string | null;
  fixtureName?: string | null;
  venue?: string | null;
  matchDate?: string | null;
  mode: TravelMode;
  miles: number;
  occupants?: number;
  supporterId?: string | null;
};

function clean(value: string | null | undefined): string {
  return String(value ?? "").trim();
}

function round1(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round(value * 10) / 10;
}

export function clampCarOccupants(value: number | string | null | undefined): number {
  const n = Math.round(Number(value) || 0);
  if (!Number.isFinite(n) || n < 1) return 1;
  if (n > 4) return 4;
  return n;
}

export function parseReturnMiles(value: number | string | null | undefined): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

export function estimateTravelKgCo2e(
  mode: TravelMode,
  miles: number | string | null | undefined,
  occupants?: number | string | null
): number {
  const distance = parseReturnMiles(miles);
  if (distance <= 0 || mode === "walk-cycle") return 0;
  if (mode === "car") {
    const people = clampCarOccupants(occupants);
    return round1((CAR_VEHICLE_KG_PER_MILE * distance) / people);
  }
  return round1(PERSON_MILE_KG[mode] * distance);
}

export function formatTravelKgCo2e(kg: number): string {
  const value = round1(kg);
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function travelModeLabel(mode: TravelMode): string {
  return TRAVEL_MODES.find((row) => row.id === mode)?.label ?? mode;
}

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `travel-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function fanTravelSessionId(): string {
  if (typeof window === "undefined") return "server";
  try {
    const existing = window.localStorage.getItem(FAN_TRAVEL_SESSION_KEY);
    if (existing && existing.trim()) return existing;
    const created = newId();
    window.localStorage.setItem(FAN_TRAVEL_SESSION_KEY, created);
    return created;
  } catch {
    return "anon";
  }
}

function readRecords(): StadiumTravelRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STADIUM_TRAVEL_STORAGE);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StadiumTravelRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRecords(rows: StadiumTravelRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STADIUM_TRAVEL_STORAGE, JSON.stringify(rows));
  } catch {
    // Private mode can block localStorage.
  }
}

function recordKey(row: Pick<StadiumTravelRecord, "sessionId" | "club" | "matchId" | "matchDate">) {
  return `${row.sessionId}::${row.club}::${row.matchId || row.matchDate}`;
}

export function listStadiumTravelRecords(): StadiumTravelRecord[] {
  return readRecords();
}

export function stadiumTravelRecordsForClub(club: string): StadiumTravelRecord[] {
  const name = clean(club).toLowerCase();
  if (!name) return [];
  return readRecords().filter((row) => row.club.trim().toLowerCase() === name);
}

export function saveStadiumTravelRecord(
  input: StadiumTravelInput
): StadiumTravelRecord | null {
  const club = clean(input.club);
  const miles = parseReturnMiles(input.miles);
  if (!club || miles <= 0) return null;
  const mode = input.mode;
  const occupants = mode === "car" ? clampCarOccupants(input.occupants) : 1;
  const now = new Date().toISOString();
  const sessionId = fanTravelSessionId();
  const next: StadiumTravelRecord = {
    id: newId(),
    sessionId,
    supporterId: input.supporterId ?? null,
    club,
    matchId: clean(input.matchId),
    fixtureName: clean(input.fixtureName),
    venue: clean(input.venue),
    matchDate: clean(input.matchDate),
    mode,
    miles,
    occupants,
    kgCo2e: estimateTravelKgCo2e(mode, miles, occupants),
    createdAt: now,
    updatedAt: now,
  };
  const rows = readRecords();
  const key = recordKey(next);
  const index = rows.findIndex((row) => recordKey(row) === key);
  if (index >= 0) {
    next.id = rows[index].id;
    next.createdAt = rows[index].createdAt;
    rows[index] = next;
  } else {
    rows.push(next);
  }
  writeRecords(rows);
  return next;
}
