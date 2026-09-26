/** Local Climate Partner catalogs (10 per country) plus 10 international projects. */

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

function localPartnerProject(
  project: Omit<PartnerCatalogProject, "featured" | "location" | "source"> & {
    location?: string;
    source?: string;
  }
): PartnerCatalogProject {
  return {
    ...project,
    featured: false,
    location: project.location ?? project.country,
    source: project.source ?? `Climate Partner · ${project.country}`,
  };
}

/** Page 1 for Scottish clubs such as Hearts: SCCAN community projects. */
export const SCOTLAND_CLIMATE_PROJECTS: PartnerCatalogProject[] =
  SCCAN_CLIMATE_PROJECTS.slice(0, 10).map((project) => ({
    ...project,
    country: "Scotland",
    location: "Scotland",
  }));

/** @deprecated Use SCOTLAND_CLIMATE_PROJECTS or localClimateProjectsForClub. */
export const UK_CLIMATE_PROJECTS: PartnerCatalogProject[] = SCOTLAND_CLIMATE_PROJECTS;

/** Page 1 for English clubs such as Arsenal. */
export const ENGLAND_CLIMATE_PROJECTS: PartnerCatalogProject[] = [
  localPartnerProject({
    name: "London Community Retrofit",
    description:
      "Street-by-street home insulation and heat-pump advice so London neighbourhoods cut bills and gas use.",
    category: "Renewable Energy",
    country: "England",
    estimated_co2: 9200,
    funding_goal: 240000,
  }),
  localPartnerProject({
    name: "Greater Manchester Bee Network",
    description:
      "Safe cycling and walking routes that replace short car trips across Greater Manchester.",
    category: "Active Travel",
    country: "England",
    estimated_co2: 4100,
    funding_goal: 160000,
  }),
  localPartnerProject({
    name: "Islington Clean Air Schools",
    description:
      "School streets, monitors and planting so children in Islington breathe cleaner air on the way to class.",
    category: "Education",
    country: "England",
    estimated_co2: 1800,
    funding_goal: 85000,
  }),
  localPartnerProject({
    name: "Bristol Community Energy",
    description:
      "Rooftop solar on community buildings in Bristol, with power sold back to fund local climate work.",
    category: "Solar Energy",
    country: "England",
    estimated_co2: 7600,
    funding_goal: 210000,
  }),
  localPartnerProject({
    name: "Liverpool Heat Pump Streets",
    description:
      "Terraced streets in Liverpool switching from gas boilers to shared clean heat.",
    category: "Renewable Energy",
    country: "England",
    estimated_co2: 8800,
    funding_goal: 230000,
  }),
  localPartnerProject({
    name: "Newcastle Urban Tree Canopy",
    description:
      "Street trees and pocket woods that cool neighbourhoods and lock up carbon in Newcastle.",
    category: "Biodiversity",
    country: "England",
    estimated_co2: 3400,
    funding_goal: 120000,
  }),
  localPartnerProject({
    name: "Cornwall Community Wind",
    description:
      "Small community-owned turbines that cut diesel use in Cornish towns and fund local services.",
    category: "Renewable Energy",
    country: "England",
    estimated_co2: 10500,
    funding_goal: 260000,
  }),
  localPartnerProject({
    name: "Birmingham Canal Wildlife Corridors",
    description:
      "Restore canal banks and wetlands through Birmingham so wildlife can move and carbon stays in the soil.",
    category: "Biodiversity",
    country: "England",
    estimated_co2: 2900,
    funding_goal: 110000,
  }),
  localPartnerProject({
    name: "Yorkshire Peatland Restoration",
    description:
      "Block drains and revegetate blanket bog on the Yorkshire moors so peat can store carbon again.",
    category: "Biodiversity",
    country: "England",
    estimated_co2: 14200,
    funding_goal: 310000,
  }),
  localPartnerProject({
    name: "Southwark Community Solar",
    description:
      "Estate rooftops in Southwark generating clean power for residents and community spaces.",
    category: "Solar Energy",
    country: "England",
    estimated_co2: 5400,
    funding_goal: 175000,
  }),
];

