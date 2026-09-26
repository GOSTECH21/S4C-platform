import { readFileSync } from "fs";
import {
  formatRemainingAmount,
  rankClimateProjectsByVotes,
  remainingAmountAfterVotes,
} from "../app/lib/climate-projects-leaderboard";
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
assert(page.includes("Projects Voted for"), "The Hibernian box is titled Projects Voted for");
assert(!page.includes("Posted for"), "The posted-for box no longer lists posted projects");
assert(
  page.includes("MatchDayWalletVote"),
  "Climate Projects lets fans take cash from a sponsor wallet"
);

const preview = readFileSync("app/preview/climate-projects/page.tsx", "utf8");
assert(
  preview.includes("MatchDayWalletVote") && preview.includes("Top Cellar"),
  "The Climate Projects preview shows Top Cellar's wallet"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Climate Projects wallet votes move cash from a sponsor wallet into a numbered project.");
