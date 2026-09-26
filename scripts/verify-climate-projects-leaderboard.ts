import { readFileSync } from "fs";
import {
  formatRemainingAmount,
  rankClimateProjectsByVotes,
  remainingAmountAfterVotes,
} from "../app/lib/climate-projects-leaderboard";
import { climateProjectGroupFor } from "../app/lib/climate-project-groups";
import {
  archivePostedProjects,
  mergeNumberedFunding,
  projectsInClimateGroup,
  readProjectArchive,
} from "../app/lib/climate-funding";
import { catalogCategoryForName } from "../app/lib/sccan-catalog";
import {
  allocateWalletVote,
  createLocalWallet,
  remainingGbp,
} from "../app/lib/sponsor-wallet";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const ranked = rankClimateProjectsByVotes([
  { id: "gss", name: "Global Schools Solar", votesReceived: 7 },
  { id: "wee", name: "Wee Spoke Hub", votesReceived: 12 },
  { id: "porty", name: "Porty Community Energy", votesReceived: 9 },
  { id: "retrofit", name: "Edinburgh Building Retrofit Collective", votesReceived: 4 },
]);

assert(ranked[0]?.name === "Wee Spoke Hub" && ranked[0]?.rank === 1, "Most votes ranks first");
assert(ranked[1]?.name === "Porty Community Energy" && ranked[1]?.rank === 2, "Next most votes is second");
assert(
  ranked.map((row) => row.votesReceived).join(",") === "12,9,7,4",
  "Voted Ranking runs from most votes to fewest"
);

assert(
  remainingAmountAfterVotes({ totalAmount: 50000, votes: 0, amountPerVote: 1000 }) === 50000,
  "The remaining amount starts at the club total"
);
assert(
  remainingAmountAfterVotes({ totalAmount: 50000, votes: 1, amountPerVote: 1000 }) === 49000,
  "A Vote reduces the remaining amount by the club-stipulated rate"
);
assert(formatRemainingAmount(49000) === "£49,000", "Remaining amount is shown in pounds");

const wallet = createLocalWallet({
  clubName: "Hibernian",
  brandName: "Top Cellar",
  sponsorshipGbp: 750,
});
const voted = allocateWalletVote({
  wallet,
  projects: [
    { id: "gss", name: "Global Schools Solar", number: 1, fundedGbp: 0, votesReceived: 0 },
    { id: "wee", name: "Wee Spoke Hub", number: 2, fundedGbp: 0, votesReceived: 0 },
  ],
  projectNumber: 2,
});
assert(voted.ok && remainingGbp(voted.ok ? voted.wallet : wallet) === 749.9, "A wallet Vote leaves £749.90");

const page = readFileSync("app/dashboard/supporter/vote/page.tsx", "utf8");
assert(
  page.includes("Project Voted For this Match Day"),
  "The Hibernian box is titled Project Voted For this Match Day"
);
assert(!page.includes("Posted for"), "The posted-for box no longer lists posted projects");
assert(
  !page.includes("ClimateProjectSponsors"),
  "Climate Projects no longer lists Climate Project Sponsors"
);
assert(
  page.includes("Current Climate Project List") &&
    page.includes("formatWalletGbp(project.fundedGbp)"),
  "Current Climate Project List shows the cumulative Received amount"
);
assert(
  page.includes("ClimateProjectGroupFolders"),
  "Climate Projects has Folders of previous climate project groups"
);

const preview = readFileSync("app/preview/climate-projects/page.tsx", "utf8");
const foldersUi = readFileSync(
  "app/lib/climate-project-groups.ts",
  "utf8"
);
assert(
  preview.includes("ClimateProjectGroupFolders") &&
    preview.includes("Current Climate Project List") &&
    preview.includes("Project Voted For this Match Day") &&
    !preview.includes("MatchDayWalletVote") &&
    !preview.includes("Top Cellar"),
  "The Climate Projects preview shows group Folders instead of sponsor wallets"
);
assert(
  foldersUi.includes("Renewable Folder") &&
    readFileSync("app/components/fan/ClimateProjectGroupFolders.tsx", "utf8").includes(
      "Received"
    ),
  "Fans can open the Renewable Folder and see Received for each previous project"
);

