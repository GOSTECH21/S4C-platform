import { readFileSync } from "fs";
import { FAN_REGISTER_TEAMS_INTRO } from "../app/lib/fan-register-copy";
import { CURRENT_SEASON } from "../app/lib/current-season";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const panel = readFileSync("app/components/fan/FanMyTeamsPanel.tsx", "utf8");
const sponsors = readFileSync(
  "app/components/fan/ClimateProjectSponsors.tsx",
  "utf8"
);
const workspace = readFileSync(
  "app/components/fan/FanCampaignWorkspace.tsx",
  "utf8"
);
const overlay = readFileSync("apply-my-s4p-streamline.mjs", "utf8");

assert(
  FAN_REGISTER_TEAMS_INTRO === `Pick from the current ${CURRENT_SEASON} season.`,
  "Saved-teams accordion summary is the first My Teams sentence"
);
assert(
  panel.includes('data-saved-teams-accordion="saved-teams-accordion-v1"') &&
    panel.includes("FAN_REGISTER_TEAMS_INTRO") &&
    panel.includes("Save My Teams") &&
    panel.includes("setSavedOpen(false)") &&
    panel.includes("Add or change teams"),
  "After Save My Teams, My S4P accordion-hides the picker down to the first sentence"
);
assert(
  workspace.includes("Climate Projects List") &&
    workspace.includes("CampaignMatchHeader") &&
    workspace.includes("ClimateProjectSponsors"),
  "My S4P still shows the Match Climate Campaign and Climate Projects List"
);
assert(
  sponsors.includes('data-my-s4p-fund-strips="fund-strips-v1"') &&
    sponsors.includes("data-sponsor-fund-strip") &&
    sponsors.includes("LOCAL_SPONSOR_FUND_SLOTS = 4") &&
    sponsors.includes("leadFundItCopy") &&
    sponsors.includes("localFundItCopy") &&
    sponsors.includes("Invite friends to use remaining funds") &&
    sponsors.includes("<select") &&
    !sponsors.includes("Climate Project Sponsor") &&
    !sponsors.includes("fundItCopy") &&
    !sponsors.includes("Lead Climate Project Sponsor"),
  "Lead plus four Local FUND-IT strips keep only the tap-a-project lines and Invite friends"
);
assert(
  overlay.includes("cursor/my-s4p-streamline-18f9") &&
    overlay.includes('PIN = "484944e"') &&
    overlay.includes("app/components/fan/FanMyTeamsPanel.tsx") &&
    overlay.includes("app/components/fan/ClimateProjectSponsors.tsx"),
  "PC overlay pulls the streamlined My S4P files"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "My S4P streamlines saved teams into an accordion and FUND-IT into Logo / Name / Wallet / Projects / FUND-IT strips."
);