/** Page 1 for Italian clubs such as AC Milan. */
export const ITALY_CLIMATE_PROJECTS: PartnerCatalogProject[] = [
  localPartnerProject({
    name: "Milan Rooftop Solar Cooperative",
    description:
      "Shared rooftop solar on schools and housing in Milan so neighbourhoods run more of the day on clean power.",
    category: "Solar Energy",
    country: "Italy",
    estimated_co2: 8700,
    funding_goal: 220000,
  }),
  localPartnerProject({
    name: "Po Valley Agroforestry",
    description:
      "Farmers plant rows of trees through Po Valley fields to restore soil, shade crops and store carbon.",
    category: "Sustainable Agriculture",
    country: "Italy",
    estimated_co2: 6400,
    funding_goal: 180000,
  }),
  localPartnerProject({
    name: "Venice Lagoon Restoration",
    description:
      "Rebuild salt marsh and seagrass in the Venetian lagoon to store blue carbon and buffer acqua alta.",
    category: "Biodiversity",
    country: "Italy",
    estimated_co2: 9100,
    funding_goal: 250000,
  }),
  localPartnerProject({
    name: "Alpine Forest Restoration",
    description:
      "Replant native woodland on Alpine slopes to hold soil, protect villages and lock up carbon.",
    category: "Biodiversity",
    country: "Italy",
    estimated_co2: 7800,
    funding_goal: 200000,
  }),
  localPartnerProject({
    name: "Rome Community Retrofit",
    description:
      "Insulate apartment blocks in Rome and switch shared heating off gas.",
    category: "Renewable Energy",
    country: "Italy",
    estimated_co2: 9900,
    funding_goal: 245000,
  }),
  localPartnerProject({
    name: "Naples Coastal Protection",
    description:
      "Restore shoreline and seagrass beds around the Bay of Naples to cut flood risk and store carbon.",
    category: "Ocean Cleanup",
    country: "Italy",
    estimated_co2: 5200,
    funding_goal: 165000,
  }),
  localPartnerProject({
    name: "Turin District Heating",
    description:
      "Expand clean district heat in Turin so homes leave oil and gas boilers behind.",
    category: "Renewable Energy",
    country: "Italy",
    estimated_co2: 11300,
    funding_goal: 280000,
  }),
  localPartnerProject({
    name: "Tuscany Regenerative Farming",
    description:
      "Olive groves and vineyards in Tuscany rebuild soil carbon with cover crops and compost.",
    category: "Sustainable Agriculture",
    country: "Italy",
    estimated_co2: 4600,
    funding_goal: 140000,
  }),
  localPartnerProject({
    name: "Sardinia Community Wind",
    description:
      "Community-owned wind that funds local services and displaces diesel on the island.",
    category: "Renewable Energy",
    country: "Italy",
    estimated_co2: 12800,
    funding_goal: 300000,
  }),
  localPartnerProject({
    name: "Lombardy Cycle Highways",
    description:
      "Protected cycle routes across Lombardy so commuters leave the car for everyday trips.",
    category: "Active Travel",
    country: "Italy",
    estimated_co2: 3700,
    funding_goal: 150000,
  }),
];

export const SPAIN_CLIMATE_PROJECTS: PartnerCatalogProject[] = [
  localPartnerProject({
    name: "Madrid Rooftop Solar",
    description:
      "School and housing rooftops in Madrid generating daytime power for the neighbourhood.",
    category: "Solar Energy",
    country: "Spain",
    estimated_co2: 9400,
    funding_goal: 235000,
  }),
  localPartnerProject({
    name: "Barcelona Superblock Greening",
    description:
      "Turn streets into green superblocks so Barcelona cuts traffic, heat and emissions.",
    category: "Active Travel",
    country: "Spain",
    estimated_co2: 4200,
    funding_goal: 155000,
  }),
  localPartnerProject({
    name: "Valencia Orchard Restoration",
    description:
      "Restore traditional huerta farmland around Valencia with water-wise crops and soil carbon.",
    category: "Sustainable Agriculture",
    country: "Spain",
    estimated_co2: 5100,
    funding_goal: 160000,
  }),
  localPartnerProject({
    name: "Andalusian Cork Oak Recovery",
    description:
      "Replant cork oak dehesa in Andalusia to store carbon and support rural livelihoods.",
    category: "Biodiversity",
    country: "Spain",
    estimated_co2: 8600,
    funding_goal: 210000,
  }),
  localPartnerProject({
    name: "Basque Coast Wetlands",
    description:
      "Restore estuaries on the Basque coast that buffer storms and lock up blue carbon.",
    category: "Biodiversity",
    country: "Spain",
    estimated_co2: 4700,
    funding_goal: 145000,
  }),
  localPartnerProject({
    name: "Seville Heat-Proof Homes",
    description:
      "Shade, insulation and cool roofs so Seville homes use less air-conditioning in heatwaves.",
    category: "Resilience",
    country: "Spain",
    estimated_co2: 3900,
    funding_goal: 130000,
  }),
  localPartnerProject({
    name: "Catalonia Community Hydro",
    description:
      "Small hydropower on existing weirs that powers hill towns without new dams.",
    category: "Renewable Energy",
    country: "Spain",
    estimated_co2: 7200,
    funding_goal: 190000,
  }),
  localPartnerProject({
    name: "Galicia Forest Firebreaks",
    description:
      "Community firebreaks and native replanting so Galician woods store carbon instead of burning.",
    category: "Resilience",
    country: "Spain",
    estimated_co2: 6800,
    funding_goal: 175000,
  }),
  localPartnerProject({
    name: "Canary Islands Wind and Water",
    description:
      "Island wind that powers desalination and cuts diesel on the Canary Islands.",
    category: "Renewable Energy",
    country: "Spain",
    estimated_co2: 10100,
    funding_goal: 255000,
  }),
  localPartnerProject({
    name: "Zaragoza Canal Biodiversity",
    description:
      "Restore irrigation canals around Zaragoza as wildlife corridors and carbon sinks.",
    category: "Biodiversity",
    country: "Spain",
    estimated_co2: 2800,
    funding_goal: 105000,
  }),
];

