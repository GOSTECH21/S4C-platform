import { readFileSync } from "fs";
import {
  brandExposureValue,
  brandExposuresFromPosts,
  campaignHeadline,
  currentSponsorshipAmount,
  formatBrandExposureLabel,
  formatGbpPerVote,
  formatMatchFundingLine,
  formatMatchHeadline,
  formatSponsorshipBadge,
  formatSponsorshipRate,
  formatSponsorPayableCopy,
  formatStipulatedRate,
  totalMatchSponsorshipPayable,
  totalSponsorshipPayable,
  DEFAULT_GBP_PER_VOTE,
  DEFAULT_MINIMUM_SPONSORSHIP,
  EXPOSURES_PER_POST,
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
  "Stipulated amount/Climate Project example is £0.02"
);
assert(
  EXPOSURES_PER_POST === 5,
  "Each post to a fan is recorded as 5 brand exposures"
);

const cityTerms = {
  baseAmount: 3000,
  gbpPerGoal: 3000,
  maxAmount: 15000,
};

assert(
  totalMatchSponsorshipPayable({ ...cityTerms, goalsScored: 0 }) === 3000,
  "0–0 still pays the £3,000 Base Match Sponsorship"
);
assert(
  totalMatchSponsorshipPayable({ ...cityTerms, goalsScored: 1 }) === 6000,
  "1–0 pays £3,000 base + £3,000 per Goal = £6,000"
);
assert(
  totalMatchSponsorshipPayable({ ...cityTerms, goalsScored: 2 }) === 9000,
  "2–0 pays £6,000 + another £3,000 = £9,000"
);
assert(
  totalMatchSponsorshipPayable({ ...cityTerms, goalsScored: 5 }) === 15000,
  "Five Goals would be £18,000 but the £15,000 cap binds"
);
assert(
  totalSponsorshipPayable({
    amountPerGoal: 3000,
    goalsScored: 0,
    baseAmount: 3000,
    maxAmount: 15000,
  }) === 3000,
  "totalSponsorshipPayable uses the same base-plus-goals formula"
);

assert(
  currentSponsorshipAmount({
    gbpPerGoal: 3000,
    minimumAmount: 3000,
  }) === 3000,
  "Posted £/Goal is the SD figure, not scaled by votes"
);
assert(
  currentSponsorshipAmount({
    minimumAmount: DEFAULT_MINIMUM_SPONSORSHIP,
  }) === DEFAULT_MINIMUM_SPONSORSHIP,
  "With no posted £/Goal, the badge falls back to the base"
);

assert(
  brandExposuresFromPosts(1) === 5,
  "One post is 1 eyeball and 5 exposures"
);
assert(
  brandExposuresFromPosts(0) === 0,
  "No posts means no recorded brand exposure"
);
assert(
  brandExposureValue({ posts: 1, gbpPerProject: 0.02 }) === 0.1,
  "£0.02/Climate Project × 5 exposures is £0.10 per posted fan"
);
assert(
  formatBrandExposureLabel() === "5 per posted fan",
  "SD form shows exposure as 5 per posted fan, not a typed fan count"
);
assert(
  formatBrandExposureLabel(1) === "5 (1 posted fan × 5)",
  "One posted fan records 5 exposures"
);

assert(
  formatMatchFundingLine(cityTerms) ===
    "£3,000 Base Match Sponsorship · £3,000/Goal · up to a maximum of £15,000",
  "Funding line lists base, per Goal, and the cap"
);
assert(
  formatSponsorPayableCopy({
    baseAmount: 3000,
    gbpPerGoal: 3000,
    maxAmount: 15000,
    clubName: "Manchester City",
  }).includes("even if Manchester City players score no Goals"),
  "Sponsor copy states the base is payable at 0–0"
);

assert(
  formatSponsorshipRate(3000, "Goal") === "£3,000/Goal",
  "Live amount is labelled per scoring event"
);
assert(
  formatSponsorshipBadge({
    amount: 3000,
    scoreLabel: "Goal",
    minimumAmount: 3000,
  }) === "£3,000/Goal",
  "Posted £/Goal is not labelled as a vote-scaled minimum"
);
assert(
  formatGbpPerVote(DEFAULT_GBP_PER_VOTE) === "£0.02",
  "Default stipulated rate is labelled as £0.02"
);
assert(
  formatStipulatedRate(0.02) === "£0.02/Climate Project",
  "SD rate is labelled as amount per Climate Project"
);

const selectPage = readFileSync(
  new URL("../app/club/projects/select/page.tsx", import.meta.url),
  "utf8"
);
assert(
  selectPage.includes("Base Match Sponsorship"),
  "SD form asks for Base Match Sponsorship"
);
assert(
  selectPage.includes("Sponsorship per Goal scored"),
  "SD form asks for Sponsorship per Goal scored"
);
assert(
  selectPage.includes("Up to a Maximum of"),
  "SD form asks for the Maximum cap"
);
assert(
  selectPage.includes("Projected Sponsor/Brand Exposure"),
  "Projected fans who will vote is replaced by Projected Sponsor/Brand Exposure"
);
assert(
  !selectPage.includes("Projected fans who will vote"),
  "SD form no longer asks for a projected fan count"
);
assert(
  selectPage.includes("Stipulated amount / Climate Project"),
  "Stipulated amount is per Climate Project, not per Vote"
);

const terms = readFileSync(
  new URL("../app/sponsor/offers/OfferSignOff.tsx", import.meta.url),
  "utf8"
);
assert(
  terms.includes("even if the club scores no Goals"),
  "Sponsor terms keep the base payable at 0–0"
);
assert(
  !terms.includes("you pay nothing"),
  "Sponsor terms no longer say the sponsor pays nothing if there are no Goals"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Match Day funding: Base + £/Goal, capped; stipulated rate is a 5-exposure counter."
);
