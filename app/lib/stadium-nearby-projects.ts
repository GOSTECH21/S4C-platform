import type { PartnerCatalogProject } from "@/app/lib/sccan-catalog";
import {
  LISTED_PROJECT_SITES,
  STADIUM_NEARBY_PROJECT_COUNT,
  STADIUM_NEARBY_PROJECT_MILES,
  milesBetweenPoints,
  nearbyProjectsForClub,
  normalizePostcode,
  registerPointForPostcode,
  stadiumSiteForClub,
  toRadians,
  type GeoPoint,
  type StadiumSite,
} from "@/app/lib/project-site";

/** Location tag so nearby placeholders are not mixed into Climate Partner uploads. */
export const NEAR_STADIUM_LOCATION_TAG = "S4P Near Stadium";

export function isNearStadiumListing(project: {
  location?: string | null;
  source?: string | null;
}): boolean {
  const blob = `${project.location ?? ""} ${project.source ?? ""}`;
  return /s4p near stadium/i.test(blob) || /climate partner · near /i.test(blob);
}

type NearbyTemplate = {
  title: string;
  description: string;
  category: string;
  estimated_co2: number;
  funding_goal: number;
};

const STADIUM_NEARBY_TEMPLATES: NearbyTemplate[] = [
  {
    title: "Community Rooftop Solar",
    description:
      "Rooftop solar on homes, halls and workshops within a short trip of the stadium so local buildings run on clean power.",
    category: "Solar Energy",
    estimated_co2: 5400,
    funding_goal: 165000,
  },
  {
    title: "School Streets Clean Air",
    description:
      "School streets, monitors and planting so children near the ground breathe cleaner air on the way to class.",
    category: "Education",
    estimated_co2: 1800,
    funding_goal: 85000,
  },
  {
    title: "Street Tree Canopy",
    description:
      "Street trees and pocket woods that cool neighbourhoods around the stadium and lock up carbon.",
    category: "Biodiversity",
    estimated_co2: 3200,
    funding_goal: 120000,
  },
  {
    title: "Heat Pump Streets",
    description:
      "Terraced streets switching from gas boilers to shared clean heat within walking distance of the ground.",
    category: "Renewable Energy",
    estimated_co2: 8800,
    funding_goal: 230000,
  },
  {
    title: "Active Travel Corridors",
    description:
      "Safe cycling and walking routes that replace short car trips on match days and every other day.",
    category: "Active Travel",
    estimated_co2: 4100,
    funding_goal: 160000,
  },
  {
    title: "Home Retrofit Streets",
    description:
      "Street-by-street insulation and draught-proofing so nearby homes cut bills and gas use.",
    category: "Renewable Energy",
    estimated_co2: 7600,
    funding_goal: 210000,
  },
  {
    title: "Parkland Restoration",
    description:
      "Restore parkland and playing fields near the stadium for wildlife, cooling and community use.",
    category: "Biodiversity",
    estimated_co2: 2900,
    funding_goal: 110000,
  },
  {
    title: "River Wildlife Corridor",
    description:
      "Restore river and canal banks so wildlife can move and carbon stays in the soil.",
    category: "Biodiversity",
    estimated_co2: 3100,
    funding_goal: 125000,
  },
  {
    title: "Community Food Growing",
    description:
      "Allotments and market gardens that shorten food miles and rebuild soil around the stadium.",
    category: "Sustainable Agriculture",
    estimated_co2: 1700,
    funding_goal: 80000,
  },
  {
    title: "E-bike and Cycle Hub",
    description:
      "A community cycle hub with repair, hire and e-bikes so more fans leave the car at home.",
    category: "Active Travel",
    estimated_co2: 2300,
    funding_goal: 65000,
  },
  {
    title: "Reuse and Repair Hub",
    description:
      "Repair and reuse of bikes, clothes and electronics so waste stays out of landfill.",
    category: "Recycling",
    estimated_co2: 3800,
    funding_goal: 140000,
  },
  {
    title: "Flood-resilient Streets",
    description:
      "Rain gardens and raised paths that help nearby streets live with heavier rain.",
    category: "Resilience",
    estimated_co2: 2100,
    funding_goal: 95000,
  },
  {
    title: "Community Hall Insulation",
    description:
      "Insulate local halls and changing rooms so they leave oil and gas heating behind.",
    category: "Renewable Energy",
    estimated_co2: 4600,
    funding_goal: 135000,
  },
  {
    title: "Rain Gardens and SUDS",
    description:
      "Sustainable drainage that soaks up stormwater on streets around the stadium.",
    category: "Resilience",
    estimated_co2: 1600,
    funding_goal: 75000,
  },
  {
    title: "Local Community Energy",
    description:
      "A neighbourhood energy co-op that owns solar and spends the surplus on local climate work.",
    category: "Renewable Energy",
    estimated_co2: 6200,
    funding_goal: 175000,
  },
  {
    title: "Wetland Restoration",
    description:
      "Rewet local marsh and pond sites so they store carbon and buffer flood peaks.",
    category: "Biodiversity",
    estimated_co2: 6700,
    funding_goal: 190000,
  },
  {
    title: "Bike Repair Workshop",
    description:
      "A drop-in workshop that teaches repair skills so more people can cycle to the match.",
    category: "Active Travel",
    estimated_co2: 1400,
    funding_goal: 55000,
  },
  {
    title: "Estate Solar Co-op",
    description:
      "Shared rooftop solar on nearby estates, with power sold back to fund community climate work.",
    category: "Solar Energy",
    estimated_co2: 5100,
    funding_goal: 155000,
  },
  {
    title: "Playground Nature Sites",
    description:
      "Turn nearby playgrounds and school yards into nature sites that cool streets and store carbon.",
    category: "Biodiversity",
    estimated_co2: 1200,
    funding_goal: 60000,
  },
  {
    title: "Shared Clean Heat Loop",
    description:
      "A shared heat loop for streets around the stadium so homes leave gas boilers behind.",
    category: "Renewable Energy",
    estimated_co2: 9900,
    funding_goal: 245000,
  },
];

