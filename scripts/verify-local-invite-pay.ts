import { readFileSync } from "fs";
import { sponsorPayPath, SPONSOR_PAY_PATH } from "../app/lib/routes";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const inbox = readFileSync("app/components/sponsor/SponsorInviteInbox.tsx", "utf8");
const listings = readFileSync(
  "app/services/sponsor-listings.service.ts",
  "utf8"
);
const pay = readFileSync("app/sponsor/pay/page.tsx", "utf8");
const wallet = readFileSync("app/sponsor/wallet/page.tsx", "utf8");
const invitations = readFileSync("app/sponsor/invitations/page.tsx", "utf8");
const currentSponsor = readFileSync(
  "app/services/current-sponsor.service.ts",
  "utf8"
);
const apply = readFileSync("apply-local-invite-pay.mjs", "utf8");

assert(
  sponsorPayPath("Rangers") === `${SPONSOR_PAY_PATH}?club=Rangers`,
  "Local invite payment carries the invited club"
);

assert(
  inbox.includes('data-local-invite-pay="local-invite-pay-v1"') &&
    inbox.includes("sponsorPayPath(round.clubName)") &&
    inbox.includes("Proceed to Payment") &&
    inbox.includes("window.location.assign(result.paymentPath)") &&
    inbox.includes("ensureLocalWallet") &&
    !inbox.includes("sponsorWalletPath"),
  "Signed local invites open the card payment page, not the wallet"
);

assert(
  listings.includes("sponsorPayPath(round.clubName)") &&
    listings.includes("ensureLocalWallet") &&
    !listings.includes("sponsorWalletPath(round.clubName)"),
  "Signing a local invite seeds the wallet amount and returns the pay path"
);

assert(
  pay.includes("clubFromQuery || matchLock?.clubName") &&
    pay.includes("ensureLocalWallet") &&
    pay.includes("s4p.sponsor.profile") &&
    pay.includes("StripeCardPayment") &&
    pay.includes("SPONSOR_INVITATIONS_PATH") &&
    wallet.includes("isNewSponsorshipRequest") &&
    wallet.includes("LOCAL_SPONSOR_HOME_PATH") &&
    invitations.includes("getCurrentSponsorWithTimeout") &&
    currentSponsor.includes("getCurrentSponsorWithTimeout"),
  "Pay prefers the invited club and keeps the local session even without Supabase auth"
);

assert(
  apply.includes("cursor/local-invite-pay-18f9") &&
    apply.includes("app/components/sponsor/SponsorInviteInbox.tsx") &&
    apply.includes("app/sponsor/invitations/page.tsx") &&
    apply.includes("app/services/current-sponsor.service.ts"),
  "PC overlay pulls the local invite payment files"
);

if (failures.length > 0) {
  console.error("verify-local-invite-pay failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-local-invite-pay: ok");
