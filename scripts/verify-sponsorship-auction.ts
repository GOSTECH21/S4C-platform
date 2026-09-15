import {
  campaignHeadline,
  currentSponsorshipAmount,
  expectedSponsorshipFromVotes,
  formatGbpPerVote,
  formatMatchHeadline,
  formatSponsorshipBadge,
  formatSponsorshipRate,
  gbpPerVoteFromExpected,
  OPENING_SPONSORSHIP,
  DEFAULT_MAX_SPONSORSHIP,
  DEFAULT_GBP_PER_VOTE,
  DEFAULT_PROJECTED_VOTES,
  VOTE_TARGET_FOR_MAX,
} from "../app/lib/sponsorship-auction";

const failures: string[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  formatMatchHeadline("Arsenal vs Chelsea Climate Campaign") ===
    "Arsenal v Chelsea",
  "Arsenal vs Chelsea campaign title becomes Arsenal v Chelsea"
);
assert(
  campaignHeadline("Arsenal vs Chelsea Climate Campaign") ===
    "Arsenal v Chelsea Climate Campaign",
  "Campaign heading stays dynamic from the match title"
);
assert(
  campaignHeadline("Hearts of Midlothian FC vs St Mirren") ===
    "Hearts v St Mirren Climate Campaign",
  "Hearts v St Mirren uses the match-day short names"
);
assert(
  campaignHeadline("Manchester City versus Manchester United") ===
    "Man City v Man United Climate Campaign",
  "Man City v Man United heading follows the fixture"
);
assert(
  currentSponsorshipAmount({ votesReceived: 0 }) === OPENING_SPONSORSHIP,
  "Opening bid is £1,000/Goal at zero votes"
);
assert(
  currentSponsorshipAmount({ votesReceived: VOTE_TARGET_FOR_MAX }) ===
    DEFAULT_MAX_SPONSORSHIP,
  "Sponsorship peaks at £5,000 when 500,000 votes are projected at £0.01/vote"
);
assert(
  currentSponsorshipAmount({ votesReceived: 250_000 }) === 3000,
  "Halfway to 500,000 votes is £3,000/Goal between £1,000 and £5,000"
);
assert(
  expectedSponsorshipFromVotes({
    projectedVotes: DEFAULT_PROJECTED_VOTES,
    gbpPerVote: DEFAULT_GBP_PER_VOTE,
  }) === 5000,
  "500,000 votes at £0.01/vote is £5,000 Sponsorship/Goal"
);
assert(
  expectedSponsorshipFromVotes({
    projectedVotes: 500_000,
    gbpPerVote: 0.02,
  }) === 10000,
  "SD can set £0.02/vote so 500,000 votes become £10,000/Goal"
);
assert(
  gbpPerVoteFromExpected({
    projectedVotes: 500_000,
    expectedSponsorship: 10000,
  }) === 0.02,
  "Editing expected Sponsorship/Goal updates the £/vote rate"
);
assert(
  currentSponsorshipAmount({
    votesReceived: 500_000,
    openingAmount: OPENING_SPONSORSHIP,
    maxAmount: 10000,
    voteTarget: 500_000,
  }) === 10000,
  "Fans see £10,000/Goal when the SD sets £0.02/vote"
);
assert(
  currentSponsorshipAmount({ votesReceived: 1_000_000 }) ===
    DEFAULT_MAX_SPONSORSHIP,
  "Votes above the target stay capped at the max bid"
);
assert(
  formatSponsorshipRate(1000, "Goal") === "£1,000/Goal",
  "Live amount is labelled per scoring event"
);
assert(
  formatSponsorshipBadge({ amount: 1000, scoreLabel: "Goal" }) ===
    "£1,000/Goal (Min)",
  "Opening amount is labelled as the minimum"
);
assert(
  formatSponsorshipBadge({ amount: 5000, scoreLabel: "Goal" }) ===
    "£5,000/Goal (Max)",
  "Default peak is labelled as the maximum"
);
assert(
  formatGbpPerVote(DEFAULT_GBP_PER_VOTE) === "£0.01",
  "Default rate is labelled as £0.01/vote"
);
assert(
  formatGbpPerVote(0.02) === "£0.02",
  "SD can raise the rate to £0.02/vote"
);
assert(
  formatSponsorshipBadge({ amount: 10000, scoreLabel: "Goal", maxAmount: 10000 }) ===
    "£10,000/Goal (Max)",
  "Peak amount is labelled as the maximum"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Sponsorship auction headlines and vote-scaled amounts passed.");
