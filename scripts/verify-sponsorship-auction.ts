import {
  campaignHeadline,
  currentSponsorshipAmount,
  formatMatchHeadline,
  formatSponsorshipBadge,
  formatSponsorshipRate,
  OPENING_SPONSORSHIP,
  DEFAULT_MAX_SPONSORSHIP,
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
  "Sponsorship peaks at £10,000 when votes hit 500,000"
);
assert(
  currentSponsorshipAmount({ votesReceived: 250_000 }) === 5500,
  "Halfway to 500,000 votes is £5,500/Goal"
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
  formatSponsorshipBadge({ amount: 10000, scoreLabel: "Goal" }) ===
    "£10,000/Goal (Max)",
  "Peak amount is labelled as the maximum"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Sponsorship auction headlines and vote-scaled amounts passed.");
