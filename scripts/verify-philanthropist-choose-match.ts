import { readFileSync } from "fs";
import {
  applyPhilanthropistMatchGifts,
  PHILANTHROPIST_AMOUNT_LABEL,
  PHILANTHROPIST_INVITE_COPY,
  PHILANTHROPIST_MIN_GBP,
  PHILANTHROPIST_SPONSOR_COPY,
  PHILANTHROPIST_SPONSOR_CTA,
  PHILANTHROPIST_SPONSOR_HEADING,
  philanthropistFundingGbp,
  philanthropistGiftCopy,
  upsertPhilanthropistMatch,
  withoutBorrowedLocalGifts,
  type PhilanthropistRecord,
} from "../app/lib/philanthropist";
import { philanthropistAdminSnapshot } from "../app/lib/philanthropist-admin";
import {
  PHILANTHROPIST_HOME_PATH,
  PHILANTHROPIST_SPONSOR_ID,
  PHILANTHROPIST_SPONSOR_PATH,
  philanthropistNewSponsorshipPath,
} from "../app/lib/routes";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const smith: PhilanthropistRecord = {
  name: "Alex Smith",
  organisation: "The Smith Foundation",
  email: "alex@smith-foundation.test",
  clubName: "Brighton & Hove Albion",
  giftGbp: 17500,
  createdAt: "2026-11-16T10:00:00.000Z",
};

const withMatch = applyPhilanthropistMatchGifts(smith, [
  {
    clubName: "Brighton & Hove Albion",
    fixtureName: "Hull City vs Brighton",
    amountGbp: 17500,
    date: "2026-11-21",
  },
]);

assert(
  PHILANTHROPIST_MIN_GBP === 1 &&
    PHILANTHROPIST_SPONSOR_HEADING === "Select a Club and a Match" &&
    PHILANTHROPIST_INVITE_COPY.includes("Sustainability Director") &&
    PHILANTHROPIST_INVITE_COPY.includes("Invitation") &&
    PHILANTHROPIST_SPONSOR_COPY.includes("Choose the Club") &&
    PHILANTHROPIST_SPONSOR_COPY.includes("choose the Match") &&
    PHILANTHROPIST_SPONSOR_COPY.includes("how much money") &&
    PHILANTHROPIST_SPONSOR_CTA === "Put into Carbon Wallet" &&
    PHILANTHROPIST_AMOUNT_LABEL.includes("How much you are putting") &&
    PHILANTHROPIST_SPONSOR_PATH ===
      `${PHILANTHROPIST_HOME_PATH}#${PHILANTHROPIST_SPONSOR_ID}`,
  "Philanthropist copy asks them to choose Club, Match and amount"
);

assert(
  withMatch.matchSponsorships?.length === 1 &&
    withMatch.matchSponsorships?.[0]?.fixtureName === "Hull City vs Brighton" &&
    withMatch.giftGbp === 17500 &&
    philanthropistFundingGbp(withMatch) === 17500,
  "A chosen Match is stored on the philanthropist record with its amount"
);

const twoClubs = upsertPhilanthropistMatch(withMatch, {
  clubName: "Rangers",
  fixtureName: "Rangers vs Celtic",
  amountGbp: 5000,
  date: "2026-12-15",
});
assert(
  philanthropistFundingGbp(twoClubs) === 22500 &&
    twoClubs.clubName === "Rangers" &&
    (twoClubs.matchSponsorships?.length ?? 0) === 2,
  "A logged-in philanthropist can add another Club and Match later"
);

const snapshot = philanthropistAdminSnapshot({
  record: withMatch,
  now: "2026-11-16T12:00:00.000Z",
});
assert(
  snapshot.matches.length === 1 &&
    snapshot.matches[0]?.fixtureName.includes("Hull City") &&
    snapshot.matches[0]?.amountLabel === "£17,500" &&
    snapshot.clubs.length === 1 &&
    snapshot.clubs[0]?.giftLabel === "£17,500",
  "My S4P Admin lists the Match the philanthropist chose, not an auto-filled fixture list"
);

const copy = philanthropistGiftCopy(withMatch);
assert(
  copy.includes("Hull City vs Brighton") &&
    copy.includes("£17,500") &&
    copy.includes("Brighton & Hove Albion") &&
    copy.includes("Philanthropist Carbon Wallet"),
  "Gift copy names the chosen Match and amount"
);

const register = readFileSync(
  "app/sponsor/philanthropist/register/page.tsx",
  "utf8"
);
const home = readFileSync("app/sponsor/philanthropist/page.tsx", "utf8");
const gift = readFileSync(
  "app/components/sponsor/PhilanthropistMatchGift.tsx",
  "utf8"
);
const login = readFileSync("app/sponsor/login/page.tsx", "utf8");
const wallet = readFileSync("app/sponsor/wallet/page.tsx", "utf8");
const dashboard = readFileSync("app/sponsor/dashboard/page.tsx", "utf8");
const fromMatch = readFileSync("app/sponsor/from-match/page.tsx", "utf8");
const picker = readFileSync(
  "app/components/sponsor/MatchSponsorshipPicker.tsx",
  "utf8"
);
const preview = readFileSync(
  "app/preview/philanthropist-admin/page.tsx",
  "utf8"
);

