import { readFileSync } from "fs";
import {
  GOOGLE_MAPS_DISTANCE_LABEL,
  MATCHRAV_DISTANCE_PATH,
  MATCHRAV_GOOGLE_MILES_STAMP,
  METERS_PER_STATUTE_MILE,
  googleModeForTravel,
  metersToStatuteMiles,
  milesFromGoogleDistanceMatrix,
  milesFromOsrmRoute,
  osrmRouteUrl,
} from "../app/lib/matchrav-google-distance";
import {
  milesFromOriginToDestination,
  originPoint,
  destinationPoint,
} from "../app/lib/matchrav-journey";
import { stadiumSiteForClub } from "../app/lib/project-site";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  MATCHRAV_GOOGLE_MILES_STAMP === "matchrav-google-miles-v1" &&
    MATCHRAV_DISTANCE_PATH === "/api/fan/matchrav-distance" &&
    GOOGLE_MAPS_DISTANCE_LABEL === "Google Maps driving distance" &&
    googleModeForTravel("car") === "driving" &&
    googleModeForTravel("flight") === null &&
    Math.abs(METERS_PER_STATUTE_MILE - 1609.344) < 0.001,
  "Matchrav uses Google Maps driving miles as the distance reference"
);

const hull = stadiumSiteForClub("Hull City");
const geodesic = milesFromOriginToDestination(
  "EH11 2PB",
  "MKM Stadium, Anlaby Road, Hull (HU3 6HU)",
  {
    id: "hull-brighton",
    date: "2026-11-22",
    kickoff: "14:00",
    homeName: "Hull City",
    awayName: "Brighton & Hove Albion",
    venue: "MKM Stadium",
    competition: "Premier League",
    source: "s4p",
    sourceUrl: null,
  },
  hull
    ? {
        club: hull.name,
        venue: "MKM Stadium",
        address: hull.address,
        postcode: hull.postcode,
        place: hull.place,
        country: hull.country,
        point: hull.point,
      }
    : null
);
assert(
  Math.abs(geodesic - 189.6) < 0.2,
  "The old crow-flies estimate from EH11 2PB to MKM Stadium is 189.6 miles"
);

const google = milesFromGoogleDistanceMatrix({
  status: "OK",
  rows: [
    {
      elements: [
        {
          status: "OK",
          distance: { text: "249 mi", value: 400728 },
          duration: { text: "5 hours 9 mins", value: 18540 },
        },
      ],
    },
  ],
});
assert(
  google?.source === "google" &&
    google.miles === 249 &&
    google.minutes === 309 &&
    metersToStatuteMiles(400728) === 249,
  "Google Maps Distance Matrix 249 mi from EH11 2PB to MKM Stadium is the Matchrav reference"
);

const osrm = milesFromOsrmRoute({
  code: "Ok",
  routes: [{ distance: 400728, duration: 18540 }],
});
assert(
  osrm?.miles === 249 && osrm.source === "osrm",
  "Road routing stores Google-scale miles when a Maps key is not set"
);

const panel = readFileSync("app/components/fan/FanMatchravPanel.tsx", "utf8");
const api = readFileSync("app/api/fan/matchrav-distance/route.ts", "utf8");
assert(
  panel.includes("data-matchrav-google-miles") &&
    panel.includes("GOOGLE_MAPS_DISTANCE_LABEL") &&
    panel.includes("requestMatchravDistance") &&
    !panel.includes("milesFromOriginToDestination(") &&
    api.includes("GOOGLE_MAPS_API_KEY") &&
    api.includes("googleMiles") &&
    api.includes("osrmMiles"),
  "Matchrav fills outbound miles from Google Maps, with road routing as fallback"
);

const from = originPoint("EH11 2PB");
const to = destinationPoint("MKM Stadium", {
  id: "hull-brighton",
  date: "2026-11-22",
  kickoff: "14:00",
  homeName: "Hull City",
  awayName: "Brighton & Hove Albion",
  venue: "MKM Stadium",
  competition: "Premier League",
  source: "s4p",
  sourceUrl: null,
});
async function verifyLiveRoadMiles() {
  if (!from || !to) return;
  const url = osrmRouteUrl({ from, to, profile: "driving" });
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) return;
  const payload = (await response.json()) as {
    code?: string;
    routes?: Array<{ distance?: number }>;
  };
  const live = milesFromOsrmRoute(payload);
  assert(
    Boolean(live && live.miles >= 240 && live.miles <= 260),
    `Live road miles from EH11 2PB to MKM Stadium should be ~249, got ${live?.miles ?? "none"}`
  );
}

verifyLiveRoadMiles()
  .then(() => {
    if (failures.length > 0) {
      console.error("verify-matchrav-google-miles failed:");
      for (const failure of failures) console.error(`- ${failure}`);
      process.exit(1);
    }
    console.log("verify-matchrav-google-miles: ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