assert(
  catalogCategoryForName("Porty Community Energy") === "Renewable Energy",
  "Catalog category is looked up by project name"
);
assert(
  climateProjectGroupFor("Global Schools Solar").id === "renewable-energy",
  "Solar projects sit in the Renewable Folder"
);
assert(
  climateProjectGroupFor("Growing Together Craigshill").id === "renewable-agriculture",
  "Growing projects sit in the Renewable Agriculture Folder"
);
assert(
  climateProjectGroupFor("Fittie Community Hall and Garden").id === "reforestation",
  "Biodiversity projects sit in the Reforestation Folder"
);
assert(
  climateProjectGroupFor("Wee Spoke Hub").id === "active-travel",
  "Bike projects sit in the Active Travel Folder"
);

const leaked = mergeNumberedFunding(
  [
    {
      id: "heat",
      name: "Clean Heat Edinburgh",
      number: 1,
      fundedGbp: 0,
      votesReceived: 0,
    },
  ],
  [
    {
      id: "wee",
      name: "Wee Spoke Hub",
      number: 1,
      fundedGbp: 9,
      votesReceived: 4,
    },
  ]
);
assert(
  leaked[0]?.fundedGbp === 0,
  "A new Match Day five does not inherit the previous project's Received"
);

const memory: Record<string, string> = {};
(globalThis as { window?: { localStorage: { getItem: (key: string) => string | null; setItem: (key: string, value: string) => void } } }).window = {
  localStorage: {
    getItem: (key) => memory[key] ?? null,
    setItem: (key, value) => {
      memory[key] = value;
    },
  },
};

archivePostedProjects(
  "hibs",
  [
    {
      id: "porty-aug",
      name: "Porty Community Energy",
      number: 1,
      fundedGbp: 8.1,
      votesReceived: 11,
    },
    {
      id: "farm-aug",
      name: "Bridgend Farmhouse",
      number: 4,
      fundedGbp: 3.4,
      votesReceived: 5,
    },
  ],
  {
    postedAt: "2026-08-16T12:00:00.000Z",
    matchDate: "2026-08-16",
    windowId: "2026-08-16",
  }
);
archivePostedProjects(
  "hibs",
  [
    {
      id: "gss",
      name: "Global Schools Solar",
      number: 1,
      fundedGbp: 12.5,
      votesReceived: 18,
    },
  ],
  {
    postedAt: "2026-07-12T12:00:00.000Z",
    matchDate: "2026-07-12",
    windowId: "2026-07-12",
  }
);
archivePostedProjects(
  "hibs",
  [
    {
      id: "gss",
      name: "Global Schools Solar",
      number: 1,
      fundedGbp: 0.5,
      votesReceived: 1,
    },
  ],
  {
    postedAt: "2026-09-20T12:00:00.000Z",
    matchDate: "2026-09-20",
    windowId: "2026-09-20",
  }
);

const archive = readProjectArchive("hibs");
const renewable = projectsInClimateGroup(archive, "renewable-energy");
const agriculture = projectsInClimateGroup(archive, "renewable-agriculture");
assert(
  renewable.length === 3,
  "Renewable Folder lists every previous Renewable Energy Project that was posted"
);
assert(
  renewable.some((row) => row.name === "Porty Community Energy" && row.fundedGbp === 8.1),
  "Each previous project shows the money it received during its 5-day Vote"
);
assert(
  renewable.filter((row) => row.name === "Global Schools Solar").length === 2,
  "The same project posted on a later Match Day is a separate 5-day Received row"
);
assert(
  agriculture.length === 1 && agriculture[0]?.fundedGbp === 3.4,
  "Renewable Agriculture Folder lists previous agriculture projects with Received totals"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Climate Projects shows Current Climate Project List and Folders of previous SD-posted projects with 5-day Received totals."
);
