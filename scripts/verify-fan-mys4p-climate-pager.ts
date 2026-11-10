import { readFileSync } from "fs";
import {
  FAN_CLIMATE_AUTO_ADVANCE_MS,
  FAN_CLIMATE_PAGER_STAMP,
  FAN_CLIMATE_PROJECT_PAGE_COUNT,
} from "../app/lib/fan-climate-project-cards";
import { FAN_MATCH_META_STAMP } from "../app/lib/fan-match-meta";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const tabs = readFileSync(
  "app/dashboard/supporter/components/FanTabBar.tsx",
  "utf8"
);
const workspace = readFileSync(
  "app/components/fan/FanCampaignWorkspace.tsx",
  "utf8"
);
const pager = readFileSync(
  "app/components/fan/FanClimateProjectPager.tsx",
  "utf8"
);
const header = readFileSync(
  "app/components/fan/CampaignMatchHeader.tsx",
  "utf8"
);
const myS4p = readFileSync("app/supporter/dashboard/page.tsx", "utf8");
const vote = readFileSync("app/dashboard/supporter/vote/page.tsx", "utf8");
const invite = readFileSync(
  "app/components/fan/InviteFriendsRemainingFunds.tsx",
  "utf8"
);

assert(
  tabs.includes('data-fan-tabs="5"') &&
    !tabs.includes('label: "Climate Projects"') &&
    tabs.includes('label: "My S4P"') &&
    tabs.includes('label: "CIFT"'),
  "Climate Projects is no longer a fan tab"
);
assert(
  myS4p.includes('section="projects"') &&
    workspace.includes("FanClimateProjectPager") &&
    workspace.includes("CampaignMatchHeader") &&
    !workspace.includes("Climate Projects List") &&
    !workspace.includes("ClimateProjectSponsors") &&
    !workspace.includes("MatchDayProjectCard"),
  "My S4P keeps the Match Climate Campaign and hosts the 1/5 pager"
);
assert(
  header.includes("fanMatchMetaLine") &&
    header.includes("kickoffAt") &&
    header.includes("venue") &&
    FAN_MATCH_META_STAMP === "fan-match-meta-v1",
  "The Climate Campaign headline includes Match date and venue"
);
assert(
  FAN_CLIMATE_PAGER_STAMP === "fan-mys4p-pager-v1" &&
    FAN_CLIMATE_PROJECT_PAGE_COUNT === 5 &&
    FAN_CLIMATE_AUTO_ADVANCE_MS === 800 &&
    pager.includes("FAN_CLIMATE_AUTO_ADVANCE_MS") &&
    pager.includes("setPageIndex") &&
    pager.includes("fromIndex + 1"),
  "Completing 1/5 automatically jumps to 2/5"
);
assert(
  pager.includes("InviteFriendsRemainingFunds") &&
    pager.includes("FAN_CLIMATE_PROJECT_PAGE_COUNT - 1") &&
    invite.includes("Invite friends to use remaining funds") &&
    invite.includes("Copy invite link"),
  "Invite friends sits after 5/5"
);
assert(
  vote.includes("window.location.replace") &&
    vote.includes("SUPPORTER_CAMPAIGN_PATH") &&
    vote.includes("p4pDonate"),
  "The old Climate Projects URL opens My S4P except P4P donate"
);
assert(
  !pager.includes("My Climate Projects") &&
    !pager.includes("SUPPORTER_CAMPAIGN_PATH"),
  "The pager no longer links back to a separate Climate Projects tab"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "My S4P keeps the Match Climate Campaign, folds in the 1/5 Climate Project pager, auto-advances after FUND-IT, and invites friends after 5/5."
);