assert(
  register.includes("ClubNetworkPicker") &&
    register.includes("MatchSponsorshipPicker") &&
    register.includes("HowS4pSelectMatch") &&
    register.includes("Select the Club you wish to sponsor") &&
    register.includes("Select the Match you wish to sponsor") &&
    register.includes("matchSponsorships") &&
    register.includes("lockMatchDayClub") &&
    register.includes("depositPhilanthropistClimateWallet") &&
    register.includes("onClubMatchSelected") &&
    register.includes("onClubConfirmed"),
  "Philanthropist register chooses Club, Match and amount like other sponsors"
);

assert(
  home.includes("PhilanthropistMatchGift") &&
    home.includes("hydratePhilanthropistRecord") &&
    home.includes("SPONSOR_NEW_SPONSORSHIP_LABEL") &&
    gift.includes("ClubLeagueMenu") &&
    gift.includes("MatchFixtureMenu") &&
    gift.includes("PHILANTHROPIST_AMOUNT_LABEL") &&
    gift.includes("lockMatchDayClub") &&
    gift.includes("depositPhilanthropistClimateWallet") &&
    gift.includes('data-philanthropist-match-gift="philanthropist-choose-match-v1"') &&
    gift.includes("SPONSOR_INVITATIONS_PATH") &&
    gift.includes("PHILANTHROPIST_INVITE_COPY") &&
    gift.includes("matchLocked ?") &&
    gift.includes('useState("")') &&
    !gift.includes("useState(record?.clubName") &&
    !gift.includes("HowS4pSelectMatch") &&
    home.includes("philanthropist-new-match-v1") &&
    home.includes("draftKey") &&
    fromMatch.includes("isPhilanthropistSponsor") &&
    fromMatch.includes("philanthropistNewSponsorshipPath") &&
    philanthropistNewSponsorshipPath({
      club: "Chelsea",
      fixtureName: "Chelsea v Arsenal",
    }).includes("club=Chelsea") &&
    preview.includes("PhilanthropistMatchGift"),
  "Logged-in philanthropists can choose Club, Match and amount from their home"
);

assert(
  login.includes("hydratePhilanthropistRecord") &&
    wallet.includes("isPhilanthropistSponsor") &&
    wallet.includes("PHILANTHROPIST_HOME_PATH") &&
    dashboard.includes("sponsorHomePath(sponsorName, { jobTitle })") &&
    picker.includes("minGbp"),
  "Login restores the philanthropist record and keeps them off the Lead wallet"
);

const frame = readFileSync("app/components/home/PhoneFrame.tsx", "utf8");
const fixtures = readFileSync(
  "app/components/home/SelectMatchFixtures.tsx",
  "utf8"
);
assert(
  !gift.includes("HowS4pSelectMatch") &&
    gift.includes("PHILANTHROPIST_SPONSOR_HEADING") &&
    gift.includes("PHILANTHROPIST_SPONSOR_COPY") &&
    gift.includes("Locked in") &&
    gift.includes("data-draft-club") &&
    gift.includes("data-draft-fixture") &&
    frame.includes("phone-mobile-unframed-v1") &&
    fixtures.includes("philanthropist-stay-v1"),
  "Logged-in philanthropists select a Club and Match in the lock-in card, with no fixture list above it"
);

const borrowed = withoutBorrowedLocalGifts(
  applyPhilanthropistMatchGifts(smith, [
    {
      clubName: "Sunderland",
      fixtureName: "Sunderland vs Tottenham Hotspur",
      amountGbp: 1300,
    },
  ]),
  [
    {
      brandName: "OKECHUKWU LIMITED",
      clubName: "Sunderland",
      pledgeGbp: 1300,
      matchSponsorships: [
        { fixtureName: "Hearts v Celtic", amountGbp: 1300 },
      ],
    },
  ]
);
assert(
  borrowed === null || philanthropistFundingGbp(borrowed) === 0,
  "A local business £1,300 is not shown as the philanthropist's own sponsorship"
);

const kept = withoutBorrowedLocalGifts(withMatch, [
  {
    brandName: "OKECHUKWU LIMITED",
    clubName: "Sunderland",
    pledgeGbp: 1300,
    matchSponsorships: [
      { fixtureName: "Sunderland vs Tottenham Hotspur", amountGbp: 1300 },
    ],
  },
]);
assert(
  kept !== null &&
    philanthropistFundingGbp(kept) === 17500 &&
    (kept.matchSponsorships ?? []).every(
      (row) => !row.fixtureName.includes("Sunderland")
    ),
  "A philanthropist's own Match stays when another brand sponsored a different club"
);

if (failures.length > 0) {
  console.error("verify-philanthropist-choose-match failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-philanthropist-choose-match: ok");