function offsetPoint(origin: GeoPoint, index: number): GeoPoint {
  const miles = 2.4 + (index % 7) * 2.3;
  const bearingDeg = (index * 137.5) % 360;
  const latMiles = 69;
  const lngMiles = Math.max(0.2, 69 * Math.cos(toRadians(origin.lat)));
  const rad = toRadians(bearingDeg);
  return {
    lat: origin.lat + (miles * Math.cos(rad)) / latMiles,
    lng: origin.lng + (miles * Math.sin(rad)) / lngMiles,
  };
}

function nearbyPostcode(stadiumPostcode: string, index: number): string {
  const key = normalizePostcode(stadiumPostcode);
  const outward = key.split(" ")[0] || "XX1";
  const digit = (index % 9) + 1;
  const a = String.fromCharCode(65 + (index % 26));
  const b = String.fromCharCode(65 + ((index * 3) % 26));
  return `${outward} ${digit}${a}${b}`;
}

function placeLabel(stadium: StadiumSite): string {
  return stadium.place || stadium.name;
}

export function syntheticNearbyProjectsForStadium(
  stadium: StadiumSite
): PartnerCatalogProject[] {
  const place = placeLabel(stadium);
  const country = stadium.country || "England";
  return STADIUM_NEARBY_TEMPLATES.map((template, index) => {
    const point = offsetPoint(stadium.point, index);
    const postcode = nearbyPostcode(stadium.postcode, index);
    registerPointForPostcode(postcode, point);
    const miles = milesBetweenPoints(stadium.point, point);
    return {
      name: `${place} ${template.title}`,
      description: `${template.description} About ${miles.toFixed(1)} miles from ${stadium.address.split(",")[0]}.`,
      category: template.category,
      country,
      location: NEAR_STADIUM_LOCATION_TAG,
      estimated_co2: template.estimated_co2,
      funding_goal: template.funding_goal,
      featured: false,
      source: `Climate Partner · Near ${stadium.address.split(",")[0]}`,
      postcode,
      address: `${template.title} site, ${place}`,
    };
  });
}

/** Public listing sites that are not yet in a country catalog still count as nearby. */
function listedSitesAsCatalogProjects(): PartnerCatalogProject[] {
  return LISTED_PROJECT_SITES.map((site) => ({
    name: site.name,
    description: `A listed climate project at ${site.address}.`,
    category: "Climate Action",
    country: site.country || "England",
    location: NEAR_STADIUM_LOCATION_TAG,
    estimated_co2: 3000,
    funding_goal: 100000,
    featured: false,
    source: `Climate Partner · Near ${site.address.split(",")[0]}`,
    postcode: site.postcode,
    address: site.address,
  }));
}

/**
 * 20 Climate Projects within 20 miles of the club stadium.
 * Until signed-up Climate Project Partners submit listings, catalog
 * placeholders and public sites fill this list.
 */
export function nearbyClimateProjectsForClub(
  clubName: string | null | undefined,
  extra: PartnerCatalogProject[] = []
): PartnerCatalogProject[] {
  const stadium = stadiumSiteForClub(clubName);
  if (!stadium) return [];
  const generated = syntheticNearbyProjectsForStadium(stadium);
  const seen = new Set<string>();
  const pool: PartnerCatalogProject[] = [];
  for (const project of [...extra, ...listedSitesAsCatalogProjects(), ...generated]) {
    const key = project.name.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    pool.push(project);
  }
  return nearbyProjectsForClub(
    pool,
    clubName,
    STADIUM_NEARBY_PROJECT_MILES
  )
    .map((row) => row.project)
    .slice(0, STADIUM_NEARBY_PROJECT_COUNT);
}