export const FRANCE_CLIMATE_PROJECTS: PartnerCatalogProject[] = [
  localPartnerProject({
    name: "Paris Schoolyard Oases",
    description:
      "Unpave and plant Paris schoolyards so they cool streets and absorb rain.",
    category: "Resilience",
    country: "France",
    estimated_co2: 2100,
    funding_goal: 95000,
  }),
  localPartnerProject({
    name: "Lyon District Geothermal",
    description:
      "Shared geothermal heat for apartment blocks in Lyon, replacing gas boilers.",
    category: "Renewable Energy",
    country: "France",
    estimated_co2: 10800,
    funding_goal: 270000,
  }),
  localPartnerProject({
    name: "Marseille Coastal Posidonia",
    description:
      "Protect Mediterranean seagrass meadows off Marseille that store blue carbon.",
    category: "Ocean Cleanup",
    country: "France",
    estimated_co2: 6400,
    funding_goal: 185000,
  }),
  localPartnerProject({
    name: "Brittany Community Tidal",
    description:
      "Small tidal and wind sites owned by Breton communities, cutting imported power.",
    category: "Renewable Energy",
    country: "France",
    estimated_co2: 9700,
    funding_goal: 240000,
  }),
  localPartnerProject({
    name: "Loire Agroforestry Belts",
    description:
      "Tree belts through Loire farms that restore soil, shade livestock and store carbon.",
    category: "Sustainable Agriculture",
    country: "France",
    estimated_co2: 5300,
    funding_goal: 160000,
  }),
  localPartnerProject({
    name: "Lille Cycle Superhighway",
    description:
      "A protected bike highway across Lille so commuters drop the car.",
    category: "Active Travel",
    country: "France",
    estimated_co2: 3300,
    funding_goal: 140000,
  }),
  localPartnerProject({
    name: "Alsace Timber Retrofit",
    description:
      "Local timber and insulation for Alsace homes, cutting winter gas use.",
    category: "Renewable Energy",
    country: "France",
    estimated_co2: 7600,
    funding_goal: 200000,
  }),
  localPartnerProject({
    name: "Camargue Wetland Recovery",
    description:
      "Restore Camargue marshes that lock carbon and shelter migrating birds.",
    category: "Biodiversity",
    country: "France",
    estimated_co2: 8100,
    funding_goal: 215000,
  }),
  localPartnerProject({
    name: "Toulouse Urban Forest",
    description:
      "Dense street-tree planting that cools Toulouse and stores carbon in the city.",
    category: "Biodiversity",
    country: "France",
    estimated_co2: 2700,
    funding_goal: 115000,
  }),
  localPartnerProject({
    name: "Normandy Hedgerow Revival",
    description:
      "Replant bocage hedgerows in Normandy to hold soil, shelter wildlife and store carbon.",
    category: "Biodiversity",
    country: "France",
    estimated_co2: 4400,
    funding_goal: 135000,
  }),
];

