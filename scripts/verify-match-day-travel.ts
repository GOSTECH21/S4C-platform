import {
  TRAVEL_EXAMPLE,
  estimateTravelKgCo2e,
  flightHaulForOneWayMiles,
  flightKgPerMile,
  formatTravelKgCo2e,
  listStadiumTravelRecords,
  saveStadiumTravelRecord,
  stadiumTravelRecordsForClub,
} from "../app/lib/match-day-travel";
import { fanLoginPath, safeFanReturnPath } from "../app/lib/routes";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  estimateTravelKgCo2e(
    TRAVEL_EXAMPLE.mode,
    TRAVEL_EXAMPLE.miles,
    TRAVEL_EXAMPLE.occupants
  ) === TRAVEL_EXAMPLE.kgCo2e,
  "Car, 30 return miles, 2 people is 6.8 kg CO2e"
);
assert(
  formatTravelKgCo2e(6.8) === "6.8",
  "The live sheet shows 6.8 kg CO2e for the car example"
);
assert(
  estimateTravelKgCo2e("car", 30, 1) === 13.6,
  "A solo car trip doubles the shared-car footprint"
);
assert(
  estimateTravelKgCo2e("walk-cycle", 30, 1) === 0,
  "Walk or cycle is 0 kg CO2e"
);
assert(estimateTravelKgCo2e("train", 30) > 0, "Train miles produce a footprint");
assert(
  flightHaulForOneWayMiles(180) === "short-haul" &&
    estimateTravelKgCo2e("flight", 180) === 54,
  "Edinburgh to Manchester (180 miles) uses DEFRA short-haul 0.30 kg per mile"
);
assert(
  flightHaulForOneWayMiles(400) === "domestic" &&
    estimateTravelKgCo2e("flight", 400) ===
      Math.round(flightKgPerMile("domestic") * 400 * 10) / 10,
  "Medium UK hops use DEFRA domestic with RF"
);
assert(
  flightHaulForOneWayMiles(1050) === "long-haul" &&
    estimateTravelKgCo2e("flight", 1050) ===
      Math.round(flightKgPerMile("long-haul") * 1050 * 10) / 10,
  "Edinburgh to Barcelona (1050 miles) uses DEFRA long-haul with RF"
);
assert(
  estimateTravelKgCo2e("flight", 400) > estimateTravelKgCo2e("train", 400),
  "A domestic flight has a higher footprint than the train for the same miles"
);
assert(
  estimateTravelKgCo2e("car", 0, 2) === 0,
  "Zero miles is a zero footprint"
);

const store: Record<string, string> = {};
(globalThis as { window?: unknown }).window = {
  localStorage: {
    getItem(key: string) {
      return store[key] ?? null;
    },
    setItem(key: string, value: string) {
      store[key] = value;
    },
    removeItem(key: string) {
      delete store[key];
    },
  },
};

const saved = saveStadiumTravelRecord({
  club: "Arsenal",
  matchId: "arsenal-chelsea",
  fixtureName: "Arsenal vs Chelsea",
  venue: "Emirates Stadium",
  matchDate: "2026-03-16",
  mode: "car",
  miles: 30,
  occupants: 2,
});
assert(Boolean(saved), "A stadium trip is written to the travel record");
assert(saved?.kgCo2e === 6.8, "The saved record stores 6.8 kg CO2e");
assert(
  stadiumTravelRecordsForClub("Arsenal").length === 1,
  "Travel records can be read back for a club"
);
const again = saveStadiumTravelRecord({
  club: "Arsenal",
  matchId: "arsenal-chelsea",
  fixtureName: "Arsenal vs Chelsea",
  venue: "Emirates Stadium",
  matchDate: "2026-03-16",
  mode: "train",
  miles: 40,
  occupants: 1,
});
assert(
  listStadiumTravelRecords().length === 1 && again?.mode === "train",
  "The same fan, club and match upserts one travel record"
);

assert(
  safeFanReturnPath("/supporter/dashboard") === "/supporter/dashboard",
  "My S4P is a safe fan return path"
);
assert(
  safeFanReturnPath("https://evil.example") === null &&
    fanLoginPath("/supporter/dashboard").includes("next="),
  "Fan login only accepts same-origin supporter return paths"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Match-day travel: Car 30 miles / 2 people = 6.8 kg CO2e; stadium trips are recorded."
);
