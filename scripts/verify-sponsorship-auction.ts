import {
  campaignHeadline,
  currentSponsorshipAmount,
  expectedSponsorshipFromVotes,
  formatGbpPerVote,
  formatMatchHeadline,
  formatSponsorshipBadge,
  formatSponsorshipRate,
  formatStipulatedRate,
  gbpPerVoteFromExpected,
  totalSponsorshipPayable,
  votesToClearMinimum,
  DEFAULT_GBP_PER_VOTE,
  DEFAULT_MINIMUM_SPONSORSHIP,
  DEFAULT_PROJECTED_VOTES,
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
  DEFAULT_GBP_PER_VOTE === 0.02,
  "Stipulated amount/vote example is £0.02"
);

const arsenalVManCity = { gbpPerVote: 0.02, minimumAmount: 5000 };
assert(
  currentSponsorshipAmount({ votesReceived: 0, ...arsenalVManCity }) === 5000,
  "Arsenal v Man City stays at the £5,000 minimum with no votes"
);
assert(
  currentSponsorshipAmount({
    votesReceived: 100_000,
    ...arsenalVManCity,
  }) === 5000,
  "£0.02 × 100,000 fans = £2,000, so Arsenal v Man City stays at £5,000"
);
assert(
  currentSponsorshipAmount({
    votesReceived: 250_000,
    ...arsenalVManCity,
  }) === 5000,
  "£0.02 × 250,000 fans equals the £5,000 Arsenal v Man City floor"
);
assert(
  currentSponsorshipAmount({
    votesReceived: 300_000,
    ...arsenalVManCity,
  }) === 6000,
  "£0.02 × 300,000 fans lifts Arsenal v Man City to £6,000/Goal"
);
assert(
  totalSponsorshipPayable({ amountPerGoal: 6000, goalsScored: 3 }) === 18000,
  "Sponsor pays £6,000/Goal × 3 Arsenal goals = £18,000"
);
assert(
  totalSponsorshipPayable({ amountPerGoal: 6000, goalsScored: 0 }) === 0,
  "If the sponsored club scores no Goals, the sponsor pays nothing"
);

const arsenalVCoventry = { gbpPerVote: 0.02, minimumAmount: 2000 };
assert(
  currentSponsorshipAmount({
    votesReceived: 50_000,
    ...arsenalVCoventry,
  }) === 2000,
  "Arsenal SD can set a £2,000 minimum vs Coventry when votes would only raise £1,000"
);
assert(
  currentSponsorshipAmount({
    votesReceived: 150_000,
    ...arsenalVCoventry,
  }) === 3000,
  "Arsenal v Coventry rises to £3,000/Goal once 150,000 fans vote"
);

const coventryVArsenal = { gbpPerVote: 0.02, minimumAmount: 4000 };
assert(
  currentSponsorshipAmount({
    votesReceived: 100_000,
    ...coventryVArsenal,
  }) === 4000,
  "Coventry SD can set a £4,000 minimum because Arsenal is a big club coming to town"
);
assert(
  currentSponsorshipAmount({
    votesReceived: 250_000,
    ...coventryVArsenal,
  }) === 5000,
  "Coventry v Arsenal rises to £5,000/Goal at 250,000 votes"
);

assert(
  votesToClearMinimum(arsenalVManCity) === 250_000,
  "Arsenal v Man City needs 250,000 votes at £0.02/Vote to clear the £5,000 floor"
);

assert(
  expectedSponsorshipFromVotes({
    projectedVotes: DEFAULT_PROJECTED_VOTES,
    gbpPerVote: DEFAULT_GBP_PER_VOTE,
  }) === 10_000,
  "500,000 projected votes at £0.02/Vote is a £10,000 vote-based /Goal preview"
);
assert(
  expectedSponsorshipFromVotes({
    projectedVotes: 500_000,
    gbpPerVote: 0.01,
  }) === 5000,
  "SD can still stipulate £0.01/Vote so 500,000 votes preview £5,000/Goal"
);
assert(
  gbpPerVoteFromExpected({
    projectedVotes: 500_000,
    expectedSponsorship: 10000,
  }) === 0.02,
  "Editing the vote-based preview updates the stipulated £/Vote"
);

assert(
  currentSponsorshipAmount({
    votesReceived: 1_000_000,
    gbpPerVote: 0.02,
    minimumAmount: 5000,
  }) === 20_000,
  "Votes above any planning target keep raising £/Goal — there is no maximum cap"
);
assert(
  currentSponsorshipAmount({
    votesReceived: 0,
    gbpPerVote: DEFAULT_GBP_PER_VOTE,
    minimumAmount: DEFAULT_MINIMUM_SPONSORSHIP,
  }) === DEFAULT_MINIMUM_SPONSORSHIP,
  "With no SD match minimum stored, the live amount stays on the default floor"
);

assert(
  formatSponsorshipRate(5000, "Goal") === "£5,000/Goal",
  "Live amount is labelled per scoring event"
);
assert(
  formatSponsorshipBadge({
    amount: 5000,
    scoreLabel: "Goal",
    minimumAmount: 5000,
  }) === "£5,000/Goal (Min)",
  "Amount at the SD minimum is labelled as the minimum"
);
assert(
  formatSponsorshipBadge({
    amount: 6000,
    scoreLabel: "Goal",
    minimumAmount: 5000,
  }) === "£6,000/Goal",
  "Amount above the minimum is not labelled as a maximum"
);
assert(
  formatGbpPerVote(DEFAULT_GBP_PER_VOTE) === "£0.02",
  "Default stipulated rate is labelled as £0.02"
);
assert(
  formatStipulatedRate(0.02) === "£0.02/Vote",
  "SD rate is labelled as amount per Vote"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Goal-scored funding: SD £/Vote × fans who voted, floored at match minimum."
);