export const GERMANY_CLIMATE_PROJECTS: PartnerCatalogProject[] = [
  localPartnerProject({
    name: "Berlin Tenement Retrofit",
    description:
      "Insulate Altbau blocks in Berlin and connect them to clean heat.",
    category: "Renewable Energy",
    country: "Germany",
    estimated_co2: 10200,
    funding_goal: 255000,
  }),
  localPartnerProject({
    name: "Munich District Heating",
    description:
      "Expand Munich's district heat so more homes leave oil and gas behind.",
    category: "Renewable Energy",
    country: "Germany",
    estimated_co2: 12100,
    funding_goal: 290000,
  }),
  localPartnerProject({
    name: "Ruhr Industrial Nature Parks",
    description:
      "Turn former industrial land in the Ruhr into woods and wetlands that store carbon.",
    category: "Biodiversity",
    country: "Germany",
    estimated_co2: 5600,
    funding_goal: 170000,
  }),
  localPartnerProject({
    name: "Hamburg Port Shore Power",
    description:
      "Shore-side electricity so ships in Hamburg stop idling on heavy fuel.",
    category: "Renewable Energy",
    country: "Germany",
    estimated_co2: 13400,
    funding_goal: 320000,
  }),
  localPartnerProject({
    name: "Black Forest Reforestation",
    description:
      "Replant mixed native forest after bark-beetle loss in the Black Forest.",
    category: "Biodiversity",
    country: "Germany",
    estimated_co2: 8900,
    funding_goal: 220000,
  }),
  localPartnerProject({
    name: "Leipzig Community Solar",
    description:
      "Citizen-owned solar on Leipzig schools and warehouses.",
    category: "Solar Energy",
    country: "Germany",
    estimated_co2: 7100,
    funding_goal: 195000,
  }),
  localPartnerProject({
    name: "Rhine Floodplain Revival",
    description:
      "Reconnect Rhine floodplains so they store carbon, cut flood peaks and bring back wildlife.",
    category: "Resilience",
    country: "Germany",
    estimated_co2: 6200,
    funding_goal: 180000,
  }),
  localPartnerProject({
    name: "Cologne Cargo Bike Hubs",
    description:
      "Neighbourhood cargo-bike hubs that replace van deliveries in Cologne.",
    category: "Active Travel",
    country: "Germany",
    estimated_co2: 2400,
    funding_goal: 100000,
  }),
  localPartnerProject({
    name: "Bavarian Bog Restoration",
    description:
      "Rewet Bavarian peat bogs so they stop emitting carbon and store it again.",
    category: "Biodiversity",
    country: "Germany",
    estimated_co2: 11700,
    funding_goal: 275000,
  }),
  localPartnerProject({
    name: "Stuttgart Heat Networks",
    description:
      "Link Stuttgart neighbourhoods to waste-heat and heat-pump networks.",
    category: "Renewable Energy",
    country: "Germany",
    estimated_co2: 9800,
    funding_goal: 250000,
  }),
];

