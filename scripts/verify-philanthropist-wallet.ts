import { readFileSync } from "fs";
import {
  allocateWalletVote,
  canPressFundIt,
  createPhilanthropistWallet,
  formatWalletGbp,
  PHILANTHROPIST_TAKE_LABEL,
  PHILANTHROPIST_WALLET_VOTE_GBP,
  remainingGbp,
  walletVoteAmount,
} from "../app/lib/sponsor-wallet";
import { PHILANTHROPIST_CARBON_WALLET_LABEL } from "../app/lib/philanthropist";
import { FEATURED_PROJECT_NAME } from "../app/lib/sccan-catalog";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  PHILANTHROPIST_WALLET_VOTE_GBP === 0.5 &&
    PHILANTHROPIST_TAKE_LABEL === "Take £0.50" &&
    PHILANTHROPIST_CARBON_WALLET_LABEL === "Philanthropist Carbon Wallet" &&
    formatWalletGbp(PHILANTHROPIST_WALLET_VOTE_GBP) === "£0.50",
  "Philanthropist Carbon Wallet take is £0.50"
);

const wallet = createPhilanthropistWallet({
  clubName: "Rangers",
  brandName: "Davies Family Trust",
  giftGbp: 250,
});
assert(
  wallet.kind === "philanthropist" &&
    remainingGbp(wallet) === 250 &&
    wallet.sponsorshipGbp === 250 &&
    wallet.managementFeeGbp === 12.5 &&
    wallet.paidGbp === 262.5 &&
    walletVoteAmount(wallet) === 0.5,
  "Fans of that club see the philanthropist gift amount in the Carbon Wallet"
);

const projects = [
  {
    id: "gss",
    name: FEATURED_PROJECT_NAME,
    number: 1,
    fundedGbp: 0,
    votesReceived: 0,
  },
  {
    id: "trees",
    name: "Ibrox Tree Canopy",
    number: 2,
    fundedGbp: 0,
    votesReceived: 0,
  },
];
const take = allocateWalletVote({
  wallet,
  projects,
  projectNumber: 2,
});
assert(take.ok, "A fan can put £0.50 onto the Climate Project they choose");
if (take.ok) {
  assert(
    take.amount === 0.5 &&
      remainingGbp(take.wallet) === 249.5 &&
      take.project.name === "Ibrox Tree Canopy" &&
      take.project.fundedGbp === 0.5,
    "£0.50 leaves the Philanthropist Carbon Wallet and funds the chosen project"
  );
}

assert(
  canPressFundIt({
    remainingGbp: 250,
    projectNumber: 2,
    projectCount: 5,
    voteGbp: 0.5,
  }) &&
    !canPressFundIt({
      remainingGbp: 0.4,
      projectNumber: 2,
      projectCount: 5,
      voteGbp: 0.5,
    }),
  "Take £0.50 stays off when the Philanthropist Carbon Wallet has less than £0.50"
);

const pager = readFileSync(
  "app/components/fan/FanClimateProjectPager.tsx",
  "utf8"
);
const workspace = readFileSync(
  "app/components/fan/FanCampaignWorkspace.tsx",
  "utf8"
);
const register = readFileSync(
  "app/sponsor/philanthropist/register/page.tsx",
  "utf8"
);
assert(
  pager.includes("PHILANTHROPIST_CARBON_WALLET_LABEL") &&
    pager.includes('data-testid="philanthropist-carbon-wallet"') &&
    pager.includes("PHILANTHROPIST_TAKE_LABEL") &&
    pager.includes("philanthropists") &&
    pager.includes("philanthropistAllocated") &&
    pager.includes("the Climate Project you chose") &&
    workspace.includes("philanthropistSponsors") &&
    workspace.includes('kind === "philanthropist"') &&
    register.includes("depositPhilanthropistClimateWallet"),
  "My S4P shows the Philanthropist Carbon Wallet and register deposits it for that club"
);

if (failures.length > 0) {
  console.error("verify-philanthropist-wallet failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-philanthropist-wallet: ok");
