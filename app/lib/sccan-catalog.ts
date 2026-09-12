/** 10 UK Climate Partner projects plus 10 international projects for Match Day choice. */

export const SCCAN_SOURCE_URL = "https://sccan.scot/";
export const SCCAN_PARTNER_NAME = "Scottish Communities Climate Action Network";
export const SCCAN_LOCATION_TAG = "SCCAN";
export const UK_LOCATION_TAG = "UK";
export const INTERNATIONAL_LOCATION_TAG = "International";
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

/** Page 1 of the SD selector: UK-based Climate Partner projects. */
export const UK_CLIMATE_PROJECTS: PartnerCatalogProject[] =
  SCCAN_CLIMATE_PROJECTS.slice(0, 10).map((project) => ({
    ...project,
    country: project.country === "Scotland" ? "United Kingdom" : project.country,
    location: UK_LOCATION_TAG,
  }));

/** Page 2 of the SD selector: international Climate Partner projects. */
export const INTERNATIONAL_CLIMATE_PROJECTS: PartnerCatalogProject[] = [
  {
    name: "Ugandan Cookstove",
    description:
      "Distribute efficient cookstoves so households burn less firewood, cut smoke in the home and protect local woodland.",
    category: "Clean Cooking",
    country: "Uganda",
    location: INTERNATIONAL_LOCATION_TAG,
    estimated_co2: 7400,
    funding_goal: 190000,
    featured: false,
    source: "Climate Partner · International",
  },
  {
    name: "Indian Solar Microgrids",
    description:
      "Village microgrids that power homes, clinics and small businesses with rooftop and community solar.",
    category: "Solar Energy",
    country: "India",
    location: INTERNATIONAL_LOCATION_TAG,
    estimated_co2: 11200,
    funding_goal: 260000,
    featured: false,
    source: "Climate Partner · International",
  },
  {
    name: "Bangladesh Cyclone Resilience",
    description:
      "Community shelters, raised gardens and early-warning work so coastal families can live with stronger storms.",
    category: "Resilience",
    country: "Bangladesh",
    location: INTERNATIONAL_LOCATION_TAG,
    estimated_co2: 4800,
    funding_goal: 150000,
    featured: false,
    source: "Climate Partner · International",
  },
  {
    name: "Peru Andean Reforestation",
    description:
      "Native-tree planting with highland communities to restore slopes, water catchments and local livelihoods.",
    category: "Biodiversity",
    country: "Peru",
    location: INTERNATIONAL_LOCATION_TAG,
    estimated_co2: 8900,
    funding_goal: 210000,
    featured: false,
    source: "Climate Partner · International",
  },
  {
    name: "Indonesia Mangrove Restoration",
    description:
      "Replant mangrove belts that store carbon, buffer storm surges and support coastal fisheries.",
    category: "Biodiversity",
    country: "Indonesia",
    location: INTERNATIONAL_LOCATION_TAG,
    estimated_co2: 13600,
    funding_goal: 280000,
    featured: false,
    source: "Climate Partner · International",
  },
  {
    name: "Ghana Agroforestry",
    description:
      "Farmers mix trees with food crops to restore soil, shade cocoa and keep carbon in the landscape.",
    category: "Sustainable Agriculture",
    country: "Ghana",
    location: INTERNATIONAL_LOCATION_TAG,
    estimated_co2: 6200,
    funding_goal: 170000,
    featured: false,
    source: "Climate Partner · International",
  },
  {
    name: "Brazil Atlantic Forest Restoration",
    description:
      "Restore fragments of the Atlantic Forest with native species and community nurseries.",
    category: "Biodiversity",
    country: "Brazil",
    location: INTERNATIONAL_LOCATION_TAG,
    estimated_co2: 15400,
    funding_goal: 320000,
    featured: false,
    source: "Climate Partner · International",
  },
  {
    name: "Nepal Community Hydro",
    description:
      "Small hydropower for mountain villages so lighting, schools and clinics run on clean energy.",
    category: "Renewable Energy",
    country: "Nepal",
    location: INTERNATIONAL_LOCATION_TAG,
    estimated_co2: 5100,
    funding_goal: 175000,
    featured: false,
    source: "Climate Partner · International",
  },
  {
    name: "Philippines Coastal Protection",
    description:
      "Community-led reef, mangrove and shoreline work that cuts flood risk and stores blue carbon.",
    category: "Ocean Cleanup",
    country: "Philippines",
    location: INTERNATIONAL_LOCATION_TAG,
    estimated_co2: 4300,
    funding_goal: 145000,
    featured: false,
    source: "Climate Partner · International",
  },
  {
    name: "Mexico Community Wind",
    description:
      "Shared wind generation that funds local climate projects and displaces diesel in rural towns.",
    category: "Renewable Energy",
    country: "Mexico",
    location: INTERNATIONAL_LOCATION_TAG,
    estimated_co2: 9800,
    funding_goal: 240000,
    featured: false,
    source: "Climate Partner · International",
  },
];

/** 20 projects the Sustainability Director chooses from (10 UK, then 10 international). */
export const SELECTABLE_MATCH_DAY_CATALOG: PartnerCatalogProject[] = [
  ...UK_CLIMATE_PROJECTS,
  ...INTERNATIONAL_CLIMATE_PROJECTS,
];

/** Published catalog: featured Global Schools Solar plus the 20 choosable projects. */
export const PARTNER_MATCH_DAY_CATALOG: PartnerCatalogProject[] = [
  FEATURED_GLOBAL_SCHOOLS_SOLAR,
  ...SELECTABLE_MATCH_DAY_CATALOG,
];

export function isUkCatalogName(name: string | null | undefined): boolean {
  const value = (name ?? "").trim().toLowerCase();
  return UK_CLIMATE_PROJECTS.some((project) => project.name.toLowerCase() === value);
}

export function isInternationalCatalogName(name: string | null | undefined): boolean {
  const value = (name ?? "").trim().toLowerCase();
  return INTERNATIONAL_CLIMATE_PROJECTS.some(
    (project) => project.name.toLowerCase() === value
  );
}

export function isSccanCatalogName(name: string | null | undefined): boolean {
  const value = (name ?? "").trim().toLowerCase();
  return PARTNER_MATCH_DAY_CATALOG.some(
    (project) => project.name.toLowerCase() === value
  );
}