export const USA_CLIMATE_PROJECTS: PartnerCatalogProject[] = [
  localPartnerProject({
    name: "New York Community Solar",
    description:
      "Shared solar for apartment buildings so New York households cut grid fossil power.",
    category: "Solar Energy",
    country: "USA",
    estimated_co2: 11200,
    funding_goal: 280000,
  }),
  localPartnerProject({
    name: "California School Shade and Solar",
    description:
      "Canopy solar over school playgrounds that cools kids and feeds clean power.",
    category: "Solar Energy",
    country: "USA",
    estimated_co2: 8600,
    funding_goal: 230000,
  }),
  localPartnerProject({
    name: "Great Lakes Wetland Recovery",
    description:
      "Restore coastal wetlands that filter water and store carbon around the Great Lakes.",
    category: "Biodiversity",
    country: "USA",
    estimated_co2: 7400,
    funding_goal: 200000,
  }),
  localPartnerProject({
    name: "Texas Community Wind",
    description:
      "Rural community wind that funds local services and displaces fossil generation.",
    category: "Renewable Energy",
    country: "USA",
    estimated_co2: 15100,
    funding_goal: 340000,
  }),
  localPartnerProject({
    name: "Pacific Northwest Forest Thinning",
    description:
      "Community forestry that reduces wildfire risk and keeps carbon in healthier woods.",
    category: "Resilience",
    country: "USA",
    estimated_co2: 9300,
    funding_goal: 245000,
  }),
  localPartnerProject({
    name: "Gulf Coast Mangrove Planting",
    description:
      "Replant mangroves and marshes that buffer hurricanes and store blue carbon.",
    category: "Biodiversity",
    country: "USA",
    estimated_co2: 8200,
    funding_goal: 215000,
  }),
  localPartnerProject({
    name: "Chicago Heat Pump Homes",
    description:
      "Swap gas furnaces for heat pumps in Chicago two-flats and bungalows.",
    category: "Renewable Energy",
    country: "USA",
    estimated_co2: 10100,
    funding_goal: 260000,
  }),
  localPartnerProject({
    name: "Atlanta Tree Equity",
    description:
      "Plant and care for street trees in Atlanta neighbourhoods with the least canopy.",
    category: "Biodiversity",
    country: "USA",
    estimated_co2: 3100,
    funding_goal: 125000,
  }),
  localPartnerProject({
    name: "Colorado River Efficiency",
    description:
      "Farm and city water efficiency that leaves more river in the Colorado basin.",
    category: "Resilience",
    country: "USA",
    estimated_co2: 2700,
    funding_goal: 150000,
  }),
  localPartnerProject({
    name: "Boston Harbor Blue Carbon",
    description:
      "Restore salt marsh around Boston Harbor to store carbon and cut flood risk.",
    category: "Ocean Cleanup",
    country: "USA",
    estimated_co2: 4500,
    funding_goal: 165000,
  }),
];

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

export const LOCAL_CLIMATE_PROJECTS_BY_COUNTRY: Record<
  string,
  PartnerCatalogProject[]
> = {
  Scotland: SCOTLAND_CLIMATE_PROJECTS,
  England: ENGLAND_CLIMATE_PROJECTS,
  Italy: ITALY_CLIMATE_PROJECTS,
  Spain: SPAIN_CLIMATE_PROJECTS,
  France: FRANCE_CLIMATE_PROJECTS,
  Germany: GERMANY_CLIMATE_PROJECTS,
  USA: USA_CLIMATE_PROJECTS,
};

export const ALL_LOCAL_CLIMATE_PROJECTS: PartnerCatalogProject[] = Object.values(
  LOCAL_CLIMATE_PROJECTS_BY_COUNTRY
).flat();

const CATALOG_COUNTRY_FALLBACK: Record<string, string> = {
  Wales: "England",
  "Northern Ireland": "England",
  Ireland: "England",
};

export function localClimateProjectsForCountry(
  country: string | null | undefined
): PartnerCatalogProject[] {
  const label = (country ?? "").trim();
  const mapped = CATALOG_COUNTRY_FALLBACK[label] ?? label;
  return (
    LOCAL_CLIMATE_PROJECTS_BY_COUNTRY[mapped] ?? ENGLAND_CLIMATE_PROJECTS
  );
}

/** 20 projects one Sustainability Director chooses from: 10 local, then 10 international. */
export function selectableCatalogForCountry(
  country: string | null | undefined
): PartnerCatalogProject[] {
  return [
    ...localClimateProjectsForCountry(country),
    ...INTERNATIONAL_CLIMATE_PROJECTS,
  ];
}

/** Default selectable set (Scotland + international) used in tests and fallbacks. */
export const SELECTABLE_MATCH_DAY_CATALOG: PartnerCatalogProject[] =
  selectableCatalogForCountry("Scotland");

/** Published catalog: featured Global Schools Solar plus every local and international project. */
export const PARTNER_MATCH_DAY_CATALOG: PartnerCatalogProject[] = [
  FEATURED_GLOBAL_SCHOOLS_SOLAR,
  ...ALL_LOCAL_CLIMATE_PROJECTS,
  ...INTERNATIONAL_CLIMATE_PROJECTS,
];

export function isUkCatalogName(name: string | null | undefined): boolean {
  const value = (name ?? "").trim().toLowerCase();
  return SCOTLAND_CLIMATE_PROJECTS.some(
    (project) => project.name.toLowerCase() === value
  );
}

export function isLocalCatalogName(
  name: string | null | undefined,
  country?: string | null
): boolean {
  const value = (name ?? "").trim().toLowerCase();
  const list = country
    ? localClimateProjectsForCountry(country)
    : ALL_LOCAL_CLIMATE_PROJECTS;
  return list.some((project) => project.name.toLowerCase() === value);
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
