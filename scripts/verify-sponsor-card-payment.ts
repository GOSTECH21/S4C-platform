import { readFileSync } from "fs";
import {
  CARD_PAYMENT_CONFIRMED_COPY,
  CLIMATE_WALLET_CONFIRMATION_COPY,
  PAY_WITH_CARD_LABEL,
  cardPaymentAmountGbp,
  formatCardExpiry,
  formatCardNumber,
  isCardCvcValid,
  isCardExpiryValid,
  isCardNumberValid,
  luhnOk,
} from "../app/lib/sponsor-card-payment";
import { MATCH_DAY_APPROVED_LABEL } from "../app/lib/partner-projects";
import { LEAD_PAY_LABEL } from "../app/lib/lead-sponsor-home";
import { sponsorPayPath, SPONSOR_PAY_PATH } from "../app/lib/routes";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  LEAD_PAY_LABEL === "Pay for these Climate Projects",
  "The third-last sponsor step is Pay for these Climate Projects"
);
assert(
  PAY_WITH_CARD_LABEL === "Pay with your Credit/Debit Card" &&
    CARD_PAYMENT_CONFIRMED_COPY.includes(MATCH_DAY_APPROVED_LABEL) &&
    CLIMATE_WALLET_CONFIRMATION_COPY.includes(
      "Deposit into Climate Sponsorship Wallet"
    ),
  "Wallet deposit is the last action before card payment; payment confirms Approved"
);
assert(
  sponsorPayPath("Hearts") === `${SPONSOR_PAY_PATH}?club=Hearts` &&
    sponsorPayPath("") === SPONSOR_PAY_PATH,
  "Card payment carries the club from the confirmation wallet"
);

assert(
  luhnOk("4242424242424242") &&
    isCardNumberValid("4242 4242 4242 4242") &&
    !isCardNumberValid("4242 4242 4242 4241") &&
    formatCardNumber("4242424242424242") === "4242 4242 4242 4242" &&
    formatCardExpiry("1228") === "12 / 28" &&
    isCardExpiryValid("12 / 28", new Date("2026-10-27T00:00:00.000Z")) &&
    !isCardExpiryValid("13 / 28") &&
    isCardCvcValid("123") &&
    !isCardCvcValid("12"),
  "Stripe test card 4242… is accepted; invalid numbers, expiry and CVC are rejected"
);
assert(
  cardPaymentAmountGbp({ kind: "lead", commitmentFeeGbp: 2500 }) === 2500 &&
    cardPaymentAmountGbp({ kind: "local", paidGbp: 825, sponsorshipGbp: 750 }) ===
      825,
  "Lead pays the Commitment Fee; Local pays the wallet amount including the fee"
);

const wallet = readFileSync("app/sponsor/wallet/page.tsx", "utf8");
const payPage = readFileSync("app/sponsor/pay/page.tsx", "utf8");
const stripe = readFileSync(
  "app/components/sponsor/StripeCardPayment.tsx",
  "utf8"
);
const panel = readFileSync(
  "app/components/sponsor/ClubChosenProjectsPanel.tsx",
  "utf8"
);
const form = readFileSync(
  "app/components/sponsor/ClimateSponsorshipWallet.tsx",
  "utf8"
);
const home = readFileSync(
  "app/components/sponsor/LeadSponsorHome.tsx",
  "utf8"
);
const listingsService = readFileSync(
  "app/services/sponsor-listings.service.ts",
  "utf8"
);

assert(
  wallet.includes("sponsorPayPath") &&
    wallet.includes("stampMatchDayFunding") &&
    wallet.includes("openCardPayment") &&
    !wallet.includes("Sign off this Match Day sponsorship") &&
    !wallet.includes("openLeadSignOffAfterProjects") &&
    form.includes("CLIMATE_WALLET_CONFIRMATION_COPY") &&
    form.includes("Deposit into Climate Sponsorship Wallet"),
  "The wallet is a confirmation page; Deposit opens Stripe rather than a second sign-off tab"
);
assert(
  payPage.includes("StripeCardPayment") &&
    payPage.includes("confirmMatchDayCardPayment") &&
    payPage.includes("PAY_WITH_CARD_LABEL") &&
    stripe.includes("PAY_WITH_CARD_LABEL") &&
    stripe.includes('data-testid="pay-with-card"'),
  "Deposit defaults into a Stripe card form to pay with Credit/Debit Card"
);
assert(
  panel.includes("matchDayProjectApprovalLabel(approved)") &&
    panel.includes("WALLET_PROJECTS_PAID_COPY") &&
    payPage.includes("approved={paid}") &&
    listingsService.includes("paidProjectIdsForClub") &&
    home.includes("isMatchDayCardPaymentConfirmed"),
  "Confirmed card payment flips pending approval to Approved"
);

if (failures.length > 0) {
  console.error("verify-sponsor-card-payment failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-sponsor-card-payment: ok");
