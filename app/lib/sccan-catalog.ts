/** 19 SCCAN community climate projects plus featured Global Schools Solar. */

export const SCCAN_SOURCE_URL = "https://sccan.scot/";
export const SCCAN_PARTNER_NAME = "Scottish Communities Climate Action Network";
export const SCCAN_LOCATION_TAG = "SCCAN";
export const FEATURED_PROJECT_NAME = "Global Schools Solar";

export type PartnerCatalogProject = {
  name: string;
  description: string;
  category: string;
  country: string;
  location: string;
  estimated_co2: number;
  funding_goal: number;
  featured: boolean;
  source: string;
};

export const FEATURED_GLOBAL_SCHOOLS_SOLAR: PartnerCatalogProject = {
  name: FEATURED_PROJECT_NAME,
  description:
    "Install rooftop solar systems in schools around the world so classrooms can run on clean energy.",
  category: "Solar Energy",
  country: "International",
  location: "Featured · S4P",
  estimated_co2: 9600,
  funding_goal: 150000,
  featured: true,
  source: "S4P Featured Climate Project",
};

/** Chosen from SCCAN current projects, Spaces and Member of the Month stories. */
export const SCCAN_CLIMATE_PROJECTS: PartnerCatalogProject[] = [
  {
    name: "Unbound Scotland",
    description:
      "SCCAN and SCDC help communities in all 32 Scottish local authorities take climate action that also supports good health.",
    category: "Community Climate Action",
    country: "Scotland",
    location: SCCAN_LOCATION_TAG,
    estimated_co2: 4200,
    funding_goal: 180000,
    featured: false,
    source: "https://sccan.scot/current-projects/",
  },
  {
    name: "Community Climate Resilience",
    description:
      "An adaptation project with the Network for Social Change so local communities can sustain themselves through climate disruption.",
    category: "Resilience",
    country: "Scotland",
    location: SCCAN_LOCATION_TAG,
    estimated_co2: 3100,
    funding_goal: 125000,
    featured: false,
    source: "https://sccan.scot/current-projects/",
  },
  {
    name: "Building Resilient Communities",
    description:
      "National Lottery workshops, with ITRC tools, that help groups build cohesion and resilience in the climate and nature emergency.",
    category: "Resilience",
    country: "Scotland",
    location: SCCAN_LOCATION_TAG,
    estimated_co2: 2800,
    funding_goal: 90000,
    featured: false,
    source: "https://sccan.scot/current-projects/",
  },
  {
    name: "Climate Communications with Uplift",
    description:
      "A framing handbook and training so SCCAN members can engage people who feel disconnected from climate action and counter misinformation.",
    category: "Education",
    country: "Scotland",
    location: SCCAN_LOCATION_TAG,
    estimated_co2: 1600,
    funding_goal: 75000,
    featured: false,
    source: "https://sccan.scot/current-projects/",
  },
  {
    name: "Vive Climate Community Network",
    description:
      "An ethical online space, with Transition Together, where grassroots climate organisers connect, share and support each other.",
    category: "Education",
    country: "Scotland",
    location: SCCAN_LOCATION_TAG,
    estimated_co2: 900,
    funding_goal: 45000,
    featured: false,
    source: "https://sccan.scot/current-projects/",
  },
  {
    name: "Clean Heat Edinburgh",
    description:
      "A SCCAN Space helping communities plan heat decarbonisation through events, resources and practical local action.",
    category: "Renewable Energy",
    country: "Scotland",
    location: SCCAN_LOCATION_TAG,
    estimated_co2: 8600,
    funding_goal: 220000,
    featured: false,
    source: "https://sccan.scot/spaces/",
  },
  {
    name: "Bridgend Farmhouse",
    description:
      "A community farmhouse in Edinburgh teaching skills, growing food and running climate action from a shared neighbourhood hub.",
    category: "Sustainable Agriculture",
    country: "Scotland",
    location: SCCAN_LOCATION_TAG,
    estimated_co2: 2400,
    funding_goal: 110000,
    featured: false,
    source: "https://sccan.scot/blog/category/1000-better-stories-blog/member-of-the-month-1000-better-stories-blog/",
  },
  {
    name: "South Seeds",
    description:
      "Community climate action on Glasgow’s Southside, helping neighbours cut energy use and grow a fairer local environment.",
    category: "Community Climate Action",
    country: "Scotland",
    location: SCCAN_LOCATION_TAG,
    estimated_co2: 3500,
    funding_goal: 130000,
    featured: false,
    source: "https://sccan.scot/blog/category/1000-better-stories-blog/member-of-the-month-1000-better-stories-blog/",
  },
  {
    name: "360 Centre Cockenzie",
    description:
      "A community vision to turn the former Cockenzie power station site into a renewable-energy campus, wildlife ground and climate centre.",
    category: "Renewable Energy",
    country: "Scotland",
    location: SCCAN_LOCATION_TAG,
    estimated_co2: 18500,
    funding_goal: 400000,
    featured: false,
    source: "https://sccan.scot/blog/member-of-the-month-the-360-centre/",
  },
  {
    name: "Fittie Community Hall and Garden",
    description:
      "Community-owned hall, garden and environmental action in Footdee, Aberdeen, including seed sharing and energy-and-transport fairs.",
    category: "Biodiversity",
    country: "Scotland",
    location: SCCAN_LOCATION_TAG,
    estimated_co2: 1800,
    funding_goal: 85000,
    featured: false,
    source: "https://sccan.scot/blog/member-of-the-month-the-fittie-community-development-trust/",
  },
  {
    name: "Growing Together Craigshill",
    description:
      "Intergenerational community growing in West Lothian, connecting all ages with soil, food and neighbourhood climate action.",
    category: "Sustainable Agriculture",
    country: "Scotland",
    location: SCCAN_LOCATION_TAG,
    estimated_co2: 2100,
    funding_goal: 70000,
    featured: false,
    source: "https://sccan.scot/blog/category/1000-better-stories-blog/member-of-the-month-1000-better-stories-blog/",
  },
  {
    name: "Paws on Plastic",
    description:
      "A Stonehaven initiative that turns regular community walks into plastic clean-ups for cleaner streets, beaches and burns.",
    category: "Ocean Cleanup",
    country: "Scotland",
    location: SCCAN_LOCATION_TAG,
    estimated_co2: 1200,
    funding_goal: 40000,
    featured: false,
    source: "https://sccan.scot/blog/category/1000-better-stories-blog/",
  },
  {
    name: "Porty Community Energy",
    description:
      "Portobello neighbours cutting carbon through low-carbon heat, bike storage and active-travel projects people actually want to join.",
    category: "Renewable Energy",
    country: "Scotland",
    location: SCCAN_LOCATION_TAG,
    estimated_co2: 5400,
    funding_goal: 160000,
    featured: false,
    source: "https://sccan.scot/blog/edinburgh-communities-climate-action-launch-day/",
  },
  {
    name: "Edinburgh Building Retrofit Collective",
    description:
      "Impartial retrofit advice and bulk-buy home improvements so neighbours can warm homes and cut emissions together.",
    category: "Renewable Energy",
    country: "Scotland",
    location: SCCAN_LOCATION_TAG,
    estimated_co2: 9200,
    funding_goal: 250000,
    featured: false,
    source: "https://sccan.scot/blog/edinburgh-communities-climate-action-launch-day/",
  },
  {
    name: "Cargo Bike Movement",
    description:
      "Volunteers move surplus food to pantries, shelters and hostels by cargo bike, cutting van miles and food waste.",
    category: "Active Travel",
    country: "Scotland",
    location: SCCAN_LOCATION_TAG,
    estimated_co2: 2600,
    funding_goal: 95000,
    featured: false,
    source: "https://sccan.scot/blog/edinburgh-communities-climate-action-launch-day/",
  },
  {
    name: "Edinburgh Remakery",
    description:
      "Repair and reuse of electronics, including school tech-donation boxes that keep e-waste out of landfill and tackle digital poverty.",
    category: "Recycling",
    country: "Scotland",
    location: SCCAN_LOCATION_TAG,
    estimated_co2: 3800,
    funding_goal: 140000,
    featured: false,
    source: "https://sccan.scot/blog/edinburgh-communities-climate-action-launch-day/",
  },
  {
    name: "Rhyze Community Mushrooms",
    description:
      "A co-op that turns sawdust, coffee chaff and brewer’s grain into food in a converted shipping container, plus grow-your-own training.",
    category: "Sustainable Agriculture",
    country: "Scotland",
    location: SCCAN_LOCATION_TAG,
    estimated_co2: 1700,
    funding_goal: 80000,
    featured: false,
    source: "https://sccan.scot/blog/edinburgh-communities-climate-action-launch-day/",
  },
  {
    name: "Wee Spoke Hub",
    description:
      "A community bike workshop that teaches repair skills so more people can cycle, run by Shrub Coop in Edinburgh.",
    category: "Active Travel",
    country: "Scotland",
    location: SCCAN_LOCATION_TAG,
    estimated_co2: 2300,
    funding_goal: 65000,
    featured: false,
    source: "https://sccan.scot/blog/edinburgh-communities-climate-action-launch-day/",
  },
  {
    name: "Lauriston Agroecology Farm",
    description:
      "One hundred acres in North West Edinburgh returned to regenerative food growing, biodiversity and community learning.",
    category: "Biodiversity",
    country: "Scotland",
    location: SCCAN_LOCATION_TAG,
    estimated_co2: 6700,
    funding_goal: 200000,
    featured: false,
    source: "https://sccan.scot/blog/edinburgh-communities-climate-action-launch-day/",
  },
];

export const PARTNER_MATCH_DAY_CATALOG: PartnerCatalogProject[] = [
  FEATURED_GLOBAL_SCHOOLS_SOLAR,
  ...SCCAN_CLIMATE_PROJECTS,
];

export function isSccanCatalogName(name: string | null | undefined): boolean {
  const value = (name ?? "").trim().toLowerCase();
  return PARTNER_MATCH_DAY_CATALOG.some(
    (project) => project.name.toLowerCase() === value
  );
}
