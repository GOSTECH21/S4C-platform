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
  formatLocalSponsorPayableCopy,
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
  DEFAULT_GBP_PER_VOTE === 0.2,
  "Each FUND-IT from a Climate Sponsorship Wallet is £0.20"
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
  "Historic 0–0 still pays the £3,000 Match-Sponsorship"
);
assert(
  totalMatchSponsorshipPayable({ ...cityTerms, goalsScored: 1 }) === 3000,
  "A score does not add Match-Sponsorship beyond the fixed amount"
);
assert(
  totalMatchSponsorshipPayable({ ...cityTerms, goalsScored: 2 }) === 3000,
  "Further scores do not create additional sponsor liabilities"
);
assert(
  totalMatchSponsorshipPayable({ ...cityTerms, goalsScored: 5 }) === 3000,
  "Five Goals still pay only the fixed £3,000 Match-Sponsorship"
);
assert(
  totalSponsorshipPayable({
    amountPerGoal: 3000,
    goalsScored: 0,
    baseAmount: 3000,
    maxAmount: 15000,
  }) === 3000,
  "totalSponsorshipPayable uses the fixed Match-Sponsorship amount"
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
  formatMatchFundingLine({ baseAmount: 3000 }) === "£3,000 Match-Sponsorship" &&
    formatMatchFundingLine({
      baseAmount: 2500,
      gbpPerGoal: 2000,
      maxAmount: 8000,
    }) === "£2,500 Match-Sponsorship" &&
    !formatMatchFundingLine({
      baseAmount: 2500,
      gbpPerGoal: 2000,
      maxAmount: 8000,
    }).includes("/Goal"),
  "Funding line is one Match-Sponsorship amount"
);
assert(
  formatSponsorPayableCopy({
    baseAmount: 4000,
    clubName: "Manchester City",
  }).includes("5%") &&
    formatSponsorPayableCopy({
      baseAmount: 4000,
      clubName: "Manchester City",
    }).includes("£4,200"),
  "Sponsor copy states Match-Sponsorship plus the 5% Platform Fee"
);
assert(
  formatSponsorPayableCopy({
    baseAmount: 4000,
    clubName: "Hearts",
  }).includes("£4,000 Match-Sponsorship") &&
    formatSponsorPayableCopy({
      baseAmount: 4000,
      clubName: "Hearts",
    }).includes("via Stripe") &&
    !formatSponsorPayableCopy({
      baseAmount: 2500,
      gbpPerGoal: 2000,
      maxAmount: 8000,
      clubName: "Fulham",
    }).includes("each Goal") &&
    !formatSponsorPayableCopy({
      baseAmount: 2500,
      gbpPerGoal: 2000,
      maxAmount: 8000,
      clubName: "Fulham",
    }).includes("/Goal"),
  "Hearts sign-off copy is one Match-Sponsorship plus Platform Fee via Stripe"
);
assert(
  formatLocalSponsorPayableCopy({
    sponsorshipGbp: 750,
    clubName: "Hibernian",
  }) === "You pay £750 for this Hibernian Match.",
  "Local Business Climate Sponsors pay the Match amount, not Goals"
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
  formatGbpPerVote(DEFAULT_GBP_PER_VOTE) === "£0.20",
  "Default FUND-IT amount is labelled as £0.20"
);
assert(
  formatStipulatedRate(0.2) === "£0.20/Climate Project",
  "FUND-IT is labelled as £0.20 per Climate Project"
);

const selectPage = readFileSync(
  new URL("../app/club/projects/select/page.tsx", import.meta.url),
  "utf8"
);
assert(
  !selectPage.includes("Goal-scored funding for this Match") &&
    !selectPage.includes("Base Match Sponsorship") &&
    !selectPage.includes("Sponsorship per Goal scored") &&
    !selectPage.includes("Up to a Maximum of"),
  "Club Climate Projects no longer asks the SD to set Goal-scored funding"
);
assert(
  selectPage.includes("FUND_IT_LABEL") &&
    selectPage.includes("DEFAULT_WALLET_VOTE_GBP") &&
    selectPage.includes("leadWalletMatchFunding") &&
    selectPage.includes("Confirm ${MATCH_DAY_PROJECT_COUNT} Climate Projects"),
  "Club Climate Projects keeps £0.20 FUND-IT and confirms the six projects"
);
assert(
  !selectPage.includes("Projected fans who will vote"),
  "SD form no longer asks for a projected fan count"
);

const terms = readFileSync(
  new URL("../app/sponsor/offers/OfferSignOff.tsx", import.meta.url),
  "utf8"
);
assert(
  terms.includes("one fixed Match-Sponsorship amount") &&
    terms.includes("5% Platform Fee") &&
    terms.includes("£4,200") &&
    terms.includes("Score Impact Pool") &&
    terms.includes("Fan Participation Pool"),
  "Sponsor terms are one Match-Sponsorship plus the 5% Platform Fee with 80/20 pools"
);
assert(
  !terms.includes("you pay nothing") &&
    !terms.includes("even if the club scores no Goals"),
  "Sponsor terms no longer use the Base Match plus Goals formula"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Match Day funding: one Match-Sponsorship plus 5% Platform Fee; club page keeps £0.20 FUND-IT."
);
