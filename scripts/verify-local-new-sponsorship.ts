import { readFileSync } from "fs";
import {
  LOCAL_FIVE_RECORD_COPY,
  MATCH_DAY_GOALS_SCORED_COPY,
  MATCH_DAY_PROJECTS_RECORD_LABEL,
  TOP_UP_CASH_HEADING,
} from "../app/lib/match-day-carbon-offset";
import { localNewSponsorshipPath } from "../app/lib/routes";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const walletPage = readFileSync("app/sponsor/wallet/page.tsx", "utf8");
const walletForm = readFileSync(
  "app/components/sponsor/ClimateSponsorshipWallet.tsx",
  "utf8"
);
const preview = readFileSync("app/preview/local-wallet/page.tsx", "utf8");
const dashboard = readFileSync("app/sponsor/dashboard/page.tsx", "utf8");

assert(
  localNewSponsorshipPath() === "/sponsor/wallet?new=1",
  "Click here to initiate a New Sponsorship still opens the Local wallet with ?new=1"
);

assert(
  walletPage.includes("SeeMatchDetails") &&
    walletPage.includes("Unlock") &&
    walletPage.includes("Select a Club") &&
    walletPage.includes("Select the Match") &&
    walletPage.includes("localLockCopy()"),
  "Local New Sponsorship selects a Club and Match and can See Match details"
);

assert(
  walletPage.indexOf('id="match-day-lock-in"') <
    walletPage.indexOf('id="top-up-cash"') &&
    walletPage.indexOf('id="top-up-cash"') <
      walletPage.lastIndexOf("MATCH_DAY_PROJECTS_RECORD_LABEL") &&
    walletPage.lastIndexOf("SeeMatchDetails") <
      walletPage.lastIndexOf("ClimateSponsorshipWallet"),
  "Club + Match details sit above the cash table, then the five Climate Projects record"
);

assert(
  walletForm.includes("TOP_UP_CASH_HEADING") &&
    walletForm.includes('kind === "local" ? TOP_UP_CASH_HEADING') &&
    TOP_UP_CASH_HEADING ===
      "Top up the cash fans will put into Climate Projects",
  "The Local cash table is titled Top up the cash fans will put into Climate Projects"
);

assert(
  walletPage.includes("MATCH_DAY_PROJECTS_RECORD_LABEL") &&
    walletPage.includes("LOCAL_FIVE_RECORD_COPY") &&
    MATCH_DAY_PROJECTS_RECORD_LABEL.includes("5 chosen Climate Projects") &&
    LOCAL_FIVE_RECORD_COPY.includes("insert your Sponsorship amount") &&
    !walletPage.includes("MATCH_DAY_GOALS_SCORED_COPY") &&
    !LOCAL_FIVE_RECORD_COPY.includes("Goals-scored") &&
    MATCH_DAY_GOALS_SCORED_COPY.includes("Goals-scored"),
  "The five Climate Projects are a Local record, not Lead Goals-scored copy"
);

assert(
  readFileSync("app/components/sponsor/ClubChosenProjectsPanel.tsx", "utf8").includes(
    "MATCH_DAY_GOALS_SCORED_COPY"
  ) &&
    dashboard.includes("LeadSponsorHome") &&
    !dashboard.includes("localLockCopy()") &&
    !dashboard.includes("LOCAL_FIVE_RECORD_COPY") &&
    !dashboard.includes("MatchDayLockIn"),
  "Lead dashboard is the four-section home; Goal-Sponsorship copy stays on Calendar lock-in"
);

assert(
    preview.includes("SeeMatchDetails") &&
    preview.includes("ClubLeagueMenu") &&
    preview.includes("MatchFixtureMenu") &&
    preview.includes("Unlock") &&
    preview.includes("MATCH_DAY_PROJECTS_RECORD_LABEL") &&
    preview.includes("LOCAL_FIVE_RECORD_COPY") &&
    preview.includes("New Sponsorship") &&
    preview.lastIndexOf("SeeMatchDetails") <
      preview.lastIndexOf("ClimateSponsorshipWallet") &&
    preview.lastIndexOf("ClimateSponsorshipWallet") <
      preview.lastIndexOf("MATCH_DAY_PROJECTS_RECORD_LABEL"),
  "The Local New Sponsorship preview walks Club + Match, cash table, then the five"
);

assert(
  walletPage.includes("Back to your sponsored Match Days") &&
    walletPage.includes("LOCAL_SPONSOR_HOME_PATH"),
  "Locals can go back from New Sponsorship to the signed Match-Day home"
);

const routesImport =
  walletPage.match(/import \{[\s\S]*?\} from "@\/app\/lib\/routes"/)?.[0] ?? "";
const homeImport =
  walletPage.match(/import \{[\s\S]*?\} from "@\/app\/lib\/sponsor-home"/)?.[0] ??
  "";
assert(
  !routesImport.includes("sponsorHomePath") &&
    homeImport.includes("sponsorHomePath"),
  "sponsorHomePath comes from sponsor-home, not routes — this Form already hit that export error"
);

if (failures.length > 0) {
  console.error("verify-local-new-sponsorship failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("verify-local-new-sponsorship: ok");
