import { readFileSync } from "fs";
import {
  climateWalletFansCopy,
  climateWalletHeading,
  MATCH_DAY_GOALS_SCORED_COPY,
  MATCH_DAY_PROJECTS_RECORD_COPY,
} from "../app/lib/match-day-carbon-offset";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

assert(
  climateWalletHeading({
    clubName: "Chelsea",
    fixtureName: "Chelsea v Liverpool",
  }) === "Climate Sponsorship Wallet (Chelsea v Liverpool)" &&
    climateWalletHeading({ clubName: "Chelsea" }) ===
      "Climate Sponsorship Wallet (Chelsea v Selected Opponent)" &&
    climateWalletHeading({}) === "Climate Sponsorship Wallet",
  "The Climate Sponsorship Wallet heading names the locked Match, or Club v Selected Opponent"
);

assert(
  climateWalletFansCopy("Chelsea") ===
    "Fans of Chelsea take cash from this wallet and put that cash into their Preferred Climate Project",
  "Fans take cash from this wallet onto their Preferred Climate Project"
);

assert(
  MATCH_DAY_GOALS_SCORED_COPY.includes("as shown or to be shown here") &&
    MATCH_DAY_PROJECTS_RECORD_COPY ===
      "Sponsored Projects will be saved in a Folder for your Record",
  "Match Day Record copy is the selected Match Day Goals-scored Climate Projects folder record"
);

const wallet = readFileSync("app/sponsor/wallet/page.tsx", "utf8");
const panel = readFileSync(
  "app/components/sponsor/ClubChosenProjectsPanel.tsx",
  "utf8"
);
const form = readFileSync(
  "app/components/sponsor/ClimateSponsorshipWallet.tsx",
  "utf8"
);
assert(
  wallet.includes("climateWalletHeading") &&
    wallet.includes("climateWalletFansCopy") &&
    form.includes("climateWalletHeading") &&
    panel.includes("MATCH_DAY_GOALS_SCORED_COPY") &&
    panel.includes("MATCH_DAY_PROJECTS_RECORD_COPY") &&
    !panel.includes("MATCH_DAY_PROJECTS_BEFORE_SIGNOFF_COPY") &&
    !wallet.includes("numbered Climate Project"),
  "Wallet page, wallet card, and Match Day Record use the Match heading and new copy"
);

if (failures.length > 0) {
  console.error("verify-wallet-match-heading failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-wallet-match-heading: ok");
