import { readFileSync } from "fs";
import {
  LOCAL_SIGNOFF_TERMS,
  LOCAL_SPONSOR_TERMS,
  localSignOffSponsorshipGbp,
} from "../app/lib/local-sponsor";
import {
  formatLocalSponsorPayableCopy,
  formatSponsorPayableCopy,
} from "../app/lib/sponsorship-auction";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  formatLocalSponsorPayableCopy({
    sponsorshipGbp: 750,
    clubName: "Hibernian",
  }) === "You pay £750 for this Hibernian Match." &&
    !formatLocalSponsorPayableCopy({
      sponsorshipGbp: 750,
      clubName: "Hibernian",
    }).includes("Goals") &&
    !formatLocalSponsorPayableCopy({
      sponsorshipGbp: 750,
      clubName: "Hibernian",
    }).includes("Base Match Sponsorship"),
  "Local sign-off states the Match amount, not Goals"
);

assert(
  formatSponsorPayableCopy({
    baseAmount: 2000,
    gbpPerGoal: 3000,
    maxAmount: 9000,
    clubName: "Hibernian",
  }).includes("£2,000 Base Match Sponsorship") &&
    formatSponsorPayableCopy({
      baseAmount: 2000,
      gbpPerGoal: 3000,
      clubName: "Hibernian",
    }).includes("even if Hibernian players score no Goals"),
  "Lead sign-off still states Base Match Sponsorship and Goals"
);

assert(
  localSignOffSponsorshipGbp({
    wallet: { sponsorshipGbp: 750 },
    record: { pledgeGbp: 500 },
  }) === 750 &&
    localSignOffSponsorshipGbp({
      wallet: { sponsorshipGbp: 0 },
      record: { pledgeGbp: 750 },
    }) === 750,
  "Local sign-off prefers the Climate Sponsorship Wallet amount"
);

assert(
  LOCAL_SIGNOFF_TERMS.startsWith("S4P Climate Sponsor Terms and Conditions:") &&
    LOCAL_SIGNOFF_TERMS.includes(
      "By signing you agree to sponsor the Club's Match Day carbon footprint offset."
    ) &&
    LOCAL_SIGNOFF_TERMS.includes(
      "The Sustainability Director chooses five Climate Projects for each Match Day."
    ) &&
    LOCAL_SIGNOFF_TERMS.includes(
      "All sponsored Projects (including those that received your monies) will be available to you for your records."
    ) &&
    LOCAL_SIGNOFF_TERMS.includes(
      "Your brand logo is displayed alongside Climate Projects."
    ) &&
    LOCAL_SIGNOFF_TERMS.includes(
      "You may withdraw before kick-off by writing to the club Sustainability Director."
    ) &&
    !LOCAL_SIGNOFF_TERMS.includes("is is") &&
    !LOCAL_SIGNOFF_TERMS.includes("Base Match Sponsorship") &&
    !LOCAL_SIGNOFF_TERMS.includes("per Goal") &&
    !LOCAL_SIGNOFF_TERMS.includes("0–0 pays") &&
    !LOCAL_SIGNOFF_TERMS.includes("Goal Sponsor"),
  "Local sign-off T&Cs are the Climate Sponsor record copy, with no Goals example"
);

assert(
  LOCAL_SPONSOR_TERMS.includes("plus a 10% management fee") &&
    LOCAL_SPONSOR_TERMS.includes("Goal Sponsor") === false,
  "Local registration T&Cs stay the wallet/min-amount copy"
);

const form = readFileSync("app/sponsor/offers/OfferSignOff.tsx", "utf8");
const page = readFileSync("app/sponsor/offers/OfferSignOffPage.tsx", "utf8");
const preview = readFileSync("app/preview/local-signoff/page.tsx", "utf8");

assert(
  form.includes("LOCAL_SIGNOFF_TERMS") &&
    form.includes("localSponsor ? LOCAL_SIGNOFF_TERMS : GOAL_SPONSOR_TERMS") &&
    form.includes("formatLocalSponsorPayableCopy") &&
    form.includes("isLocalClimateSponsor") &&
    form.includes("GOAL_SPONSOR_TERMS") &&
    form.includes("Signed as Local Business Climate Sponsor") &&
    form.includes("Signed as Goal Sponsor"),
  "The sign-off Form switches Local T&Cs and Lead Goal-Sponsor T&Cs"
);

assert(
  page.includes("formatLocalSponsorPayableCopy") &&
    page.includes("isLocalClimateSponsor") &&
    page.includes("formatSponsorPayableCopy"),
  "The sign-off page intro does not use Lead Goals copy for Locals"
);

assert(
  preview.includes("Kokobean Cafe") &&
    preview.includes("sponsorshipGbp: 750") &&
    preview.includes("sponsorshipAmountGbp: 2000") &&
    preview.includes("gbpPerGoal: 3000") &&
    preview.includes("OfferSignOffForm"),
  "The Local sign-off preview uses Kokobean Cafe at £750 against a leftover £2,000/Goal offer"
);

if (failures.length > 0) {
  console.error("verify-local-signoff-terms failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-local-signoff-terms: ok");
