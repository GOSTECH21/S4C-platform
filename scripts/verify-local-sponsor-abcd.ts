import { readFileSync } from "fs";
import { sportingCalendarClubGroups } from "../app/lib/calendar-clubs";

const failures: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const wallet = readFileSync("app/sponsor/wallet/page.tsx", "utf8");
const previewWallet = readFileSync("app/preview/local-wallet/page.tsx", "utf8");
const localHome = readFileSync("app/sponsor/local/page.tsx", "utf8");
const localUi = readFileSync(
  "app/components/sponsor/LocalSignedSponsorHome.tsx",
  "utf8"
);
const leadUi = readFileSync("app/components/sponsor/LeadSponsorHome.tsx", "utf8");
const overlay = readFileSync("apply-local-sponsor-abcd.mjs", "utf8");
const clubs = sportingCalendarClubGroups().flatMap((group) => group.clubs);

assert(
  wallet.includes("allPlatformClubs") &&
    previewWallet.includes("allPlatformClubs") &&
    !wallet.includes("Select a club from Premier League or Scottish Premiership") &&
    !previewWallet.includes(
      "Select a club from Premier League or Scottish Premiership"
    ) &&
    clubs.includes("Rangers") &&
    clubs.includes("Leeds United") &&
    clubs.length > 20,
  "Local New Sponsorship lists every Sporting Calendar club, not the three-club demo"
);

assert(
  leadUi.includes("export function SponsorAbcdSections") &&
    leadUi.includes('letter="a"') &&
    leadUi.includes("Section (d)") &&
    localUi.includes("SponsorAbcdSections") &&
    localUi.includes('data-local-abcd="local-abcd-v1"') &&
    localHome.includes("loadClubChosenClimateProjects") &&
    localHome.includes("clubsNeedingChosenProjects"),
  "Local Business Climate Sponsors see the same A-D sections as Lead Climate Sponsors"
);

assert(
  overlay.includes("cursor/local-sponsor-abcd-18f9") &&
    overlay.includes("app/components/sponsor/LocalSignedSponsorHome.tsx") &&
    overlay.includes("app/sponsor/wallet/page.tsx"),
  "PC overlay pulls the Local A-D and all-clubs files"
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  "Local New Sponsorship lists every platform club, and Local home shows sections A-D."
);
