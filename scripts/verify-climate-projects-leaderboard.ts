import { readFileSync } from "fs";
import {
  formatRemainingAmount,
  rankClimateProjectsByVotes,
  remainingAmountAfterVotes,
} from "../app/lib/climate-projects-leaderboard";

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
assert(
  remainingAmountAfterVotes({ totalAmount: 50000, votes: 2, amountPerVote: 1000 }) === 48000,
  "A second Vote reduces the remaining amount again"
);
assert(
  remainingAmountAfterVotes({ totalAmount: 1000, votes: 3, amountPerVote: 0.02 }) === 999.94,
  "Fractional stipulated rates still reduce the remaining amount"
);
assert(formatRemainingAmount(49000) === "£49,000", "Remaining amount is shown in pounds");

const page = readFileSync("app/dashboard/supporter/vote/page.tsx", "utf8");
assert(page.includes("Projects Voted for"), "The Hibernian box is titled Projects Voted for");
assert(!page.includes("Posted for"), "The posted-for box no longer lists posted projects");
assert(
  !page.includes("These are the verified climate projects that you have Voted for") &&
    !page.includes("HistoryCard"),
  "The voted project cards are removed"
);
assert(
  page.includes("ClimateProjectsLeaderboard"),
  "Climate Projects shows a Climate Projects Leaderboard"
);

const board = readFileSync("app/components/fan/ClimateProjectsLeaderboard.tsx", "utf8");
assert(board.includes("Voted Ranking"), "The leaderboard has a Voted Ranking column");
assert(board.includes(">Votes<") || board.includes("Votes"), "The leaderboard has a Votes column");
assert(board.includes(">Vote<") || board.includes('"Vote"'), "The leaderboard has a Vote button");
assert(
  board.includes("Remaining amount"),
  "The leaderboard shows the remaining amount that Votes reduce"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Climate Projects Leaderboard ranks by votes and reduces the remaining amount.");
